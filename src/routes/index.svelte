<script>
	import { base } from '$app/paths';

	export async function load({ fetch }) {
		const posts = await fetch(`${base}/index.json`).then((r) => r.json());
		return {
			props: { posts }
		};
	}
</script>

<svelte:head>
	<title>Home Page</title>
</svelte:head>

<h1 class="text-4xl p-5">Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<h2>Another Element!</h2>
