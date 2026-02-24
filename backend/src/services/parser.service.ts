import {
    LLMGameResponse, NormalFormGame, ExtensiveFormGame,
    PayoffEntry, Player, AnalysisResult, NashEquilibrium, DominantStrategy
} from '../models/types';

// ─── Convert LLM Response → Structured Game ────────────────────────────────

export function parseGame(llm: LLMGameResponse): NormalFormGame | ExtensiveFormGame {
    if (llm.gameType === 'normal-form') {
        return parseNormalForm(llm);
    } else {
        return parseExtensiveForm(llm);
    }
}

function parseNormalForm(llm: LLMGameResponse): NormalFormGame {
    if (!llm.normalForm) {
        throw new Error('LLM identified a normal-form game but provided no normalForm data');
    }

    const players: Player[] = llm.players.map((p, i) => ({
        id: p.id || `P${i + 1}`,
        name: p.name,
        role: p.role
    }));

    // Build per-player strategy lists
    const strategyMap = new Map<string, string[]>();
    for (const s of llm.normalForm.strategies) {
        if (!strategyMap.has(s.player)) strategyMap.set(s.player, []);
        const list = strategyMap.get(s.player)!;
        if (!list.includes(s.strategy)) list.push(s.strategy);
    }

    // Ensure every player has at least an empty list
    const strategies: string[][] = players.map(p => strategyMap.get(p.name) || strategyMap.get(p.id) || []);

    const payoffs: PayoffEntry[] = llm.normalForm.payoffs.map(pe => ({
        strategyProfile: pe.strategyProfile,
        payoffs: pe.payoffs
    }));

    // Fill missing payoff combos with zeros
    const completePayoffs = ensureCompletePayoffs(players, strategies, payoffs);

    return { type: 'normal-form', players, strategies, payoffs: completePayoffs };
}

function parseExtensiveForm(llm: LLMGameResponse): ExtensiveFormGame {
    if (!llm.extensiveForm?.rootNode) {
        throw new Error('LLM identified an extensive-form game but provided no rootNode');
    }
    const players: Player[] = llm.players.map((p, i) => ({
        id: p.id || `P${i + 1}`,
        name: p.name,
        role: p.role
    }));
    return { type: 'extensive-form', players, rootNode: llm.extensiveForm.rootNode };
}

// Build all strategy-profile combos and fill missing ones with zeros
function ensureCompletePayoffs(
    players: Player[],
    strategies: string[][],
    existing: PayoffEntry[]
): PayoffEntry[] {
    function cartesian(arrays: string[][]): string[][] {
        return arrays.reduce<string[][]>(
            (acc, arr) => acc.flatMap(prev => arr.map(val => [...prev, val])),
            [[]]
        );
    }

    const allProfiles = cartesian(strategies);
    const existingMap = new Map(existing.map(pe => [pe.strategyProfile.join('|'), pe]));

    return allProfiles.map(profile => {
        const key = profile.join('|');
        return existingMap.get(key) || { strategyProfile: profile, payoffs: players.map(() => 0) };
    });
}

// ─── Nash Equilibrium Finder (Pure Strategies) ─────────────────────────────

export function findNashEquilibria(game: NormalFormGame): NashEquilibrium[] {
    const { players, strategies, payoffs } = game;
    const payoffMap = new Map(payoffs.map(pe => [pe.strategyProfile.join('|'), pe.payoffs]));

    function getPayoff(profile: string[]): number[] {
        return payoffMap.get(profile.join('|')) || players.map(() => 0);
    }

    const allProfiles: string[][] = strategies.reduce<string[][]>(
        (acc, arr) => acc.flatMap(prev => arr.map(val => [...prev, val])),
        [[]]
    );

    const nashEquilibria: NashEquilibrium[] = [];

    for (const profile of allProfiles) {
        let isNash = true;

        // For each player, check if they can improve by deviating
        for (let pi = 0; pi < players.length; pi++) {
            const currentPayoff = getPayoff(profile)[pi];
            const playerStrategies = strategies[pi];

            for (const altStrategy of playerStrategies) {
                if (altStrategy === profile[pi]) continue;
                const altProfile = [...profile];
                altProfile[pi] = altStrategy;
                const altPayoff = getPayoff(altProfile)[pi];
                if (altPayoff > currentPayoff) {
                    isNash = false;
                    break;
                }
            }
            if (!isNash) break;
        }

        if (isNash) {
            nashEquilibria.push({ strategyProfile: profile, payoffs: getPayoff(profile) });
        }
    }

    return nashEquilibria;
}

