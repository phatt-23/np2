<!-- Created by phatt-23 on 22/10/2025 -->

<script lang="ts">
    import type { CNF3 } from "$lib/instance/CNF3";
    import type { SSP } from "$lib/instance/SSP";
    import Katex from "./Katex.svelte";
    import SSPTable from "./SSPTable.svelte";
    import SATSSPTable from "./3SAT-SSPTable.svelte";

    type SSPStyles = 'none' | '3sat';
                   
    type Props = {
        ssp: SSP;
        style?: SSPStyles;
        cnfInstance?: CNF3;
        trimLeadingZeros?: boolean;
    };

    let { 
        ssp, 
        style = 'none',
        cnfInstance,
        trimLeadingZeros = false,
    }: Props = $props();

    let useCnfFormat = $state(false)
</script>

{#snippet classicView()}
    {#if ssp.target}
        <div class="center">
            <p>Target: {ssp.target.join('')}</p>
        </div>
    {/if}
    
    {#if ssp.numbers.length}
        <div class="table-wrapper">
            <SSPTable highlightUsed {ssp} {trimLeadingZeros} />
        </div>
    {/if}
{/snippet}

{#snippet cnfFormatView(cnfInstance: CNF3)}
    <div>
        <ul>
            {#each cnfInstance.clauses as clause, i}
                <li>
                    <Katex text={`\\kappa_{${i}} = ` + clause.toTexString()}>
                    </Katex>
                </li>
            {/each}
        </ul>
    </div>

    <div class="table-wrapper">
        <SATSSPTable {ssp} {cnfInstance} {trimLeadingZeros} />
    </div>
{/snippet}

<main>
    <h2 class="dev">SSP Renderer</h2>

    {#if style == 'none'}
        
        {@render classicView()}    

    {:else if style == '3sat'}
    
        {#if !cnfInstance}
            <p style="color: red">When using the '3sat' style, you must pass in the CNF3 instance.</p>
        {:else}

            <label class="checkbox-wrapper">
                <input type='checkbox' bind:checked={useCnfFormat} />
                <span>Use 3-SAT format</span>
            </label>

            {#if !useCnfFormat}
                {@render classicView()}    
            {:else}
                {@render cnfFormatView(cnfInstance)}                
            {/if}
        
        {/if}
    {/if}

</main>

<style>

.center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.table-wrapper {
    overflow-x: auto;
    max-width: 100%;
    display: flex;
    justify-content: center;
}
</style>
