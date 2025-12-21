// Created by phatt-23 on 21/10/2025

import { Unsolvable } from "$lib/core/Unsolvable";
import { Graph } from "$lib/instance/Graph";
import { SolverTSP } from "$lib/solve/SolverTSP";
import { WorkerResponseType, type WorkerRequestTSP, type WorkerResponseTSP } from "./types";

self.onmessage = async (message: MessageEvent<WorkerRequestTSP>) => {
    console.debug('WorkerTSPSolver::onmessage');

    try {
        const serializedGraph: string = message.data.graph;
        const maxCost: number = message.data.maxCost;

        const instance: Graph = Graph.fromSerializedString(serializedGraph);

        const solver = new SolverTSP(instance, maxCost);
        const result = solver.solve();

        const response: WorkerResponseTSP = (result == Unsolvable)
            ? ({ type: WorkerResponseType.UNSOLVABLE })
            : ({ 
                type: WorkerResponseType.RESULT,
                path: result.path, 
            })

        postMessage(response);
    }
    catch (e) {
        postMessage({
            type: WorkerResponseType.ERROR,
            message: e instanceof Error ? e.message : String(e)
        });
    }
};
