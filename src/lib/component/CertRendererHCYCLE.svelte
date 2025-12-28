<!-- Created by phatt-23 on 27/12/2025 -->
 
<script lang="ts">
    import { Unsolvable } from "$lib/core/Unsolvable";
    import type { CertificateHCIRCUIT } from "$lib/solve/CertificateHCIRCUIT";
    import CertRendererGraphPath from "./CertRendererGraphPath.svelte";

    type Props = {
        cert: CertificateHCIRCUIT | Unsolvable;
    };

    const { 
        cert 
    }: Props = $props();
</script>

<CertRendererGraphPath {cert}>
    {#snippet unsolvablePlaceholder()}
        <p>The graph doesn't contain a Hamiltonian cycle.</p>
    {/snippet}
</CertRendererGraphPath>
