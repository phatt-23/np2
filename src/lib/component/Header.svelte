<script lang="ts">
	import { page } from '$app/state';
</script>

<header>
	<nav>
		<ul>
			<li aria-current={page.url.pathname === '/' ? 'page' : undefined}>
				<a href="/">Home</a>
			</li>
			<li aria-current={page.url.pathname === '/3sat-hcycle' ? 'page' : undefined}>
				<a href="/3sat-hcycle">3SAT to HCYCLE</a>
			</li>
			<li aria-current={page.url.pathname === '/hcycle-hcircuit' ? 'page' : undefined}>
				<a href="/hcycle-hcircuit">HCYCLE to HCIRCUIT</a>
			</li>
			<li aria-current={page.url.pathname === '/hcircuit-tsp' ? 'page' : undefined}>
				<a href="/hcircuit-tsp">HCIRCUIT to TSP</a>
			</li>
			<li aria-current={page.url.pathname === '/3sat-ssp' ? 'page' : undefined}>
				<a href="/3sat-ssp">3SAT to SSP</a>
			</li>
			<li aria-current={page.url.pathname === '/3sat-3cg' ? 'page' : undefined}>
				<a href="/3sat-3cg">3SAT to 3CG</a>
			</li>
		</ul>
	</nav>
</header>
