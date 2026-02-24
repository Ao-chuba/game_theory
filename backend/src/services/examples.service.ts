import { ExampleGame } from '../models/types';

export const EXAMPLE_GAMES: ExampleGame[] = [
    {
        id: 'prisoners-dilemma',
        title: "Prisoner's Dilemma",
        category: 'Classic',
        description: `Two suspects are interrogated separately. If both stay silent, each gets 1 year in prison. If one betrays the other while the other stays silent, the betrayer goes free and the other gets 3 years. If both betray each other, each gets 2 years in prison.`
    },
    {
        id: 'battle-of-sexes',
        title: 'Battle of the Sexes',
        category: 'Coordination',
        description: `A couple wants to spend the evening together but disagree on where to go. Alice prefers the Opera, Bob prefers the Football game. If both go to Opera, Alice gets 3 and Bob gets 1. If both go to Football, Alice gets 1 and Bob gets 3. If they go to different places, both get 0.`
    },
    {
        id: 'stag-hunt',
        title: 'Stag Hunt',
        category: 'Coordination',
        description: `Two hunters can cooperate to hunt a stag (worth 4 each) or individually hunt a hare (worth 1 each). If one hunts stag alone while the other hunts hare, the stag hunter gets nothing (0) and the hare hunter gets 1.`
    },
    {
        id: 'chicken',
        title: 'Chicken (Hawk-Dove)',
        category: 'Anti-Coordination',
        description: `Two drivers race toward each other. Each can Swerve or Straight. If both Swerve, each gets 0. If one Swerves and the other goes Straight, the one who Swerved gets -1 (called chicken) and the one who went Straight gets 1. If both go Straight, both crash and get -10.`
    },
    {
        id: 'matching-pennies',
        title: 'Matching Pennies',
        category: 'Zero-Sum',
        description: `Two players each place a penny on a table, either Heads or Tails. If the pennies match (both Heads or both Tails), Player 1 wins and gets +1 while Player 2 gets -1. If they don't match, Player 2 wins and gets +1 while Player 1 gets -1.`
    },
    {
        id: 'entry-game',
        title: 'Entry Game (Market Entry)',
        category: 'Sequential',
        description: `A potential Entrant decides whether to Enter or Stay Out of a market. If the Entrant stays out, Entrant gets 0 and the Incumbent gets 10. If the Entrant enters, the Incumbent then chooses to either Accommodate or Fight. If the Incumbent accommodates, both get 5. If the Incumbent fights, both get 0.`
    },
    {
        id: 'coordination',
        title: 'Pure Coordination Game',
        category: 'Coordination',
        description: `Two drivers approach each other on a road. Each must choose to drive on the Left or the Right. If they both choose the same side, each gets a payoff of 1 (safe passage). If they choose different sides, both get 0 (collision).`
    },
    {
        id: 'rock-paper-scissors',
        title: 'Rock-Paper-Scissors',
        category: 'Zero-Sum',
        description: `Two players simultaneously choose Rock, Paper, or Scissors. Rock beats Scissors, Scissors beats Paper, Paper beats Rock. The winner gets +1 and the loser gets -1. Ties give both players 0.`
    },
    {
        id: 'public-goods',
        title: 'Public Goods Game',
        category: 'Social Dilemma',
        description: `Two people each have 10 tokens. Each can Contribute all tokens to a public fund or Keep them. The public fund doubles what's contributed and divides it equally. If both contribute, each gets 10 (20 total doubled to 40, split evenly). If one contributes and the other keeps, keeper gets 10+10=20, contributor gets 10-10+10=10. Wait—let me clarify: if both keep, each gets 10. If one contributes (10 tokens), total fund=10, doubled to 20, each gets 10; contributor started with 0, gets 10; keeper started with 10, gets 10+10=20. If both contribute, total fund=20, doubled to 40, each gets 20.`
    },
    {
        id: 'ultimatum-game',
        title: 'Ultimatum Game',
        category: 'Sequential',
        description: `A Proposer has 10 dollars to split with a Responder. The Proposer can offer a Fair split (5-5) or an Unfair split (8-2, keeping 8). The Responder can Accept or Reject. If accepted: payoffs as proposed. If the Responder rejects the Fair offer, both get 0. If the Responder rejects the Unfair offer, both get 0.`
    }
];

export function getExampleById(id: string): ExampleGame | undefined {
    return EXAMPLE_GAMES.find(g => g.id === id);
}
