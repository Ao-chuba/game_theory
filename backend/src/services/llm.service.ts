import OpenAI from 'openai';
import { LLMGameResponse } from '../models/types';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-your')) {
        throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.');
    }

    const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Extract the game structure from this description:\n\n${description}` }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) throw new Error('Empty response from LLM');

    let parsed: LLMGameResponse;
    try {
        parsed = JSON.parse(rawContent) as LLMGameResponse;
    } catch {
        throw new Error(`Failed to parse LLM response as JSON: ${rawContent.slice(0, 200)}`);
    }

    // Basic validation
    if (!parsed.gameType) throw new Error('LLM response missing gameType');
    if (!parsed.players || parsed.players.length === 0) throw new Error('LLM response missing players');
    if (!parsed.ambiguities) parsed.ambiguities = [];
    if (!parsed.assumptions) parsed.assumptions = [];

    return parsed;
}
