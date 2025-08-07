# ACME Portal VSCode Extension

ACME Portal is a VSCode extension that allows users to manage deployments of their Python projects. Data for the extension is provided via the open project using [`acme-portal-sdk`](https://github.com/blackwhitehere/acme-portal-sdk). Sample project using it is available at [`acme-prefect`](https://github.com/blackwhitehere/acme-prefect).

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap, Build, and Test the Repository

Run these commands in exact order:

```bash
# Install dependencies - takes ~1 minute
npm install

# Compile TypeScript - takes ~4 seconds
npm run compile

# Run linter - takes ~1 second  
npm run lint

# Check for unused dependencies - takes ~2 seconds
npm run knip

# Run unit tests - takes ~4 seconds, NEVER requires VS Code installation
npm run test:unit

# Package extension - takes ~5 seconds
npm run package-check
```

### CRITICAL Timing and Timeout Requirements

**NEVER CANCEL any long-running commands.** Use these timeout values:

- `npm install`: Set timeout to **5+ minutes** (typically takes 1 minute)
- `npm run compile`: Set timeout to **2+ minutes** (typically takes 4 seconds)
- `npm run test:unit`: Set timeout to **3+ minutes** (typically takes 4 seconds)
- `npm run package-check`: Set timeout to **3+ minutes** (typically takes 5 seconds)
- `mkdocs build`: Set timeout to **2+ minutes** (typically takes 1 second)
- VS Code integration tests: **DO NOT RUN** - they fail due to network restrictions

### Testing Strategy

**ALWAYS use unit tests only in CI environments:**

```bash
# Primary test command - handles network issues gracefully
npm test

# Force unit tests only (recommended for CI)
VSCODE_TEST_UNIT_ONLY=true npm test

# Direct unit test execution
npm run test:unit
```

**NEVER attempt VS Code integration tests** - they require downloading VS Code from `update.code.visualstudio.com` which is blocked in most CI environments. The test runner automatically falls back to unit tests.

### Documentation

Install and build documentation:

```bash
# Install MkDocs Material (one-time setup)
pip3 install mkdocs-material

# Build documentation - takes ~1 second
mkdocs build

# Serve documentation locally (for development)
mkdocs serve
```

## Development Workflow

### Run Extension in Development

1. Open VSCode in this repository
2. Press F5 or use "Run Extension" configuration
3. This opens a new VSCode window with the extension loaded
4. Open [`acme-prefect`](https://github.com/blackwhitehere/acme-prefect) repository in the extension host window
5. Create Python virtual environment according to acme-prefect instructions
6. Set Python interpreter using `Python: Select Interpreter` command

### Required Setup for Testing Extension Functionality

The extension requires:
- Microsoft Python VSCode Extension installed
- Python environment selected with `Python: Select Interpreter` command  
- Project with [`acme-portal-sdk`](https://blackwhitehere.github.io/acme-portal-sdk) dependency
- Git CLI installed
- GitHub repository as remote source

## Validation Scenarios

**ALWAYS test these scenarios after making changes:**

### 1. Basic Extension Loading
- Run extension in development mode (F5)
- Verify ACME Portal view appears in Activity Bar
- Check that no errors appear in Console

### 2. Build and Package Validation
```bash
# Complete validation sequence
npm run compile && npm run lint && npm run knip && npm run test:unit && npm run package-check
```

### 3. Documentation Build
```bash
mkdocs build --strict
```

### 4. Release Notes Validation
```bash
npm run check-release-notes
```

**ALWAYS run all validation steps before submitting changes.** The CI will fail if any of these steps fail.

## Repository Structure and Key Locations

### Source Code Organization
```
src/
├── actions/         # Business logic for deployments and flow management
├── commands/        # VSCode command implementations (7 files)
├── treeView/        # Tree view providers and UI components (8 files)
├── utils/           # Utility functions and helpers (7 files)
├── sdk/             # Bridge to acme-portal-sdk integration
├── settings/        # Configuration management
├── scripts/         # Python scripts for interacting with Python objects
└── extension.ts     # Main extension entry point
```

### Key Configuration Files
- `package.json` - Extension manifest and dependencies
- `tsconfig.json` - TypeScript compilation settings
- `eslint.config.mjs` - Linting configuration
- `.vscode/launch.json` - Debug configuration for "Run Extension"
- `.vscode/tasks.json` - Build tasks configuration

### Build Output
- `out/` - Compiled JavaScript and source maps
- `out/scripts/` - Python scripts copied from src/scripts/
- `acmeportal-*.vsix` - Packaged extension file

## Common Issues and Solutions

### VS Code Integration Test Failures
**Expected behavior:** VS Code integration tests fail with network errors like `getaddrinfo EAI_AGAIN vscode.download.prss.microsoft.com`. This is normal in CI environments.

**Solution:** Use `VSCODE_TEST_UNIT_ONLY=true npm test` or rely on automatic fallback to unit tests.

### Build Failures
- **TypeScript compilation errors:** Check `tsconfig.json` and ensure all types are properly imported
- **Linting errors:** Run `npm run lint` and fix any ESLint violations
- **Package validation errors:** Ensure `package.json` and extension manifest are valid

### Development Environment
- **Extension not loading:** Ensure TypeScript is compiled (`npm run compile`) before running F5
- **Changes not reflected:** Restart extension host window or recompile

## CI/CD Pipeline Integration

### Automated Checks
The repository runs these checks on every PR:
- Linting (`npm run lint`)
- Unused dependency check (`npm run knip`) 
- TypeScript compilation (`npm run compile`)
- Unit tests (`npm run test:unit`)
- Package validation (`npm run package-check`)
- Release notes format check (`npm run check-release-notes`)
- Documentation build (`mkdocs build --strict`)

### Release Process
1. Update version in `package.json`
2. Add release notes to `CHANGELOG.md` under `[Unreleased]` section
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions automatically packages and publishes

## Quality Checks

**ALWAYS run before committing:**

```bash
# Core validation (required for CI)
npm run lint
npm run knip  
npm run check-release-notes

# Full build validation
npm run compile && npm run test:unit && npm run package-check
```

## Project Background and Architecture

This VSCode extension allows users to manage deployments of their Python projects. Data for the extension is provided via the open project using [`acme-portal-sdk`](https://github.com/blackwhitehere/acme-portal-sdk). For explanation of main concepts view [`acme-portal-sdk` docs](https://blackwhitehere.github.io/acme-portal-sdk/).

### Libraries and Frameworks
- `vscode`: Core library for building VSCode extensions
- `acme-portal-sdk`: Backend functionality for managing deployments and flows (not directly used)
- `typescript`: Type-safe development
- `@typescript-eslint`: TypeScript-specific linting rules
- `@vscode/test-cli` and `@vscode/test-electron`: Testing tools for VSCode extensions
- `knip`: Identifies unused files, dependencies, and exports
- `mkdocs`: Documentation building and deployment

### Coding Standards
- Make code easy to change: isolate concerns, single responsibilities, good naming
- Adhere to DRY principle: centralize knowledge definition
- Design orthogonal functionality
- Check Python typing information in method signatures
- Keep documentation concise but informative
- Follow VSCode's design principles for UI consistency

### Release Notes Requirements
**Every pull request must include a release notes entry in CHANGELOG.md**

1. Add entry to `[Unreleased]` section in CHANGELOG.md
2. Use appropriate category: Added, Changed, Fixed, Security, Deprecated, Removed  
3. Format: `- **Feature/Fix Name**: Brief description (#PR_NUMBER)`
4. Make it user-focused, not implementation details

Example:
```markdown
### Added
- **Deploy Progress Notifications**: Real-time progress updates during flow deployments (#42)
```

See CONTRIBUTING.md for complete release notes guidelines.

## Frequently Referenced Commands and Output

### Repository Root Contents
```bash
ls -la
# Expected: package.json, tsconfig.json, src/, out/, docs/, .vscode/, README.md, CONTRIBUTING.md, CHANGELOG.md
```

### Build Status Check
```bash
git status && npm run compile && echo "Build successful"
```

### Package Configuration
```bash
cat package.json
# Shows extension metadata, dependencies, commands, and npm scripts
```

### Extension Development Cycle
After making TypeScript changes:
1. Run `npm run compile` 
2. Restart extension host (F5 again) or reload window
3. Test functionality in extension host window

**Remember:** Always use appropriate timeouts, never cancel long-running commands, and validate all changes with the complete test suite before submitting.