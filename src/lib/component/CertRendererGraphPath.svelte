<!-- Created by phatt-23 on 27/12/2025 -->

<script lang="ts">
    import { Unsolvable } from "$lib/core/Unsolvable";
    import type { CertificateGraphPath } from "$lib/solve/CertificateGraphPath";
    import type { Snippet } from "svelte";
    import Katex from "./Katex.svelte";

    type Props = {
        cert: CertificateGraphPath | Unsolvable;
        unsolvablePlaceholder: () => ReturnType<Snippet>,
    };

    const { 
        cert, 
        unsolvablePlaceholder
    }: Props = $props();
    
    let showAsList = $state(false);
</script>

<main>
    {#if cert == Unsolvable}
        {@render unsolvablePlaceholder()}
    {:else}
        <div class="controls">
            <label class="checkbox-wrapper">
                <input type="checkbox" bind:checked={showAsList}>
                <span>Show as list</span>
            </label>
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
    border: 1px solid #ccc;
}

.sol {
    display: flex;
    justify-content: center;
    padding: 16px;
}
</style>