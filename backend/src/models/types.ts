// ─── Player / Strategy Primitives ────────────────────────────────────────────

export interface Player {
    id: string;
    name: string;
    role?: string;
}

export interface Strategy {
    player: string;
    strategy: string;
}

// ─── Normal-Form Game ─────────────────────────────────────────────────────────

export interface PayoffEntry {
    strategyProfile: string[];  // one strategy name per player, in player order
    payoffs: number[];          // one payoff per player, same order
}

export interface NormalFormGame {
    type: 'normal-form';
    players: Player[];
    strategies: string[][];     // strategies[i] = list of strategies for player i
    payoffs: PayoffEntry[];
}

// ─── Extensive-Form Game ──────────────────────────────────────────────────────

export type NodeType = 'decision' | 'chance' | 'terminal';

export interface GameTreeNode {
    id: string;
    type: NodeType;
    playerId?: string;          // which player acts here (decision nodes)
    label?: string;
    actions?: string[];         // available actions at this node
    children?: { action: string; node: GameTreeNode }[];
    payoffs?: number[];         // terminal node payoffs, one per player
    probability?: number;       // for chance nodes
}

export interface ExtensiveFormGame {
    type: 'extensive-form';
    players: Player[];
    rootNode: GameTreeNode;
}

// ─── LLM Response Shape ───────────────────────────────────────────────────────

export interface LLMNormalFormData {
    strategies: Strategy[];
    payoffs: PayoffEntry[];
}

export interface LLMExtensiveFormData {
    rootNode: GameTreeNode;
}

export interface LLMGameResponse {
    gameType: 'normal-form' | 'extensive-form';
    players: Player[];
    normalForm?: LLMNormalFormData;
    extensiveForm?: LLMExtensiveFormData;
    ambiguities: string[];
    assumptions: string[];
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

export interface NashEquilibrium {
    strategyProfile: string[];  // one strategy per player
    payoffs: number[];
}

export interface DominantStrategy {
    player: string;
    strategy: string;
    type: 'strictly' | 'weakly';
}

export interface AnalysisResult {
    nashEquilibria: NashEquilibrium[];
    dominantStrategies: DominantStrategy[];
    isZeroSum: boolean;
    hasSaddlePoint: boolean;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface TranslateResponse {
    success: boolean;
    game?: NormalFormGame | ExtensiveFormGame;
    analysis?: AnalysisResult;
    ambiguities: string[];
    assumptions: string[];
    error?: string;
}

export interface ExampleGame {
    id: string;
    title: string;
    description: string;
    category: string;
}
