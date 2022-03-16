import static_adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: static_adapter({
			// default options are shown
			pages: 'build',
			assets: 'build',
			fallback: null,
			precompress: false
		}),

		paths: {
			base: dev ? '' : '/danjoembro.github.io'
		},

		prerender: {
			// This can be false if you're using a fallback (i.e. SPA mode)
			default: true
		},

		appDir: 'internal'
	}
};

export default config;
