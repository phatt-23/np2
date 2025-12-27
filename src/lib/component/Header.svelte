<script lang="ts">
	import { page } from '$app/state';
    import { ROUTES } from '$lib/page/routes';
</script>

<header>
	<nav>
		<ul class="nav-item-list">
			<li class="nav-item" aria-current={page.url.pathname === ROUTES['HOME'] ? 'page' : undefined}>
				<a href={ROUTES['HOME']}>Home</a>
			</li>
			<li class="nav-item" aria-current={page.url.pathname === ROUTES['3SAT_HCYCLE'] ? 'page' : undefined}>
				<a href={ROUTES['3SAT_HCYCLE']}>3SAT to HCYCLE</a>
			</li>
			<li class="nav-item" aria-current={page.url.pathname === ROUTES['HCYCLE_HCIRCUIT'] ? 'page' : undefined}>
				<a href={ROUTES['HCYCLE_HCIRCUIT']}>HCYCLE to HCIRCUIT</a>
			</li>
			<li class="nav-item" aria-current={page.url.pathname === ROUTES['HCIRCUIT_TSP'] ? 'page' : undefined}>
				<a href={ROUTES['HCIRCUIT_TSP']}>HCIRCUIT to TSP</a>
			</li>
			<li class="nav-item" aria-current={page.url.pathname === ROUTES['3SAT_SSP'] ? 'page' : undefined}>
				<a href={ROUTES['3SAT_SSP']}>3SAT to SSP</a>
			</li>
			<li class="nav-item" aria-current={page.url.pathname === ROUTES['3SAT_3CG'] ? 'page' : undefined}>
				<a href={ROUTES['3SAT_3CG']}>3SAT to 3CG</a>
			</li>
		</ul>
	</nav>
</header>

<style>
	.nav-item-list {
		display: flex;
		list-style: none;
		justify-content: center;
	}

	.nav-item + .nav-item {
		margin-left: 10px;
	}
</style>
