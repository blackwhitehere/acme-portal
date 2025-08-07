# ACME Portal Documentation

Welcome to the ACME Portal VS Code Extension documentation.

## Overview

ACME Portal is a VS Code extension that provides a user interface for managing Python flow deployments for a project utilizing `acme-portal-sdk`.

## Key Features

### 🔍 **Flow Discovery and Management**
- **Automatic Detection**: Scans your project for SDK-compatible flows
- **Tree View Navigation**: Hierarchical display of flows, environments, and deployments
- **File Integration**: Direct access to flow source files from the tree view
- **Metadata Display**: Shows flow descriptions, paths, and organizational grouping

### 🚀 **Deployment Operations**
- **One-Click Deployment**: Deploy flows directly from the VS Code interface
- **Environment Promotion**: Move flows through environment chains (dev → staging → production)
- **Progress Tracking**: Real-time notifications for all deployment operations
- **Error Handling**: Comprehensive error reporting and troubleshooting guidance

### 🔄 **Version Control Integration**
- **Robust Versioning**: View semantic version and `git` hash contained in each deployment
- **Diff Views**: Compare flow versions between two deployments
- **Branch Management**: Track deployments across different Git branches

### ⚙️ **Configuration and Settings**
- **Automatic Configuration**: Uses acme-portal-sdk configuration for all flow discovery
- **Environment Management**: Support for multiple deployment environments
- **Extension Settings**: Integration with VS Code's settings system
- **Multi-Project Support**: Works with multi-root workspaces

### 🔗 **External Integrations**
- **Dashboard Links**: Direct access to deployment dashboards and monitoring tools
- **URL Management**: Open external resources related to deployments
- **API Integration**: Seamless communication with external deployment systems

## How It Works

The extension serves as a bridge between VS Code and the acme-portal-sdk:

1. **Discovery**: Scans your project for flows using SDK's FlowFinder
2. **Display**: Presents flows in an organized tree view with deployment status
3. **Actions**: Provides commands for deployment, promotion, and comparison operations
4. **Communication**: Uses Python scripts to interface with python SDK objects
5. **Feedback**: Displays progress and results through VS Code's notification system

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   VS Code UI    │ ←→ │  ACME Extension  │ ←→ │ acme-portal-sdk │
│                 │    │                  │    │                 │
│ • Tree View     │    │ • Commands       │    │ • FlowFinder    │
│ • Commands      │    │ • Tree Provider  │    │ • DeployWorkflow│
│ • Notifications │    │ • SDK Interface  │    │ • PromoteFlow   │
│ • Settings      │    │ • Error Handling │    │ • Comparisons   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Prerequisites

Before getting started, ensure you have:

- **VS Code** 1.102.0 or later
- **Microsoft Python Extension** installed
- **Git CLI** installed and accessible
- **acme-portal-sdk** configured in your Python project

## Quick Start

1. **Install the Extension**
   - Search for "ACME Portal" in VS Code Extensions marketplace
   - Click "Install" and reload VS Code

2. **Setup Your Project**
   - Open a workspace with Python flows configured for acme-portal-sdk
   - Select the correct Python interpreter using VSCode command `Python: Select Interpreter`

3. **Start Using**
   - Open the ACME Portal sidebar (click the ACME icon)
   - View your flows in the tree structure
   - Use context menus and toolbar actions for deployments

## Navigation Guide

This documentation is organized into the following sections:

### User Documentation
- **[Getting Started](user/getting-started.md)** - Installation, setup, and initial configuration
- **[User Guide](user/user-guide.md)** - Comprehensive feature guide and workflows
- **[API Reference](user/api-reference.md)** - Technical details and SDK integration

### Developer Documentation
- **[Contributing](developer/contributing.md)** - Guidelines for contributing to the project
- **[CI Strategy](developer/ci-strategy.md)** - Continuous integration and deployment information

## SDK Integration

The extension is tightly integrated with the [acme-portal-sdk](https://blackwhitehere.github.io/acme-portal-sdk/), which provides the core functionality for:

- **Flow Discovery**: Scanning projects for compatible flows
- **Deployment Management**: Executing deployment workflows
- **Environment Operations**: Managing environment promotions
- **Data Interfaces**: Standardized data structures and APIs

**Important**: The extension requires a properly configured acme-portal-sdk installation. Visit the [SDK documentation](https://blackwhitehere.github.io/acme-portal-sdk/) for setup instructions.

## Sample Project

For a complete working example of the extension in action, check out the [acme-prefect sample project](https://github.com/blackwhitehere/acme-prefect), which demonstrates:

- Proper SDK configuration
- Flow structure and organization
- Integration with deployment systems
- Best practices for project setup

## Demonstration Videos

See the extension in action:

- [Navigate Flows and View Deployments](https://vimeo.com/1078687975/38ca31d450?share=copy)
- [Deploy Flow Demonstration](https://vimeo.com/1078676313/8c957e07db?share=copy)
- [View Deployment](https://vimeo.com/1078680347/53b0f567f0?share=copy)
- [Promote Deployment](https://vimeo.com/1078686510/fcf1ce0d2c?share=copy)
- [Compare Flow Deployment Versions](https://vimeo.com/1078701794/21ed88bdf9?share=copy)

## Support and Community

### Getting Help

- **Documentation**: Start with this documentation for comprehensive guides
- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/blackwhitehere/acme-portal/issues)
- **Discussions**: Ask questions or share ideas in [GitHub Discussions](https://github.com/blackwhitehere/acme-portal/discussions)

### Contributing

We welcome contributions! See our [Contributing Guide](developer/contributing.md) for:

- Development setup instructions
- Coding standards and guidelines
- Pull request process
- Issue reporting guidelines

### Project Status

> **Note**: This extension is currently in alpha and primarily for demonstration purposes. APIs may change frequently as we refine the functionality based on user feedback.

## License

This project is licensed using [LICENSE](https://github.com/blackwhitehere/acme-portal/blob/main/LICENSE) file for details.
