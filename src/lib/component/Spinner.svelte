<!-- Created by phatt-23 on 21/10/2025 -->

<script lang="ts">
    let { children } = $props();
</script>

<main>
    <div class="loading">
        <span class="spinner"></span>
        <span>{@render children()}</span>
    </div>
</main>

<style>
.loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    font-style: italic;
}

.spinner {
    width: 1em;
    height: 1em;
    border: 2px solid rgba(0,0,0,0.2);
    border-top-color: rgba(0,0,0,0.6);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>