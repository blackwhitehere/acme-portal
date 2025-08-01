# CI Strategy for VS Code Extension

This document explains the new CI strategy implemented to address firewall restrictions that block VS Code downloads from `update.code.visualstudio.com`.

## Problem

VS Code extension testing traditionally requires downloading VS Code binaries, which can be blocked by corporate firewalls or CI environments with network restrictions.

## Solution

We've implemented a **separated CI strategy** that divides testing into two categories:

### 1. Basic Tests (Run on every PR/push)

**What runs:**
- ESLint linting
- TypeScript compilation
- Unit tests (no VS Code required)
- Unused dependency checks (knip)
- Extension packaging validation

**Benefits:**
- Fast execution (no VS Code download)
- Works in restricted network environments
- Catches most common issues
- Validates code quality

**Environment:**
- Ubuntu latest only (per issue #40)
- Node.js 20.x only (per issue #40)
- No VS Code installation required

### 2. Integration Tests (Run on demand)

**When they run:**
- Manual trigger via workflow_dispatch
- Release builds
- When explicitly enabled with `run-integration-tests: true`

**What they test:**
- VS Code extension integration
- Real VS Code environment behavior
- End-to-end functionality

**Environment:**
- Configurable platforms (Ubuntu by default, all platforms with `full-test: true`)
- Node.js 20.x (simplified per issue #40)
- VS Code stable (simplified per issue #40)

## Usage

### For Regular Development (PR/Push)
No action needed - basic tests run automatically and provide fast feedback.

### For Integration Testing
Use GitHub Actions workflow_dispatch:
1. Go to Actions tab in GitHub
2. Select "CI" workflow
3. Click "Run workflow"
4. Check "Run VS Code integration tests"
5. Optionally check "Run tests on all platforms"

### For Releases
Integration tests run automatically on git tag pushes (`v*`).

## Environment Variables

The test runner script supports several environment variables for different scenarios:

- `VSCODE_TEST_UNIT_ONLY=true` - Run only unit tests
- `VSCODE_TEST_ALTERNATIVE=true` - Fall back to unit tests if VS Code fails
- `SKIP_VSCODE_TESTS=true` - Skip all VS Code tests entirely

## Fallback Mechanism

If VS Code integration tests fail due to network issues, the system:
1. Detects the network error
2. Automatically falls back to unit tests
3. Continues the CI pipeline
4. Provides helpful error messages

## Benefits

1. **Faster CI**: Basic tests complete in ~1-2 minutes vs 5-10 minutes
2. **Network resilient**: Works in restricted environments
3. **Better feedback**: Developers get quick feedback on common issues
4. **Comprehensive when needed**: Full integration testing available on demand
5. **Follows issue #40**: Simplified to Node 20.x + stable VS Code by default

## Files Modified

- `.github/workflows/ci.yml` - New separated CI workflow
- `package.json` - Added unit test scripts
- `scripts/test.js` - Enhanced fallback logic
- `src/test-unit/` - New unit test directory
- `knip.json` - Updated to ignore test files
- `.vscode-test-unit.mjs` - Unit test configuration

## Migration Path

Existing functionality remains unchanged:
- `npm test` still works for local development
- VS Code integration tests still work when network allows
- All existing scripts and configurations remain functional