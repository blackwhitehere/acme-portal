# Contributing to ACME Portal

Thank you for your interest in contributing to the ACME Portal VS Code extension! This guide will help you get started with development and contributing.

## Development Setup

### Prerequisites

- **Node.js** (version 18.x or 20.x)
- **npm** (comes with Node.js)
- **VS Code** (version 1.97.0 or later)
- **Git** (for version control)

### Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/acme-portal.git
   cd acme-portal
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Open in VS Code**
   ```bash
   code .
   ```

### Development Workflow

#### Running the Extension

1. Press `F5` in VS Code to launch the Extension Development Host
2. This opens a new VS Code window with your extension loaded
3. Make changes to the code and reload the window to test changes

#### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile TypeScript to JavaScript |
| `npm run watch` | Watch for changes and auto-compile |
| `npm run lint` | Run ESLint for code quality |
| `npm run test` | Run the test suite |
| `npm run package` | Build production bundle with webpack |
| `npm run knip` | Check for unused dependencies |

#### Debugging

- Set breakpoints in your TypeScript code
- Use the Debug Console in the Extension Development Host
- Check the Output panel → "ACME Portal" for extension logs
- Use the Developer Tools (Help → Toggle Developer Tools)

## Code Style and Standards

### ESLint Configuration

The project uses ESLint with TypeScript support. Run linting with:
```bash
npm run lint
```

### Code Formatting

- Use 2 spaces for indentation
- Follow TypeScript best practices
- Add JSDoc comments for public APIs
- Use meaningful variable and function names

### File Organization

```
src/
├── extension.ts          # Main extension entry point
├── flowTreeProvider.ts   # Tree view implementation
├── commands/            # Command implementations
├── models/             # Data models and interfaces
├── utils/              # Utility functions
└── test/               # Test files
```

## Testing

### Running Tests

```bash
npm run test
```

This runs tests in a headless VS Code environment using the `@vscode/test-cli` framework.

### Writing Tests

- Place test files in the `src/test/` directory
- Use the `.test.ts` suffix for test files
- Follow the existing test patterns:

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  test('Sample test', () => {
    assert.strictEqual([1, 2, 3].indexOf(5), -1);
    assert.strictEqual([1, 2, 3].indexOf(0), -1);
  });
});
```

### Test Categories

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test extension commands and VS Code integration
- **End-to-End Tests**: Test complete workflows

## Contributing Guidelines

### Before You Start

1. Check existing issues for similar problems or features
2. Open an issue to discuss major changes before implementing
3. Make sure tests pass before submitting changes

### Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run lint
   npm run test
   npm run compile
   npm run check-release-notes  # Validate release notes entry
   ```

4. **Add Release Notes Entry**
   - Open `CHANGELOG.md`
   - Add your change to the `[Unreleased]` section
   - Format: `- **Feature Name**: Description (#PR_NUMBER)`
   - See [Release Notes Process](#release-notes-process) below

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Format

We follow conventional commit format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Maintenance tasks

Examples:
- `feat: add flow comparison command`
- `fix: resolve tree view refresh issue`
- `docs: update API reference`

### Pull Request Process

1. **Push Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Use a descriptive title
   - Fill out the PR template
   - Reference related issues
   - Add screenshots for UI changes

3. **Address Review Feedback**
   - Respond to comments
   - Make requested changes
   - Push updates to the same branch

## Documentation

### Updating Documentation

When making changes that affect users or developers:

1. **README.md**: Update if installation or basic usage changes
2. **CHANGELOG.md**: Add entries for all user-facing changes
3. **docs/**: Update relevant documentation pages
4. **Code Comments**: Add or update JSDoc comments

### Documentation Style

- Use clear, concise language
- Include code examples where helpful
- Keep screenshots up to date
- Link to related documentation

## Release Notes Process

**Every pull request must include a release notes entry** in `CHANGELOG.md`. This ensures all changes are properly documented and enables automated release generation.

### Quick Guidelines

1. **Add to [Unreleased] Section**
   ```markdown
   ## [Unreleased]
   
   ### Added
   - **Your Feature**: Brief description of the change (#PR_NUMBER)
   ```

2. **Choose Correct Category**
   - `### Added` - for new features
   - `### Changed` - for changes in existing functionality  
   - `### Fixed` - for bug fixes
   - `### Security` - for security-related changes
   - `### Deprecated` - for soon-to-be removed features
   - `### Removed` - for removed features

3. **Format Requirements**
   - Use `**Feature Name**:` for the entry title
   - Include brief user-focused description
   - Always add `(#PR_NUMBER)` at the end
   - Write from the user's perspective, not implementation details

### Examples

```markdown
### Added
- **Deploy Progress Notifications**: Real-time progress updates during flow deployments (#42)

### Fixed  
- **Tree View Refresh**: Fixed issue where tree view wasn't updating after deployments (#43)

### Changed
- **Settings UI**: Improved settings panel layout and validation (#44)
```

### Validation

- **Automated Check**: CI validates that all PRs are referenced in release notes
- **Manual Check**: Run `npm run check-release-notes [PR_NUMBER]` to validate
- **Required for Merge**: PRs without release notes entries will fail CI

For complete release process details, see the main [CONTRIBUTING.md](../CONTRIBUTING.md).

## Release Process

### Version Management

We use semantic versioning (semver):
- `MAJOR.MINOR.PATCH`
- Increment MAJOR for breaking changes
- Increment MINOR for new features
- Increment PATCH for bug fixes

### Creating Releases

Releases are automated through GitHub Actions:

1. **Update Version**
   ```bash
   npm version patch  # or minor/major
   ```

2. **Create Tag**
   ```bash
   git push origin main
   git push origin --tags
   ```

3. **Automated Process**
   - CI runs tests across platforms
   - Extension is packaged and validated
   - GitHub release is created
   - VS Code Marketplace publishing (when configured)

## Getting Help

### Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [VS Code Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Community

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Code Reviews**: Learn from PR feedback and reviews

### Development Tips

1. **Use VS Code's Extension Development Host** for testing
2. **Check the Output panel** for debugging information
3. **Use breakpoints** liberally during development
4. **Test on different operating systems** when possible
5. **Keep dependencies up to date** but test thoroughly

## Code of Conduct

Please note that this project follows a Code of Conduct. By participating, you are expected to:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Recognition

Contributors will be recognized in:
- The CHANGELOG.md file
- GitHub's contributor graph
- Release notes for significant contributions

Thank you for contributing to ACME Portal! 🚀