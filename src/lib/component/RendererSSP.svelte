<!-- Created by phatt-23 on 22/10/2025 -->

<script lang="ts">
    import { trimStartingZeros } from "$lib/core/filters";
    import type { CNF3 } from "$lib/instance/CNF3";
    import type { SSP } from "$lib/instance/SSP";
    import Katex from "./Katex.svelte";

    type SSPStyles = 'none'
                   | '3sat';
                   

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

    function preprocessNumber(value: number[]) {
        let x = value.join('');
        if (trimLeadingZeros) {
            x = trimStartingZeros(x);
        } 
        return x;
    }

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
            <table class="ssp-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {#each ssp.numbers as num, i}
                        <tr>
                            <td>
                                <Katex text={num.label ?? 'NULL'}></Katex>
                            </td>
                            <td class:ssp-used={ssp.numbers[i].used} class={num.classes ?? ''}>
                                <span>{ preprocessNumber(num.value) }</span>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
{/snippet}

{#snippet cnfFormatView(cnfInstance: CNF3)}
    <div class="table-wrapper">
        <table class="sat-ssp-table">
            <thead>
                <tr>
                    <th></th>

                    {#each cnfInstance.variables as variable, i}
                        <th class={'var-col'}>
                            <Katex displayMode text={variable}>
                            </Katex>
                        </th>
                    {/each}

                    {#each cnfInstance.clauses as clause, i}
                        <th class='clause-col'>
                            <Katex displayMode style="font-size:1em;" text={clause.toTexString()}>
                            </Katex>
                        </th>
                    {/each}
                </tr>
            </thead>

            <tbody>
                {#each cnfInstance.variables as variable, i}
                    <tr class="var-row" class:ssp-used={ssp.numbers[2 * i].used}>
                        <td>
                            <Katex text={`${variable} = T`}>
                            </Katex>
                        </td>

                        {#each ssp.numbers[2 * i].value as digit, j}
                            <td>{digit}</td>
                        {/each}
                    </tr>

                    <tr class="var-row var-row-false" class:ssp-used={ssp.numbers[2 * i + 1].used}>
                        <td>
                            <Katex text={`${variable} = F`}>
                            </Katex>
                        </td>

                        {#each ssp.numbers[2 * i + 1].value as digit, j}
                            <td>{digit}</td>
                        {/each}
                    </tr>

                    <!-- Horizontal separator after each variable pair -->
                    <tr class="section-sep">
                        <td colspan="999">
                        </td>
                    </tr>
                {/each}

                {#each cnfInstance.clauses as clause, i}
                    <tr class="clause-row" class:ssp-used={ssp.numbers[(2 * i) + (2 * cnfInstance.variables.length)].used}>
                        <td>
                            <Katex text={clause.toTexString()}>
                            </Katex>
                        </td>

                        {#each ssp.numbers[(2 * i) + (2 * cnfInstance.variables.length)].value as digit, j}
                            <td>{digit}</td>
                        {/each}
                    </tr>

                    <tr class={"clause-row clause-row-fill"} class:ssp-used={ssp.numbers[(2 * i + 1) + (2 * cnfInstance.variables.length)].used}>
                        <td>
                            <Katex text={clause.toTexString()}>
                            </Katex>
                        </td>

                        {#each ssp.numbers[(2 * i + 1) + (2 * cnfInstance.variables.length)].value as digit, j}
                            <td>{digit}</td>
                        {/each}
                    </tr>

                    <!-- Horizontal separator after each clause pair -->
                    <tr class="section-sep">
                        <td colspan="999">
                        </td>
                    </tr>
                {/each}
            </tbody>

            <tfoot>
                <tr>
                    <td>Target:</td>
                    {#each ssp.target as digit, j}
                        <td>{digit}</td>
                    {/each}
                </tr>
            </tfoot>
        </table>
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
                <p>Each row represents one number.</p>
                {@render cnfFormatView(cnfInstance)}                
            {/if}
        
        {/if}
    {/if}

</main>

<style>

.center {
    display: flex;
    justify-content: center;
}

.table-wrapper {
    overflow-x: auto;
    max-width: 100%;
    padding-bottom: 24px;
    display: flex;
    justify-content: center;
}

.ssp-table {
    border-collapse: collapse;
    margin-top: 1rem;
}

.ssp-table th, 
.ssp-table td {
    padding: 4px 8px;
    text-align: right;
    border: 1px solid #ccc;
}



.sat-ssp-table {
    border-collapse: collapse;
    margin-top: 1rem;
}

.sat-ssp-table th, 
.sat-ssp-table td {
    padding: 4px 8px;
    text-align: center;
    border: 1px solid #ccc;
}

.section-sep td {
    border: none;
    height: 0px;
    background-color: #fff;
}

/* visually distinguish variable and clause zones */
.var-col {
    background-color: #f9f9f9;
}

.clause-col {
    background-color: #f0f8ff;
}

.clause-row td,
.var-row td {
    border-color: #ddd;
}

.ssp-used {
    background-color: rgb(256, 240, 240);
}



/* th {
    position: sticky;
    top: 0;
    background: white;
}

td:first-child,
th:first-child {
    position: sticky;
    left: 0;
    background: white;
} */

</style>