<!-- Created by phatt-23 on 19/10/2025 -->

<script lang="ts">
    import { Unsolvable } from "$lib/core/Unsolvable";
    import type { Certificate3SAT } from "$lib/solve/Certificate3SAT";
    import Katex from "./Katex.svelte";

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

        <div class='sol'>
            <Katex 
                text={
                    `\\begin{aligned}`+
                    sorted.map(([varName, assign]) => `${varName} &= ${assign ? 'T' : 'F'}`).join(' \\\\ ')
                    +`\\end{aligned}`
                }
            ></Katex>
        </div>
    {/if}
</main>

<style>
    .sol {
        display: flex;
        justify-content: center;
    }
</style>