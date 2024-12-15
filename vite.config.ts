import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},

	server: {
		fs: {
			allow: ["wasm"]
		}
	},

	optimizeDeps: {
		exclude: ['a.out.js']
	},

	build: {
		target: 'esnext',
		rollupOptions: {
			external: ['/a.out.js']
		}
	},

	assetsInclude: ['**/*.wasm']
});
