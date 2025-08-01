#!/usr/bin/env node

/**
 * Release Notes Validation Script
 * 
 * This script validates that pull requests are properly referenced in the 
 * CHANGELOG.md release notes. It ensures contributors follow the release
 * notes process described in CONTRIBUTING.md.
 * 
 * Usage:
 *   node scripts/check-release-notes.js [PR_NUMBER]
 * 
 * When PR_NUMBER is provided, validates that specific PR is referenced.
 * When run without PR_NUMBER, validates the general format.
 * 
 * Exit codes:
 *   0 - Success (PR found in release notes or general validation passed)
 *   1 - Error (PR not found, invalid format, or file access issues)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md');
const UNRELEASED_SECTION_REGEX = /## \[Unreleased\]([\s\S]*?)(?=## \[|$)/;
const PR_LINK_REGEX = /\(#(\d+)\)/g;

/**
 * Reads and parses the CHANGELOG.md file
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
 * Extracts the [Unreleased] section from changelog content
 * @param {string} content - Full changelog content
 * @returns {string|null} Unreleased section content or null if not found
 */
function extractUnreleasedSection(content) {
  const match = content.match(UNRELEASED_SECTION_REGEX);
  return match ? match[1].trim() : null;
}

/**
 * Extracts all PR numbers from the unreleased section
 * @param {string} unreleasedContent - Content of unreleased section
 * @returns {number[]} Array of PR numbers found
 */
function extractPRNumbers(unreleasedContent) {
  const matches = [...unreleasedContent.matchAll(PR_LINK_REGEX)];
  return matches.map(match => parseInt(match[1], 10));
}

/**
 * Validates the format of the unreleased section
 * @param {string} unreleasedContent - Content to validate
 * @returns {object} Validation result with success flag and messages
 */
function validateFormat(unreleasedContent) {
  const issues = [];
  
  // Check for valid section headers
  const validSections = ['### Added', '### Changed', '### Deprecated', '### Removed', '### Fixed', '### Security'];
  const hasValidSection = validSections.some(section => unreleasedContent.includes(section));
  
  if (unreleasedContent.length > 10 && !hasValidSection) {
    issues.push('No valid changelog sections found (### Added, ### Changed, ### Fixed, etc.)');
  }
  
  // Check for entries without PR links (but ignore historical sections)
  const lines = unreleasedContent.split('\n').filter(line => line.trim().startsWith('-'));
  const linesWithoutPR = lines.filter(line => {
    // Skip lines that are under historical sections (they contain "Historical - No PR refs")
    const isHistoricalSection = unreleasedContent.includes('Historical - No PR refs');
    const lineIndex = unreleasedContent.indexOf(line);
    
    // If we have historical sections, check if this line is after a historical header
    if (isHistoricalSection && lineIndex > 0) {
      const beforeLine = unreleasedContent.substring(0, lineIndex);
      const lastHeader = beforeLine.lastIndexOf('###');
      if (lastHeader > 0) {
        const headerLine = unreleasedContent.substring(lastHeader, unreleasedContent.indexOf('\n', lastHeader));
        if (headerLine.includes('Historical - No PR refs')) {
          return false; // Skip validation for historical entries
        }
      }
    }
    
    return !PR_LINK_REGEX.test(line);
  });
  
  if (linesWithoutPR.length > 0) {
    issues.push(`Found ${linesWithoutPR.length} changelog entries without PR references`);
    linesWithoutPR.forEach(line => {
      issues.push(`  - "${line.trim()}"`);
    });
  }
  
  return {
    success: issues.length === 0,
    issues: issues
  };
}

/**
 * Main validation function
 * @param {number|null} targetPR - Specific PR number to check for, or null for general validation
 */
function validateReleaseNotes(targetPR = null) {
  console.log('🔍 Checking release notes in CHANGELOG.md...\n');
  
  // Read changelog
  const content = readChangelog();
  
  // Extract unreleased section
  const unreleasedSection = extractUnreleasedSection(content);
  
  if (!unreleasedSection) {
    console.error('❌ No [Unreleased] section found in CHANGELOG.md');
    console.error('   Please ensure CHANGELOG.md contains a ## [Unreleased] section');
    process.exit(1);
  }
  
  // If checking for specific PR
  if (targetPR) {
    const prNumbers = extractPRNumbers(unreleasedSection);
    
    if (prNumbers.includes(targetPR)) {
      console.log(`✅ PR #${targetPR} is properly referenced in release notes`);
      console.log(`📝 Found in [Unreleased] section with ${prNumbers.length} total PR references`);
      return;
    } else {
      console.error(`❌ PR #${targetPR} is NOT referenced in the [Unreleased] section`);
      console.error('');
      console.error('Please add an entry to CHANGELOG.md in the [Unreleased] section:');
      console.error('');
      console.error('## [Unreleased]');
      console.error('');
      console.error('### Added|Changed|Fixed');
      console.error(`- **Your Feature**: Description of your change (#${targetPR})`);
      console.error('');
      console.error('See CONTRIBUTING.md for detailed guidelines.');
      
      if (prNumbers.length > 0) {
        console.error(`\nCurrently referenced PRs: ${prNumbers.map(n => `#${n}`).join(', ')}`);
      }
      
      process.exit(1);
    }
  }
  
  // General format validation
  const validation = validateFormat(unreleasedSection);
  
  if (validation.success) {
    const prNumbers = extractPRNumbers(unreleasedSection);
    console.log('✅ Release notes format validation passed');
    
    if (prNumbers.length > 0) {
      console.log(`📝 Found ${prNumbers.length} PR references: ${prNumbers.map(n => `#${n}`).join(', ')}`);
    } else {
      console.log('📝 [Unreleased] section is empty (this is ok for initial setup)');
    }
    
    console.log('\n💡 Tip: Contributors should add their changes to the [Unreleased] section');
    console.log('   See CONTRIBUTING.md for detailed guidelines');
  } else {
    console.error('❌ Release notes format validation failed:');
    validation.issues.forEach(issue => {
      console.error(`   - ${issue}`);
    });
    console.error('\nSee CONTRIBUTING.md for proper release notes format.');
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const prNumber = process.argv[2] ? parseInt(process.argv[2], 10) : null;
  
  if (prNumber && (isNaN(prNumber) || prNumber <= 0)) {
    console.error('❌ Invalid PR number provided. Please provide a positive integer.');
    process.exit(1);
  }
  
  validateReleaseNotes(prNumber);
}

module.exports = {
  validateReleaseNotes,
  extractUnreleasedSection,
  extractPRNumbers,
  validateFormat
};