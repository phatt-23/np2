<!-- Created by phatt-23 on 11/10/2025 -->

<script lang="ts">
    import type { CNF3 } from "$lib/instance/CNF3";
    import katex from "katex";
    import { onMount } from "svelte";

    type Props = {
        cnf: CNF3;
    }

    const { cnf }: Props = $props();

    let viewAsColumn = $state(false)

    let katexElement: HTMLElement|undefined = $state(undefined);
    let katexElementColumn: HTMLElement |undefined= $state(undefined);
    
    $effect(() => {
        if (katexElement) {
            const tex = cnf.toTexString(); 
            katex.render(tex, katexElement, { throwOnError: false });
        }
    });

    $effect(() => {
        if (katexElementColumn) {
            const tex = cnf.clauses.map(c => c.toTexString()).join(String.raw` \newline `);
            katex.render(tex, katexElementColumn, { throwOnError: false });
        }
    });
</script>

<div class="cnf-renderer">
    <h2 class="dev">CNF Renderer</h2>

    <div>
        <input bind:checked={viewAsColumn} type="checkbox" name="viewAsColumnCheckbox">
        <label for="viewAsColumnCheckbox">View as column</label>
    </div>

    {#if viewAsColumn}
        <div bind:this={katexElementColumn}></div>
    {:else}
        <div bind:this={katexElement}></div>
    {/if}

</div>

<style>
/* .clause { margin: 0.0em 0; } */
</style>
