/**
 * Unit tests for the update-changelog.js script
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Import the module under test
const {
  extractUnreleasedContent,
  createVersionSection,
  validateVersion,
  updateChangelog
} = require('../../../scripts/update-changelog');

suite('Update Changelog Script Tests', () => {
  
  suite('validateVersion', () => {
    test('should accept valid semantic versions', () => {
      assert.strictEqual(validateVersion('1.0.0'), true);
      assert.strictEqual(validateVersion('0.1.0'), true);
      assert.strictEqual(validateVersion('10.20.30'), true);
      assert.strictEqual(validateVersion('1.0.0-alpha'), true);
      assert.strictEqual(validateVersion('1.0.0-alpha.1'), true);
      assert.strictEqual(validateVersion('1.0.0-beta.2'), true);
    });

    test('should reject invalid version formats', () => {
      assert.strictEqual(validateVersion('1.0'), false);
      assert.strictEqual(validateVersion('1'), false);
      assert.strictEqual(validateVersion('v1.0.0'), false);
      assert.strictEqual(validateVersion('1.0.0.0'), false);
      assert.strictEqual(validateVersion(''), false);
      assert.strictEqual(validateVersion('invalid'), false);
    });
  });

  suite('extractUnreleasedContent', () => {
    test('should extract content from [Unreleased] section', () => {
      const changelog = `# Change Log

## [Unreleased]

### Added
- New feature (#123)

### Fixed
- Bug fix (#124)

## 1.0.0

### Added
- Initial release
`;

      const result = extractUnreleasedContent(changelog);
      assert.strictEqual(result, `### Added
- New feature (#123)

### Fixed
- Bug fix (#124)`);
    });

    test('should return null for empty [Unreleased] section', () => {
      const changelog = `# Change Log

## [Unreleased]

## 1.0.0

### Added
- Initial release
`;

      const result = extractUnreleasedContent(changelog);
      assert.strictEqual(result, null);
    });

    test('should return null when [Unreleased] section is missing', () => {
      const changelog = `# Change Log

## 1.0.0

### Added
- Initial release
`;

      const result = extractUnreleasedContent(changelog);
      assert.strictEqual(result, null);
    });

    test('should handle [Unreleased] section at end of file', () => {
      const changelog = `# Change Log

## [Unreleased]

### Added
- New feature (#123)`;

      const result = extractUnreleasedContent(changelog);
      assert.strictEqual(result, `### Added
- New feature (#123)`);
    });
  });

  suite('createVersionSection', () => {
    test('should create properly formatted version section', () => {
      const content = `### Added
- New feature (#123)

### Fixed
- Bug fix (#124)`;
      
      const result = createVersionSection('1.2.3', content);
      const expected = `## 1.2.3

### Added
- New feature (#123)

### Fixed
- Bug fix (#124)`;
      
      assert.strictEqual(result, expected);
    });

    test('should handle single line content', () => {
      const content = '- Single change (#123)';
      const result = createVersionSection('2.0.0', content);
      const expected = `## 2.0.0

- Single change (#123)`;
      
      assert.strictEqual(result, expected);
    });
  });

  suite('updateChangelog integration', () => {
    let tempDir;
    let tempChangelogPath;
    let originalChangelogPath;

    setup(() => {
      // Create temporary directory and files for testing
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'changelog-test-'));
      tempChangelogPath = path.join(tempDir, 'CHANGELOG.md');
      
      // Save original CHANGELOG_PATH for restoration
      const updateChangelogModule = require('../../../scripts/update-changelog');
      originalChangelogPath = path.join(__dirname, '..', '..', '..', 'CHANGELOG.md');
    });

    teardown(() => {
      // Clean up temporary directory
      if (tempDir && fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    test('should handle changelog with content in unreleased section', () => {
      const testChangelog = `# Change Log

## [Unreleased]

### Added
- New automated feature (#123)

### Fixed
- Critical bug fix (#124)

## 1.0.0

### Added
- Initial release
`;

      // Write test changelog
      fs.writeFileSync(tempChangelogPath, testChangelog);

      // Mock the CHANGELOG_PATH for this test
      const originalReadFile = fs.readFileSync;
      const originalWriteFile = fs.writeFileSync;
      
      let writtenContent = null;
      
      fs.readFileSync = (filePath, encoding) => {
        if (filePath.endsWith('CHANGELOG.md')) {
          return testChangelog;
        }
        return originalReadFile(filePath, encoding);
      };
      
      fs.writeFileSync = (filePath, content, encoding) => {
        if (filePath.endsWith('CHANGELOG.md')) {
          writtenContent = content;
          return;
        }
        return originalWriteFile(filePath, content, encoding);
      };

      try {
        updateChangelog('1.1.0');
        
        // Verify the content was updated correctly
        assert(writtenContent !== null, 'CHANGELOG.md should have been written to');
        assert(writtenContent.includes('## [Unreleased]\n\n## 1.1.0'), 'Should have empty unreleased section and new version section');
        assert(writtenContent.includes('- New automated feature (#123)'), 'Should preserve the added content');
        assert(writtenContent.includes('- Critical bug fix (#124)'), 'Should preserve the fixed content');
        assert(writtenContent.includes('## 1.0.0'), 'Should preserve existing version sections');
      } finally {
        // Restore original functions
        fs.readFileSync = originalReadFile;
        fs.writeFileSync = originalWriteFile;
      }
    });
  });
});