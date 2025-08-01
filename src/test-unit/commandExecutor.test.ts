import * as assert from 'assert';
import { CommandExecutor } from '../utils/commandExecutor';

/**
 * Unit tests for CommandExecutor that don't require VS Code integration
 */
suite('CommandExecutor Unit Tests', () => {
    test('should create CommandExecutor instance', () => {
        const executor = new CommandExecutor();
        assert.ok(executor instanceof CommandExecutor);
    });

    test('should execute simple command successfully', async () => {
        const executor = new CommandExecutor();
        
        // Use a simple command that should work on all platforms
        const result = await executor.execute('echo "test"');
        
        assert.ok(result.stdout.includes('test'));
        assert.strictEqual(typeof result.stderr, 'string');
    });

    test('should handle command failure', async () => {
        const executor = new CommandExecutor();
        
        // Use a command that should fail
        try {
            await executor.execute('nonexistent-command-that-should-fail');
            assert.fail('Expected command to fail');
        } catch (error) {
            // This is expected
            assert.ok(error instanceof Error);
        }
    });

    test('should execute command in specified working directory', async () => {
        const executor = new CommandExecutor();
        
        // Test with current directory
        const result = await executor.execute('pwd', process.cwd());
        
        assert.ok(result.stdout.length > 0);
    });

    test('should return proper CommandResult structure', async () => {
        const executor = new CommandExecutor();
        
        const result = await executor.execute('echo "test"');
        
        assert.ok('stdout' in result);
        assert.ok('stderr' in result);
        assert.strictEqual(typeof result.stdout, 'string');
        assert.strictEqual(typeof result.stderr, 'string');
    });
});