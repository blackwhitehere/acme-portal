import { suite, test } from 'mocha';
import * as assert from 'assert';
import { IconUtils } from '../../utils/iconUtils';

suite('IconUtils Tests', () => {
    
    test('should return comment icon for description labels', () => {
        const icon = IconUtils.getIconForDetailLabel('Description: Test description');
        assert.strictEqual(icon, 'comment');
    });

    test('should return file-code icon for source labels', () => {
        const icon = IconUtils.getIconForDetailLabel('Source: test/path.py');
        assert.strictEqual(icon, 'file-code');
    });

    test('should return symbol-function icon for function labels', () => {
        const icon = IconUtils.getIconForDetailLabel('Function: test_function');
        assert.strictEqual(icon, 'symbol-function');
    });

    test('should return git-commit icon for commit labels', () => {
        const icon = IconUtils.getIconForDetailLabel('Commit: abc123def456');
        assert.strictEqual(icon, 'git-commit');
    });

    test('should return package icon for package version labels', () => {
        const icon = IconUtils.getIconForDetailLabel('Package Version: 1.0.0');
        assert.strictEqual(icon, 'package');
    });

    test('should return clock icon for updated labels', () => {
        const icon = IconUtils.getIconForDetailLabel('Updated: 2024-01-01 12:00:00');
        assert.strictEqual(icon, 'clock');
    });

    test('should return symbol-property icon for child attribute labels', () => {
        const icon = IconUtils.getIconForDetailLabel('custom_attr: custom_value');
        assert.strictEqual(icon, 'symbol-property');
    });

    test('should return symbol-property icon for unknown labels', () => {
        const icon = IconUtils.getIconForDetailLabel('Unknown: some value');
        assert.strictEqual(icon, 'symbol-property');
    });

    test('should return symbol-property icon for empty labels', () => {
        const icon = IconUtils.getIconForDetailLabel('');
        assert.strictEqual(icon, 'symbol-property');
    });

    test('should be case sensitive for label matching', () => {
        const icon = IconUtils.getIconForDetailLabel('description: lowercase');
        assert.strictEqual(icon, 'symbol-property'); // Should not match 'Description:'
    });

    test('should match labels with extra content after prefix', () => {
        const descriptions = [
            'Description: A very long description with lots of details',
            'Source: /very/long/path/to/some/file.py',
            'Function: very_long_function_name_with_underscores',
            'Commit: abc123def456789012345678901234567890',
            'Package Version: 1.2.3-beta.1+build.123',
            'Updated: 2024-12-31 23:59:59'
        ];

        const expectedIcons = [
            'comment', 'file-code', 'symbol-function', 
            'git-commit', 'package', 'clock'
        ];

        descriptions.forEach((desc, index) => {
            const icon = IconUtils.getIconForDetailLabel(desc);
            assert.strictEqual(icon, expectedIcons[index], `Failed for: ${desc}`);
        });
    });
});