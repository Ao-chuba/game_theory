import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, Loader2, Zap } from 'lucide-react';
import { ExampleGame } from '../types/game.types';
import { getExamples } from '../services/api';

interface InputFormProps {
    onSubmit: (description: string) => void;
    isLoading: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
    'Classic': 'text-blue-400 bg-blue-400/10',
    'Coordination': 'text-green-400 bg-green-400/10',
    'Anti-Coordination': 'text-orange-400 bg-orange-400/10',
    'Zero-Sum': 'text-red-400 bg-red-400/10',
    'Sequential': 'text-purple-400 bg-purple-400/10',
    'Social Dilemma': 'text-yellow-400 bg-yellow-400/10',
};

const PLACEHOLDER = `Describe a game in natural language, for example:

"Two prisoners can cooperate or betray each other. If both cooperate, each gets 1 year. If one betrays while the other cooperates, the betrayer goes free and the other gets 3 years. If both betray, each gets 2 years."

The AI will extract players, strategies, and payoffs automatically.`;

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
    const [description, setDescription] = useState('');
    const [examples, setExamples] = useState<ExampleGame[]>([]);
    const [showExamples, setShowExamples] = useState(false);

    useEffect(() => {
        getExamples().then(setExamples).catch(() => { });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim().length >= 10 && !isLoading) {
            onSubmit(description.trim());
        }
    };

    const selectExample = (example: ExampleGame) => {
        setDescription(example.description);
        setShowExamples(false);
    };

    const charCount = description.length;
    const isReady = charCount >= 10 && !isLoading;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Example selector */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowExamples(!showExamples)}
                    className="btn-secondary w-full justify-between"
                    id="example-selector"
                >
                    <span className="flex items-center gap-2">
                        <Zap size={14} className="text-brand-400" />
                        Load Classic Game Example
                    </span>
                    <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${showExamples ? 'rotate-180' : ''}`}
                    />
                </button>

                {showExamples && (
                    <div
                        className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border overflow-hidden shadow-2xl"
                        style={{ background: '#0f1629', borderColor: 'rgba(148,163,184,0.15)', maxHeight: '320px', overflowY: 'auto' }}
                    >
                        {examples.map(ex => (
                            <button
                                key={ex.id}
                                type="button"
                                onClick={() => selectExample(ex)}
                                className="w-full text-left px-4 py-3 text-sm transition-colors duration-150 border-b flex items-start gap-3"
                                style={{ borderColor: 'rgba(148,163,184,0.08)' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(14,165,233,0.08)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-medium text-slate-200">{ex.title}</span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CATEGORY_COLORS[ex.category] || 'text-slate-400 bg-slate-400/10'}`}>
                                            {ex.category}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-xs line-clamp-2">{ex.description.slice(0, 100)}…</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Textarea */}
            <div className="relative">
                <textarea
                    id="game-description"
                    className="input-field"
                    rows={8}
                    placeholder={PLACEHOLDER}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    disabled={isLoading}
                    spellCheck={false}
                />
                <div
                    className="absolute bottom-3 right-3 text-xs font-mono"
                    style={{ color: charCount < 10 ? 'rgb(239 68 68 / 0.7)' : 'rgba(148,163,184,0.4)' }}
                >
                    {charCount} chars
                </div>
            </div>

            {/* Submit button */}
            <button
                type="submit"
                className="btn-primary"
                disabled={!isReady}
                id="translate-btn"
            >
                {isLoading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Translating to Game Theory…
                    </>
                ) : (
                    <>
                        <Sparkles size={18} />
                        Translate to Game Theory
                    </>
                )}
            </button>

            {charCount > 0 && charCount < 10 && (
                <p className="text-xs text-red-400/70 -mt-2">
                    Please enter at least 10 characters to describe the game.
                </p>
            )}
        </form>
    );
}
