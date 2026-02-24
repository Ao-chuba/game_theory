import { useState } from 'react';
import { NormalFormGame, NashEquilibrium, DominantStrategy } from '../types/game.types';
import { Trophy, TrendingUp, Info } from 'lucide-react';

interface PayoffMatrixProps {
    game: NormalFormGame;
    nashEquilibria: NashEquilibrium[];
    dominantStrategies: DominantStrategy[];
}

function isNash(
    rowIdx: number,
    colIdx: number,
    strategies0: string[],
    strategies1: string[],
    nash: NashEquilibrium[]
): boolean {
    return nash.some(
        ne =>
            ne.strategyProfile[0] === strategies0[rowIdx] &&
            ne.strategyProfile[1] === strategies1[colIdx]
    );
}

function isDominant(playerName: string, strategy: string, dominant: DominantStrategy[]): DominantStrategy | undefined {
    return dominant.find(d => d.player === playerName && d.strategy === strategy);
}

export default function PayoffMatrix({ game, nashEquilibria, dominantStrategies }: PayoffMatrixProps) {
    const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
    const { players, strategies, payoffs } = game;

    const payoffMap = new Map(payoffs.map(pe => [pe.strategyProfile.join('|'), pe.payoffs]));
    const getPayoff = (profile: string[]) => payoffMap.get(profile.join('|')) ?? [];

    // For 2-player: rows = player 0, cols = player 1
    if (players.length === 2) {
        const [p0, p1] = players;
        const [s0, s1] = strategies;

        return (
            <div className="flex flex-col gap-4">
                {/* Legend */}
                <div className="flex items-center gap-4 text-xs flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(245,158,11,0.25)', border: '1px solid rgba(245,158,11,0.5)' }} />
                        <span style={{ color: '#fbbf24' }}>Nash Equilibrium</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(16,185,129,0.15)', borderLeft: '2px solid rgba(16,185,129,0.5)' }} />
                        <span style={{ color: '#34d399' }}>Dominant Strategy</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span style={{ color: 'rgba(148,163,184,0.5)' }}>Format: ({p0.name}, {p1.name})</span>
                    </div>
                </div>

                {/* Matrix table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                {/* Top-left corner */}
                                <th className="p-3 text-left" style={{ minWidth: '120px' }}>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-semibold" style={{ color: '#60a5fa' }}>{p0.name} ↓</span>
                                        <span className="text-xs" style={{ color: '#a78bfa' }}>{p1.name} →</span>
                                    </div>
                                </th>
                                {s1.map(col => {
                                    const dom = isDominant(p1.name, col, dominantStrategies);
                                    return (
                                        <th
                                            key={col}
                                            className="p-3 text-center font-semibold"
                                            style={{
                                                color: dom ? '#34d399' : 'rgba(167,139,250,0.9)',
                                                borderBottom: '1px solid rgba(148,163,184,0.1)',
                                                minWidth: '100px'
                                            }}
                                        >
                                            {col}
                                            {dom && <span className="ml-1 text-xs">✦</span>}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {s0.map((row, ri) => {
                                const dom = isDominant(p0.name, row, dominantStrategies);
                                return (
                                    <tr key={row}>
                                        <td
                                            className="p-3 font-semibold"
                                            style={{
                                                color: dom ? '#34d399' : 'rgba(96,165,250,0.9)',
                                                borderRight: '1px solid rgba(148,163,184,0.1)',
                                            }}
                                        >
                                            {row}
                                            {dom && <span className="ml-1 text-xs">✦</span>}
                                        </td>
                                        {s1.map((col, ci) => {
                                            const profilePayoffs = getPayoff([row, col]);
                                            const nash = isNash(ri, ci, s0, s1, nashEquilibria);
                                            const rowDom = isDominant(p0.name, row, dominantStrategies);
                                            const colDom = isDominant(p1.name, col, dominantStrategies);

                                            return (
                                                <td
                                                    key={col}
                                                    className={`p-3 text-center cursor-pointer transition-all duration-200 ${nash ? 'nash-cell' : ''}`}
                                                    style={{
                                                        border: '1px solid rgba(148,163,184,0.08)',
                                                        background: nash
                                                            ? 'rgba(245,158,11,0.15)'
                                                            : (rowDom || colDom)
                                                                ? 'rgba(16,185,129,0.06)'
                                                                : 'rgba(255,255,255,0.02)',
                                                    }}
                                                    onMouseEnter={e => {
                                                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                        setTooltip({
                                                            text: nash ? '⭐ Nash Equilibrium — No player can improve by unilaterally deviating' : `Payoffs: ${p0.name}=${profilePayoffs[0]}, ${p1.name}=${profilePayoffs[1]}`,
                                                            x: rect.left + rect.width / 2,
                                                            y: rect.top - 10
                                                        });
                                                    }}
                                                    onMouseLeave={() => setTooltip(null)}
                                                >
                                                    <span className="font-mono font-semibold" style={{ color: nash ? '#fbbf24' : 'rgba(241,245,249,0.9)' }}>
                                                        ({profilePayoffs[0] ?? '?'}, {profilePayoffs[1] ?? '?'})
                                                    </span>
                                                    {nash && (
                                                        <Trophy size={10} className="inline ml-1.5 text-amber-400" />
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Tooltip */}
                {tooltip && (
                    <div
                        className="fixed z-50 text-xs px-3 py-2 rounded-lg pointer-events-none shadow-xl"
                        style={{
                            left: tooltip.x,
                            top: tooltip.y,
                            transform: 'translate(-50%, -100%)',
                            background: 'rgba(15,22,41,0.95)',
                            border: '1px solid rgba(148,163,184,0.2)',
                            color: '#f1f5f9',
                            maxWidth: '280px',
                            textAlign: 'center'
                        }}
                    >
                        {tooltip.text}
                    </div>
                )}
            </div>
        );
    }

    // 3+ player: flat list view
    return (
        <div className="flex flex-col gap-2">
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
                <Info size={12} className="inline mr-1" />
                {players.length}-player game — displaying payoff table
            </p>
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                            <th className="p-2 text-left text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>Strategy Profile</th>
                            {players.map(p => (
                                <th key={p.id} className="p-2 text-center text-xs font-semibold" style={{ color: '#60a5fa' }}>{p.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {payoffs.map((pe, i) => {
                            const nash = nashEquilibria.some(ne => ne.strategyProfile.join('|') === pe.strategyProfile.join('|'));
                            return (
                                <tr key={i} className={nash ? 'nash-cell' : ''} style={{ borderBottom: '1px solid rgba(148,163,184,0.05)' }}>
                                    <td className="p-2 font-mono text-xs" style={{ color: 'rgba(148,163,184,0.7)' }}>
                                        ({pe.strategyProfile.join(', ')})
                                        {nash && <Trophy size={10} className="inline ml-1.5 text-amber-400" />}
                                    </td>
                                    {pe.payoffs.map((pv, j) => (
                                        <td key={j} className="p-2 text-center font-mono font-semibold" style={{ color: nash ? '#fbbf24' : '#f1f5f9' }}>
                                            {pv}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
