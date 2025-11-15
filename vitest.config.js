import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		globals: true,
		environment: 'happy-dom',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			exclude: [
				'node_modules/',
				'tests/',
				'src/routes/',
				'**/*.svelte'
			],
			thresholds: {
				statements: 90,
				branches: 90,
				functions: 90,
				lines: 90
			}
		}
	},
	resolve: {
		alias: {
			$lib: '/src/lib'
		}
	}
});
