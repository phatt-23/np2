<!-- Created by phatt-23 on 27/12/2025 -->

<script lang="ts">
    import Card from "../Card.svelte";
    import Spinner from "../Spinner.svelte";

    let { 
        title,
        editor,
        redStore,
        isSolving,
        solveMessage,
        reduce,
        solve,
        showStepper,
    } = $props();

</script>

<Card>
    {#snippet header()}
        {@render title()}    
    {/snippet}

    {#snippet body()}
        {@render editor()}

        <div class="controls">
            <div class="left-controls">
                <button 
                    disabled={!$redStore.hasInInstance() 
                        || $redStore.hasOutInstance() 
                        || $redStore.inInstance?.isEmpty()
                        || $isSolving} 
                    onclick={reduce}
                >
                    Reduce
                </button>

                <button
                    disabled={!$redStore.hasInstances() 
                        || $redStore.hasOutCertificate()
                        || $redStore.inInstance?.isEmpty()
                        || $isSolving}
                    onclick={solve}
                >
                    {#if $isSolving}
                        Solving...
                    {:else}
                        Solve
                    {/if}
                </button>

                <div>
                    {#if $isSolving}
                        <Spinner>{$solveMessage}</Spinner>
                    {/if}
                </div>
            </div>

            <div class="right-controls">
                <label class="checkbox-wrapper">
                    <input type="checkbox" bind:checked={$showStepper}>
                    <span>Show steps</span>
                </label>
            </div>
        </div>
    {/snippet}
</Card>

<style lang="sass">

.controls
    display: flex
    justify-content: space-between

.left-controls
    display: flex
    align-items: center
    gap: 0.25rem

.right-controls
    align-items: center
    align-content: center

</style>