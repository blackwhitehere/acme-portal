# User Guide

## Overview

The ACME Portal VS Code extension provides a comprehensive interface for managing Python flow deployments through the acme-portal-sdk. It automatically discovers flows in your project and provides deployment operations through a tree view interface.

## Interface Components

### ACME Portal Sidebar

Access the main interface through the ACME Portal icon in the VS Code Activity Bar:

- **ACME Resources View**: Tree structure showing all flows and their deployments
- **Toolbar Actions**: Refresh and settings buttons
- **Context Menus**: Right-click actions for specific items

### Tree View Structure

```
📁 Flow Group (optional grouping)
├── 🔄 Flow Name
│   ├── 🌍 Environment 1 (e.g., dev)
│   │   ├── 🌿 Branch Name (e.g., main, feature/xyz)
│   │   │   ├── 📊 Deployment Details
│   │   │   └── 🔗 External Links
│   │   └── 🌿 Another Branch
│   ├── 🌍 Environment 2 (e.g., staging)
│   └── 🌍 Environment 3 (e.g., production)
└── 🔄 Another Flow
```

## Core Features

### Flow Discovery and Management

The extension automatically discovers flows using the acme-portal-sdk FlowFinder and displays:

- **Flow Name**: As defined in Python code
- **Description**: Flow documentation 
- **Source Path**: Location of the Python file
- **Deployability**: Whether the flow can be deployed

**Opening Flow Files**: Click the file icon (📄) next to any flow name to open the source file.

### Tree Navigation

- **Refresh**: Click the refresh button (🔄) or use Command Palette → "ACME: Refresh Flows"
- **Expand/Collapse**: Click arrows or double-click items
- **Hover Information**: Tooltips show additional details

### Deployment Operations

#### Individual Flow Deployment

**Prerequisites**:
- Flow must be deployable by SDK
- Git repository with clean state or committed changes
- Python environment with acme-portal-sdk configured
- Target environment configured in SDK

**Deploy Methods**:
1. Right-click flow → "Deploy Flow" (☁️)
2. Command Palette → "ACME: Deploy Flow"

#### Group Deployment

Deploy multiple flows with the same grouping path.

**Methods**:
1. Command Palette → "ACME: Deploy Flow Group" → Enter group path (e.g., "backend/data/etl")
2. Right-click group folder → "Deploy All Flows in Group"

#### Environment Promotion

Move flows between environments (dev → staging → production).

**Methods**:
1. Right-click flow/environment → "Promote Flow" (🚀)
2. Command Palette → "ACME: Promote Flow"

#### Group Promotion

Promote all flows in a group between environments.

**Method**: Command Palette → "ACME: Promote Flow Group"

#### Version Comparison

Compare flow versions across environments or branches.

**Method**: Right-click environment → "Compare Flow Versions" (🔄)

### External Integrations

Access deployment dashboards and monitoring tools by clicking link icons (🔗) or using "Open URL" from context menus.

## Configuration

All flow discovery and configuration is handled automatically by the acme-portal-sdk. No manual configuration is needed.

**Access Extension Settings**:
- Click gear icon (⚙️) in ACME Resources toolbar
- VS Code Settings (`Ctrl+,`) → Search "acme portal"
- Command Palette → "ACME: Open Settings"

## Commands Reference

| Command | Description | Context |
|---------|-------------|---------|
| `ACME: Refresh Flows` | Reload flows and deployments | Always available |
| `ACME: Deploy Flow` | Deploy selected flow | Deployable flows |
| `ACME: Deploy Flow Group` | Deploy all flows in group | Always available |
| `ACME: Promote Flow` | Promote to next environment | Deployed flows |
| `ACME: Promote Flow Group` | Promote group between environments | Always available |
| `ACME: Compare Flow Versions` | Show version differences | Deployed environments |
| `ACME: Open Settings` | Open extension settings | Always available |

### Context Menu Commands

**Flow Items**: Open Flow File (📄), Deploy Flow (☁️), Promote Flow (🚀)  
**Environment Items**: Promote Flow (🚀), Compare Versions (🔄), Open URL (🔗)  
**Group Items**: Deploy/Promote All Flows in Group

## SDK Integration

### Communication Architecture

```
VS Code Extension (TypeScript)
    ↓
Python Script Executor  
    ↓
SDK Object Runner (Python)
    ↓
acme-portal-sdk Objects
```

### Key SDK Objects

**FlowFinder**: Discovers flows in project  
**DeployWorkflow**: Handles flow deployments  
**PromoteWorkflow**: Manages environment promotions  
**DeploymentFinder**: Discovers existing deployments

### Data Structures

**FlowDetails**: Flow metadata including name, description, source path, grouping  
**DeploymentDetails**: Deployment information including environment, branch, status, URLs

## Progress Notifications

The extension provides real-time feedback for operations:

- **Loading**: "Loading ACME Portal data"
- **Deployment**: "Deploying flows: [names] on ref: [branch]"  
- **Promotion**: "Promoting [flow] from [env1] to [env2]"
- **Errors**: Detailed error messages with troubleshooting guidance

Check the Output panel (select "ACME Portal") for detailed logs.

## Best Practices

### Organization
- Use meaningful flow names and descriptions
- Organize flows with descriptive grouping hierarchies
- Maintain consistent project structure

### Development Workflow
1. **Development**: Edit flows → Deploy to dev environment
2. **Testing**: Promote to staging → Validate functionality  
3. **Production**: Final review → Promote to production

### Group-Based Operations
- Deploy related flows together using group paths
- Coordinate releases for interdependent flows
- Use group operations for bulk environment promotions

## Troubleshooting

### Common Issues

**No Flows Visible**:
- Verify Python interpreter selection
- Check acme-portal-sdk configuration
- Review Output panel for errors
- Try refresh button

**Deployment Failures**:
- Ensure Git CLI installed and accessible
- Check Git repository state
- Verify SDK configuration
- Review error messages in notifications

**SDK Integration Issues**:
- Confirm acme-portal-sdk installation in Python environment
- Check `.acme_portal_sdk` directory exists
- Verify Python environment has required packages

For detailed SDK setup instructions, see the [acme-portal-sdk documentation](https://blackwhitehere.github.io/acme-portal-sdk/).

## Tips

- Use Command Palette (`Ctrl+Shift+P`) for quick access to all commands
- Hover over tree items for additional information
- Check Output panel for detailed operation logs
- Use refresh after external changes to sync state