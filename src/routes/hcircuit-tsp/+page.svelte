<!-- Created by phatt-23 on 21/10/2025 -->

<svelte:head>
    <title>HCIRCUIT to TSP</title>
	<meta name="description" content="Reduction from HCIRCUIT to TSP" />
</svelte:head>

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
    import { CertificateTSP } from "$lib/solve/CertificateTSP";
    import RendererEditableGraph from "$lib/component/RendererEditableGraph.svelte";
    import { useReductionController } from "$lib/page/useReductionController.svelte";
    import WorkerTSPSolver from "$lib/workers/WorkerTSPSolver?worker";
    import { WorkerResponseType, type WorkerRequestTSP, type WorkerResponseTSP } from "$lib/workers/types";
    import { assert } from "$lib/core/assert";
    import EditorCard from "$lib/component/red-page/EditorCard.svelte";
    import StepsCard from "$lib/component/red-page/StepsCard.svelte";
    import OutputInstanceCard from "$lib/component/red-page/OutputInstanceCard.svelte";
    import InputInstanceCard from "$lib/component/red-page/InputInstanceCard.svelte";
    import CertRendererHCYCLE from "$lib/component/CertRendererHCYCLE.svelte";


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
        reducerFactory: (outInst) => new ReducerHCIRCUITtoTSP(outInst),
        decoderFactory: () => new DecoderTSPtoHCIRCUIT(),
        createWorkerRequest: (outInst) => {
            const ret: WorkerRequestTSP = {
                graph: outInst.toSerializedString(), 
                maxCost: outInst.nodes.length, 
            };

            return ret;
        }, 
        resolveWorkerResponse: (data) => {
            const res = data as WorkerResponseTSP;
            assert(res.type == WorkerResponseType.RESULT);
            return new CertificateTSP(res.path);
        },
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

    
    let cost = $state(0);

    $effect(() => {
        if ($redStore.inInstance) {
            cost = $redStore.inInstance.nodes.length;
        }
    });
</script>




<main>
    <h1>HCIRCUIT to TSP reduction</h1>

    <div class="card-list">
        
        <EditorCard {redStore} {isSolving} {solveMessage} {showStepper} {reduce} {solve}>
            {#snippet title()}
                <h2>Graph Editor</h2>
            {/snippet}
            
            {#snippet editor()}
                <EditorGraph
                    graph={$redStore.inInstance}
                    onChange={(graph) => editorChanged(graph)}
                    displayErrorMessages
                />
            {/snippet}
        </EditorCard>


        {#if $showStepper}
            
            {@render inputInstanceCard(true)}
            
            <StepsCard {redStore} {storage}>
                {#snippet instance(inst)}
                    <RendererGraph 
                        graph={inst} 
                        style='TSP'
                        layout='circle'
                    />
                {/snippet}
            </StepsCard>

        {:else}
        
            {@render inputInstanceCard(false)}
          
            <OutputInstanceCard {redStore}>
                {#snippet title()}
                    <h2>Output TSP Instance</h2>
                {/snippet}

                {#snippet instance(inst)}
                    <RendererGraph 
                        graph={inst} 
                        style='TSP'
                        layout='circle'
                    />
                {/snippet}

                {#snippet certificate(cert)}
                   <CertRendererTSP {cert} {cost}/>
                {/snippet}

                {#snippet certificatePlaceholder()}
                    <span class='placeholder'>Certificate for TSP will appear here.</span>
                {/snippet}
            </OutputInstanceCard>

        {/if}
        
    </div>
</main>


{#snippet inputInstanceCard(viewingSteps: boolean)}

    <InputInstanceCard {redStore} hideCertificate={viewingSteps}>
        {#snippet title()}
            <h2>Input HCIRCUIT Instance</h2>
        {/snippet}  

        {#snippet instance(inst)}
            {#if viewingSteps}
                <RendererGraph 
                    graph={inst} 
                    style='UNDIRECTED'
                    layout='circle'
                />
            {:else}
                <RendererEditableGraph 
                    graph={inst} 
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
        {/snippet}

        {#snippet certificate(cert)}
            <CertRendererHCYCLE {cert} />
        {/snippet}

        {#snippet certificatePlaceholder()}
            <span>Certificate for HCYCLE will appear here.</span>
        {/snippet}
    </InputInstanceCard>

{/snippet}


<style lang="sass">
    main
        align-items: center

    .card-list > :global(*) + :global(*)
        margin-top: 8px
</style>

