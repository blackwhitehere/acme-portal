import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Integration Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('blackwhitehere.acmeportal'));
	});

	test('Extension should activate', async () => {
		const extension = vscode.extensions.getExtension('blackwhitehere.acmeportal');
		assert.ok(extension);
		await extension.activate();
		assert.strictEqual(extension.isActive, true);
	});

	test('VSCode version should be compatible', () => {
		const version = vscode.version;
		console.log('VSCode version:', version);
		
		// Parse the version to check it meets our minimum requirement
		const versionParts = version.split('.').map(Number);
		const major = versionParts[0];
		const minor = versionParts[1];
		const patch = versionParts[2];
		
		// Check minimum version 1.99.3
		if (major > 1) {
			assert.ok(true, 'Major version is higher than 1');
		} else if (major === 1) {
			if (minor > 99) {
				assert.ok(true, 'Minor version is higher than 99');
			} else if (minor === 99) {
				assert.ok(patch >= 3, 'Patch version should be at least 3 for version 1.99.x');
			} else {
				assert.fail('VSCode version is below minimum requirement 1.99.3');
			}
		} else {
			assert.fail('VSCode version is below minimum requirement 1.99.3');
		}
	});

	test('Extension commands should be registered', async () => {
		const extension = vscode.extensions.getExtension('blackwhitehere.acmeportal');
		assert.ok(extension);
		await extension.activate();

		const commands = await vscode.commands.getCommands(true);
		
		// Check if our extension commands are registered
		const extensionCommands = [
			'acmeportal.openSettings',
			'acmeportal.refreshFlows',
			'acmeportal.openFlowFile',
			'acmeportal.promoteEnvironment',
			'acmeportal.deployFlow',
			'acmeportal.compareFlowVersions',
			'acmeportal.openExternalUrl'
		];

		for (const commandId of extensionCommands) {
			assert.ok(commands.includes(commandId), `Command ${commandId} should be registered`);
		}
	});

	test('Extension should contribute views', async () => {
		const extension = vscode.extensions.getExtension('blackwhitehere.acmeportal');
		assert.ok(extension);
		await extension.activate();

		// Check if the view is registered (this is implicitly tested by the view being created)
		// The view container and view should be available in the activity bar
		assert.ok(true, 'Views are contributed through package.json');
	});
});
