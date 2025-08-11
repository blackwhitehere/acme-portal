# Change Log

All notable changes to the "acmeportal" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added
- **SDK Version Checking**: Extension now verifies that the installed acme-portal-sdk version meets minimum requirements before allowing operations, ensuring compatibility and providing clear upgrade instructions when needed (#68)

### Changed
- **VSCode Version Compatibility**: Updated minimum VSCode version requirement from 1.102.0 to 1.99.3 to support older but still supported VSCode versions (#66)

### Added  
- **Multi-Version Testing**: Enhanced testing infrastructure with multi-version test configuration to validate extension compatibility across different VSCode versions (#66)

### Removed
- **Flow Path Settings**: Removed obsolete `acmeportal.flowsPath` setting and `setFlowsPath` command as flow discovery is now handled entirely by acme-portal-sdk (#62)

## 0.0.5

### Fixed
- **GitHub Release Action Permissions**: Fixed 403 "Resource not accessible by integration" error in release workflow by adding required `contents: write` permission (#60)

### Added
- **Group Flow Deployment**: Added ability to deploy all flows in a specified group using group path format "aaa/bbb/ccc" (#41)
- **Group Flow Promotion**: Added ability to promote all flows in a specified group between environments (#41)
- **Group Context Menu Actions**: Added right-click context menu options on groups to deploy or promote all flows in that group (#41)
- **Command Palette Integration**: New commands "ACME: Deploy Flow Group" and "ACME: Promote Flow Group" available in command palette (#41)
- **Release Notes Process**: Standardized release notes workflow with automated validation and extraction (#56)

### Added (Historical - No PR refs)
- **Comprehensive CI/CD Pipeline**: Implemented full automation following VS Code extension best practices
  - Multi-platform testing (Ubuntu, Windows, macOS)
  - Multiple Node.js versions (18.x, 20.x)
  - Multiple VS Code versions (stable, insiders)
  - Automated quality checks (ESLint, knip, npm audit)
  - Webpack bundling for optimized extension size (47.1KB bundled)
  - Automated publishing to VS Code Marketplace
  - Security scanning with CodeQL
  - Dependabot for automatic dependency updates
  - GitHub release automation with extension assets

- **Extension Bundling**: Added webpack configuration for optimized packaging
  - Reduced extension size and improved startup performance
  - Source maps for debugging bundled code
  - Development and production build configurations

- **Progress Notifications**: Added real-time progress notifications for all major operations
  - Deployment operations now show progress in the notification bar
  - Promotion operations display progress updates during execution
  - Data loading shows progress when scanning flows and deployments
  - Comparison setup shows progress during preparation
  - All notifications appear immediately when operations start and update with meaningful status messages
  - Success/error states are clearly indicated with emoji visual indicators (✅ ❌)

### Changed (Historical - No PR refs)
- **Build Process**: Switched from TypeScript compilation to webpack bundling for main distribution
- **Package Structure**: Updated entry point to bundled extension for better performance
- **Development Workflow**: Enhanced with comprehensive quality checks and automated testing
- Improved user experience with immediate feedback instead of only showing results at completion
- Enhanced error messages with visual indicators for better clarity

### Developer Experience (Historical - No PR refs)
- Added comprehensive documentation for CI/CD setup and development workflow
- Configured development tools for better code quality
- Automated security and dependency management
- Streamlined publishing process with automated releases

## [0.0.1] - Initial Release

- Initial release
