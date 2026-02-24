import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMGameResponse } from '../models/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are a game theory expert who extracts formal game structures from natural language descriptions.

Your task is to analyze the description and return a JSON object with the following schema:

{
  "gameType": "normal-form" | "extensive-form",
  "players": [{ "id": string, "name": string, "role": string }],
  "normalForm": {                          // include ONLY if gameType is "normal-form"
    "strategies": [{ "player": string, "strategy": string }],
    "payoffs": [{ "strategyProfile": [string, ...], "payoffs": [number, ...] }]
  },
  "extensiveForm": {                       // include ONLY if gameType is "extensive-form"
    "rootNode": {
      "id": string,
      "type": "decision" | "chance" | "terminal",
      "playerId": string,                  // which player acts (omit for terminal/chance)
      "label": string,
      "actions": [string, ...],            // omit for terminal nodes
      "children": [{ "action": string, "node": <GameTreeNode> }],
      "payoffs": [number, ...]             // only for terminal nodes, one per player
    }
  },
  "ambiguities": [string, ...],            // unclear aspects of the description
  "assumptions": [string, ...]             // assumptions you made during formalization
}

Rules:
1. Use "normal-form" for simultaneous games, "extensive-form" for sequential games.
2. Use numerical payoffs. If only qualitative (better/worse), use a 1-3 scale (3=best).
3. For prison-style games, lower years = better (negate or use utility values accordingly — prefer utility so higher = better).
4. List ALL strategy combinations in payoffs (n-player = product of all strategy lists).
5. Player ids should be "P1", "P2", etc.
6. Strategy profile order must match player order.
7. Return ONLY valid JSON — no markdown fences, no prose.

If the description is too ambiguous to formalize, still return your best attempt and list all issues in "ambiguities".`;

export async function translateGameDescription(description: string): Promise<LLMGameResponse> {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.startsWith('AIzaSy-your')) {
        throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.');
    }

    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
        },
        systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(
        `Extract the game structure from this description:\n\n${description}`
    );

    const rawContent = result.response.text();
    if (!rawContent) throw new Error('Empty response from Gemini');

    let parsed: LLMGameResponse;
    try {
        parsed = JSON.parse(rawContent) as LLMGameResponse;
    } catch {
        throw new Error(`Failed to parse Gemini response as JSON: ${rawContent.slice(0, 200)}`);
    }

    // Basic validation
    if (!parsed.gameType) throw new Error('Gemini response missing gameType');
    if (!parsed.players || parsed.players.length === 0) throw new Error('Gemini response missing players');
    if (!parsed.ambiguities) parsed.ambiguities = [];
    if (!parsed.assumptions) parsed.assumptions = [];

    return parsed;
}
