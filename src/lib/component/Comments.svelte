<script lang="ts">
    let { comments } = $props();
    // let hideComments = $state(false);
</script>

<div>
    <!-- <button -->
    <!--     onclick={() => { -->
    <!--         hideComments = !hideComments; -->
    <!--     }} -->
    <!-- > -->
    <!--     {hideComments ? 'Hide comments' : 'Show comments'} -->
    <!-- </button> -->

    <!-- {#if hideComments} -->
        {#each comments as comment}
            <p class="comment">{@html comment}</p>
        {/each}
    <!-- {/if} -->
</div>

<style lang="sass">
div
    padding-block: 16px

.comment
    color: gray
    padding: 0
    margin: 0

    :global(span)
        background-color: #f0f0f0
        border-radius: 3px
        padding: 0.1em 0.3em
        font-family: monospace
        font-size: 0.9em
</style>

