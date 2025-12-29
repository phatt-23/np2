// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';

import { sveltePreprocess } from "svelte-preprocess";
import dotenv from 'dotenv';

dotenv.config({
	debug: true,
}); // load environment variables from .env

const PUBLIC_BASE_PATH = process.env.PUBLIC_BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: sveltePreprocess({
        sass: {
            prependData: `@use './src/styles/global.sass'`,
        },
    }),

    // preprocess: vitePreprocess(), 

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			// // default options are shown. On some platforms
			// // these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true,
		}),
		paths: {
			base: PUBLIC_BASE_PATH
		},
	}
};

export default config;
