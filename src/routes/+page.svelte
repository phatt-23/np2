<!-- Created by phatt-23 on 12/10/2025 -->

<script>
	const reducesInPolyTimeTo = '&le;<sub>p</sub>';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<main>
	<h1>
		NP-Complete problems 2
	</h1>

	<div class='desc'>
		<p>
			Showcasing reductions between these NP-complete problems:
		</p>

		<ul>
			<li>3SAT {@html reducesInPolyTimeTo} HCYCLE</li>
			<ul>
				<li>HCYCLE {@html reducesInPolyTimeTo} HCIRCUIT</li>
				<ul>
					<li>HCIRCUIT {@html reducesInPolyTimeTo} TSP</li>            
				</ul>
			</ul>
			<li>3SAT {@html reducesInPolyTimeTo} SSP</li>
			<li>3SAT {@html reducesInPolyTimeTo} 3CG</li>
		</ul>
	</div>

	<div class="notes">
		<h4>Notes</h4>
		<ul>
			<li>HCYCLE - here means "hamiltonovsky cyklus"</li>
			<li>HCIRCUIT - here means "hamiltonovska kruznice"</li>
		</ul>
		<p>
			HCYCLE is asking whether there is a hamiltonian cycle in a <b>directed</b> graph.
			HCIRCUIT is asking whether there is a hamiltonian cycle in an <b>undirected</b> graph.
		</p>
	</div>

</main>

<style lang="sass">
main 
	display: flex
	flex-direction: column

.desc
	flex: 1
	display: flex
	flex-direction: column

.notes
	display: flex
	flex-direction: column

</style>