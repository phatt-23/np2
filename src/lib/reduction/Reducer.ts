//
// Created by phatt-23 on 11/10/2025
//

import type { ProblemInstance } from "$lib/instance/ProblemInstance";
import type { ReductionStep } from "./ReductionStep";

export type ReductionResult<
    I extends ProblemInstance, 
    O extends ProblemInstance,
> = { 
    outInstance: O, 
    steps: ReductionStep<I, O>[] 
};

export abstract class Reducer<
    I extends ProblemInstance, 
    O extends ProblemInstance,
> {
    constructor(public inInstance: I) {
    }

    public reduce(): ReductionResult<I, O> {
        if (this.inInstance.isEmpty()) {
            throw "Call to reduce failed. Input instance is empty.";
        }
        const result = this.doReduce();
        return result;
    }

    protected abstract doReduce(): ReductionResult<I, O>;
}
