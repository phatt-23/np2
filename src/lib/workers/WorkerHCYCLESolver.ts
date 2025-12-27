// Created by phatt-23 on 20/10/2025

import { SolverHCYCLE } from "$lib/solve/SolverHCYCLE";
import { Unsolvable } from "$lib/core/Unsolvable";
import { Graph } from "$lib/instance/Graph";
import { WorkerResponseType, type WorkerRequestHCYCLE, type WorkerResponseHCYCLE } from "./types";

self.onmessage = async (e: MessageEvent<WorkerRequestHCYCLE>) => {
    try {
        const instance: Graph = Graph.fromSerializedString(e.data.graph);
        const solver = new SolverHCYCLE(instance);
        const result = solver.solve();

        const response: WorkerResponseHCYCLE = (result == Unsolvable)
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
