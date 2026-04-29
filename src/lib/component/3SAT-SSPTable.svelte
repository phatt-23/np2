<script lang="ts">
    import type { CNF3 } from "$lib/instance/CNF3";
    import type { SSP } from "$lib/instance/SSP";
    import Katex from "./Katex.svelte";

    type Props = {
        ssp: SSP;
        cnfInstance: CNF3;
        trimLeadingZeros?: boolean;
    };

    let { 
        ssp, 
        cnfInstance,
        trimLeadingZeros = false,
    }: Props = $props();

    function leadingZerosToEmptyString(value: number[]) {
        if (trimLeadingZeros) {
            const nonZero = value.findIndex(v => v !== 0)
            if (nonZero == 0) 
                return value;
            return [...value.slice(0, nonZero).map(v => ''), ...value.slice(nonZero)]
        }
        return value;
    }
</script>

<table class="sat-ssp-table">
    <thead>
        <tr>
            <th></th>

            {#each cnfInstance.variables as variable}
                <th class={'sat-ssp-var-col'}>
                    <Katex displayMode text={variable} />
                </th>
            {/each}

            {#each cnfInstance.clauses as clause}
                <th class='sat-ssp-clause-col'>
                    <Katex text={`\\kappa_{${i}}`} />
                </th>
            {/each}
        </tr>
    </thead>

    <tbody>
        {#each ssp.numbers as num}
            <tr class="sat-ssp-var-row" class:ssp-used={num.used}>
                <td>
                    <Katex text={num.label ?? 'NULL'} />
                </td>
                {#each leadingZerosToEmptyString(num.value) as digit}
                    <td>
                        {digit}
                    </td>
                {/each}
            </tr>
        {/each}

        <tr>
            <td>Target:</td>
            {#each ssp.target as digit}
                <td>{digit}</td>
            {/each}
        </tr>
    </tbody>
</table>

<style>
.sat-ssp-table {
    width: max-content;
    /* min-width: 100%; */
    margin: 0 auto;
    border-collapse: collapse;
}

.sat-ssp-table th, 
.sat-ssp-table td {
    padding: 4px 8px;
    text-align: center;
    border: 1px solid #ccc;
}

/* visually distinguish variable and clause zones */
.sat-ssp-var-col {
    background-color: #f9f9f9;
}

.sat-ssp-clause-col {
    background-color: #f0f8ff;
}

.sat-ssp-var-row td {
    border-color: #ddd;
}

/* Common */
.ssp-used {
    background-color: rgb(256, 240, 240);
}


</style>
