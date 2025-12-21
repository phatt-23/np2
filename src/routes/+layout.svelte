<script lang="ts">
	import '../app.css';
    import { onMount } from 'svelte';
	import Header from '../lib/component/Header.svelte';
	import cyCanvas from 'cytoscape-canvas';
	import cytoscape from 'cytoscape';
    import localStorageKeys from '$lib/core/localStorageKeys';

	let { children } = $props();

    // initialize cy canvas plugin
    onMount(() => {
        cyCanvas(cytoscape);
    });
</script>

<div class="app">
	<Header />

	<div class="dev">
		<button onclick={() => {
			Object.values(localStorageKeys).forEach(key => {
				localStorage.removeItem(key);
			})
		}}>Clear local storage</button>
	</div>

	<main>
		{@render children()}
	</main>

	<footer>
		<p>
			Written by TRA0163, <a href="https://github.com/phatt-23">github</a>
		</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}
</style>
