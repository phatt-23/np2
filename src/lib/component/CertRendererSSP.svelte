<!-- Created by phatt-23 on 22/10/2025 -->

<script lang="ts">
    import { trimStartingZeros } from "$lib/core/filters";
    import { Unsolvable } from "$lib/core/Unsolvable";
    import type { CertificateSSP } from "$lib/solve/CertificateSSP";

    type Props = {
        cert: CertificateSSP | Unsolvable;
        target: number;
    };

    let { 
        cert,
        target, 
    }: Props = $props();
</script>

<main>
    <h2 class="dev">CertRenderer SSP</h2>

    {#if cert == Unsolvable}
        <p>SSP doesn't have a solution.</p>
    
    {:else} 
        <p>
            Subset of numbers summing to the target of {target}: 
        </p>

        <div class="center">
            <table>
                <tbody>
                    {#each cert.numbers as num, i}
                        <tr>
                            <td>
                                {trimStartingZeros(num.value.join(''))}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</main>

<style>
.center {
    display: flex;
    justify-content: center;
}

table {
    border-collapse: collapse;
    margin-bottom: 1rem;
}

table td {
    padding: 4px 8px;
    text-align: right;
    border: 1px solid #ccc;
}
</style>