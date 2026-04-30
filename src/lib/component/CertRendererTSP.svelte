<!-- Created by phatt-23 on 19/10/2025 -->

<script lang="ts">
    import { Unsolvable } from "$lib/core/Unsolvable";
    import type { CertificateHCIRCUIT } from "$lib/solve/CertificateHCIRCUIT";
    import CertRendererGraphPath from "./CertRendererGraphPath.svelte";
    import Katex from "./Katex.svelte";

    type Props = {
        cert: CertificateHCIRCUIT | Unsolvable;
        cost: number;
    };

    const { 
        cert,
        cost, 
    }: Props = $props();
</script>

<CertRendererGraphPath {cert}>
    {#snippet unsolvablePlaceholder()}
        <p>
            <Katex
                inline html
                text={`
                    The graph doesn't contain a Hamiltonian cycle with a cost less than or equal to 
                    $k = ${cost}$.
                `}
            />
        </p>
    {/snippet}
</CertRendererGraphPath>
