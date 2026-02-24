// Mirror of backend types for the frontend

export type GameType = 'normal-form' | 'extensive-form';

export interface Player {
    id: string;
    name: string;
    role?: string;
}

export interface PayoffEntry {
    strategyProfile: string[];
    payoffs: number[];
}

export interface NormalFormGame {
    type: 'normal-form';
    players: Player[];
    strategies: string[][];
    payoffs: PayoffEntry[];
}

export type NodeType = 'decision' | 'chance' | 'terminal';

export interface GameTreeNode {
    id: string;
    type: NodeType;
    playerId?: string;
    label?: string;
    actions?: string[];
    children?: { action: string; node: GameTreeNode }[];
    payoffs?: number[];
    probability?: number;
}

export interface ExtensiveFormGame {
    type: 'extensive-form';
    players: Player[];
    rootNode: GameTreeNode;
}

export interface NashEquilibrium {
    strategyProfile: string[];
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
