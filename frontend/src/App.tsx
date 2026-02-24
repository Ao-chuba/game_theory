import { useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, GitBranch, Layers, Github } from 'lucide-react';
import InputForm from './components/InputForm';
import PayoffMatrix from './components/PayoffMatrix';
import GameTree from './components/GameTree';
import AnalysisPanel from './components/AnalysisPanel';
import ExportButtons from './components/ExportButtons';
import { translateGame } from './services/api';
import { TranslateResponse, NormalFormGame, ExtensiveFormGame } from './types/game.types';

export default function App() {
    const [result, setResult] = useState<TranslateResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'visualization' | 'analysis'>('visualization');

    const handleTranslate = useCallback(async (description: string) => {
        setIsLoading(true);
        setResult(null);
        try {
            const res = await translateGame(description);
            setResult(res);
            if (!res.success) {
                toast.error(res.error || 'Translation failed');
            } else {
                toast.success('Game translated successfully!', { icon: '🎮' });
                setActiveTab('visualization');
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Network error';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const game = result?.game;
    const analysis = result?.analysis;
    const isNormalForm = game?.type === 'normal-form';

    return (
        <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
            {/* Background glow orbs */}
            <div className="glow-orb" style={{ width: 600, height: 600, background: 'rgba(14,165,233,0.06)', top: -200, left: -100 }} />
            <div className="glow-orb" style={{ width: 500, height: 500, background: 'rgba(99,102,241,0.05)', bottom: -100, right: -50 }} />

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <header className="flex-shrink-0 px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center justify-center w-9 h-9 rounded-xl"
                            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 4px 20px rgba(14,165,233,0.3)' }}
                        >
                            <Brain size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold gradient-text leading-none">NL2Game</h1>
                            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>Natural Language → Game Theory</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span
                            className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                            style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8' }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
                            Gambit GSoC 2026
                        </span>
                        <a
                            href="https://github.com"
                            className="btn-secondary py-1.5"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Github size={14} />
                            <span className="hidden sm:inline">GitHub</span>
                        </a>
                    </div>
                </header>

                {/* Main layout */}
                <main className="flex-1 flex flex-col xl:flex-row gap-6 p-6 max-w-[1600px] mx-auto w-full">
                    {/* Left panel — Input */}
                    <aside className="flex-shrink-0 xl:w-[420px] flex flex-col gap-5">
                        <div className="glass-card p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Layers size={15} style={{ color: '#38bdf8' }} />
                                <span className="section-label">Game Description</span>
                            </div>
                            <InputForm onSubmit={handleTranslate} isLoading={isLoading} />
                        </div>

                        {/* How it works */}
                        <div className="glass-card p-5">
                            <p className="section-label mb-3">How It Works</p>
                            <ol className="flex flex-col gap-2.5">
                                {[
                                    { n: '01', label: 'Describe', desc: 'Type any game in plain English or pick a classic' },
                                    { n: '02', label: 'Translate', desc: 'GPT-4o extracts players, strategies & payoffs' },
                                    { n: '03', label: 'Analyze', desc: 'Nash equilibria & dominant strategies computed' },
                                    { n: '04', label: 'Explore', desc: 'Interact with the matrix or game tree, then export' },
                                ].map(step => (
                                    <li key={step.n} className="flex items-start gap-3 text-xs">
                                        <span
                                            className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-[10px]"
                                            style={{ background: 'rgba(14,165,233,0.12)', color: '#38bdf8' }}
                                        >
                                            {step.n}
                                        </span>
                                        <div>
                                            <span className="font-semibold" style={{ color: '#e2e8f0' }}>{step.label} </span>
                                            <span style={{ color: 'rgba(148,163,184,0.6)' }}>{step.desc}</span>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </aside>

                    {/* Right panel — Results */}
                    <div className="flex-1 flex flex-col gap-5 min-w-0">
                        <AnimatePresence mode="wait">
                            {!result && !isLoading && (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="flex-1 flex flex-col items-center justify-center glass-card p-12 text-center"
                                >
                                    <div
                                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                                        style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}
                                    >
                                        <GitBranch size={36} style={{ color: 'rgba(56,189,248,0.5)' }} />
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2" style={{ color: 'rgba(241,245,249,0.6)' }}>
                                        Awaiting Game Description
                                    </h2>
                                    <p className="text-sm max-w-md" style={{ color: 'rgba(148,163,184,0.4)' }}>
                                        Enter a game description on the left or select a classic example to see payoff matrices, game trees, and Nash equilibrium analysis.
                                    </p>
                                </motion.div>
                            )}

                            {isLoading && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 flex items-center justify-center glass-card p-12"
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative w-16 h-16">
                                            <div
                                                className="absolute inset-0 rounded-full border-2 border-transparent spin-slow"
                                                style={{ borderTopColor: '#38bdf8', borderRightColor: '#6366f1' }}
                                            />
                                            <div className="absolute inset-2 rounded-full flex items-center justify-center"
                                                style={{ background: 'rgba(14,165,233,0.1)' }}>
                                                <Brain size={20} style={{ color: '#38bdf8' }} />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-semibold" style={{ color: '#e2e8f0' }}>Translating to Game Theory…</p>
                                            <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.5)' }}>
                                                GPT-4o is extracting players, strategies, and payoffs
                                            </p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {[0, 1, 2].map(i => (
                                                <div
                                                    key={i}
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        background: '#38bdf8',
                                                        animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {result && !isLoading && (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex-1 flex flex-col gap-5"
                                >
                                    {/* Tabs header */}
                                    {game && analysis && (
                                        <div className="glass-card p-1.5 flex items-center justify-between gap-2">
                                            <div className="flex gap-1">
                                                {(['visualization', 'analysis'] as const).map(tab => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setActiveTab(tab)}
                                                        className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200"
                                                        style={{
                                                            background: activeTab === tab ? 'rgba(14,165,233,0.15)' : 'transparent',
                                                            color: activeTab === tab ? '#38bdf8' : 'rgba(148,163,184,0.5)',
                                                            border: activeTab === tab ? '1px solid rgba(14,165,233,0.2)' : '1px solid transparent',
                                                        }}
                                                    >
                                                        {tab}
                                                    </button>
                                                ))}
                                            </div>
                                            <ExportButtons game={game} analysis={analysis} />
                                        </div>
                                    )}

                                    {/* Game info bar */}
                                    {game && (
                                        <div className="glass-card px-5 py-3 flex items-center gap-4 flex-wrap">
                                            <div>
                                                <span className="section-label">Players</span>
                                                <div className="flex gap-2 mt-1">
                                                    {game.players.map(p => (
                                                        <span
                                                            key={p.id}
                                                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
                                                        >
                                                            {p.name}{p.role ? ` (${p.role})` : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            {isNormalForm && (
                                                <>
                                                    <div className="w-px h-8 bg-white/5" />
                                                    <div>
                                                        <span className="section-label">Strategies</span>
                                                        <div className="flex gap-2 mt-1 flex-wrap">
                                                            {(game as NormalFormGame).strategies.map((slist, i) => (
                                                                <span key={i} className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
                                                                    <span style={{ color: '#60a5fa' }}>{game.players[i]?.name}</span>: {slist.join(' / ')}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {analysis && analysis.nashEquilibria.length > 0 && (
                                                <>
                                                    <div className="w-px h-8 bg-white/5" />
                                                    <div>
                                                        <span className="section-label">Nash Equilibria</span>
                                                        <div className="flex gap-1 mt-1">
                                                            {analysis.nashEquilibria.map((ne, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="text-xs px-2 py-0.5 rounded-full font-mono font-medium"
                                                                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}
                                                                >
                                                                    ({ne.strategyProfile.join(', ')})
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Main content area */}
                                    {activeTab === 'visualization' && game && analysis && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="glass-card p-6"
                                        >
                                            {isNormalForm ? (
                                                <>
                                                    <h2 className="text-base font-semibold mb-5" style={{ color: '#e2e8f0' }}>
                                                        Payoff Matrix
                                                    </h2>
                                                    <PayoffMatrix
                                                        game={game as NormalFormGame}
                                                        nashEquilibria={analysis.nashEquilibria}
                                                        dominantStrategies={analysis.dominantStrategies}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <h2 className="text-base font-semibold mb-5" style={{ color: '#e2e8f0' }}>
                                                        Game Tree
                                                    </h2>
                                                    <GameTree
                                                        game={game as ExtensiveFormGame}
                                                        nashEquilibria={analysis.nashEquilibria}
                                                    />
                                                </>
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'analysis' && analysis && game && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <AnalysisPanel
                                                analysis={analysis}
                                                game={game}
                                                ambiguities={result.ambiguities}
                                                assumptions={result.assumptions}
                                            />
                                        </motion.div>
                                    )}

                                    {/* Error */}
                                    {!result.success && result.error && (
                                        <div
                                            className="glass-card p-5 rounded-xl"
                                            style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}
                                        >
                                            <p className="text-sm font-semibold text-red-400 mb-1">Translation Error</p>
                                            <p className="text-sm" style={{ color: 'rgba(248,113,113,0.8)' }}>{result.error}</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>

                {/* Footer */}
                <footer className="flex-shrink-0 px-6 py-3 text-center text-xs" style={{ color: 'rgba(148,163,184,0.3)', borderTop: '1px solid rgba(148,163,184,0.06)' }}>
                    NL2Game · Built for Gambit GSoC 2026 · GameInterpreter Project 2
                </footer>
            </div>

            <Toaster
                position="top-right"
                toastOptions={{
                    style: { background: '#0f1629', border: '1px solid rgba(148,163,184,0.15)', color: '#f1f5f9', fontSize: '13px' },
                }}
            />
        </div>
    );
}
