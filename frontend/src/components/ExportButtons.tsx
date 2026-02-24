import { Download, FileJson, FileText } from 'lucide-react';
import { NormalFormGame, ExtensiveFormGame, AnalysisResult } from '../types/game.types';

interface ExportButtonsProps {
    game: NormalFormGame | ExtensiveFormGame;
    analysis: AnalysisResult;
}

function downloadFile(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportJson(game: NormalFormGame | ExtensiveFormGame, analysis: AnalysisResult) {
    const data = { game, analysis, exportedAt: new Date().toISOString() };
    downloadFile('nl2game-export.json', JSON.stringify(data, null, 2), 'application/json');
}

function exportCsv(game: NormalFormGame | ExtensiveFormGame) {
    if (game.type !== 'normal-form') {
        downloadFile(
            'nl2game-tree.csv',
            'Game Type: Extensive-Form\nExport as JSON for full tree structure.\n',
            'text/csv'
        );
        return;
    }

    const rows: string[] = [];
    const header = ['Strategy Profile', ...game.players.map(p => `${p.name} Payoff`)];
    rows.push(header.join(','));
    for (const pe of game.payoffs) {
        const row = [`"(${pe.strategyProfile.join(', ')})"`, ...pe.payoffs.map(String)];
        rows.push(row.join(','));
    }
    downloadFile('nl2game-payoffs.csv', rows.join('\n'), 'text/csv');
}

export default function ExportButtons({ game, analysis }: ExportButtonsProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest mr-1" style={{ color: 'rgba(148,163,184,0.4)' }}>
                Export
            </span>
            <button
                onClick={() => exportJson(game, analysis)}
                className="btn-secondary text-xs"
                title="Download full game data as JSON"
                id="export-json-btn"
            >
                <FileJson size={13} />
                JSON
            </button>
            <button
                onClick={() => exportCsv(game)}
                className="btn-secondary text-xs"
                title="Download payoff matrix as CSV"
                id="export-csv-btn"
            >
                <FileText size={13} />
                CSV
            </button>
        </div>
    );
}
