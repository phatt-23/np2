import { type Id } from "$lib/core/Id";
import { Unsolvable } from "$lib/core/Unsolvable";
import type { Graph, GraphNode } from "$lib/instance/Graph";
import { Certificate3CG, type Coloring } from "./Certificate3CG";
import type { Solver } from "./Solver";


export class Solver3CG implements Solver<Graph, Certificate3CG> {
    constructor(public instance: Graph) {

    }

    public solve(): Certificate3CG | Unsolvable {
        const graph = this.instance.copy(); // do NOT mutate original
        const nodes = graph.nodes;

        const adjacency = this.buildAdjacency(graph);
        const coloring = new Map<Id,Coloring>();

        // initial coloring
        nodes.forEach(n => {
            if (n.color) {
                coloring.set(n.id, { 
                    label: n.label ?? 'UNKNOWN',
                    colorNumber: n.color,
                });
            }
        })
        // coloring.set(CG3_ID.CORE.T, 1);
        // coloring.set(CG3_ID.CORE.F, 0);
        // coloring.set(CG3_ID.CORE.B, 2);

        const success = this.backtrackColor(0, nodes, adjacency, coloring);

        if (!success) {
            return Unsolvable;
        }

        return new Certificate3CG(coloring);
    }

    private buildAdjacency(graph: Graph): Map<Id, Set<Id>> {
        const adj = new Map<Id, Set<Id>>();

        for (const node of graph.nodes) {
            adj.set(node.id, new Set());
        }

        for (const edge of graph.edges) {
            adj.get(edge.from)!.add(edge.to);
            adj.get(edge.to)!.add(edge.from); // undirected
        }

        return adj;
    }

    private backtrackColor(
        index: number,
        nodes: GraphNode[],
        adj: Map<Id, Set<Id>>,
        coloring: Map<Id, Coloring>
    ): boolean {
        if (index == nodes.length) {
            return true; // all nodes colored
        }

        const node = nodes[index];
        const alreadyColored = coloring.has(node.id);

        for (let color = 0; color < 3; color++) {
            if (!this.canUseColor(node.id, color, adj, coloring))
                continue;

            // local change
            if (!alreadyColored)
                coloring.set(node.id, { label: node.label ?? 'Unknown', colorNumber: color });

            // recurse
            if (this.backtrackColor(index + 1, nodes, adj, coloring)) {
                return true;
            }

            // backtrack
            if (!alreadyColored)
                coloring.delete(node.id); 
        }

        return false;
    }

    private canUseColor(
        nodeId: Id,
        color: number,
        adj: Map<Id, Set<Id>>,
        coloring: Map<Id, Coloring>
    ): boolean {
        for (const neighbor of adj.get(nodeId)!) {
            if (coloring.get(neighbor)?.colorNumber == color) {
                return false;
            }
        }
        return true;
    }
}
