<!-- Created by phatt-23 on 11/10/2025 -->

<svelte:head>
    <title>3SAT to HCYCLE</title>
	<meta name="description" content="Redcution from 3SAT to HCYCLE" />
</svelte:head>

<script lang="ts">
    import CertRenderer3SAT from "$lib/component/CertRenderer3SAT.svelte";
    import CertRendererHCYCLE from "$lib/component/CertRendererHCYCLE.svelte";
    import Editor3CNF from "$lib/component/Editor3CNF.svelte";
    import Renderer3CNF from "$lib/component/Renderer3CNF.svelte";
    import RendererGraph from "$lib/component/RendererGraph.svelte";

    import { assert } from "$lib/core/assert";
    import { Unsolvable } from "$lib/core/Unsolvable";

    import { CNF3 } from "$lib/instance/CNF3";
    import { Graph } from "$lib/instance/Graph";
    import { ReductionStore } from "$lib/state/ReductionStore.svelte";
    import { Reducer3SATtoHCYCLE } from "$lib/reduction/Reducer3SATtoHCYCLE";
    import { DecoderHCYCLEto3SAT } from "$lib/decode/DecoderHCYCLEto3SAT";
    import { Certificate3SAT } from "$lib/solve/Certificate3SAT";
    import { CertificateHCYCLE } from "$lib/solve/CertificateHCYCLE";

    import { WorkerResponseType, type WorkerRequestHCYCLE, type WorkerResponseHCYCLE } from "$lib/workers/types";
    import WorkerHCYCLESolver from "$lib/workers/WorkerHCYCLESolver?worker";

    import localStorageKeys from "$lib/core/localStorageKeys";
    import { useLocalStorage } from "$lib/core/useLocalStorage.svelte";
    import { useReductionController } from "$lib/page/useReductionController.svelte";

    import EditorCard from "$lib/component/red-page/EditorCard.svelte";
    import InputInstanceCard from "$lib/component/red-page/InputInstanceCard.svelte";
    import OutputInstanceCard from "$lib/component/red-page/OutputInstanceCard.svelte";
    import StepsCard from "$lib/component/red-page/StepsCard.svelte";


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
        
        <EditorCard {redStore} {isSolving} {solveMessage} {showStepper} {reduce} {solve}>
            {#snippet title()}
                <h2>3-CNF Editor</h2>
            {/snippet}
            
            {#snippet editor()}
                <Editor3CNF
                    cnf={$redStore.inInstance} 
                    onChange={(cnf) => editorChanged(cnf)} 
                    displayErrorMessages
                />
            {/snippet}
        </EditorCard>


        {#if $showStepper}
            
            {@render inputInstanceCard(true)}
            
            <StepsCard {redStore} {storage}>
                {#snippet instance(inst, _stepIndex)}
                    <RendererGraph 
                        graph={inst}  
                        style={'3SAT-HCYCLE'}
                    />
                {/snippet}
            </StepsCard>

        {:else}
        
            {@render inputInstanceCard(false)}
          
            <OutputInstanceCard {redStore}>
                {#snippet title()}
                    <h2>Output HCYCLE Instance</h2>
                {/snippet}

                {#snippet instance(inst)}
                    <RendererGraph graph={inst} style={'3SAT-HCYCLE'}/>
                {/snippet}

                {#snippet certificate(cert)}
                    <CertRendererHCYCLE {cert}/>
                {/snippet}

                {#snippet certificatePlaceholder()}
                    <span class='placeholder'>Certificate for HCYCLE will appear here.</span>
                {/snippet}
            </OutputInstanceCard>

        {/if}
        
    </div>
</main>


{#snippet inputInstanceCard(hideCertificate: boolean)}
    <InputInstanceCard {redStore} {hideCertificate}>
        {#snippet title()}
            <h2>Input 3-SAT Instance</h2>
        {/snippet}  

        {#snippet instance(inst)}
            <Renderer3CNF cnf={inst} />
        {/snippet}

        {#snippet certificate(cert)}
            <CertRenderer3SAT {cert} />
        {/snippet}

        {#snippet certificatePlaceholder()}
            <span>Certificate for 3-SAT will appear here.</span>
        {/snippet}
    </InputInstanceCard>
{/snippet}


<style lang="sass">
    main
        align-items: center

    .card-list > :global(*) + :global(*)
        margin-top: 8px
</style>
