# Contributing to ACME Portal

## Development Setup

1. **Prerequisites**
   - Node.js 18.x or 20.x
   - VS Code
   - Git
   - Python (for testing with acme-portal-sdk)

2. **Clone and Install**
   ```bash
   git clone https://github.com/blackwhitehere/acme-portal.git
   cd acme-portal
   npm install
   ```

3. **Development Workflow**
   ```bash
   # Start development server
   npm run watch
   
   # Run extension in new VS Code window
   # Press F5 or use "Run Extension" configuration
   ```

## Code Quality

### Linting and Formatting
```bash
# Run ESLint
npm run lint

# Check for unused code/dependencies
npm run knip
```

### Building and Packaging
```bash
# Compile TypeScript
npm run compile

# Bundle for production
npm run package

# Verify package
npm run package-check
```

### Testing
```bash
# Run all tests
npm test

# Note: Tests require VS Code environment
# Use "Extension Test Runner" in VS Code for interactive testing
```

## CI/CD Pipeline

### Automated Checks
Every pull request automatically runs:
- **Multi-platform testing** (Ubuntu, Windows, macOS)
- **Multiple Node.js versions** (18.x, 20.x)
- **Multiple VS Code versions** (stable, insiders)
- **Code quality checks** (ESLint, knip, audit)
- **Security scanning** (CodeQL)
- **Package verification**

### Branch Protection
The `main` branch is protected and requires:
- All CI checks to pass
- Code review approval
- Up-to-date branch

## Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- Breaking changes increment MAJOR
- New features increment MINOR  
- Bug fixes increment PATCH

### Creating a Release
1. **Update Version**
   ```bash
   # Update package.json version
   npm version patch|minor|major
   ```

2. **Update Changelog**
   - Move items from `[Unreleased]` to new version section
   - Follow [Keep a Changelog](https://keepachangelog.com/) format

3. **Create and Push Tag**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. **Automated Release**
   - GitHub Actions will automatically:
     - Run all tests and quality checks
     - Bundle the extension
     - Create GitHub release with assets
     - Publish to VS Code Marketplace (if configured)

## Code Style

### TypeScript Guidelines
- Use TypeScript strict mode
- Provide type annotations for public APIs
- Follow existing code patterns
- Document complex functions with JSDoc

### File Organization
```
src/
├── commands/          # VS Code command implementations
├── actions/           # Business logic actions
├── treeView/          # Tree view providers and items
├── utils/             # Utility functions
├── settings/          # Configuration management
├── sdk/               # acme-portal-sdk integration
└── test/              # Test files
```

### Naming Conventions
- **Files**: camelCase for TypeScript files
- **Classes**: PascalCase
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase with descriptive names

## Pull Request Guidelines

### Before Submitting
1. **Test your changes**
   ```bash
   npm run compile
   npm run lint
   npm run knip
   npm test
   ```

2. **Update documentation** if needed
3. **Add changelog entry** in appropriate section
4. **Test extension functionality** in VS Code

### PR Description Template
```markdown
## What changes were made?
Brief description of changes

## Why were these changes made?
Context and motivation

## How were these changes tested?
Testing approach and results

## Checklist
- [ ] Code compiles without errors
- [ ] Linting passes
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Changelog updated
```

## Security

### Reporting Vulnerabilities
Report security issues privately to the maintainers.

### Dependency Management
- Dependencies are automatically updated by Dependabot
- Major version updates require manual review
- Security updates are prioritized

## Support

### Getting Help
- Check existing [Issues](https://github.com/blackwhitehere/acme-portal/issues)
- Review [Documentation](https://blackwhitehere.github.io/acme-portal-sdk/)
- Create new issue with detailed description

### Issue Templates
Please use appropriate issue templates:
- **Bug Report**: For reporting issues
- **Feature Request**: For suggesting enhancements
- **Question**: For asking questions

Thank you for contributing to ACME Portal! 🚀