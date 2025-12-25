<!-- Created by phatt-23 on 22/10/2025 -->

<script lang="ts">
    import { Unsolvable } from "$lib/core/Unsolvable";
    import type { CertificateSSP } from "$lib/solve/CertificateSSP";

    type Props = {
        cert: CertificateSSP | Unsolvable;
    };

    let { cert }: Props = $props();
</script>

<main>
    <h2 class="dev">CertRenderer SSP</h2>

    {#if cert == Unsolvable}
        <p>SSP doesn't have a solution.</p>
    {:else} 
        <p>Subset of numbers summing to to target.</p>
        <ul>
            {#each cert.numbers as num, i}
                <li>{num.value.join('')}</li>
            {/each}
        </ul> 
    {/if}
</main>