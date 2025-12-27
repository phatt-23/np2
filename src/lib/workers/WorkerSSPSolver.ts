// Created by phatt-23 on 22/10/2025

import { Unsolvable } from "$lib/core/Unsolvable";
import { SSP } from "$lib/instance/SSP";
import { SolverSSP } from "$lib/solve/SolverSSP";
import { WorkerResponseType, type WorkerRequestSSP, type WorkerResponseSSP } from "./types";

self.onmessage = async (e: MessageEvent<WorkerRequestSSP>) => {
    try {
        const ssp = SSP.fromSerializedString(e.data.ssp);
        
        if (typeof ssp == 'string') {
            postMessage({
                type: WorkerResponseType.ERROR,
                message: "SSP couldn't be parsed from string.",
            });

            return;
        }

        const solver = new SolverSSP(ssp);
        const result = solver.solve();

        const response: WorkerResponseSSP = (result == Unsolvable) 
            ? ({ type: WorkerResponseType.UNSOLVABLE })
            : ({
                type: WorkerResponseType.RESULT,
                numbers: result.numbers, 
            });

        postMessage(response);
    }
    catch (e) {
        postMessage({
            type: WorkerResponseType.ERROR,
            message: e instanceof Error ? e.message : String(e)
        });
    }
};
