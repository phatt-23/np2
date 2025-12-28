<!-- Created by phatt-23 on 20/12/2025-->

<svelte:head>
    <title>3SAT to 3CG</title>
	<meta name="description" content="Redcution from 3SAT to 3CG" />
</svelte:head>

<script lang="ts">
    import CertRenderer3CG from "$lib/component/CertRenderer3CG.svelte";
    import CertRenderer3SAT from "$lib/component/CertRenderer3SAT.svelte";
    import Editor3CNF from "$lib/component/Editor3CNF.svelte";
    import EditorCard from "$lib/component/red-page/EditorCard.svelte";
    import InputInstanceCard from "$lib/component/red-page/InputInstanceCard.svelte";
    import OutputInstanceCard from "$lib/component/red-page/OutputInstanceCard.svelte";
    import StepsCard from "$lib/component/red-page/StepsCard.svelte";
    import Renderer3CNF from "$lib/component/Renderer3CNF.svelte";
    import RendererGraph from "$lib/component/RendererGraph.svelte";
    import { assert } from "$lib/core/assert";
    import type { Id } from "$lib/core/Id";
    import localStorageKeys from "$lib/core/localStorageKeys";
    import { Unsolvable } from "$lib/core/Unsolvable";
    import { useLocalStorage } from "$lib/core/useLocalStorage.svelte";
    import { Decoder3CGto3SAT } from "$lib/decode/Decoder3CGto3SAT";
    import { CNF3 } from "$lib/instance/CNF3";
    import { Graph } from "$lib/instance/Graph";
    import { useReductionController } from "$lib/page/useReductionController.svelte";
    import { Reducer3SATto3CG } from "$lib/reduction/Reducer3SATto3CG";
    import { Certificate3CG, type Coloring } from "$lib/solve/Certificate3CG";
    import { Certificate3SAT } from "$lib/solve/Certificate3SAT";
    import { ReductionStore } from "$lib/state/ReductionStore.svelte";
    import { WorkerResponseType, type WorkerRequest3CG, type WorkerResponse3CG } from "$lib/workers/types";
    import Worker3CGSolver from "$lib/workers/Worker3CGSolver?worker";

    let storage = useLocalStorage(
        localStorageKeys.LS_3SAT_3CG, 
        new ReductionStore<CNF3, Graph, Certificate3SAT, Certificate3CG>()
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
        workerFactory: () => new Worker3CGSolver(),
        reducerFactory: (inInstance) => new Reducer3SATto3CG(inInstance),
        decoderFactory: () => new Decoder3CGto3SAT(),
        createWorkerRequest: (outInst) => {
            const ret: WorkerRequest3CG = { 
                graph: outInst.toSerializedString(),
            };
            return ret;
        },
        resolveWorkerResponse: (data) => {
            const response = data as WorkerResponse3CG;
            assert(response.type == WorkerResponseType.RESULT);
            
            const coloring: Map<Id, Coloring> = new Map();
            response.coloring.forEach(([k,v]) => {
                coloring.set(k,v);
            });

            return new Certificate3CG(coloring);
        },
        onSolveFinished: (outInst, outCert) => {
            if (outCert == Unsolvable) {
                $redStore.inCert = Unsolvable;
                return;
            }

            outInst.nodes.forEach(n => {
                n.color = outCert.coloring.get(n.id)?.colorNumber;
                switch (n.color) {
                    case 0: 
                        n.classes += ' red'
                        break;
                    case 1:
                        n.classes += ' green'
                        break;
                    case 2:
                        n.classes += ' blue'
                        break;
                    default:
                        throw new Error(`Value ${n.color} not supported.`);
                }
            });

            // outInst.labelSolved({ path: outCert.path, directed: true });

            // decode and update reduction store
            const decoder = new Decoder3CGto3SAT();
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
    <h1>3-SAT to 3-CG reduction</h1>

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
                        style={'3SAT-3CG'}
                    />
                {/snippet}
            </StepsCard>

        {:else}
        
            {@render inputInstanceCard(false)}
          
            <OutputInstanceCard {redStore}>
                {#snippet title()}
                    <h2>Output 3-CG Instance</h2>
                {/snippet}

                {#snippet instance(inst)}
                    <RendererGraph graph={inst} style={'3SAT-3CG'}/>
                {/snippet}

                {#snippet certificate(cert)}
                    <CertRenderer3CG {cert}/>
                {/snippet}

                {#snippet certificatePlaceholder()}
                    <span class='placeholder'>Certificate for 3-CG will appear here.</span>
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

