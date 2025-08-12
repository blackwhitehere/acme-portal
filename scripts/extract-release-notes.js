#!/usr/bin/env node

/**
 * Release Notes Extractor Script
 * 
 * This script extracts release notes from CHANGELOG.md for a specific version
 * or the [Unreleased] section for use in GitHub releases.
 * 
 * Usage:
 *   node scripts/extract-release-notes.js [VERSION]
 * 
 * When VERSION is provided (e.g., "1.0.0"), extracts notes for that version.
 * When run without VERSION, extracts the [Unreleased] section.
 * 
 * Output is formatted for GitHub releases with proper markdown.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md');

/**
 * Reads and parses the CHANGELOG.md file
 * @returns {string} Content of CHANGELOG.md
 */
function readChangelog() {
  try {
    return fs.readFileSync(CHANGELOG_PATH, 'utf8');
  } catch (error) {
    console.error('Error reading CHANGELOG.md:', error.message);
    process.exit(1);
  }
}

/**
 * Extracts release notes for a specific version or unreleased section
 * @param {string} content - Full changelog content
 * @param {string|null} version - Version to extract (e.g., "1.0.0") or null for unreleased
 * @returns {string|null} Release notes content or null if not found
 */
function extractReleaseNotes(content, version = null) {
  let sectionPattern;
  
  if (version) {
    // Match specific version section
    const versionEscaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    sectionPattern = new RegExp(`## \\[${versionEscaped}\\][^\\n]*\\n([\\s\\S]*?)(?=\\n## (?!\\[${versionEscaped}\\])|$)`, 'i');
  } else {
    // Match unreleased section
    sectionPattern = /## \[Unreleased\][^\n]*\n([\s\S]*?)(?=\n## (?!\[Unreleased\])|$)/i;
  }
  
  const match = content.match(sectionPattern);
  return match ? match[1].trim() : null;
}

/**
 * Formats release notes for GitHub release
 * @param {string} rawNotes - Raw release notes content
 * @param {string|null} version - Version being released
 * @returns {string} Formatted release notes
 */
function formatForGitHub(rawNotes, version = null) {
  // Clean up the notes
  let formatted = rawNotes
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
  
  // If it's empty, provide a default message
  if (!formatted || formatted.trim().length === 0) {
    if (version) {
      return `Release ${version}\n\nSee CHANGELOG.md for details.`;
    } else {
      return 'No release notes available.\n\nSee CHANGELOG.md for details.';
    }
  }
  
  // Add header if it's from unreleased section
  if (!version) {
    formatted = `Release Notes\n\n${formatted}`;
  }
  
  return formatted;
}

/**
 * Main extraction function
 * @param {string|null} version - Version to extract or null for unreleased
 */
function extractForRelease(version = null) {
  const content = readChangelog();
  const rawNotes = extractReleaseNotes(content, version);
  
  if (!rawNotes) {
    if (version) {
      console.error(`No release notes found for version ${version}`);
      console.error('Available versions in CHANGELOG.md:');
      
      // Show available versions
      const versionMatches = content.match(/## \[[^\]]+\]/g);
      if (versionMatches) {
        versionMatches.forEach(match => console.error(`  - ${match}`));
      }
    } else {
      console.error('No [Unreleased] section found in CHANGELOG.md');
    }
    process.exit(1);
  }
  
  const formatted = formatForGitHub(rawNotes, version);
  console.log(formatted);
}

// Main execution
if (require.main === module) {
  const version = process.argv[2] || null;
  extractForRelease(version);
}

module.exports = {
  extractReleaseNotes,
  formatForGitHub,
  extractForRelease
};