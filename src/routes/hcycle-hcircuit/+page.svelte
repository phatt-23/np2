<!-- Created by phatt-23 on 19/10/2025 -->

<script lang="ts">
    import CertRendererHCIRCUIT from "$lib/component/CertRendererHCIRCUIT.svelte";
    import CertRendererHCYCLE from "$lib/component/CertRendererHCYCLE.svelte";
    import EditorGraph from "$lib/component/EditorGraph.svelte";
    import ReductionStepper from "$lib/component/ReductionStepper.svelte";
    import RendererEditableGraph from "$lib/component/RendererEditableGraph.svelte";
    import RendererGraph from "$lib/component/RendererGraph.svelte";
    import Spinner from "$lib/component/Spinner.svelte";
    import localStorageKeys from "$lib/core/localStorageKeys";
    import { Unsolvable } from "$lib/core/Unsolvable";
    import { useLocalStorage } from "$lib/core/useLocalStorage.svelte";
    import { DecoderHCIRCUITtoHCYCLE } from "$lib/decode/DecoderHCIRCUITtoHCYCLE";
    import type { Graph } from "$lib/instance/Graph";
    import { useReductionController } from "$lib/page/useReductionController.svelte";
    import { ReducerHCYCLEtoHCIRCUIT } from "$lib/reduction/ReducerHCYCLEtoHCIRCUIT";
    import type { CertificateHCIRCUIT } from "$lib/solve/CertificateHCIRCUIT";
    import type { CertificateHCYCLE } from "$lib/solve/CertificateHCYCLE";
    import { ReductionStore } from "$lib/state/ReductionStore.svelte";
    import WorkerHCIRCUITSolver from "$lib/workers/WorkerHCIRCUITSolver?worker";

    let storage = useLocalStorage(
        localStorageKeys.LS_HCYCLE_HCIRCUIT,
        new ReductionStore<Graph, Graph, CertificateHCYCLE, CertificateHCIRCUIT>()
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
        workerFactory: () => new WorkerHCIRCUITSolver(),
        reducerFactory: (inInstance) => new ReducerHCYCLEtoHCIRCUIT(inInstance),
        decoderFactory: () => new DecoderHCIRCUITtoHCYCLE(),
        onSolveFinished: (outInst, outCert) => {
            if (outCert == Unsolvable) {
                $redStore.inCert = Unsolvable;
                return;
            }

            const decoder = new DecoderHCIRCUITtoHCYCLE()
            const inCert = decoder.decode(outInst, outCert);
            const inInst = $redStore.inInstance!;

            inInst.labelSolved({ path: inCert.path, directed: false });
            outInst.labelSolved({ path: outCert.path, directed: false });

            redStore.update(rs => {
                rs.inInstance = inInst;
                rs.inCert = inCert;
                rs.outCert = outCert;
                rs.outInstance = outInst;
                return rs;
            });

        }
    });
</script>

<svelte:head>
    <title>HCYCLE to HCIRCUIT</title>
	<meta name="description" content="Reduction from HCYCLE to HCIRCUIT" />
</svelte:head>

<main>
    <h1>
        HCYCLE to HCIRCUIT reduction
    </h1>

    <EditorGraph
        graph={$redStore.inInstance}
        onChange={(graph) => editorChanged(graph)}
        onWrongFormat={(msg) => alert("From graph editor: " + msg)}
    />

    <div class="controls">
        <button 
            disabled={!$redStore.hasInInstance() 
                || $redStore.hasOutInstance() 
                || $isSolving} 
            onclick={reduce}
        >
            Reduce
        </button>

        <button
            disabled={!$redStore.hasInstances() 
                || $redStore.hasOutCertificate()
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
        <Spinner>{solveMessage}</Spinner>
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
                    <RendererGraph 
                        graph={steps[stepIndex].inSnapshot!} 
                        style='DIRECTED'
                        layout='circle'
                    />
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
                    storage.save();  // save the current index
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
                        style='HCIRCUIT'
                        layout='preset'
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
                    <RendererEditableGraph 
                        graph={$redStore.inInstance} 
                        style='DIRECTED' 
                        layout='circle'
                        directed 
                        onAddEdge={(edge) => {
                            redStore.update(rs => {
                                let inInstance = rs.inInstance!;
                                inInstance.addEdge(edge);
                                inInstance.unlabelSolved();

                                rs.reset();
                                rs.setInInstance(inInstance);

                                return rs;
                            });

                            storage.save();
                        }}
                        onRemoveEdge={(edge) => {
                            redStore.update(rs => {
                                let inInstance = rs.inInstance!;
                                inInstance.removeEdgeById(edge.id());
                                inInstance.unlabelSolved();

                                rs.reset();
                                rs.setInInstance(inInstance);

                                return rs;
                            });

                            storage.save();
                        }}
                    />
                {/if}
                {#if $redStore.inCert}
                    <CertRendererHCYCLE cert={$redStore.inCert} />
                {/if}
            </div>
            <div>
                {#if $redStore.outInstance && !$redStore.outInstance.isEmpty()}
                    <RendererGraph 
                        graph={$redStore.outInstance} 
                        style='HCIRCUIT'
                        layout='preset'
                    />
                {/if}
                {#if $redStore.outCert}
                    <CertRendererHCIRCUIT cert={$redStore.outCert}/>
                {/if}
            </div>
        </div>
    {/if}
</main>