// ─── Dominant Strategy Detector ────────────────────────────────────────────

export function findDominantStrategies(game: NormalFormGame): DominantStrategy[] {
    const { players, strategies, payoffs } = game;
    const payoffMap = new Map(payoffs.map(pe => [pe.strategyProfile.join('|'), pe.payoffs]));
    const dominant: DominantStrategy[] = [];

    function getPayoff(profile: string[]): number[] {
        return payoffMap.get(profile.join('|')) || players.map(() => 0);
    }

    function cartesianOthers(pi: number): string[][] {
        const others = strategies.filter((_, i) => i !== pi);
        return others.reduce<string[][]>(
            (acc, arr) => acc.flatMap(prev => arr.map(val => [...prev, val])),
            [[]]
        );
    }

    for (let pi = 0; pi < players.length; pi++) {
        const playerStrategies = strategies[pi];
        for (const sA of playerStrategies) {
            let strictlyDominates = true;
            let weaklyDominates = true;

            for (const sB of playerStrategies) {
                if (sA === sB) continue;
                const otherProfiles = cartesianOthers(pi);

                for (const others of otherProfiles) {
                    const profileA = [...others.slice(0, pi), sA, ...others.slice(pi)];
                    const profileB = [...others.slice(0, pi), sB, ...others.slice(pi)];
                    const payA = getPayoff(profileA)[pi];
                    const payB = getPayoff(profileB)[pi];
                    if (payA <= payB) strictlyDominates = false;
                    if (payA < payB) weaklyDominates = false;
                }
            }

            if (strictlyDominates && playerStrategies.length > 1) {
                dominant.push({ player: players[pi].name, strategy: sA, type: 'strictly' });
            } else if (weaklyDominates && !strictlyDominates && playerStrategies.length > 1) {
                dominant.push({ player: players[pi].name, strategy: sA, type: 'weakly' });
            }
        }
    }

    return dominant;
}

// ─── Zero-Sum Check ──────────────────────────────────────────────────────────

function isZeroSum(game: NormalFormGame): boolean {
    return game.payoffs.every(pe => {
        const sum = pe.payoffs.reduce((a, b) => a + b, 0);
        return Math.abs(sum) < 0.0001;
    });
}

function hasSaddlePoint(game: NormalFormGame): boolean {
    if (game.players.length !== 2) return false;
    const payoffMap = new Map(game.payoffs.map(pe => [pe.strategyProfile.join('|'), pe.payoffs]));

    for (const s1 of game.strategies[0]) {
        // Find min in row for player 1
        const rowPayoffs = game.strategies[1].map(s2 => payoffMap.get([s1, s2].join('|'))?.[0] ?? 0);
        const rowMin = Math.min(...rowPayoffs);

        for (const s2 of game.strategies[1]) {
            const colPayoffs = game.strategies[0].map(r1 => payoffMap.get([r1, s2].join('|'))?.[0] ?? 0);
            const colMax = Math.max(...colPayoffs);
            const entry = payoffMap.get([s1, s2].join('|'))?.[0] ?? 0;
            if (entry === rowMin && entry === colMax) return true;
        }
    }
    return false;
}

// ─── Combined Analysis ───────────────────────────────────────────────────────

export function analyzeGame(game: NormalFormGame | ExtensiveFormGame): AnalysisResult {
    if (game.type === 'extensive-form') {
        return { nashEquilibria: [], dominantStrategies: [], isZeroSum: false, hasSaddlePoint: false };
    }
    return {
        nashEquilibria: findNashEquilibria(game),
        dominantStrategies: findDominantStrategies(game),
        isZeroSum: isZeroSum(game),
        hasSaddlePoint: hasSaddlePoint(game)
    };
}
