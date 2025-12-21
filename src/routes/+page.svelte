<!-- Created by phatt-23 on 12/10/2025 -->

<script>
	// symbol for reduction in poly-time 
	const rP = '&le;<sub>p</sub>';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<main>
	<h1>
		NP-Complete problems 2
	</h1>

	<p>
		Showcasing reductions between these NP-complete problems:
	</p>

	<ul>
		<li>3SAT {@html rP} HCYCLE</li>
		<ul>
			<li>HCYCLE {@html rP} HCIRCUIT</li>
			<ul>
				<li>HCIRCUIT {@html rP} TSP</li>            
			</ul>
		</ul>
		<li>3SAT {@html rP} SSP</li>
		<li>3SAT {@html rP} 3CG</li>
	</ul>

	<h4>Notes</h4>
	<p>
		There is probably no concrete/correct way to differentiate 
		between "hamiltonovsky cyklus" and "hamiltonovska kruznice" in the English language.
		In this project I chose this naming:
	</p>
	<ul>
		<li>HCYCLE - here means "hamiltonovsky cyklus"</li>
		<li>HCIRCUIT - here means "hamiltonovska kruznice"</li>
	</ul>
	<p>
		HCYCLE is asking wether there is a hamiltonian cycle in a <b>directed</b> graph.
		HCIRCUIT is asking wether there is a hamiltonian cycle in an <b>undirected</b> graph.
	</p>
</main>
