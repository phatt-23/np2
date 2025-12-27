<!-- Created by phatt-23 on 11/10/2025 -->

<svelte:head>
    <title>3SAT to HCYCLE</title>
	<meta name="description" content="Redcution from 3SAT to HCYCLE" />
</svelte:head>

<script lang="ts">
    import Card from "$lib/component/Card.svelte";
    import CertRenderer3SAT from "$lib/component/CertRenderer3SAT.svelte";
    import CertRendererHCYCLE from "$lib/component/CertRendererHCYCLE.svelte";
    import Editor3CNF from "$lib/component/Editor3CNF.svelte";
    import ReductionStepper from "$lib/component/ReductionStepper.svelte";
    import Renderer3CNF from "$lib/component/Renderer3CNF.svelte";
    import RendererGraph from "$lib/component/RendererGraph.svelte";
    import Spinner from "$lib/component/Spinner.svelte";
    import { assert } from "$lib/core/assert";
    import localStorageKeys from "$lib/core/localStorageKeys";
    import { Unsolvable } from "$lib/core/Unsolvable";
    import { useLocalStorage } from "$lib/core/useLocalStorage.svelte";
    import { DecoderHCYCLEto3SAT } from "$lib/decode/DecoderHCYCLEto3SAT";
    import { CNF3 } from "$lib/instance/CNF3";
    import { Graph } from "$lib/instance/Graph";
    import { useReductionController } from "$lib/page/useReductionController.svelte";
    import { Reducer3SATtoHCYCLE } from "$lib/reduction/Reducer3SATtoHCYCLE";
    import { Certificate3SAT } from "$lib/solve/Certificate3SAT";
    import { CertificateHCYCLE } from "$lib/solve/CertificateHCYCLE";
    import { ReductionStore } from "$lib/state/ReductionStore.svelte";
    import { WorkerResponseType, type WorkerRequestHCYCLE, type WorkerResponseHCYCLE } from "$lib/workers/types";
    import WorkerHCYCLESolver from "$lib/workers/WorkerHCYCLESolver?worker";

    let storage = useLocalStorage(
        localStorageKeys.LS_3SAT_HCYCLE, 
        new ReductionStore<CNF3, Graph, Certificate3SAT, CertificateHCYCLE>()
    );

    let {
        redStore,
        showStepper,
        isSolving,
        solveMessage,
        editorChanged, 
        reduce,
        solve,
    } = useReductionController({ 
        storage: storage,
        workerFactory: () => new WorkerHCYCLESolver(),  
        reducerFactory: (inInstance) => new Reducer3SATtoHCYCLE(inInstance),
        decoderFactory: () => new DecoderHCYCLEto3SAT(),
        createWorkerRequest: (outInst) => {
            const ret: WorkerRequestHCYCLE = {
                graph: outInst.toSerializedString(),
            };
            return ret;
        },
        resolveWorkerResponse: (data) => {
            const res = data as WorkerResponseHCYCLE;
            assert(res.type == WorkerResponseType.RESULT);
            return new CertificateHCYCLE(res.path);
        },
        onSolveFinished: (outInst, outCert) => {
            if (outCert == Unsolvable) {
                $redStore.inCert = Unsolvable;
                return;
            }

            outInst.labelSolved({ path: outCert.path, directed: true, edgeIdUsesNodeIds: false });

            // decode and update reduction store
            const decoder = new DecoderHCYCLEto3SAT();
            const inCert = decoder.decode(outInst, outCert);

            redStore.update(rs => {
                rs.inCert = inCert;
                rs.outCert = outCert;
                rs.outInstance = outInst;
                return rs;
            });
        }
    });
</script>

<main>
    <h1>3-SAT to HCYCLE reduction</h1>

    <div class="card-list">
        {@render editorCard()}

        {#if $showStepper}
            {@render inputInstanceCard(true)}
            {@render stepsCard()}
        {:else}
            {@render inputInstanceCard(false)}
            {@render outputInstanceCard()}
        {/if}
    </div>
</main>

{#snippet editorCard()}
    <Card>
        {#snippet header()}
            <h2>3-SAT Editor</h2>
        {/snippet}

        {#snippet body()}
            <Editor3CNF
                cnf={$redStore.inInstance} 
                onChange={(cnf) => editorChanged(cnf)} 
                displayErrorMessages
            />

            <div class="controls">
                <div class="left-controls">
                    <button 
                        disabled={!$redStore.hasInInstance() 
                            || $redStore.hasOutInstance() 
                            || $redStore.inInstance?.isEmpty()
                            || $isSolving} 
                        onclick={reduce}
                    >
                        Reduce
                    </button>

                    <button
                        class="btn"
                        disabled={!$redStore.hasInstances() 
                            || $redStore.hasOutCertificate()
                            || $redStore.inInstance?.isEmpty()
                            || $isSolving}
                        onclick={solve}
                    >
                        {#if $isSolving}
                            Solving...
                        {:else}
                            Solve
                        {/if}
                    </button>

                    <div>
                        {#if $isSolving}
                            <Spinner>{$solveMessage}</Spinner>
                        {/if}
                    </div>
                </div>

                <div class="right-controls">
                    <label class="checkbox-wrapper">
                        <input type="checkbox" bind:checked={$showStepper}>
                        Show steps
                    </label>
                </div>
            </div>
        {/snippet}
    </Card>
{/snippet}

{#snippet inputInstanceCard(hideFooter: boolean)}
    <Card hideFooter={hideFooter}>
        {#snippet header()}
            <h2>Input 3-SAT Instance</h2>
        {/snippet}

        {#snippet body()}
            {#if $redStore.inInstance && !$redStore.inInstance.isEmpty()}
                <Renderer3CNF cnf={$redStore.inInstance} />
            {/if}
        {/snippet}

        {#snippet footer()}
            {#if $redStore.inCert}
                <h3>Certificate</h3>
                <CertRenderer3SAT cert={$redStore.inCert} />
            {:else}
                <span>Certificate for 3-SAT will appear here.</span>
            {/if}
        {/snippet}
    </Card>
{/snippet}

{#snippet outputInstanceCard()}
    <Card>
        {#snippet header()}
            <h2>Output HCYCLE Instance</h2>
        {/snippet}

        {#snippet body()}
            {#if $redStore.outInstance && !$redStore.outInstance.isEmpty()}
                <RendererGraph graph={$redStore.outInstance} style={'3SAT-HCYCLE'}/>
            {:else}
                <span class='placeholder'>Reduced instance will appear here.</span>
            {/if}
        {/snippet}

        {#snippet footer()}
            {#if $redStore.outCert}
                <h3>Certificate</h3>
                <CertRendererHCYCLE cert={$redStore.outCert}/>
            {:else}
                <span class='placeholder'>Certificate for HCYCLE will appear here.</span>
            {/if}
        {/snippet}
    </Card>
{/snippet}

{#snippet stepsCard()}
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
                        <RendererGraph 
                            graph={$redStore.steps[stepIndex].outSnapshot!}  
                            style={'3SAT-HCYCLE'}
                        />
                    {/snippet}
                </ReductionStepper>

            {:else}
                <span>There are no steps to step through.</span>
            {/if}
        {/snippet}
    </Card>
{/snippet}

<style lang="sass">
main
    align-items: center

.card-list > :global(*) + :global(*)
    margin-top: 8px

.controls
    display: flex
    justify-content: space-between

.left-controls
    display: flex
    align-items: center
    gap: 0.25rem

.right-controls
    align-items: center
    align-content: center

</style>
