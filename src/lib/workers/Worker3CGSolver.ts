// Created by phatt-23 on 20/12/2025

import { Solver3CG } from "$lib/solve/Solver3CG";
import { Graph } from "$lib/instance/Graph";
import { Unsolvable } from "$lib/core/Unsolvable";
import { WorkerResponseType, type WorkerRequest3CG, type WorkerResponse3CG } from "./types";

self.onmessage = async (e: MessageEvent<WorkerRequest3CG>) => {
    console.debug('Worker3CGSolver::onmessage');

    try {
        const instance: Graph = Graph.fromSerializedString(e.data.graph);
        const solver = new Solver3CG(instance);
        const result = solver.solve();

        const response: WorkerResponse3CG = (result == Unsolvable) 
            ? ({ type: WorkerResponseType.UNSOLVABLE }) 
            : ({ 
                type: WorkerResponseType.RESULT, 
                coloring: Array.from(result.coloring.entries()) 
            });

        postMessage(response);
    }
    catch (e) {
        const res: WorkerResponse3CG = {
            type: WorkerResponseType.ERROR,
            message: e instanceof Error ? e.message : String(e)
        };

        postMessage(res);
    }
};

