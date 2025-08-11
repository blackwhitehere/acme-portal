import { defineConfig } from '@vscode/test-cli';

export default defineConfig([
	{
		label: 'unit tests',
		files: 'out/test-unit/**/*.test.js',
		workspaceFolder: undefined, // No workspace needed for unit tests
		extensionDevelopmentPath: undefined, // No extension needed for unit tests
		mocha: {
			ui: 'tdd',
			timeout: 20000
		}
	},
	{
		label: 'minimum version (1.99.3)',
		files: 'out/test/**/*.test.js',
		version: '1.99.3',
		mocha: {
			ui: 'tdd',
			timeout: 20000
		}
	},
	{
		label: 'latest stable',
		files: 'out/test/**/*.test.js',
		version: 'stable',
		mocha: {
			ui: 'tdd',
			timeout: 20000
		}
	},
	{
		label: 'latest insiders',
		files: 'out/test/**/*.test.js',
		version: 'insiders',
		mocha: {
			ui: 'tdd',
			timeout: 20000
		}
	}
]);