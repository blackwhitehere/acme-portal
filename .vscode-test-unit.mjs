import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test-unit/**/*.test.js',
	// Unit tests don't require VS Code installation - they run in Node.js environment
	workspaceFolder: undefined, // No workspace needed for unit tests
	extensionDevelopmentPath: undefined, // No extension needed for unit tests
	mocha: {
		ui: 'tdd',
		timeout: 20000
	}
});