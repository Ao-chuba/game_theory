import axios from 'axios';
import { TranslateResponse, ExampleGame } from '../types/game.types';

const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
});

export async function translateGame(description: string): Promise<TranslateResponse> {
    const res = await api.post<TranslateResponse>('/translate', { description });
    return res.data;
}

export async function getExamples(): Promise<ExampleGame[]> {
    const res = await api.get<ExampleGame[]>('/examples');
    return res.data;
}
