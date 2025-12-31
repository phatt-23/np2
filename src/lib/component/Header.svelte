<script lang="ts">
	import { page } from '$app/state';
    import { DESTINATIONS } from '$lib/page/destinations';
	import { resolve } from '$app/paths';
</script>

<header>
	<nav>
		<ul class="nav-item-list">
            {#each Object.values(DESTINATIONS) as item}
                <li class="nav-item" aria-current={page.url.pathname === resolve(item.route) ? 'page' : undefined}>
                    <a href={resolve(item.route)}>{@html item.title}</a>
                </li>
            {/each}
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
