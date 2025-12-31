<!-- Created by phatt-23 on 12/10/2025 -->

<script>
	const reducesInPolyTimeTo = '&rightarrow;';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<main>
	<h1>
		NP-Complete Problems 2
	</h1>

	<div class='desc'>
		<p>
			Showcasing PTIME reductions between these NP-complete problems:
		</p>

		<ul class="reduction-list">
			<li>3-SAT {@html reducesInPolyTimeTo} HCYCLE</li>
			<ul class="reduction-list">
				<li>HCYCLE {@html reducesInPolyTimeTo} HCIRCUIT</li>
				<ul class="reduction-list">
					<li>HCIRCUIT {@html reducesInPolyTimeTo} TSP</li>            
				</ul>
			</ul>
			<li>3-SAT {@html reducesInPolyTimeTo} SSP</li>
			<li>3-SAT {@html reducesInPolyTimeTo} 3-CG</li>
		</ul>
	</div>

	<div class="notes">
		<h4>Notes</h4>
		<ul>
			<li>HCYCLE - "hamiltonovský cyklus", hamiltonian cycle in a <b>directed</b> graph</li>
			<li>HCIRCUIT - "hamiltonovská kružnice", hamiltonian cycle in an <b>undirected</b> graph</li>
		</ul>
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

.reduction-list 
	list-style: none

</style>
