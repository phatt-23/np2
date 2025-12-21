// Created by phatt-23 on 22/10/2025

import { Unsolvable } from "$lib/core/Unsolvable";
import { SSP } from "$lib/instance/SSP";
import { SolverSSP } from "$lib/solve/SolverSSP";

self.onmessage = async (e) => {
    console.debug('WorkerSSPSolver::onmessage');
    postMessage('WorkerSSPSolver::onmessage');

    try {
        console.debug('Calling SSP.fromSerializedString method');
        const ssp = SSP.fromSerializedString(e.data);

        if (typeof ssp == 'string') {
            postMessage(new Error("SSP couldn't be parsed from string."));
            return;
        }

        console.debug('Creating new solver');

        const solver = new SolverSSP(ssp);

        console.debug('solving...');
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
