<!-- Created by phatt-23 on 11/10/2025 -->

<script lang="ts">
    import type { CNF3 } from "$lib/instance/CNF3";

    type Props = {
        cnf: CNF3;
    }

    const { cnf }: Props = $props();

    let viewAsColumn = $state(false)
</script>

<div class="cnf-renderer">
    <h2>CNF Renderer</h2>

    <div>
        <input bind:checked={viewAsColumn} type="checkbox" name="viewAsColumnCheckbox">
        <label for="viewAsColumnCheckbox">View as column</label>
    </div>

    {#if viewAsColumn}
        {#each cnf.clauses as clause, i}
            <div class="clause">
                {@html clause.asHtmlString()}
            </div> 
        {/each}
    {:else}
        {@html cnf.asHtmlString()}
    {/if}
</div>

<style>
.clause { margin: 0.0em 0; }
</style>
