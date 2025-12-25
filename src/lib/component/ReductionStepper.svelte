<!--
Created by phatt-23 on 12/10/2025
-->

<script lang="ts">
    import { ProblemInstance } from '$lib/instance/ProblemInstance';
    import type { ReductionStep } from '$lib/reduction/ReductionStep';

    type Props<
        I extends ProblemInstance, 
        O extends ProblemInstance
    > = {
        children: any;
        steps: ReductionStep<I,O>[];
        stepIndex: number;
        indent?: number,
        onNextClick?: () => void;
        onPrevClick?: () => void;
    }

    let { 
        children,
        steps, 
        stepIndex, 
        indent = 0,
        onNextClick = undefined, 
        onPrevClick = undefined,
    }: Props<ProblemInstance, ProblemInstance> = $props();

    const totalStepCount = steps.length;

    let showAll = $state(false);
    let showInterSteps = $state(false);
    let childStepIndex = $state(0);

    function prevClick() {
        if (onPrevClick && stepIndex > 0) {
            onPrevClick();
        }
    }

    function nextClick() {
        if (onNextClick && stepIndex < (totalStepCount - 1)) {
            onNextClick();
        }
    }
</script>

<main>
    <h2 class="dev">Reduction Stepper</h2>

    {#if stepIndex < steps.length}
        {@const step = steps[stepIndex]}

        <h3>Step #{stepIndex + 1}: {step.title}</h3>

        <div class="controls">
            <button onclick={prevClick}>Previous</button>
            <button onclick={nextClick}>Next</button>
            <span>{stepIndex + 1}/{totalStepCount}</span>
        </div>

        <div>
            {@render children()}
        </div> 

        <p>{@html step.description}</p>

    {:else}
        <span>Step index out of bounds</span>
    {/if}


</main>

<style>
</style>