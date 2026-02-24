import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ExtensiveFormGame, GameTreeNode, NashEquilibrium } from '../types/game.types';

interface GameTreeProps {
    game: ExtensiveFormGame;
    nashEquilibria: NashEquilibrium[];
}

interface D3Node {
    id: string;
    type: string;
    label: string;
    playerId?: string;
    payoffs?: number[];
    actions?: string[];
    children?: D3Node[];
}

type HierarchyNode = d3.HierarchyPointNode<D3Node>;

// Colors for each player
const PLAYER_COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#fb923c', '#f472b6'];
const TERMINAL_COLOR = '#475569';
const NASH_COLOR = '#f59e0b';

function convertToD3(node: GameTreeNode, playerMap: Map<string, number>): D3Node {
    const label = node.label || node.id;
    return {
        id: node.id,
        type: node.type,
        label,
        playerId: node.playerId,
        payoffs: node.payoffs,
        actions: node.actions,
        children: node.children?.map(c => convertToD3(c.node, playerMap))
    };
}

export default function GameTree({ game, nashEquilibria }: GameTreeProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const playerMap = new Map(game.players.map((p, i) => [p.id, i]));
        const root = convertToD3(game.rootNode, playerMap);

        const containerWidth = svgRef.current.parentElement?.clientWidth || 700;
        const margin = { top: 40, right: 60, bottom: 40, left: 60 };
        const width = containerWidth - margin.left - margin.right;

        // Count leaves to estimate height
        function countLeaves(n: D3Node): number {
            if (!n.children || n.children.length === 0) return 1;
            return n.children.reduce((a, c) => a + countLeaves(c), 0);
        }
        const leaves = countLeaves(root);
        const height = Math.max(300, leaves * 70);

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        svg.attr('width', containerWidth).attr('height', height + margin.top + margin.bottom);

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // D3 tree layout (left→right)
        const treeLayout = d3.tree<D3Node>().size([height, width]);
        const hierarchy = d3.hierarchy(root);
        const treeData = treeLayout(hierarchy);

        // Draw links
        const link = g.selectAll('.game-tree-link')
            .data(treeData.links())
            .join('path')
            .attr('class', 'game-tree-link')
            .attr('d', d3.linkHorizontal<d3.HierarchyPointLink<D3Node>, HierarchyNode>()
                .x(d => d.y)
                .y(d => d.x)
            )
            .attr('stroke', 'rgba(148,163,184,0.2)')
            .attr('stroke-width', 1.5)
            .attr('fill', 'none');

        // Draw action labels on links
        g.selectAll('.action-label')
            .data(treeData.links())
            .join('text')
            .attr('class', 'action-label')
            .attr('x', d => (d.source.y + d.target.y) / 2)
            .attr('y', d => (d.source.x + d.target.x) / 2 - 6)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', 'rgba(148,163,184,0.6)')
            .attr('font-family', 'Inter, sans-serif')
            .text(d => {
                const sourceData = d.source.data;
                if (!sourceData.children) return '';
                const childIdx = sourceData.children.findIndex(c => c.id === d.target.data.id);
                if (childIdx === -1) return '';
                // Get the action from the original game tree
                function findActions(node: GameTreeNode, targetId: string): string {
                    if (!node.children) return '';
                    for (const child of node.children) {
                        if (child.node.id === targetId) return child.action;
                        const found = findActions(child.node, targetId);
                        if (found) return found;
                    }
                    return '';
                }
                return findActions(game.rootNode, d.target.data.id);
            });

        // Draw nodes
        const node = g.selectAll('.game-tree-node')
            .data(treeData.descendants())
            .join('g')
            .attr('class', 'game-tree-node')
            .attr('transform', d => `translate(${d.y},${d.x})`)
            .style('cursor', 'pointer');

        // Node circles / shapes
        node.each(function (d) {
            const el = d3.select(this);
            const nodeData = d.data;
            const playerIdx = nodeData.playerId ? (playerMap.get(nodeData.playerId) ?? 0) : 0;
            const color = nodeData.type === 'terminal' ? TERMINAL_COLOR : PLAYER_COLORS[playerIdx % PLAYER_COLORS.length];

            if (nodeData.type === 'terminal') {
                // Diamond for terminal nodes
                el.append('polygon')
                    .attr('points', '0,-14 14,0 0,14 -14,0')
                    .attr('fill', 'rgba(71,85,105,0.3)')
                    .attr('stroke', color)
                    .attr('stroke-width', 1.5);
            } else if (nodeData.type === 'chance') {
                // Square for chance nodes
                el.append('rect')
                    .attr('x', -12).attr('y', -12).attr('width', 24).attr('height', 24)
                    .attr('rx', 4)
                    .attr('fill', `${color}22`)
                    .attr('stroke', color)
                    .attr('stroke-width', 2);
            } else {
                // Circle for decision nodes
                el.append('circle')
                    .attr('r', 16)
                    .attr('fill', `${color}22`)
                    .attr('stroke', color)
                    .attr('stroke-width', 2);

                // Player label inside circle
                el.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.35em')
                    .attr('font-size', '10px')
                    .attr('font-weight', '600')
                    .attr('fill', color)
                    .attr('font-family', 'Inter, sans-serif')
                    .text(game.players.find(p => p.id === nodeData.playerId)?.name.slice(0, 2) || '?');
            }
        });

        // Node labels below
        node.append('text')
            .attr('dy', d => d.data.type === 'terminal' ? '28px' : '32px')
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', 'rgba(148,163,184,0.7)')
            .attr('font-family', 'Inter, sans-serif')
            .text(d => {
                if (d.data.type === 'terminal' && d.data.payoffs) {
                    return `(${d.data.payoffs.join(', ')})`;
                }
                return d.data.label || '';
            });

        // Tooltip on hover
        const tooltip = d3.select('body').append('div')
            .attr('id', 'game-tree-tooltip')
            .style('position', 'fixed')
            .style('background', 'rgba(15,22,41,0.95)')
            .style('border', '1px solid rgba(148,163,184,0.2)')
            .style('color', '#f1f5f9')
            .style('padding', '8px 12px')
            .style('border-radius', '8px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('z-index', 9999)
            .style('font-family', 'Inter, sans-serif');

        node
            .on('mouseenter', (event, d) => {
                const nd = d.data;
                let content = '';
                if (nd.type === 'terminal' && nd.payoffs) {
                    content = `Terminal node<br>Payoffs: (${game.players.map((p, i) => `${p.name}: ${nd.payoffs![i]}`).join(', ')})`;
                } else if (nd.type === 'decision') {
                    const player = game.players.find(p => p.id === nd.playerId);
                    content = `${player?.name || 'Unknown'}'s decision<br>Actions: ${nd.actions?.join(', ') || 'N/A'}`;
                } else {
                    content = `Chance node`;
                }
                tooltip
                    .html(content)
                    .style('left', `${event.clientX + 12}px`)
                    .style('top', `${event.clientY - 10}px`)
                    .transition().duration(150).style('opacity', 1);
            })
            .on('mouseleave', () => {
                tooltip.transition().duration(150).style('opacity', 0);
            });

        return () => {
            d3.select('#game-tree-tooltip').remove();
        };
    }, [game, nashEquilibria]);

    return (
        <div className="w-full overflow-x-auto">
            {/* Player legend */}
            <div className="flex items-center gap-4 mb-3 flex-wrap">
                {game.players.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-1.5 text-xs">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ background: PLAYER_COLORS[i % PLAYER_COLORS.length] + '44', border: `1.5px solid ${PLAYER_COLORS[i % PLAYER_COLORS.length]}` }}
                        />
                        <span style={{ color: PLAYER_COLORS[i % PLAYER_COLORS.length] }}>{p.name}</span>
                    </div>
                ))}
                <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-3 h-3" style={{ background: TERMINAL_COLOR + '44', border: `1.5px solid ${TERMINAL_COLOR}`, transform: 'rotate(45deg)', width: '10px', height: '10px' }} />
                    <span style={{ color: TERMINAL_COLOR }}>Terminal (payoffs)</span>
                </div>
            </div>

            <svg ref={svgRef} className="w-full" style={{ minHeight: '300px' }} />
        </div>
    );
}
