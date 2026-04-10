<script lang="ts">
    let { comments } = $props();
</script>

<div>
    {#each comments as comment}
        <p class="comment">{comment}</p>
    {/each}
</div>

<style lang="sass">
.comment
    // display: none
    // color: gray
    padding: 0
    margin: 0
</style>

