import { useState } from 'react';
import { Trophy, TrendingUp, AlertTriangle, Info, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { AnalysisResult, NormalFormGame, ExtensiveFormGame } from '../types/game.types';

interface AnalysisPanelProps {
    analysis: AnalysisResult;
    game: NormalFormGame | ExtensiveFormGame;
    ambiguities: string[];
    assumptions: string[];
}

function Section({
    title,
    icon,
    count,
    color,
    children,
    defaultOpen = true
}: {
    title: string;
    icon: React.ReactNode;
    count?: number;
    color: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(148,163,184,0.08)' }}>
            <button
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors duration-150"
                style={{ background: 'rgba(255,255,255,0.02)', color }}
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-center gap-2">
                    {icon}
                    {title}
                    {count !== undefined && (
                        <span
                            className="text-xs font-mono px-1.5 py-0.5 rounded"
                            style={{ background: `${color}22`, color }}
                        >
                            {count}
                        </span>
                    )}
                </div>
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {open && (
                <div className="px-4 py-3 text-sm" style={{ borderTop: '1px solid rgba(148,163,184,0.06)' }}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default function AnalysisPanel({ analysis, game, ambiguities, assumptions }: AnalysisPanelProps) {
    const { nashEquilibria, dominantStrategies, isZeroSum, hasSaddlePoint } = analysis;

    return (
        <div className="flex flex-col gap-3">
            {/* Nash Equilibria */}
            <Section
                title="Nash Equilibria"
                icon={<Trophy size={14} />}
                count={nashEquilibria.length}
                color="#f59e0b"
            >
                {nashEquilibria.length === 0 ? (
                    <p style={{ color: 'rgba(148,163,184,0.6)' }}>No pure-strategy Nash equilibria found.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {nashEquilibria.map((ne, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono"
                                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}
                            >
                                <Trophy size={10} />
                                <span>({ne.strategyProfile.join(', ')})</span>
                                <span className="ml-auto" style={{ color: 'rgba(245,158,11,0.6)' }}>
                                    payoffs: ({ne.payoffs.join(', ')})
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            {/* Dominant Strategies */}
            <Section
                title="Dominant Strategies"
                icon={<TrendingUp size={14} />}
                count={dominantStrategies.length}
                color="#34d399"
            >
                {dominantStrategies.length === 0 ? (
                    <p style={{ color: 'rgba(148,163,184,0.6)' }}>No dominant strategies found.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {dominantStrategies.map((ds, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                            >
                                <TrendingUp size={10} style={{ color: '#34d399' }} />
                                <span style={{ color: '#34d399', fontWeight: 600 }}>{ds.player}</span>
                                <span style={{ color: 'rgba(148,163,184,0.6)' }}>→</span>
                                <span className="font-mono" style={{ color: '#6ee7b7' }}>{ds.strategy}</span>
                                <span
                                    className="ml-auto text-xs px-1.5 py-0.5 rounded"
                                    style={{
                                        background: ds.type === 'strictly' ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
                                        color: '#34d399'
                                    }}
                                >
                                    {ds.type}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            {/* Game Properties */}
            <Section
                title="Game Properties"
                icon={<Activity size={14} />}
                color="#60a5fa"
            >
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'Game Type', value: game.type === 'normal-form' ? 'Normal-Form (Simultaneous)' : 'Extensive-Form (Sequential)' },
                        { label: 'Players', value: String(game.players.length) },
                        { label: 'Zero-Sum', value: isZeroSum ? 'Yes' : 'No' },
                        { label: 'Saddle Point', value: hasSaddlePoint ? 'Yes' : 'No' },
                    ].map(prop => (
                        <div
                            key={prop.label}
                            className="flex flex-col px-3 py-2 rounded-lg text-xs"
                            style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.12)', flex: '1 1 120px' }}
                        >
                            <span style={{ color: 'rgba(148,163,184,0.5)', marginBottom: '2px' }}>{prop.label}</span>
                            <span style={{ color: '#93c5fd', fontWeight: 600 }}>{prop.value}</span>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Ambiguities */}
            {ambiguities.length > 0 && (
                <Section
                    title="Ambiguities Detected"
                    icon={<AlertTriangle size={14} />}
                    count={ambiguities.length}
                    color="#fb923c"
                    defaultOpen={true}
                >
                    <div className="flex flex-col gap-1.5">
                        {ambiguities.map((a, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#fdba74' }}>
                                <AlertTriangle size={10} className="mt-0.5 flex-shrink-0" />
                                {a}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Assumptions */}
            {assumptions.length > 0 && (
                <Section
                    title="Assumptions Made"
                    icon={<Info size={14} />}
                    count={assumptions.length}
                    color="#818cf8"
                    defaultOpen={false}
                >
                    <div className="flex flex-col gap-1.5">
                        {assumptions.map((a, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#a5b4fc' }}>
                                <Info size={10} className="mt-0.5 flex-shrink-0" />
                                {a}
                            </div>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
}
