<!-- Created by phatt-23 on 22/10/2025 -->

<script lang="ts">
    import { trimStartingZeros } from "$lib/core/filters";
    import { Unsolvable } from "$lib/core/Unsolvable";
    import { SSP } from "$lib/instance/SSP";
    import type { CertificateSSP } from "$lib/solve/CertificateSSP";
    import Katex from "./Katex.svelte";
    import SSPTable from "./SSPTable.svelte";

    type Props = {
        cert: CertificateSSP | Unsolvable;
        target: number;
    };

    let { 
        cert,
        target, 
    }: Props = $props();

    let displayAsTable = $state(false);
</script>

<main>
    <h2 class="dev">CertRenderer SSP</h2>

    {#if cert == Unsolvable}
        <p>The SSP instance doesn't have a solution.</p>
    
    {:else} 
        {@const numbers = cert.numbers.map(num => trimStartingZeros(num.value.join('')))}

        <label class="checkbox-wrapper">
            <input type="checkbox" bind:checked={displayAsTable}>
            <span>Display as table</span>
        </label>

        <p>
            Subset of numbers summing to the target of {target}: 
        </p>

        {#if !displayAsTable}
            <Katex html inline text={`
                $$
                    S' = \\{ ${numbers.join(',')} \\} 
                $$
            `}/>
        {:else}
            <div class="center">
                <SSPTable 
                    trimLeadingZeros
                    ssp={(() => {
                        const ssp = new SSP(); 
                        ssp.numbers = cert.numbers;
                        return ssp;
                    })()} 
                />
            </div>
        {/if}
    {/if}
</main>

<style>
.center {
    display: flex;
    justify-content: center;
}

</style>

