<script lang="ts">
	import { page } from '$app/state';
    import { ROUTES } from '$lib/page/routes';
	import { resolve } from '$app/paths';
</script>

{#snippet navItem(route: string, name: string)}
    <li class="nav-item" aria-current={page.url.pathname === resolve(route) ? 'page' : undefined}>
        <a href={resolve(route)}>{name}</a>
    </li>
{/snippet}

<!-- {page.url.pathname} -->

<header>
	<nav>
		<ul class="nav-item-list">
            {@render navItem(ROUTES['HOME'],            'Home')}
            {@render navItem(ROUTES['3SAT_HCYCLE'],     '3SAT to HCYCLE')}
            {@render navItem(ROUTES['HCYCLE_HCIRCUIT'], 'HCYCLE to HCIRCUIT')}
            {@render navItem(ROUTES['HCIRCUIT_TSP'],    'HCIRCUIT to TSP')}
            {@render navItem(ROUTES['3SAT_SSP'],        '3SAT to SSP')}
            {@render navItem(ROUTES['3SAT_3CG'],        '3SAT to 3CG')}
		</ul>
	</nav>
</header>

<style>
	.nav-item-list {
		display: flex;
		list-style: none;
		justify-content: center;
        margin: 10 0;
        padding: 0 0;
	}


	.nav-item + .nav-item {
		margin-left: 10px;
	}

    @media screen and (max-width: 650px) {
        .nav-item-list {
            display: block;
            float: none;
            width: 100%;
		    box-sizing: border-box;
			min-width: 100%;
			padding-inline: 1rem;
        }

        .nav-item + .nav-item {
            margin-left: 0px;
        }
    }

</style>
