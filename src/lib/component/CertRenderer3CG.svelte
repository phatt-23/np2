<!-- Created by phatt-23 on 20/12/2025 -->

<script lang="ts">
    import { CG3_ID, NODE_ID_PREFIX } from "$lib/core/Id";
    import { Unsolvable } from "$lib/core/Unsolvable";
    import type { Certificate3CG } from "$lib/solve/Certificate3CG";
    import Katex from "./Katex.svelte";

    type Props = {
        cert : Certificate3CG | Unsolvable;
    };

    const { cert } : Props = $props();

    function toText(colorNum: number) {
        switch (colorNum) {
            case 0: return 'red';
            case 1: return 'green';
            case 2: return 'blue';
            default:
                console.debug(colorNum)
                throw new Error(`The colorNum ${colorNum} not supported.`);
        }
    }

    let displayAsSets = $state(false)
</script>

<main>
    <h2 class="dev">CertRenderer 3CG</h2>

    {#if cert == Unsolvable}
        <p>The graph can't be colored by 3 colors.</p>
    {:else}
        <label class="checkbox-wrapper">
            <input type="checkbox" bind:checked={displayAsSets}>
            <span>Display as sets</span>
        </label>

        {#if displayAsSets}
            {@const red = [...cert.coloring.entries().filter(([nodeId, coloring]) => coloring.colorNumber == CG3_ID.COLOR_FALSE)].map(x => x[1])}
            {@const green = [...cert.coloring.entries().filter(([nodeId, coloring]) => coloring.colorNumber == CG3_ID.COLOR_TRUE)].map(x => x[1])}
            {@const blue = [...cert.coloring.entries().filter(([nodeId, coloring]) => coloring.colorNumber == CG3_ID.COLOR_BUFFER)].map(x => x[1])}
            <Katex displayMode text={`
                \\begin{aligned}

                \\color{red}{R} &= \\{ ${ red.map(x => x.label).join(',') } \\}  \\\\
                \\color{green}{G} &= \\{ ${ green.map(x => x.label).join(',') } \\} \\\\
                \\color{blue}{B} &= \\{ ${ blue.map(x => x.label).join(',') } \\}  \\\\
                
                \\end{aligned}
            `}>
            </Katex>
        {:else}
            <p>
                The 3-color mapping of the nodes:
            </p>

            <Katex displayMode text={
                `\\begin{aligned}` +
                
                cert.coloring.entries().map(([_nodeId, { label, colorNumber }]) => `
                    ${label} & \\rightarrow{} \\color{${toText(colorNumber)}}{ ${toText(colorNumber)[0].toUpperCase() } } \\\\
                `).reduce((x,y) => x + y)
                
                + `\\end{aligned}`
            }>
            </Katex>
        {/if}
    {/if}
</main>

<style>
</style>

