<!-- Created by phatt-23 on 11/10/2025 -->

<script lang="ts">
    import type { CNF3 } from "$lib/instance/CNF3";
    import Katex from "./Katex.svelte";

    type Props = {
        cnf: CNF3;
    }

    const { cnf }: Props = $props();

    let viewAsColumn = $state(false)
</script>

<div class="cnf-renderer">
    <h2 class="dev">CNF Renderer</h2>

    <div>
        <input bind:checked={viewAsColumn} type="checkbox" name="viewAsColumnCheckbox">
        <label for="viewAsColumnCheckbox">View as column</label>
    </div>

    <div class="katex-wrapper">
        {#key cnf}
            {#if viewAsColumn}
                <Katex displayMode text={
                    `\\begin{aligned}` +
                    cnf.clauses.map(c => c.toTexString()).map(s => `&${s}`).join(String.raw` \\ `) +
                    `\\end{aligned}`
                }>
                </Katex>
            {:else}
                <Katex text={cnf.clauses.map(c => c.toTexString()).map(s => `${s}`).join('\\allowbreak\\land')}>
                </Katex>
            {/if}
        {/key}
    </div>

</div>

<style>
.katex-wrapper {
    padding: 8px;
}
</style>
