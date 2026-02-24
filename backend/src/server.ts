import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import gameRoutes from './routes/game.routes';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api', gameRoutes);

// Startup warning
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.startsWith('AIzaSy-your')) {
    console.warn('\n⚠️  WARNING: GEMINI_API_KEY is not configured.');
    console.warn('   Please copy backend/.env.example to backend/.env and add your key.');
    console.warn('   Get a free key at: https://aistudio.google.com/app/apikey\n');
}

app.listen(PORT, () => {
    console.log(`\n🎮 NL2Game Backend running at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Examples: http://localhost:${PORT}/api/examples\n`);
});

export default app;
