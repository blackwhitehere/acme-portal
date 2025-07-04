# acme-portal

> **Important:** This extension is currently in alpha and primarily for demonstration purposes. APIs may still change frequently.

`VSCode` extension for managing deployments using [`acme-portal-sdk`](https://github.com/blackwhitehere/acme-portal-sdk). Sample project using it is available at [`acme-prefect`](https://github.com/blackwhitehere/acme-prefect).

For explanation of main concepts used by the extension view `acme-portal-sdk` [docs](https://blackwhitehere.github.io/acme-portal-sdk/)

📚 **[Extension Documentation](https://blackwhitehere.github.io/acme-portal/)** - Complete user guide, API reference, and contributing guidelines

![acme-portal](https://raw.githubusercontent.com/blackwhitehere/acme-portal/main/media/acme_portal_screen2.png)

## Features

* Show and navigate all `Flows` in a project
* View existing `Flow` deployments across different `Environments` (and `branches`)
* Navigate to deployment URL from deployment tree view
* `Deploy` a flow to a given starting environment, e.g. `dev`
* `Promote` a deployment from a given environment to another environment
* View source code differences between environments
* **Progress Notifications**: Real-time progress updates in the notification bar for all operations

## Video Demonstration

Watch how to:

* [Navigate Flows and View Deployments](https://vimeo.com/1078687975/38ca31d450?share=copy "Navigate Flows and View Deployments")
* [Deploy Flow Demonstration](https://vimeo.com/1078676313/8c957e07db?share=copy "Deploy Flow Demonstration")
* [View Deployment](https://vimeo.com/1078680347/53b0f567f0?share=copy "View Deployment")
* [Promote Deployment](https://vimeo.com/1078686510/fcf1ce0d2c?share=copy "Promote Deployment")
* [Compare Flow Deployment Versions](https://vimeo.com/1078701794/21ed88bdf9?share=copy "Compare Flow Deployment Versions")

## Requirements

* Microsoft Python VSCode Extension needs to be installed
* Python environment used by your project needs to be selected with `Python: Select Interpreter` command
* Project needs to add as dependency & setup [`acme-portal-sdk`](https://blackwhitehere.github.io/acme-portal-sdk)
* `git` CLI needs to be installed
* Opened project needs to have remote source pointing to a `GitHub` repository (Other repos to be supported)

## Development

### Dev setup

* Go to `VSCode` `Run and Debug` tab and run `Run Extension` configuration.
* Open [`acme-prefect`](https://github.com/blackwhitehere/acme-prefect) repository which you have pulled locally.
* Create python virtual env according to instructions in the repo and set it using `Python: Select Interpreter`.

### Building and Testing

The project uses a comprehensive CI/CD pipeline with the following commands:

```bash
# Install dependencies
npm install

# Lint code
npm run lint

# Check for unused dependencies
npm run knip

# Compile TypeScript
npm run compile

# Run tests
npm test

# Package extension
npm run package

# Verify package integrity
npm run package-check
```

### CI/CD Pipeline

The project includes comprehensive CI/CD automation:

#### Continuous Integration (`.github/workflows/ci.yml`)
- **Multi-platform testing**: Ubuntu, Windows, macOS
- **Multiple Node.js versions**: 18.x, 20.x  
- **Multiple VS Code versions**: stable, insiders
- **Quality checks**: ESLint, knip, npm audit
- **Automated packaging validation**

#### Security Scanning
- **CodeQL analysis** for security vulnerabilities
- **Dependabot** for automatic dependency updates
- **NPM audit** for known security issues

#### Release Automation (`.github/workflows/release.yml`)
- **Automated publishing** on git tags (`v*`)
- **GitHub releases** with extension assets
- **VS Code Marketplace publishing** (requires `VSCE_PAT` secret)
- **Package verification** before publishing

### Publishing

To publish a new version:

1. Update version in `package.json`
2. Create a git tag: `git tag v1.0.0`
3. Push tag: `git push origin v1.0.0`
4. The release workflow will automatically:
   - Run all tests and quality checks
   - Package the extension
   - Create a GitHub release
   - Publish to VS Code Marketplace (if configured)

Manual publishing:
```bash
# Package extension
npm run package

# Publish to marketplace (requires authentication)
npx vsce publish
```

## Build and publish

Follow [VS Code Extension Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) for detailed publishing instructions.

## Extension Settings

## Release Notes

### 0.0.1

Initial release of `acme-portal`

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)