<!-- Created by phatt-23 on 27/12/2025 -->

<script lang="ts">
    import type { Snippet } from "svelte";
    import Card from "../Card.svelte";
    import type { ProblemInstance } from "$lib/instance/ProblemInstance";
    import type { ReductionStore } from "$lib/state/ReductionStore.svelte";
    import type { Certificate } from "$lib/solve/Certificate";
    import type { Writable } from "svelte/store";

    type Props<
        I extends ProblemInstance, 
        O extends ProblemInstance,
        IC extends Certificate, 
        OC extends Certificate,
    > = {
        hideCertificate?: boolean,
        title: () => ReturnType<Snippet>,
        redStore: Writable< ReductionStore<I,O,IC,OC> >,
        instance: (inst: I) => ReturnType<Snippet>,
        certificate: (cert: IC) => ReturnType<Snippet>,
        certificatePlaceholder: () => ReturnType<Snippet>,
    };

    let { 
        hideCertificate = false,
        title,
        redStore,
        instance,
        certificate,
        certificatePlaceholder,
    }: Props<any, any, any, any> = $props();

</script>

<Card hideFooter={hideCertificate}>
    {#snippet header()}
        {@render title()}        
    {/snippet}

    {#snippet body()}
        {#if $redStore.inInstance && !$redStore.inInstance.isEmpty()}
            {@render instance($redStore.inInstance!)}    
        {/if}
    {/snippet}

    {#snippet footer()}
        {#if $redStore.inCert}

            <h3>Certificate</h3>

            {@render certificate($redStore.inCert!)}

        {:else}
            {@render certificatePlaceholder()}
        {/if}
    {/snippet}
</Card>