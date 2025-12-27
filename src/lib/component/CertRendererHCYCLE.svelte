<!-- Created by phatt-23 on 19/10/2025 -->

<script lang="ts">
    import { Unsolvable } from "$lib/core/Unsolvable";
    import type { CertificateHCYCLE } from "$lib/solve/CertificateHCYCLE";
    import Katex from "./Katex.svelte";

    type Props = {
        cert : CertificateHCYCLE | Unsolvable;
    };

    const { cert } : Props = $props();

    let showAsList = $state(false);
</script>

<main>
    <h2 class="dev">CertRenderer HCYCLE</h2>

    {#if cert == Unsolvable}
        <p>The graph doesn't contain a Hamiltonian cycle.</p>
    {:else}
        <div class="controls">
            <input type="checkbox" bind:checked={showAsList} name="showAsListCheckbox">
            <label for="showAsListCheckbox">Show as list</label>
        </div>

        <div class='sol'>
            {#if showAsList}
                <table>
                    <thead>
                        <tr>
                            <th>
                                step
                            </th>
                            <th>
                                node
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each cert.path as node, i}
                            <tr>
                                <td>
                                    {i}
                                </td>    
                                <td>
                                    <Katex text={node.label ?? node.id}></Katex>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {:else}
                <Katex
                    text={
                        'P = (' +
                        cert.path.map(x => x.label).join(' ,\\allowbreak\\mathbin{} ') +
                        ')'
                    }
                >
                </Katex>    
            {/if}
        </div>
    {/if}
</main>

<style>
table {
    border-collapse: collapse;
    margin-top: 1rem;
}

table th, 
table td {
    padding: 4px 8px;
    text-align: center;
    border: 1px solid #ccc;
}

.sol {
    display: flex;
    justify-content: center;
    padding: 16px;
}
</style>
