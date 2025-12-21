<!-- Created by phatt-23 on 11/10/2025 -->

<script lang="ts">
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

<svelte:head>
    <title>3SAT to HCYCLE</title>
	<meta name="description" content="Redcution from 3SAT to HCYCLE" />
</svelte:head>

<main>
    <h1>3SAT to HCYCLE reduction</h1>

    <Editor3CNF
        cnf={$redStore.inInstance} 
        onChange={(cnf) => editorChanged(cnf)}
        onWrongFormat={(msg) => alert("From editor: " + msg)}
    />

    <div class="controls">
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

        <input type="checkbox" bind:checked={$showStepper} name="showStepperCheckbox">
        <label for="showStepperCheckbox">Show steps</label>
    </div>

    {#if $isSolving}
        <Spinner>{$solveMessage}</Spinner>
    {/if}

    {#if $showStepper}
        {@const steps = $redStore.steps}
        {@const stepIndex = $redStore.stepIndex}
        {#if steps.length}
            <div>
                {#if stepIndex < steps.length &&
                    steps[stepIndex].inSnapshot && 
                    !steps[stepIndex].inSnapshot.isEmpty()
                }
                    <Renderer3CNF cnf={steps[stepIndex].inSnapshot!} />
                {/if}
            </div>

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
            />

            <div>
                {#if $redStore.stepIndex < $redStore.steps.length && 
                    $redStore.steps[$redStore.stepIndex].outSnapshot}
                    <RendererGraph 
                        graph={$redStore.steps[$redStore.stepIndex].outSnapshot!} 
                        style={'3SAT-HCYCLE'}
                    />
                {/if}
            </div>
        {:else}
            <span>There are no steps to step through.</span>
        {/if}
    {:else}
        <div class="panes">
            <div>
                {#if $redStore.inInstance && !$redStore.inInstance.isEmpty()}
                    <Renderer3CNF cnf={$redStore.inInstance} />
                {/if}
                {#if $redStore.inCert}
                    <CertRenderer3SAT cert={$redStore.inCert} />
                {/if}
            </div>
            <div>
                {#if $redStore.outInstance && !$redStore.outInstance.isEmpty()}
                    <RendererGraph graph={$redStore.outInstance} style={'3SAT-HCYCLE'}/>
                {/if}
                {#if $redStore.outCert}
                    <CertRendererHCYCLE cert={$redStore.outCert}/>
                {/if}
            </div>
        </div>
    {/if}
</main>

<style>
.panes {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}
</style>
