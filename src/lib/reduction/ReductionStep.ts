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

    // snapshot of the output instance in this current step
    outSnapshot: O;  
}
