// Created by phatt-23 on 21/10/2025

import { Unsolvable } from "$lib/core/Unsolvable";
import type { Graph } from "$lib/instance/Graph";
import { CertificateTSP } from "./CertificateTSP";
import type { Solver } from "./Solver";

export class SolverTSP implements Solver<Graph, CertificateTSP> {
    instance: Graph;
    maxCost: number;

    constructor(instance: Graph, maxCost: number) {
        this.instance = instance;
        this.maxCost = maxCost;
    }

    solve(): CertificateTSP | Unsolvable {
        const nodes = this.instance.nodes;
        const edges = this.instance.edges;

        const n = nodes.length;
        if (n == 0) return Unsolvable;
        if (n == 1) return new CertificateTSP([nodes[0]]);

        // build adjacency matrix
        const dist: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity));

        for (const e of edges) {
            const from = nodes.findIndex(v => v.id == e.from);
            const to = nodes.findIndex(v => v.id == e.to);
            if (from !== -1 && to !== -1) {
                const w = e.weight ?? 1;
                dist[from][to] = w;
                dist[to][from] = w; // undirected TSP
            }
        }

        const start = 0;
        const size = 1 << n;
        const dp: number[][] = Array.from({ length: size }, () => Array(n).fill(Infinity));
        const parent: number[][] = Array.from({ length: size }, () => Array(n).fill(-1));

        dp[1 << start][start] = 0;

        for (let mask = 0; mask < size; mask++) {
            for (let last = 0; last < n; last++) {
                if (!(mask & (1 << last))) 
                    continue;

                const prevMask = mask ^ (1 << last);

                if (prevMask == 0) 
                    continue;

                for (let k = 0; k < n; k++) {
                    if (!(prevMask & (1 << k))) 
                        continue;

                    const newCost = dp[prevMask][k] + dist[k][last];

                    if (newCost < dp[mask][last]) {
                        dp[mask][last] = newCost;
                        parent[mask][last] = k;
                    }
                }
            }
        }

        // find best cycle
        let minCost = Infinity;
        let lastNode = -1;
        const fullMask = size - 1;

        for (let i = 0; i < n; i++) {
            const cost = dp[fullMask][i] + dist[i][start];
            if (cost < minCost) {
                minCost = cost;
                lastNode = i;
            }
        }

        if (minCost == Infinity || minCost > this.maxCost) {
            return Unsolvable;
        }

        // reconstruct path
        const path: number[] = [];
        let mask = fullMask;
        let curr = lastNode;
        while (curr !== -1) {
            path.push(curr);
            const prev = parent[mask][curr];
            mask ^= (1 << curr);
            curr = prev;
        }
        path.reverse();
        path.push(start);

        // convert indices to nodes
        const nodePath = path.map(i => nodes[i]);

        return new CertificateTSP(nodePath);
    }
}
