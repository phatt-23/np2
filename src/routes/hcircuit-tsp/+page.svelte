<!-- Created by phatt-23 on 21/10/2025 -->

<script lang="ts">
    import CertRendererHCIRCUIT from "$lib/component/CertRendererHCIRCUIT.svelte";
    import CertRendererTSP from "$lib/component/CertRendererTSP.svelte";
    import EditorGraph from "$lib/component/EditorGraph.svelte";
    import ReductionStepper from "$lib/component/ReductionStepper.svelte";
    import RendererGraph from "$lib/component/RendererGraph.svelte";
    import Spinner from "$lib/component/Spinner.svelte";
    import localStorageKeys from "$lib/core/localStorageKeys";
    import { Unsolvable } from "$lib/core/Unsolvable";
    import { useLocalStorage } from "$lib/core/useLocalStorage.svelte";
    import { DecoderTSPtoHCIRCUIT } from "$lib/decode/DecoderTSPtoHCIRCUIT";
    import { ReducerHCIRCUITtoTSP } from "$lib/reduction/ReducerHCIRCUITtoTSP";
    import { ReductionStore } from "$lib/state/ReductionStore.svelte";
    import type { Graph } from "$lib/instance/Graph";
    import type { CertificateHCIRCUIT } from "$lib/solve/CertificateHCIRCUIT";
    import type { CertificateTSP } from "$lib/solve/CertificateTSP";
    import RendererEditableGraph from "$lib/component/RendererEditableGraph.svelte";
    import { useReductionController } from "$lib/page/useReductionController.svelte";
    import WorkerTSPSolver from "$lib/workers/WorkerTSPSolver?worker";

    let storage = useLocalStorage(
        localStorageKeys.LS_HCIRCUIT_TSP,
        new ReductionStore<Graph, Graph, CertificateHCIRCUIT, CertificateTSP>()
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
        workerFactory: () => new WorkerTSPSolver(),
        createWorkerRequest: (outInst) => ({ 
            graph: outInst.toSerializedString(), 
            maxCost: outInst.nodes.length 
        }),
        reducerFactory: (outInst) => new ReducerHCIRCUITtoTSP(outInst),
        decoderFactory: () => new DecoderTSPtoHCIRCUIT(),
        onSolveFinished: (outInst, outCert) => {
            if (outCert == Unsolvable) {
                $redStore.inCert = Unsolvable;
                return;
            }

            const decoder = new DecoderTSPtoHCIRCUIT()
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
    <title>HCIRCUIT to TSP</title>
	<meta name="description" content="Reduction from HCIRCUIT to TSP" />
</svelte:head>

<main>
    <h1>
        HCIRCUIT to TSP reduction
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
                    <RendererGraph 
                        graph={steps[stepIndex].inSnapshot!} 
                        style='UNDIRECTED'
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
                        style='TSP'
                        layout='circle'
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
                        style='UNDIRECTED' 
                        layout='circle'
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
                    <CertRendererHCIRCUIT cert={$redStore.inCert} />
                {/if}
            </div>
            <div>
                {#if $redStore.outInstance && !$redStore.outInstance.isEmpty()}
                    <RendererGraph 
                        graph={$redStore.outInstance} 
                        style='TSP'
                        layout='circle'
                    />
                {/if}
                {#if $redStore.outCert}
                    <CertRendererTSP cert={$redStore.outCert}/>
                {/if}
            </div>
        </div>
    {/if}
</main>
