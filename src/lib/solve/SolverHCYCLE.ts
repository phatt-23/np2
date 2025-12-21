// Created by phatt-23 on 19/10/2025

import { Unsolvable } from "$lib/core/Unsolvable";
import type { Graph, GraphNode } from "$lib/instance/Graph";
import { CertificateHCYCLE } from "./CertificateHCYCLE";
import type { Solver } from "./Solver";

export class SolverHCYCLE implements Solver<Graph, CertificateHCYCLE> {
    public instance : Graph;

    public constructor(instance : Graph) {
        this.instance = instance;
    }

    public solve(): CertificateHCYCLE | Unsolvable {
        const nodes = this.instance.nodes;
        const edges = this.instance.edges;

        if (this.instance.isEmpty()) {
            throw new Error("Graph is empty.");
        }

        // Build adjacency list for fast lookup
        const adj = new Map<string, Set<string>>();
        for (const node of nodes) {
            adj.set(node.id, new Set());
        }

        for (const edge of edges) {
            if (adj.has(edge.from) && adj.has(edge.to)) {
                adj.get(edge.from)!.add(edge.to);

                // if it were undirected
                // adj.get(edge.to)!.add(edge.from); 
            }
        }

        const start = nodes[0].id;
        const path: string[] = [start];
        const visited = new Set<string>([start]);

        const found = this.backtrack(start, start, visited, path, nodes.length, adj);
        if (!found) {
            return Unsolvable;
        }

        const graph = this.instance.copy();
        const pathNodes = new Array<GraphNode>();

        path.forEach(p => {
            const node = graph.nodes.find(n => n.id == p);
            if (!node) {
                throw new Error(`Node id in the path is not pointing to any valid node: ${p}`);
            }

            pathNodes.push(node);
        });

        return new CertificateHCYCLE(pathNodes); 
    }

    /** 
     * Backtracking search for Hamiltonian cycle 
     */
    private backtrack(
        current : string,
        start : string,
        visited : Set<string>,
        path : string[],
        totalNodes : number,
        adj : Map<string, Set<string>>
    ) : boolean {
        // If all nodes visited, check if last connects back to start
        if (visited.size === totalNodes) {
            if (adj.get(current)?.has(start)) {
                path.push(start); // complete the cycle
                return true;
            }
            return false;
        }

        for (const neighbor of adj.get(current) ?? []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                path.push(neighbor);

                if (this.backtrack(neighbor, start, visited, path, totalNodes, adj)) {
                    return true;
                }

                // backtrack
                visited.delete(neighbor);
                path.pop();
            }
        }

        return false;
    }
}
