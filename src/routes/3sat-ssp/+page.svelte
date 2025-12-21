<!-- Created by phatt-23 on 22/10/2025 -->

<script lang="ts">
    import CertRenderer3SAT from "$lib/component/CertRenderer3SAT.svelte";
    import CertRendererSSP from "$lib/component/CertRendererSSP.svelte";
    import Editor3CNF from "$lib/component/Editor3CNF.svelte";
    import ReductionStepper from "$lib/component/ReductionStepper.svelte";
    import Renderer3CNF from "$lib/component/Renderer3CNF.svelte";
    import RendererSSP from "$lib/component/RendererSSP.svelte";
    import Spinner from "$lib/component/Spinner.svelte";
    import localStorageKeys from "$lib/core/localStorageKeys";
    import { Unsolvable } from "$lib/core/Unsolvable";
    import { useLocalStorage } from "$lib/core/useLocalStorage.svelte";
    import { DecoderSSPto3SAT } from "$lib/decode/DecoderSSPto3SAT";
    import { CNF3 } from "$lib/instance/CNF3";
    import type { SSP } from "$lib/instance/SSP";
    import { useReductionController } from "$lib/page/useReductionController.svelte";
    import { Reducer3SATtoSSP } from "$lib/reduction/Reducer3SATtoSSP";
    import { Certificate3SAT } from "$lib/solve/Certificate3SAT";
    import { CertificateSSP } from "$lib/solve/CertificateSSP";
    import { ReductionStore } from "$lib/state/ReductionStore.svelte";

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
        workerUrl: new URL("$lib/workers/WorkerSSPSolver.ts", import.meta.url),
        reducerFactory: (inInstance) => new Reducer3SATtoSSP(inInstance),
        decoderFactory: () => new DecoderSSPto3SAT(),
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

            console.debug("Done decoding...");

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
    <title>3SAT to SSP</title>
	<meta name="description" content="Redcution from 3SAT to SSP" />
</svelte:head>

<main>
    <h1>3SAT to SSP reduction</h1>

    <Editor3CNF
        cnf={$redStore.inInstance} 
        onChange={(cnf) => editorChanged(cnf)}
        onWrongFormat={(msg) => alert("From editor: " + msg)}
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
                    <RendererSSP 
                        ssp={$redStore.steps[$redStore.stepIndex].outSnapshot!} 
                        style='none'
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
                    <RendererSSP 
                        ssp={$redStore.outInstance} 
                        style='3sat'
                        cnfInstance={$redStore.inInstance ?? undefined}
                    />
                {/if}
                {#if $redStore.outCert}
                    <CertRendererSSP cert={$redStore.outCert}/>
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
