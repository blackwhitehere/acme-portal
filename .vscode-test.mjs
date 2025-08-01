import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	// Allow CI pipeline to control VS Code version for testing (stable/insiders) via environment variable
	// Falls back to 'stable' for local development when VSCODE_TEST_VERSION is not set
	version: process.env.VSCODE_TEST_VERSION || 'stable',
});
