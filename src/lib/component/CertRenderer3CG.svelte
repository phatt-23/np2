<!-- Created by phatt-23 on 20/12/2025 -->

<script lang="ts">
    import { Unsolvable } from "$lib/core/Unsolvable";
    import type { Certificate3CG } from "$lib/solve/Certificate3CG";

    type Props = {
        cert : Certificate3CG | Unsolvable;
    };

    const { cert } : Props = $props();

    function toText(colorNum: number) {
        switch (colorNum) {
            case 0: return 'Red';
            case 1: return 'Green';
            case 2: return 'Blue';
            default:
                throw new Error(`The colorNum ${colorNum} not supported.`);
        }
    }
</script>

<main>
    <h2>CertRenderer 3CG</h2>

    {#if cert == Unsolvable}
        <p>The graph can't be colored by 3 colors.</p>
    {:else}
        The color mapping for 3-coloring:
        <ul>
            {#each cert.coloring as [nodeId, colorNumber]}
                <li>
                    {nodeId} &rightarrow; {colorNumber} ({toText(colorNumber)})
                </li>
            {/each}
        </ul>
    {/if}
</main>

<style>
</style>

