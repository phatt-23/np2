// Created by phatt-23 on 20/12/2025

import { Solver3CG } from "$lib/solve/Solver3CG";
import { Graph } from "$lib/instance/Graph";
import { Unsolvable } from "$lib/core/Unsolvable";

self.onmessage = async (e) => {
    console.debug('Worker3CGSolver::onmessage');
    console.debug('e.data', e.data);

    try {
        const instance: Graph = Graph.fromSerializedString(e.data);
        
        console.debug('instance', instance.asString());

        const solver = new Solver3CG(instance);

        console.debug('calling solve');
        const result = solver.solve();

        console.debug('posting the promise');
        postMessage(result || Unsolvable);
    }
    catch (e) {
        postMessage({
            error: true,
            message: e instanceof Error ? e.message : String(e)
        });
    }
};

