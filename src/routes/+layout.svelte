<script lang="ts">
	import '../styles/app.sass';
    import { onMount } from 'svelte';
	import Header from '../lib/component/Header.svelte';
	import cyCanvas from 'cytoscape-canvas';
	import cytoscape from 'cytoscape';
    import localStorageKeys from '$lib/core/localStorageKeys';
	import 'katex/dist/katex.min.css';

	let { children } = $props();

    // initialize cy canvas plugin
    onMount(() => {
        cyCanvas(cytoscape);
    });
</script>

<div class='app'>
	<Header />

	<main>
		{@render children()}
	</main>

	<footer>
		<p>
			Written by TRA0163, <a href="https://github.com/phatt-23">github</a>
		</p>

		<div class='dev'>
			<button onclick={() => Object.values(localStorageKeys).forEach(key => localStorage.removeItem(key))}>
				Clear local storage
			</button>
		</div>
	</footer>
</div>

<style lang="sass">
	.app
		display: flex
		flex-direction: column
		min-height: 100vh

	main
		flex: 1
		display: flex
		flex-direction: column
		width: 100%
		max-width: 1000px  
		min-width: 600px   
		margin: 0 auto     // center horizontally
		padding-inline: 2rem
		box-sizing: border-box

	@media (max-width: 650px)
		main
			min-width: 100%
			padding-inline: 1rem

	footer
		display: flex
		flex-direction: column
		justify-content: center
		align-items: center
		padding: 12px

	footer a
		font-weight: bold
</style>
