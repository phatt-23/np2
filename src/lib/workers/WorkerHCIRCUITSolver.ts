// Created by phatt-23 on 21/10/2025

import { Unsolvable } from "$lib/core/Unsolvable";
import { Graph } from "$lib/instance/Graph";
import { SolverHCIRCUIT } from "$lib/solve/SolverHCIRCUIT";
import { WorkerResponseType, type WorkerRequestHCIRCUIT, type WorkerResponseHCIRCUIT } from "./types";

self.onmessage = async (message: MessageEvent<WorkerRequestHCIRCUIT>) => {
    try {
        const instance : Graph = Graph.fromSerializedString(message.data.graph);
        const solver = new SolverHCIRCUIT(instance);
        const result = solver.solve();

        const response: WorkerResponseHCIRCUIT = (result == Unsolvable)
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
