<!-- Created by phatt-23 on 27/12/2025 -->

<script lang="ts">
    import type { ProblemInstance } from "$lib/instance/ProblemInstance";
    import type { Snippet } from "svelte";
    import Card from "../Card.svelte";
    import type { ReductionStore } from "$lib/state/ReductionStore.svelte";
    import type { Writable } from "svelte/store";
    import type { Certificate } from "$lib/solve/Certificate";

    type Props<
        I extends ProblemInstance, 
        O extends ProblemInstance,
        IC extends Certificate, 
        OC extends Certificate,
    > = {
        title: () => ReturnType<Snippet>,
        redStore: Writable< ReductionStore<I,O,IC,OC> >,
        instance: (inst: I) => ReturnType<Snippet>,
        certificate: (cert: IC) => ReturnType<Snippet>,
        certificatePlaceholder: () => ReturnType<Snippet>,
    };

    let { 
        title,
        instance,
        redStore,
        certificate,
        certificatePlaceholder,
    }: Props<any,any,any,any> = $props();

</script>

<Card>
    {#snippet header()}
        {@render title()}    
    {/snippet}

    {#snippet body()}
        {#if $redStore.outInstance && !$redStore.outInstance.isEmpty()}
            {@render instance($redStore.outInstance!)}    
        {:else}
            <span class='placeholder'>Reduced instance will appear here.</span>
        {/if}
    {/snippet}

    {#snippet footer()}
        {#if $redStore.outCert}
            <h3>Certificate</h3>
            {@render certificate($redStore.outCert)}
        {:else}
            {@render certificatePlaceholder()}
        {/if}
    {/snippet}
</Card>