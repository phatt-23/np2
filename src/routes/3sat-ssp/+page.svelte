<!-- Created by phatt-23 on 22/10/2025 -->


<svelte:head>
    <title>3SAT to SSP</title>
	<meta name="description" content="Redcution from 3SAT to SSP" />
</svelte:head>

<script lang="ts">
    import CertRenderer3SAT from "$lib/component/CertRenderer3SAT.svelte";
    import CertRendererSSP from "$lib/component/CertRendererSSP.svelte";
    import Editor3CNF from "$lib/component/Editor3CNF.svelte";
    import EditorCard from "$lib/component/red-page/EditorCard.svelte";
    import InputInstanceCard from "$lib/component/red-page/InputInstanceCard.svelte";
    import OutputInstanceCard from "$lib/component/red-page/OutputInstanceCard.svelte";
    import StepsCard from "$lib/component/red-page/StepsCard.svelte";
    import Renderer3CNF from "$lib/component/Renderer3CNF.svelte";
    import RendererSSP from "$lib/component/RendererSSP.svelte";
    import { assert } from "$lib/core/assert";
    import localStorageKeys from "$lib/core/localStorageKeys";
    import { Unsolvable } from "$lib/core/Unsolvable";
    import { useLocalStorage } from "$lib/core/useLocalStorage.svelte";
    import { DecoderSSPto3SAT } from "$lib/decode/DecoderSSPto3SAT";
    import { CNF3 } from "$lib/instance/CNF3";
    import { type SSP } from "$lib/instance/SSP";
    import { useReductionController } from "$lib/page/useReductionController.svelte";
    import { Reducer3SATtoSSP } from "$lib/reduction/Reducer3SATtoSSP";
    import { Certificate3SAT } from "$lib/solve/Certificate3SAT";
    import { CertificateSSP } from "$lib/solve/CertificateSSP";
    import { ReductionStore } from "$lib/state/ReductionStore.svelte";
    import { WorkerResponseType, type WorkerRequestSSP, type WorkerResponseSSP } from "$lib/workers/types";
    import WorkerSSPSolver from "$lib/workers/WorkerSSPSolver?worker";


    let storage = useLocalStorage(
        localStorageKeys.LS_3SAT_SSP, 
        new ReductionStore<CNF3, SSP, Certificate3SAT, CertificateSSP>()
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
        workerFactory: () => new WorkerSSPSolver(),  
        reducerFactory: (inInstance) => new Reducer3SATtoSSP(inInstance),
        decoderFactory: () => new DecoderSSPto3SAT(),
        createWorkerRequest: (outInst) => {
            const ret: WorkerRequestSSP = {
                ssp: outInst.toSerializedString(),
            };
            return ret;
        },
        resolveWorkerResponse: (data) => {
            const res = data as WorkerResponseSSP;
            assert(res.type == WorkerResponseType.RESULT);
            return new CertificateSSP(res.numbers);
        },
        onSolveFinished: (outInst, outCert) => {
            if (outCert == Unsolvable) {
                $redStore.inCert = Unsolvable;
                return;
            }

            // tag numbers that are in the final ssp subset that sums up to the target
            outCert.numbers.forEach((a) => {
                const num = outInst.numbers.find(b => a.id == b.id);

                if (num) {
                    num.used = true;
                }
            });

            const decoder = new DecoderSSPto3SAT();
            const inCert = decoder.decode(outInst, outCert);

            redStore.update(rs => {
                rs.inCert = inCert;
                rs.outCert = outCert;
                rs.outInstance = outInst;
                return rs;
            });
        }
    });

    let target = $state(0);

    $effect(() => {
        if ($redStore.outInstance) {
            target = Number.parseInt($redStore.outInstance.target.join('')); 
        }
    });
</script>



<main>
    <h1>3-SAT to SSP reduction</h1>

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
                    <RendererSSP 
                        ssp={inst}
                        style='3sat'
                        cnfInstance={$redStore.inInstance ?? undefined}
                    />
                {/snippet}
            </StepsCard>

        {:else}
        
            {@render inputInstanceCard(false)}
          
            <OutputInstanceCard {redStore}>
                {#snippet title()}
                    <h2>Output SSP Instance</h2>
                {/snippet}

                {#snippet instance(inst)}
                    {#if $redStore.inInstance}
                        <RendererSSP 
                            ssp={inst} 
                            style='3sat'
                            cnfInstance={$redStore.inInstance}
                        />
                    {:else}
                        <span>Cannot render this SSP isntance without providing CNF instance.</span>
                    {/if}
    
                {/snippet}

                {#snippet certificate(cert)}
                    <CertRendererSSP {cert} {target}/>
                {/snippet}

                {#snippet certificatePlaceholder()}
                    <span class='placeholder'>Certificate for SSP will appear here.</span>
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


