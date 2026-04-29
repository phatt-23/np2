<script lang="ts">
    import type { SSP } from "$lib/instance/SSP";
    import { trimStartingZeros } from "$lib/core/filters";
    import Katex from "./Katex.svelte";

    type Props = {
        ssp: SSP;
        trimLeadingZeros?: boolean;
    };

    let { 
        ssp, 
        trimLeadingZeros = false
    }: Props = $props();


    function preprocessNumber(value: number[]) {
        let x = value.join('');
        if (trimLeadingZeros) {
            x = trimStartingZeros(x);
        } 
        return x;
    }
    
</script>

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
                <td class:ssp-used={ssp.numbers[i].used} class={num.classes ?? '' + ' number-td'}>
                    <span>{ preprocessNumber(num.value) }</span>
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
.ssp-table {
    border-collapse: collapse;
    margin-top: 1rem;
}

.ssp-table td {
    padding: 4px 8px;
    text-align: center;
    border: 1px solid #ccc;
}

.ssp-table .number-td {
    text-align: right;
}

.ssp-used {
    background-color: rgb(256, 240, 240);
}
</style>

