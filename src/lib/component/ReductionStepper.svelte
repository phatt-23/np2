<!--
Created by phatt-23 on 12/10/2025
-->

<script lang="ts">
    import { ProblemInstance } from '$lib/instance/ProblemInstance';
    import type { ReductionStep } from '$lib/reduction/ReductionStep';
    import { onDestroy, onMount, type Snippet } from 'svelte';
    import Katex from './Katex.svelte';

    type Props<
        I extends ProblemInstance, 
        O extends ProblemInstance
    > = {
        outInstRender: (stepIndex: number) => ReturnType<Snippet>;
        steps: ReductionStep<I,O>[];
        stepIndex: number;
        onNextClick?: () => void;
        onPrevClick?: () => void;
    }

    let { 
        outInstRender,
        steps, 
        stepIndex, 
        onNextClick = undefined, 
        onPrevClick = undefined,
    }: Props<ProblemInstance, ProblemInstance> = $props();

    const totalStepCount = steps.length;

    let showAll = $state(false);

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

    function handleKeydown(event: KeyboardEvent) {
        const target = event.target as HTMLElement;

        if (
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target.isContentEditable
        ) {
            return;
        }

        switch (event.key) {
            case 'ArrowLeft':
                prevClick();
                break;
            case 'ArrowRight':
                nextClick();
                break;
        }
    }

    let mainContainer: HTMLElement;

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
    });

    onDestroy(() => {
        window.removeEventListener('keydown', handleKeydown);
    });
</script>

{#snippet controls()}
    <div class="controls">
        <label class="checkbox-wrapper">
            <input type="checkbox" bind:checked={showAll}>
            <span>Show all</span>
        </label>

        <div class="stepper">
            <button disabled={showAll} onclick={prevClick}>
                Previous
            </button>
            
            <span class={[showAll && "disabled"]}>
                {stepIndex + 1}/{totalStepCount}
            </span>
            
            <button disabled={showAll} onclick={nextClick}>
                Next
            </button>
        </div>
    </div>
{/snippet}

{#snippet title(title: string, stepIndex: number)}
    {#key stepIndex}
        <h3>
            <Katex inline html text={`
                Step #${stepIndex + 1}: ${title}
            `}>
            </Katex>
        </h3>
    {/key}
{/snippet}

<main bind:this={mainContainer}>
    <h2 class="dev">Reduction Stepper</h2>

    {@render controls()}


    {#if showAll}
        <!-- Loads everything (slow) -->
        {#each steps as step, stepIndex}

            {@render title(step.title, stepIndex)}
            {@render outInstRender(stepIndex)}
            <Katex inline html text={step.description}></Katex>

            {#if stepIndex != (steps.length - 1)}
                <hr />
            {/if}
        {/each}
    {:else}
        {#if stepIndex < steps.length}
            {@const step = steps[stepIndex]}

            {@render title(step.title, stepIndex)}
            {@render outInstRender(stepIndex)}
            {#key stepIndex}
                <Katex inline html text={step.description}></Katex>
            {/key}
        {:else}
            <span>Step index out of bounds</span>
        {/if}
    {/if}

    {@render controls()}
</main>

<style lang="sass">
    hr
        border: none
        border-top: 1px solid global.$light-border-color
        margin-top: 32px        

    .controls 
        display: flex
        justify-content: space-between

    span.disabled
        color: gray

    .stepper
        display: flex
        align-items: center
        gap: 0.25rem

    .stepper span
        min-width: 4ch
        text-align: center

    .stepper .disabled
        opacity: 0.5
</style>
