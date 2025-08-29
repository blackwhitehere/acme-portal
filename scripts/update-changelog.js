#!/usr/bin/env node

/**
 * Changelog Update Script
 * 
 * This script automatically updates CHANGELOG.md during the release process by:
 * 1. Extracting content from the [Unreleased] section
 * 2. Creating a new version section with that content
 * 3. Clearing the [Unreleased] section
 * 
 * Usage:
 *   node scripts/update-changelog.js VERSION
 * 
 * Example:
 *   node scripts/update-changelog.js 1.2.3
 * 
 * The script preserves all existing content and formats the new version section
 * according to the Keep a Changelog standard.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md');

/**
 * Reads the CHANGELOG.md file
 * @returns {string} Content of CHANGELOG.md
 */
function readChangelog() {
  try {
    return fs.readFileSync(CHANGELOG_PATH, 'utf8');
  } catch (error) {
    console.error('❌ Error reading CHANGELOG.md:', error.message);
    process.exit(1);
  }
}

/**
 * Writes content back to CHANGELOG.md
 * @param {string} content - Updated content to write
 */
function writeChangelog(content) {
  try {
    fs.writeFileSync(CHANGELOG_PATH, content, 'utf8');
    console.log('✅ CHANGELOG.md updated successfully');
  } catch (error) {
    console.error('❌ Error writing CHANGELOG.md:', error.message);
    process.exit(1);
  }
}

/**
 * Extracts the [Unreleased] section content
 * @param {string} content - Full changelog content
 * @returns {string|null} Unreleased section content or null if not found/empty
 */
function extractUnreleasedContent(content) {
  const unreleasedPattern = /## \[Unreleased\][^\n]*\n([\s\S]*?)(?=\n## (?!\[Unreleased\])|$)/i;
  const match = content.match(unreleasedPattern);
  
  if (!match) {
    return null;
  }
  
  const unreleasedContent = match[1].trim();
  
  // Check if the unreleased section has meaningful content
  if (!unreleasedContent || unreleasedContent.length === 0) {
    return null;
  }
  
  return unreleasedContent;
}

/**
 * Creates a new version section with the unreleased content
 * @param {string} version - Version number (e.g., "1.2.3")
 * @param {string} unreleasedContent - Content to move to the version section
 * @returns {string} Formatted version section
 */
function createVersionSection(version, unreleasedContent) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  return `## ${version}

${unreleasedContent}`;
}

/**
 * Updates the changelog by moving unreleased content to a new version section
 * @param {string} version - Version number to create section for
 */
function updateChangelog(version) {
  console.log(`🔄 Updating CHANGELOG.md for version ${version}...`);
  
  // Read current changelog
  const content = readChangelog();
  
  // Extract unreleased content
  const unreleasedContent = extractUnreleasedContent(content);
  
  if (!unreleasedContent) {
    console.log('ℹ️  No content found in [Unreleased] section - nothing to update');
    console.log('   This is normal if the release contains no new changes.');
    return;
  }
  
  console.log(`📝 Found content in [Unreleased] section (${unreleasedContent.split('\n').length} lines)`);
  
  // Create new version section
  const versionSection = createVersionSection(version, unreleasedContent);
  
  // Replace the unreleased section and add the new version section
  const unreleasedPattern = /(## \[Unreleased\][^\n]*\n)([\s\S]*?)(?=\n## (?!\[Unreleased\])|$)/i;
  
  const updatedContent = content.replace(unreleasedPattern, (match, header, oldContent, nextSection) => {
    // Clear the unreleased section and add the new version section
    return `${header}\n${versionSection}\n\n`;
  });
  
  // Write the updated content
  writeChangelog(updatedContent);
  
  console.log(`✅ Successfully moved content from [Unreleased] to version ${version}`);
  console.log('📄 The [Unreleased] section is now empty and ready for new changes');
}

/**
 * Validates the version format
 * @param {string} version - Version to validate
 * @returns {boolean} True if valid semantic version format
 */
function validateVersion(version) {
  // Basic semantic version validation (major.minor.patch with optional pre-release)
  // Allows both standard semver (1.0.0-alpha1) and non-hyphen format (1.0.0alpha1)
  const semverPattern = /^\d+\.\d+\.\d+(?:-?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)?$/;
  return semverPattern.test(version);
}

// Main execution
if (require.main === module) {
  const version = process.argv[2];
  
  if (!version) {
    console.error('❌ Version number is required');
    console.error('   Usage: node scripts/update-changelog.js VERSION');
    console.error('   Example: node scripts/update-changelog.js 1.2.3');
    process.exit(1);
  }
  
  if (!validateVersion(version)) {
    console.error(`❌ Invalid version format: ${version}`);
    console.error('   Please use semantic versioning format (e.g., 1.2.3)');
    process.exit(1);
  }
  
  updateChangelog(version);
}

module.exports = {
  updateChangelog,
  extractUnreleasedContent,
  createVersionSection,
  validateVersion
};