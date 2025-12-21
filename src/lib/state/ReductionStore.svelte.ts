//
// Created by phatt-23 on 11/10/2025
//

import Serializer from "$lib/core/Serializer";
import type { Unsolvable } from "$lib/core/Unsolvable";
import type { ProblemInstance } from "$lib/instance/ProblemInstance";
import type { ReductionStep } from "$lib/reduction/ReductionStep";
import type { Certificate } from "$lib/solve/Certificate";

@Serializer.SerializableClass("ReductionStore")
export class ReductionStore
    <
        I extends ProblemInstance, 
        O extends ProblemInstance,
        IC extends Certificate,
        OC extends Certificate,
    > 
{
    inInstance: I | null = null
    outInstance: O | null = null

    steps: ReductionStep<I, O>[] = []
    stepIndex: number = 0

    inCert: IC | Unsolvable | null = null;
    outCert: OC | Unsolvable | null = null;

    public reset() {
        this.inInstance = null;
        this.outInstance = null;
        this.inCert = null;
        this.outCert = null;
        this.steps = [];
        this.stepIndex = 0;
    }
    public resetStepIndex() {
        this.stepIndex = 0;
    }
    public setInInstance(inInstance: I) {
        this.reset();
        this.inInstance = inInstance;
    }
    public setOutInstance(outInstance: O) {
        this.outInstance = outInstance;
    }
    public setSteps(steps: ReductionStep<I, O>[]) {
        this.steps = steps;
        this.stepIndex = 0;
    }
    public nextStep() {
        const stepCount = this.steps.length;
        this.stepIndex = Math.min(this.stepIndex + 1, stepCount);
    }
    public prevStep() {
        this.stepIndex = Math.max(this.stepIndex - 1, 0); 
    }
    public hasInstances() : boolean {
        return this.inInstance != null && this.outInstance != null;
    }
    public hasInInstance() : boolean {
        return this.inInstance != null;
    }
    public hasOutInstance() : boolean {
        return this.outInstance != null;
    }
    public hasInCertificate() : boolean {
        return this.inCert != null;
    }
    public hasOutCertificate() : boolean {
        return this.outCert != null;
    }
}
