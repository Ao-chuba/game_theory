import { Router, Request, Response } from 'express';
import { translateGameDescription } from '../services/llm.service';
import { parseGame, analyzeGame } from '../services/parser.service';
import { EXAMPLE_GAMES } from '../services/examples.service';
import { TranslateResponse } from '../models/types';

const router = Router();

// POST /api/translate
router.post('/translate', async (req: Request, res: Response) => {
    try {
        const { description } = req.body as { description?: string };

        if (!description || description.trim().length < 10) {
            return res.status(400).json({
                success: false,
                ambiguities: ['Description too short. Please provide more detail.'],
                assumptions: [],
                error: 'Description must be at least 10 characters.'
            } satisfies TranslateResponse);
        }

        const llmResponse = await translateGameDescription(description.trim());
        const game = parseGame(llmResponse);
        const analysis = analyzeGame(game);

        const response: TranslateResponse = {
            success: true,
            game,
            analysis,
            ambiguities: llmResponse.ambiguities,
            assumptions: llmResponse.assumptions
        };

        return res.json(response);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[/translate error]', message);
        return res.status(500).json({
            success: false,
            ambiguities: [],
            assumptions: [],
            error: message
        } satisfies TranslateResponse);
    }
});

// GET /api/examples
router.get('/examples', (_req: Request, res: Response) => {
    res.json(EXAMPLE_GAMES);
});

// GET /api/health
router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
