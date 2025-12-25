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
    <h1>3-SAT to HCYCLE reduction</h1>

    <div class="card">

        <div class="card-header">
            <h2>3-SAT Editor</h2>
        </div>

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

            <input type="checkbox" bind:checked={$showStepper} name="showStepperCheckbox">
            <label for="showStepperCheckbox">Show steps</label>

            {#if $isSolving}
                <Spinner>{$solveMessage}</Spinner>
            {/if}
        </div>
    </div>

    <div class="card">
        <div class="card-header">
            <h2>Input 3-SAT Instance</h2>
        </div>

        {#if $redStore.inInstance && !$redStore.inInstance.isEmpty()}
            <Renderer3CNF cnf={$redStore.inInstance} />
            {#if $redStore.inCert && !$showStepper}

                <div class="card-footer">
                    <h3>Certificate</h3>
                    <CertRenderer3SAT cert={$redStore.inCert} />
                </div>
            {/if}
        {/if}
    </div>

    <div class="card">
        <div class="card-header">
            <h2>Output HCYCLE Instance</h2>
        </div>

        {#if $showStepper}
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
                    {#if $redStore.stepIndex < $redStore.steps.length && 
                        $redStore.steps[$redStore.stepIndex].outSnapshot}
                        <RendererGraph 
                            graph={$redStore.steps[$redStore.stepIndex].outSnapshot!} 
                            style={'3SAT-HCYCLE'}
                        />
                    {:else}
                        <span>Step index is out of bounds</span>
                    {/if}
                </ReductionStepper>

            {:else}
                <span>There are no steps to step through.</span>
            {/if}
        {:else}
            <div>
                {#if $redStore.outInstance && !$redStore.outInstance.isEmpty()}
                    <RendererGraph graph={$redStore.outInstance} style={'3SAT-HCYCLE'}/>
                    {#if $redStore.outCert}
                        <div class="card-footer">
                            <h3>Certificate</h3>
                            <CertRendererHCYCLE cert={$redStore.outCert}/>
                        </div>
                    {/if}
                {:else}
                    <span>Reduced instance will appear here.</span>
                {/if}
            </div>
        {/if}
    </div>

</main>

<style>
    main {
        align-items: center;
    }

    .card {
        padding: 16px;
        align-content: center;
        width: 100%;
        border-radius: 4pt;
        border-color: rgba(0.8, 0.8, 0.8, 0.2);
        border-width: 1px;
        border-style: solid;
    }

    .card + .card {
        margin-top: 8px;
    }
</style>