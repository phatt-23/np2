<!-- Created by phatt-23 on 27/12/2025 -->

<script lang="ts">
    import type { ProblemInstance } from "$lib/instance/ProblemInstance";
    import type { Certificate } from "$lib/solve/Certificate";
    import type { Writable } from "svelte/store";
    import Card from "../Card.svelte";
    import ReductionStepper from "../ReductionStepper.svelte";
    import type { ReductionStore } from "$lib/state/ReductionStore.svelte";
    import type { LocalStorage } from "$lib/core/useLocalStorage.svelte";
    import type { Snippet } from "svelte";

    type Props<
        I extends ProblemInstance, 
        O extends ProblemInstance,
        IC extends Certificate, 
        OC extends Certificate,
    > = {
        redStore: Writable< ReductionStore<I,O,IC,OC> >,
        storage: LocalStorage<I,O,IC,OC>,
        instance: (inst: I, stepIndex: number) => ReturnType<Snippet>,
    };

    let { 
        redStore,
        storage,
        instance,
    }: Props<any,any,any,any> = $props();

</script>

<Card>
    {#snippet header()}
        <h2>Steps</h2>                
    {/snippet}

    {#snippet body()}
        {#if $redStore.steps.length}

            <ReductionStepper 
                steps={$redStore.steps} 
                stepIndex={$redStore.stepIndex}
                onPrevClick={() => {
                    redStore.update(rs => { 
                        rs.prevStep();
                        return rs;
                    });
                    storage.save();
                }}
                onNextClick={() => { 
                    redStore.update(rs => { 
                        rs.nextStep();
                        return rs;
                    });
                    storage.save();
                }}
            >
                {#snippet outInstRender(stepIndex)}
                    {#if $redStore.steps[stepIndex].outSnapshot}
                        {@render instance($redStore.steps[stepIndex].outSnapshot, stepIndex)}
                    {/if}
                {/snippet}
            </ReductionStepper>

        {:else}
            <span>There are no steps to step through.</span>
        {/if}
    {/snippet}
</Card>