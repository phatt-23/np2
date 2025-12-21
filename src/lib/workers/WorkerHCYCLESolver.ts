// Created by phatt-23 on 20/10/2025

import { SolverHCYCLE } from "$lib/solve/SolverHCYCLE";
import { Unsolvable } from "$lib/core/Unsolvable";
import { Graph } from "$lib/instance/Graph";

self.onmessage = async (e) => {
    postMessage('WorkerHCYCLESolver::onmessage');

    try {
        console.debug('WorkerHCYCLESolver::onmessage');

        const instance: Graph = Graph.fromSerializedString(e.data);
        const solver = new SolverHCYCLE(instance);
        const result = solver.solve();
        postMessage(result || Unsolvable);
    }
    catch (e) {
        postMessage({
            error: true,
            message: e instanceof Error ? e.message : String(e)
        });
    }
};
