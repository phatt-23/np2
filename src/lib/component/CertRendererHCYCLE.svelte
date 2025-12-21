<!-- Created by phatt-23 on 19/10/2025 -->

<script lang="ts">
    import { Unsolvable } from "$lib/core/Unsolvable";
    import type { CertificateHCYCLE } from "$lib/solve/CertificateHCYCLE";

    type Props = {
        cert : CertificateHCYCLE | Unsolvable;
    };

    const { cert } : Props = $props();

    let showAsList = $state(true);
</script>

<main>
    <h2>CertRenderer HCYCLE</h2>

    {#if cert == Unsolvable}
        <p>The graph doesn't contain a Hamiltonian cycle.</p>
    {:else}
        <div class="controls">
            <input type="checkbox" bind:checked={showAsList} name="showAsListCheckbox">
            <label for="showAsListCheckbox">Show as list</label>
        </div>

        {#if showAsList}
            <ol>
                {#each cert.path as node, i}
                    <li>
                        {node.id}
                    </li>
                {/each}
            </ol>
        {:else}
            <div>
                {#each cert.path as node, i}
                    <span>{@html i != 0 ? '&ThinSpace;&LongRightArrow;&ThinSpace;' : ''} {node.id}</span>
                {/each}
            </div>
        {/if}
    {/if}
</main>

<style>
</style>
