# User Guide

## Overview

This guide covers all the features and functionality of the ACME Portal VS Code extension.

## Interface Components

### ACME Portal Sidebar

The main interface is accessed through the ACME Portal icon in the VS Code Activity Bar. It contains:

- **ACME Resources View**: Lists all flows and environments in your project
- **Toolbar Buttons**: Quick access to common actions like refresh and settings

### Flow Tree Structure

Flows are organized hierarchically:
```
📁 Flow Name
├── 🌍 Environment 1
├── 🌍 Environment 2
└── 🌍 Environment 3
```

## Core Features

### Flow Management

#### Viewing Flows
- All flows in your configured flows directory are automatically detected
- Flows are displayed with their current environments and status
- Use the refresh button (🔄) to reload the flow list

#### Opening Flow Files
- Click the file icon (📄) next to any flow to open its main file
- This opens the Python file associated with the flow in the editor

### Deployment Operations

#### Deploying Flows
- Click the deploy button (☁️) next to deployable flows
- Only flows that meet deployment criteria will show this option
- Monitor deployment progress in the Output panel

#### Environment Promotion
- Click the promote button (🚀) next to flows or environments
- This moves a flow from one environment to the next in the promotion chain
- Useful for moving flows from dev → staging → production

#### Version Comparison
- Click the diff button (🔄) next to environments
- Opens a comparison view showing differences between flow versions
- Helps review changes before promotion or deployment

### Configuration

#### Extension Settings
- Access through the gear icon (⚙️) in the ACME Portal toolbar
- Or go to VS Code Settings and search for "acme portal"
- Configure the flows path relative to your workspace root

#### Flow Path Configuration
The most important setting is the flows path:
- **Default**: `flows`
- **Description**: Directory containing your Python flow files
- **Examples**: 
  - `src/flows` - flows in a src subdirectory
  - `my-flows` - custom flows directory name
  - `./flows` - explicit relative path

## Commands

All ACME Portal commands are available through the Command Palette (`Ctrl+Shift+P`):

| Command | Description |
|---------|-------------|
| `ACME: Open Settings` | Open extension settings |
| `ACME: Refresh Flows` | Reload the flow list |
| `ACME: Deploy Flow` | Deploy the selected flow |
| `ACME: Promote Flow` | Promote flow to next environment |
| `ACME: Compare Flow Versions` | Show differences between versions |

## Context Menus

Right-click on flows and environments for additional options:
- **Flows**: Open file, deploy, promote
- **Environments**: Promote, compare versions, open external URLs

## Workflow Examples

### Typical Development Workflow

1. **Create/Modify Flow**: Edit Python files using VS Code
2. **Refresh Views**: Click refresh to see changes
3. **Deploy to Dev**: Use deploy button for development testing
4. **Promote to Staging**: Once tested, promote to staging environment
5. **Compare Versions**: Review changes before production
6. **Promote to Production**: Final promotion after approval

### Multi-Environment Management

1. **View All Environments**: Expand flows to see all environments
2. **Check Status**: Monitor deployment status across environments
3. **Selective Promotion**: Promote specific flows as needed
4. **Version Control**: Use comparison tools to track changes

## Tips and Best Practices

### Organization
- Keep flows in a dedicated directory
- Use descriptive flow names
- Maintain consistent directory structure

### Development
- Test flows in development environment before promoting
- Use version comparison before production deployments
- Keep flow files organized and well-documented

### Troubleshooting
- Check the Output panel for detailed logs
- Verify Python interpreter selection
- Ensure acme-portal-sdk is properly configured
- Use refresh if flows don't appear immediately

## Integration with VS Code

### File Operations
- Opening flow files integrates with VS Code's editor
- Use VS Code's built-in Git integration for version control
- Leverage VS Code's Python debugging for flow development

### Extensions Compatibility
- Works alongside Python extension
- Compatible with Git extensions
- Supports VS Code's integrated terminal for manual operations

## Advanced Usage

### Custom Flow Structures
- Configure non-standard flow directory layouts
- Work with multiple flow directories (requires separate workspaces)
- Integration with monorepo structures

### Automation
- Use VS Code tasks to automate common workflows
- Integrate with VS Code's launch configurations
- Set up keyboard shortcuts for frequent operations

For technical details about the underlying SDK, see the [API Reference](api-reference.md).