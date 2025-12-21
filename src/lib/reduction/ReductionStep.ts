//
// Created by phatt-23 on 11/10/2025
//

import type { ProblemInstance } from "$lib/instance/ProblemInstance";

export interface ReductionStep<I extends ProblemInstance, O extends ProblemInstance> {
    id: string;

    // tell what is beign done in general terms
    title: string;

    // detailed description of what is being done (html allowed)
    description: string;  

    // optional snapshots, otherwise the inInstance and outInstance
    // from the ReductionStore will be used instead
    inSnapshot?: I;
    outSnapshot?: O;  

    // I element id -> O element ids (shows correspondence between I element and O elements)
    mapping?: Record<string, string[]>;  

    // children steps
    interSteps?: ReductionStep<I, O>[];
}
