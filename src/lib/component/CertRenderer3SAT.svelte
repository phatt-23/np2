<!-- Created by phatt-23 on 19/10/2025 -->

<script lang="ts">
    import { Unsolvable } from "$lib/core/Unsolvable";
    import type { Certificate3SAT } from "$lib/solve/Certificate3SAT";

    type Props = {
        cert : Certificate3SAT | Unsolvable;
    };

    let { cert }: Props = $props();
</script>

<main>
    <h2 class="dev">CertRenderer 3SAT</h2>

    {#if cert == Unsolvable}
        <p>The 3CNF formula is unsatisfiable.</p>
    {:else}
        {@const sorted = [...cert.assignments].sort(([a], [b]) => a.localeCompare(b))}

        {#each sorted as [varName, assgn],i}
            <div>{varName} &coloneq; {assgn == true ? 'T' : assgn == false ? 'F' : 'Either' }</div>
        {/each}
    {/if}
</main>