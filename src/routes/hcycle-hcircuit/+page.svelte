<!-- Created by phatt-23 on 19/10/2025 -->

<svelte:head>
    <title>HCYCLE to HCIRCUIT</title>
	<meta name="description" content="Reduction from HCYCLE to HCIRCUIT" />
</svelte:head>

<script lang="ts">
    import CertRendererHCIRCUIT from "$lib/component/CertRendererHCIRCUIT.svelte";
    import CertRendererHCYCLE from "$lib/component/CertRendererHCYCLE.svelte";
    import EditorGraph from "$lib/component/EditorGraph.svelte";
    import EditorCard from "$lib/component/red-page/EditorCard.svelte";
    import InputInstanceCard from "$lib/component/red-page/InputInstanceCard.svelte";
    import OutputInstanceCard from "$lib/component/red-page/OutputInstanceCard.svelte";
    import StepsCard from "$lib/component/red-page/StepsCard.svelte";
    import RendererEditableGraph from "$lib/component/RendererEditableGraph.svelte";
    import RendererGraph from "$lib/component/RendererGraph.svelte";
    import { assert } from "$lib/core/assert";
    import localStorageKeys from "$lib/core/localStorageKeys";
    import { Unsolvable } from "$lib/core/Unsolvable";
    import { useLocalStorage } from "$lib/core/useLocalStorage.svelte";
    import { DecoderHCIRCUITtoHCYCLE } from "$lib/decode/DecoderHCIRCUITtoHCYCLE";
    import { Graph } from "$lib/instance/Graph";
    import { useReductionController } from "$lib/page/useReductionController.svelte";
    import { ReducerHCYCLEtoHCIRCUIT } from "$lib/reduction/ReducerHCYCLEtoHCIRCUIT";
    import { CertificateHCIRCUIT } from "$lib/solve/CertificateHCIRCUIT";
    import { CertificateHCYCLE } from "$lib/solve/CertificateHCYCLE";
    import { ReductionStore } from "$lib/state/ReductionStore.svelte";
    import { WorkerResponseType, type WorkerRequestHCIRCUIT, type WorkerResponseHCIRCUIT } from "$lib/workers/types";
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
        createWorkerRequest: (outInst) => {
            const ret: WorkerRequestHCIRCUIT = {
                graph: outInst.toSerializedString(),
            };
            return ret;
        },
        resolveWorkerResponse: (data) => {
            const res = data as WorkerResponseHCIRCUIT;
            assert(res.type == WorkerResponseType.RESULT);
            return new CertificateHCIRCUIT(res.path);
        },
        onSolveFinished: (outInst, outCert) => {
            if (outCert == Unsolvable) {
                $redStore.inCert = Unsolvable;
                return;
            }

            const decoder = new DecoderHCIRCUITtoHCYCLE()
            const inCert = decoder.decode(outInst, outCert);
            const inInst = $redStore.inInstance!;

            inInst.labelSolved({ path: inCert.path, directed: true });
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


<main>
    <h1>HCYCLE to HCIRCUIT reduction</h1>

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
                    <RendererGraph graph={inst} style='HCIRCUIT' layout='preset'/>
                {/snippet}
            </StepsCard>

        {:else}
        
            {@render inputInstanceCard(false)}
          
            <OutputInstanceCard {redStore}>
                {#snippet title()}
                    <h2>Output HCIRCUIT Instance</h2>
                {/snippet}

                {#snippet instance(inst)}
                    <RendererGraph 
                        graph={inst} 
                        style='HCIRCUIT'
                        layout='preset'
                    />
                {/snippet}

                {#snippet certificate(cert)}
                    <CertRendererHCIRCUIT {cert}/>
                {/snippet}

                {#snippet certificatePlaceholder()}
                    <span class='placeholder'>Certificate for HCIRCUIT will appear here.</span>
                {/snippet}
            </OutputInstanceCard>

        {/if}
        
    </div>
</main>


{#snippet inputInstanceCard(viewingSteps: boolean)}

    <InputInstanceCard {redStore} hideCertificate={viewingSteps}>
        {#snippet title()}
            <h2>Input HCYCLE Instance</h2>
        {/snippet}  

        {#snippet instance(inst)}
            {#if viewingSteps}
                <RendererGraph graph={inst} style='DIRECTED' layout='circle'/>
            {:else}
                <RendererEditableGraph 
                    graph={inst} 
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
