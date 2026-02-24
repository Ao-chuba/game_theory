# NL2Game — Natural Language to Game Theory

> Translate plain-English game descriptions into formal game theory representations using LLMs, with interactive payoff matrices, game trees, and Nash equilibrium analysis.

---

## Quick Start

### Prerequisites
- Node.js 18+
- Google Gemini API key (free — get one at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm run dev
```

Server starts at `http://localhost:3001`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App opens at `http://localhost:5173`

---

## Features

| Feature | Status |
|---|---|
| Natural language → payoff matrix | ✅ |
| Natural language → game tree | ✅ |
| Pure-strategy Nash equilibrium finder | ✅ |
| Dominant strategy detection | ✅ |
| 10 classic game templates | ✅ |
| Interactive D3.js game tree | ✅ |
| Export JSON / CSV | ✅ |
| 2-player and 3+-player support | ✅ |

## Key Test Cases

```
# Prisoner's Dilemma → 2x2 matrix, NE: (Betray, Betray)
"Two suspects are interrogated separately. If both stay silent, each gets 1 year..."

# Entry Game → game tree, equilibrium path highlighted
"A potential Entrant decides whether to Enter or Stay Out of a market..."

# Ambiguous → flags issues
"Two companies compete with strategies."
```

## Architecture

```
project-gambit/
├── backend/
│   └── src/
│       ├── models/types.ts          # NormalFormGame, ExtensiveFormGame, etc.
│       ├── services/
│       │   ├── llm.service.ts       # Google Gemini gemini-1.5-flash integration
│       │   ├── parser.service.ts    # Nash solver + game parser
│       │   └── examples.service.ts  # 10 classic templates
│       ├── routes/game.routes.ts    # POST /translate, GET /examples
│       └── server.ts
└── frontend/
    └── src/
        ├── components/
        │   ├── InputForm.tsx         # Textarea + example selector
        │   ├── PayoffMatrix.tsx      # Interactive table with Nash highlights
        │   ├── GameTree.tsx          # D3.js extensive-form tree
        │   ├── AnalysisPanel.tsx     # Nash, dominant, properties
        │   └── ExportButtons.tsx
        ├── services/api.ts
        ├── types/game.types.ts
        └── App.tsx
```

## API Reference

### `POST /api/translate`
```json
// Request
{ "description": "Two players simultaneously choose..." }

// Response
{
  "success": true,
  "game": { "type": "normal-form", "players": [...], "strategies": [...], "payoffs": [...] },
  "analysis": { "nashEquilibria": [...], "dominantStrategies": [...], "isZeroSum": false }
}
```

### `GET /api/examples`
Returns 10 classic game templates with descriptions.

