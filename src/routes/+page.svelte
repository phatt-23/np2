<!-- Created by phatt-23 on 12/10/2025 -->

<script>
    import Katex from "$lib/component/Katex.svelte";

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

    <div>
        <h3>
            Problem definitions 
        </h3>

        <dl>
            <dt>3-SAT</dt> 
            <dd>
                Can a boolean formula in 3-CNF be satfisfied?
            </dd>
            <dt>HCYCLE</dt>
            <dd>
                Does a directed graph contain a Hamiltonian cycle?
            </dd>
            <dt>HCIRCUIT</dt>
            <dd>
                Does an undirected graph contain a Hamiltonian cycle?
            </dd>
            <dt>TSP</dt>
            <dd>
                Given some positive integer <i>k</i>, 
                does the undirected graph contain a Hamiltonian cycle 
                with the cost less than or equal to <i>k</i>?
            </dd>
            <dt>3-CG</dt>
            <dd>
                Can an undirected graph be colored by 3 colors, 
                such that there are no neighbouring nodes with the same color?
            </dd>
            <dt>SSP</dt>
            <dd>
                Given a set of numbers <i>S</i> and a target value <i>t</i>, 
                can we pick a subset of numbers from <i>S</i>, 
                such that their sum is equal to <i>t</i>?
            </dd>
        </dl>
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
