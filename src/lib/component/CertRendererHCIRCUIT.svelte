<!-- Created by phatt-23 on 21/10/2025 -->

<script lang="ts">
    import { Unsolvable } from "$lib/core/Unsolvable";
    import type { CertificateHCIRCUIT } from "$lib/solve/CertificateHCIRCUIT";

    type Props = {
        cert: CertificateHCIRCUIT | Unsolvable;
    };

    const { cert }: Props = $props();
</script>

<main>
    <h2>CertRenderer HCIRCUIT</h2>

    {#if cert == Unsolvable}
        <p>The graph doesn't contain a Hamiltonian circuit.</p>
    {:else}
        <ul>
            {#each cert.path as node, i}
                <li>{node.id}</li>
            {/each}
        </ul>
    {/if}
</main>