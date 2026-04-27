<!-- Created by phatt-23 on 12/10/2025 -->

<script lang="ts">
    import Katex from "$lib/component/Katex.svelte";
    import { PROBLEM_DEFINITIONS } from "$lib/page/problemDefinitions";

	import { page } from '$app/state';
    import { DESTINATIONS, type Destination } from '$lib/page/destinations';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

{#snippet link(item: Destination)}
    <li class="nav-item" aria-current={page.url.pathname === resolve(item.route) ? 'page' : undefined}>
        <a href={resolve(item.route)}>{@html item.title}</a>
    </li>
{/snippet}

<main>
	<h1>
		NP-Complete Problems 2
	</h1>

	<div class='desc'>
		<p>
			Showcasing PTIME reductions between these NP-complete problems:
		</p>

		<ul class="reduction-list">

			<li>
                {@render link(DESTINATIONS["3SAT_HCYCLE"])}
            </li>

			<ul class="reduction-list">
				<li>
                    {@render link(DESTINATIONS["HCYCLE_HCIRCUIT"])}
                </li>
				<ul class="reduction-list">
					<li>
                        {@render link(DESTINATIONS["HCIRCUIT_TSP"])}
                    </li>            
				</ul>
			</ul>

			<li>
                {@render link(DESTINATIONS["3SAT_SSP"])}
            </li>
			<li>
                {@render link(DESTINATIONS["3SAT_3CG"])}
            </li>
		</ul>
	</div>

    <div>
        <h3>
            Problem definitions 
        </h3>

        <dl>
            {#each Object.entries(PROBLEM_DEFINITIONS) as problem}
                <dt>{@html problem[0]}</dt>
                <dd><Katex html inline text={problem[1]}/></dd>
            {/each}
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

.reduction-list 
	list-style: none

</style>
