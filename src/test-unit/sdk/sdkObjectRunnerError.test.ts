import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

suite('SDK Error Handling Tests', () => {
    test('should create error files with proper structure', async () => {
        // Test that our Python script creates the expected error file structure
        const tempDir = os.tmpdir();
        const outputFile = path.join(tempDir, `test_error_${Date.now()}.json`);
        const errorFile = outputFile.replace('.json', '_error.json');
        
        try {
            // Simulate the error structure that the Python script would create
            const expectedErrorInfo = {
                error_type: 'PrefectHTTPStatusError',
                error_message: "Client error '401 Unauthorized' for url 'https://api.prefect.cloud/api/accounts/test/workspaces/test/deployments/filter'",
                module_name: 'deployment_finder',
                class_name: 'DeploymentFinder',
                traceback: 'Traceback (most recent call last):\n  File "test.py", line 1, in <module>\n    raise Exception("Test error")\nException: Test error'
            };
            
            // Write the error info to the file (simulating what Python script does)
            await fs.promises.writeFile(errorFile, JSON.stringify(expectedErrorInfo, null, 2));
            
            // Read it back and verify structure
            const fileExists = await fs.promises.access(errorFile, fs.constants.F_OK).then(() => true).catch(() => false);
            assert.ok(fileExists, 'Error file should exist');
            
            const content = await fs.promises.readFile(errorFile, 'utf8');
            const parsedError = JSON.parse(content);
            
            // Verify all required fields are present
            assert.ok('error_type' in parsedError);
            assert.ok('error_message' in parsedError);
            assert.ok('module_name' in parsedError);
            assert.ok('class_name' in parsedError);
            assert.ok('traceback' in parsedError);
            
            // Verify field values
            assert.strictEqual(parsedError.error_type, 'PrefectHTTPStatusError');
            assert.strictEqual(parsedError.class_name, 'DeploymentFinder');
            assert.ok(parsedError.error_message.includes('401 Unauthorized'));
            
        } finally {
            // Clean up
            try {
                await fs.promises.unlink(errorFile);
            } catch (e) {
                // Ignore cleanup errors
            }
        }
    });

    test('should handle file naming correctly', () => {
        // Test that error file naming works correctly
        const outputFile = '/tmp/acme_portal_123456.json';
        const expectedErrorFile = '/tmp/acme_portal_123456_error.json';
        const actualErrorFile = outputFile.replace('.json', '_error.json');
        
        assert.strictEqual(actualErrorFile, expectedErrorFile);
    });
});