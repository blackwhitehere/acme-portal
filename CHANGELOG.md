# Change Log

All notable changes to the "acmeportal" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added
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

### Changed
- **Build Process**: Switched from TypeScript compilation to webpack bundling for main distribution
- **Package Structure**: Updated entry point to bundled extension for better performance
- **Development Workflow**: Enhanced with comprehensive quality checks and automated testing
- Improved user experience with immediate feedback instead of only showing results at completion
- Enhanced error messages with visual indicators for better clarity

### Developer Experience
- Added comprehensive documentation for CI/CD setup and development workflow
- Configured development tools for better code quality
- Automated security and dependency management
- Streamlined publishing process with automated releases

## [0.0.1] - Initial Release

- Initial release