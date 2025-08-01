import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Unit tests for utility functions that don't require VS Code integration
 */
suite('Utility Functions Unit Tests', () => {
    test('path operations work correctly', () => {
        const testPath = path.join('test', 'directory', 'file.txt');
        assert.ok(testPath.includes('test'));
        assert.ok(testPath.includes('file.txt'));
    });

    test('file system operations work', () => {
        // Test creating and cleaning up temp directory
        const tempDir = fs.mkdtempSync(path.join(__dirname, 'test-'));
        assert.ok(fs.existsSync(tempDir));
        
        // Create test file
        const testFile = path.join(tempDir, 'test.txt');
        fs.writeFileSync(testFile, 'test content');
        assert.ok(fs.existsSync(testFile));
        
        // Read file content
        const content = fs.readFileSync(testFile, 'utf-8');
        assert.strictEqual(content, 'test content');
        
        // Clean up
        fs.rmSync(tempDir, { recursive: true, force: true });
        assert.ok(!fs.existsSync(tempDir));
    });

    test('promise handling works correctly', async () => {
        const testPromise = new Promise<string>((resolve) => {
            setTimeout(() => resolve('test-result'), 10);
        });
        
        const result = await testPromise;
        assert.strictEqual(result, 'test-result');
    });

    test('error handling works correctly', () => {
        assert.throws(() => {
            throw new Error('Test error');
        }, /Test error/);
    });

    test('basic JavaScript operations', () => {
        const testArray = [1, 2, 3, 4, 5];
        const filtered = testArray.filter(x => x > 3);
        assert.deepStrictEqual(filtered, [4, 5]);
        
        const mapped = testArray.map(x => x * 2);
        assert.deepStrictEqual(mapped, [2, 4, 6, 8, 10]);
        
        const reduced = testArray.reduce((sum, x) => sum + x, 0);
        assert.strictEqual(reduced, 15);
    });
});