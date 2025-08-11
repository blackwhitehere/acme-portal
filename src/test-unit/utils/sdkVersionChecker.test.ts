import * as assert from 'assert';
import { parseSemanticVersion, isVersionCompatible } from '../../utils/versionUtils';

suite('SDK Version Checking Unit Tests', () => {
    test('should parse semantic version correctly', () => {
        // Test valid semantic versions
        assert.deepStrictEqual(parseSemanticVersion('1.2.3'), { major: 1, minor: 2, patch: 3 });
        assert.deepStrictEqual(parseSemanticVersion('v1.2.3'), { major: 1, minor: 2, patch: 3 });
        assert.deepStrictEqual(parseSemanticVersion('0.1.0'), { major: 0, minor: 1, patch: 0 });
        assert.deepStrictEqual(parseSemanticVersion('10.20.30'), { major: 10, minor: 20, patch: 30 });
        
        // Test version with pre-release info (should ignore it)
        assert.deepStrictEqual(parseSemanticVersion('1.2.3-alpha.1'), { major: 1, minor: 2, patch: 3 });
        assert.deepStrictEqual(parseSemanticVersion('1.2.3+build.1'), { major: 1, minor: 2, patch: 3 });
        
        // Test invalid versions
        assert.throws(() => parseSemanticVersion('1.2'), Error);
        assert.throws(() => parseSemanticVersion('1.2.x'), Error);
        assert.throws(() => parseSemanticVersion('invalid'), Error);
    });

    test('should compare versions correctly', () => {
        // Test version compatibility
        assert.strictEqual(isVersionCompatible('1.2.3', '1.2.3'), true); // Same version
        assert.strictEqual(isVersionCompatible('1.2.4', '1.2.3'), true); // Patch higher
        assert.strictEqual(isVersionCompatible('1.3.0', '1.2.3'), true); // Minor higher
        assert.strictEqual(isVersionCompatible('2.0.0', '1.2.3'), true); // Major higher
        
        assert.strictEqual(isVersionCompatible('1.2.2', '1.2.3'), false); // Patch lower
        assert.strictEqual(isVersionCompatible('1.1.9', '1.2.3'), false); // Minor lower
        assert.strictEqual(isVersionCompatible('0.9.9', '1.2.3'), false); // Major lower
        
        // Test with v prefix
        assert.strictEqual(isVersionCompatible('v1.2.3', '1.2.3'), true);
        assert.strictEqual(isVersionCompatible('1.2.3', 'v1.2.3'), true);
        
        // Test with pre-release versions
        assert.strictEqual(isVersionCompatible('1.2.3-alpha', '1.2.3'), true);
        assert.strictEqual(isVersionCompatible('1.2.3', '1.2.3-alpha'), true);
        
        // Test invalid versions (should return false for safety)
        assert.strictEqual(isVersionCompatible('invalid', '1.2.3'), false);
        assert.strictEqual(isVersionCompatible('1.2.3', 'invalid'), false);
    });

    test('should handle edge cases in version comparison', () => {
        // Test boundary conditions
        assert.strictEqual(isVersionCompatible('1.0.0', '1.0.0'), true);
        assert.strictEqual(isVersionCompatible('0.0.1', '0.0.0'), true);
        assert.strictEqual(isVersionCompatible('0.0.0', '0.0.1'), false);
        
        // Test large version numbers
        assert.strictEqual(isVersionCompatible('999.999.999', '1.0.0'), true);
        assert.strictEqual(isVersionCompatible('1.0.0', '999.999.999'), false);
        
        // Test different formatting
        assert.strictEqual(isVersionCompatible('v1.2.3-beta+build.123', 'v1.2.2'), true);
    });
});