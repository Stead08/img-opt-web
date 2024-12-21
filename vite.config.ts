import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],


	server: {
		fs: {
			allow: ["packages"]
		}
	},
	build: {
		target: 'esnext',
	},

	assetsInclude: ['**/*.wasm']
});
