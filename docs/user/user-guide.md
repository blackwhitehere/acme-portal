# User Guide

## Overview

This guide covers all features and functionality of the ACME Portal VS Code extension. The extension provides a comprehensive interface for managing Python flow deployments through the acme-portal-sdk.

## Extension Architecture

The ACME Portal extension acts as a bridge between VS Code and the acme-portal-sdk, providing:
- **Visual Interface**: Tree view for flows, environments, and deployments
- **Command Integration**: Direct access to deployment operations
- **SDK Communication**: Python script execution to interact with SDK objects
- **Progress Tracking**: Real-time notifications for all operations

## Interface Components

### ACME Portal Sidebar

The main interface is accessed through the ACME Portal icon in the VS Code Activity Bar. It contains:

- **ACME Resources View**: Tree structure showing all flows and their deployments
- **Toolbar Actions**: Quick access buttons for common operations
- **Context Menus**: Right-click actions for specific items

### Tree View Structure

The extension organizes your flows in a hierarchical tree structure:

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

## Information Displayed in Tree

### Flow Level Information

For each flow, the tree displays:
- **Flow Name**: The name as defined in your Python code
- **Description**: Flow description from the SDK
- **Source File**: Path to the Python file containing the flow
- **Status Icons**: Visual indicators for deployability and state

### Environment Level Information

For each environment under a flow:
- **Environment Name**: dev, staging, production, etc.
- **Deployment Status**: Whether the flow is deployed to this environment
- **Branch Information**: Which Git branches have deployments
- **Version Details**: Current deployed version information

### Branch Level Information

For each branch within an environment:
- **Branch Name**: Git branch name (main, develop, feature branches, etc.)
- **Commit Information**: Latest deployed commit details
- **Deployment Timestamp**: When the deployment was made
- **Deployment URL**: Link to external deployment interface (if available)

### Detail Level Information

Additional details may include:
- **Deployment ID**: Unique identifier for the deployment
- **Status**: Running, completed, failed, etc.
- **Version**: Semantic version or commit SHA
- **Metadata**: Additional deployment-specific information

## Tree Navigation

### Expanding and Collapsing

- **Click the arrow** next to any item to expand or collapse it
- **Double-click** on items to expand/collapse them
- **Use the "Collapse All"** button in the toolbar to collapse the entire tree

### Viewing Flow Information

Hover over any item in the tree to see additional information in tooltips:
- Flow descriptions and source paths
- Environment status and deployment details
- Branch information and commit details

### Refreshing the Tree

The tree automatically loads when you open a workspace, but you can manually refresh it:

1. **Click the Refresh button** (🔄) in the ACME Resources toolbar
2. **Use Command Palette**: `Ctrl+Shift+P` → "ACME: Refresh Flows"
3. **Automatic refresh**: The tree refreshes after successful deployment or promotion operations

**When to refresh:**
- After making changes to flow files
- When new flows are added to your project
- After external deployments (made outside VS Code)
- When Git branches change
- If the tree appears out of sync with your project state

## Core Features

### Flow Discovery and Management

#### How Flows are Found

The extension automatically discovers flows in your project by:

1. **Scanning the configured flows directory** (set in extension settings)
2. **Using the acme-portal-sdk FlowFinder** to identify compatible flows
3. **Reading flow metadata** including names, descriptions, and source paths
4. **Detecting flow grouping** for organized display

#### Flow Information Display

Each flow shows:
- **Name**: Flow name as defined in Python code
- **Description**: Documentation from the flow definition
- **Source Path**: Location of the Python file
- **Grouping**: Organizational structure for navigation
- **Deployability**: Whether the flow can be deployed

#### Opening Flow Files

**Method 1: Context Menu**
- Right-click on any flow in the tree
- Select "Open Flow File" or click the file icon (📄)

**Method 2: Direct Click**
- Click the file icon (📄) next to any flow name

**Method 3: Command Palette**
- Use `Ctrl+Shift+P` → "ACME: Open Flow File" (when a flow is selected)

**What happens:**
- Opens the Python source file in VS Code editor
- File opens at the main definition location
- Full VS Code editing capabilities available
- Integrated with VS Code's Git features for version control

### Deployment Operations

#### Deploying Flows

Deploy flows from your local workspace to target environments.

**Prerequisites for deployment:**
- Flow must be marked as deployable by the SDK
- Git repository must have a clean working state or committed changes
- Python environment must have acme-portal-sdk properly configured
- Target environment must be configured in the SDK

**How to deploy:**

1. **Via Context Menu**: 
   - Right-click on a deployable flow
   - Click "Deploy Flow" or the cloud upload icon (☁️)

2. **Via Command Palette**:
   - Select a flow in the tree
   - Use `Ctrl+Shift+P` → "ACME: Deploy Flow"

3. **Via Toolbar** (when flow is selected):
   - Click the deploy button in the context menu

**Deployment process:**
1. Extension validates prerequisites
2. Determines current Git branch/commit
3. Calls SDK's DeployWorkflow object
4. Shows progress notification
5. Updates tree view with new deployment status
6. Displays deployment URL if available

**Deployment parameters passed to SDK:**
- List of flows to deploy
- Git reference (branch/tag/commit)
- Additional context from flow metadata

#### Environment Promotion

Move deployments from one environment to the next (e.g., dev → staging → production).

**Promotion workflow:**
- Promotes flows through predefined environment chains
- Maintains version history and traceability
- Validates promotion rules defined in SDK

**How to promote:**

1. **From Flow Level**:
   - Right-click on a flow
   - Click "Promote Flow" or rocket icon (🚀)
   - Promotes from the flow's current environment to the next

2. **From Environment Level**:
   - Right-click on a specific environment
   - Click "Promote Flow" or rocket icon (🚀)
   - Promotes from that environment to the next

3. **Via Command Palette**:
   - Select flow or environment
   - Use `Ctrl+Shift+P` → "ACME: Promote Flow"

**Promotion process:**
1. Identifies source and target environments
2. Validates promotion eligibility
3. Calls SDK's PromoteWorkflow object
4. Shows progress notification
5. Updates tree to reflect new deployment state

#### Version Comparison

Compare different versions of flows across environments or branches.

**What you can compare:**
- Same flow across different environments
- Same flow across different branches
- Different versions of the same flow over time

**How to compare versions:**

1. **From Environment**:
   - Right-click on an environment
   - Click "Compare Flow Versions" or diff icon (🔄)

2. **Via Command Palette**:
   - Select an environment
   - Use `Ctrl+Shift+P` → "ACME: Compare Flow Versions"

**Comparison process:**
1. Identifies versions to compare
2. Retrieves source code from different Git references
3. Uses SDK's comparison functionality
4. Opens diff view in VS Code
5. Shows differences in code, configuration, and metadata

### External Integrations

#### Opening External URLs

Access deployment dashboards, monitoring tools, or other external resources.

**Available for:**
- Environments with configured external URLs
- Deployments with associated monitoring links
- Flow documentation or dashboard links

**How to access:**
1. **Context Menu**: Right-click on environment → "Open URL" or link icon (🔗)
2. **Direct Click**: Click link icons where available

**What opens:**
- Deployment dashboards
- Monitoring interfaces
- Documentation pages
- CI/CD pipeline views

## Configuration

### Extension Settings

Access extension settings through multiple methods:

**Method 1: ACME Portal Toolbar**
- Click the gear icon (⚙️) in the ACME Resources toolbar
- This opens VS Code settings filtered to ACME Portal options

**Method 2: VS Code Settings**
- Open VS Code Settings (`Ctrl+,` / `Cmd+,`)
- Search for "acme portal" to find all extension settings

**Method 3: Command Palette**
- Use `Ctrl+Shift+P` → "ACME: Open Settings"

### Available Settings

#### Flows Path Configuration

**Setting**: `acmeportal.flowsPath`
- **Type**: String
- **Default**: `flows`
- **Description**: Directory containing Python flow files (relative to workspace root)

**Examples**:
```json
{
  "acmeportal.flowsPath": "flows"              // Default: flows directory in root
  "acmeportal.flowsPath": "src/flows"          // Flows in src subdirectory
  "acmeportal.flowsPath": "packages/my-flows"  // Custom nested directory
  "acmeportal.flowsPath": "my_flows"           // Custom directory name
}
```

**Important Notes**:
- Path must be relative to workspace root
- Use forward slashes (/) even on Windows
- Directory must exist and contain SDK-compatible flows
- Changes require refreshing the tree view

### Workspace Configuration

#### Multi-Root Workspaces

For multi-root workspaces, configure settings per folder:

```json
{
  "folders": [
    {
      "name": "Project A",
      "path": "./project-a"
    },
    {
      "name": "Project B", 
      "path": "./project-b"
    }
  ],
  "settings": {
    "acmeportal.flowsPath": "src/flows"
  }
}
```

#### Folder-Specific Settings

Configure different flows paths for different projects:

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "Preferences: Open Folder Settings"
3. Add folder-specific ACME Portal settings

## Commands Reference

All ACME Portal commands are available through the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

### Core Commands

| Command | Description | Keyboard Shortcut | Context |
|---------|-------------|-------------------|---------|
| `ACME: Open Settings` | Open extension settings | None | Always available |
| `ACME: Refresh Flows` | Reload the flow list and deployments | None | Always available |
| `ACME: Deploy Flow` | Deploy the selected flow to target environment | None | Deployable flows only |
| `ACME: Promote Flow` | Promote flow to next environment | None | Flows/environments with deployments |
| `ACME: Compare Flow Versions` | Show differences between versions | None | Environments with deployments |

### Context Menu Commands

Available when right-clicking on tree items:

#### Flow Context Menu
- **Open Flow File** (📄): Opens the Python source file
- **Deploy Flow** (☁️): Deploys the flow (if deployable)
- **Promote Flow** (🚀): Promotes to next environment

#### Environment Context Menu  
- **Promote Flow** (🚀): Promotes from this environment
- **Compare Flow Versions** (🔄): Shows version differences
- **Open URL** (🔗): Opens external deployment URL

#### Additional Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `acmeportal.helloWorld` | Test command for debugging | Development only |
| `acmeportal.itemClicked` | Internal tree item handler | Internal use |
| `acmeportal.setFlowsPath` | Set flows directory path | Internal use |
| `acmeportal.openExternalUrl` | Open external deployment URLs | Context menu |

## Progress Notifications

The extension provides real-time progress feedback for all operations:

### Notification Types

#### Loading Operations
- **Flow Discovery**: "Loading ACME Portal data"
- **Deployment Scanning**: "Found X flows, scanning deployments..."
- **Tree Building**: "Building tree view..."

#### Deployment Operations
- **Deployment**: "Deploying flows: [flow-names] on ref: [branch]"
- **Promotion**: "Promoting [flow] from [env1] to [env2]"
- **Comparison**: "Comparing versions for [flow]"

#### Error Notifications
- **Precondition Failures**: Missing dependencies, configuration issues
- **Deployment Errors**: Failed deployments with error details
- **SDK Errors**: Issues communicating with acme-portal-sdk

### Progress Locations

1. **Notification Area**: Toast notifications in bottom-right corner
2. **Status Bar**: Brief status updates during operations
3. **Output Panel**: Detailed logs (select "ACME Portal" from dropdown)
4. **Tree View**: Loading indicators and status icons

## Context Menus and Interactions

### Right-Click Context Menus

Context menus provide quick access to relevant actions based on the selected item:

#### Flow Items
```
📁 Flow Name
├── 📄 Open Flow File
├── ☁️ Deploy Flow (if deployable)
└── 🚀 Promote Flow (if deployed)
```

#### Environment Items
```
🌍 Environment Name
├── 🚀 Promote Flow
├── 🔄 Compare Flow Versions
└── 🔗 Open URL (if available)
```

#### Branch Items
```
🌿 Branch Name
├── 🔄 Compare Flow Versions
└── 🔗 Open URL (if available)
```

### Toolbar Actions

The ACME Resources view toolbar provides global actions:

| Icon | Action | Description |
|------|--------|-------------|
| ⚙️ | Open Settings | Access extension configuration |
| 🔄 | Refresh Flows | Reload all flows and deployments |

### Double-Click Behavior

- **Flows**: Opens the flow source file
- **Environments**: Expands/collapses the environment
- **Branches**: Expands/collapses the branch
- **Details**: No action (leaf nodes)

## SDK Integration Architecture

### How the Extension Communicates with acme-portal-sdk

The ACME Portal extension acts as a bridge between VS Code and the acme-portal-sdk, using a sophisticated integration architecture:

#### Communication Flow

```
VS Code Extension (TypeScript)
    ↓
Python Script Executor
    ↓
SDK Object Runner (Python)
    ↓
acme-portal-sdk Objects
    ↓
External Systems (Git, APIs, etc.)
```

#### Key Components

**1. Python Script Executor**
- Manages Python environment and script execution
- Handles cross-platform compatibility
- Provides error handling and logging

**2. SDK Object Runner** 
- Bridge script that imports and executes SDK objects
- Located at `src/scripts/sdk_object_runner.py`
- Handles JSON serialization of results
- Manages module imports from `.acme_portal_sdk` directory

**3. SDK Objects Used**
- **FlowFinder**: Discovers and catalogs flows in the project
- **DeployWorkflow**: Handles flow deployment operations
- **PromoteWorkflow**: Manages environment promotions
- **Flow Comparison**: Compares flow versions across environments

### Data Flow and Parameters

#### Flow Discovery Process

**Extension → SDK Flow:**
1. Extension calls `FindFlows.scanForFlows()`
2. TypeScript invokes `SdkObjectRunner.runSdkObject()`
3. Python script imports `FlowFinder` from `.acme_portal_sdk/flow_finder`
4. SDK scans project for flows and returns metadata
5. Extension receives JSON with flow details

**Data Returned:**
```typescript
interface FlowDetails {
    name: string;                    // Display name
    original_name: string;           // Name as defined in code
    description: string;             // Flow description
    obj_type: string;                // Object type (function, method)
    obj_name: string;                // Object name
    obj_parent_type: string;         // Container type (class, module)
    obj_parent: string;              // Container name
    id: string;                      // Unique identifier
    module: string;                  // Python module name
    source_path: string;             // Absolute path to source file
    source_relative: string;         // Relative path from project root
    import_path: string;             // Python import path
    grouping: string[];              // Organizational grouping
    child_attributes?: Record<string, any>; // Additional metadata
}
```

#### Deployment Process

**Parameters Passed to SDK:**
```typescript
{
    flows_to_deploy: string[];       // List of flow names
    ref: string;                     // Git branch/tag/commit
    additional_context?: Record<string, any>; // Extra metadata
}
```

**Extension → SDK Flow:**
1. Extension gathers deployment parameters
2. Calls `FlowDeployer.deployFlows()` with parameters
3. SDK executes deployment workflow
4. Returns deployment URL or error information

#### Promotion Process

**Parameters Passed to SDK:**
```typescript
{
    flows_to_promote: string[];      // Flows to promote
    source_environment: string;      // Current environment
    target_environment: string;      // Destination environment
    additional_context?: Record<string, any>; // Extra metadata
}
```

#### Deployment Discovery

**Extension → SDK Flow:**
1. Extension calls `FindDeployments.scanForDeployments()`
2. SDK queries external systems (APIs, databases)
3. Returns current deployment state across environments

**Data Returned:**
```typescript
interface DeploymentDetails {
    flow_name: string;               // Associated flow name
    environment: string;             // Target environment
    branch: string;                  // Git branch
    commit_sha: string;              // Git commit
    deployment_id: string;           // Unique deployment ID
    status: string;                  // Deployment status
    url?: string;                    // External URL
    timestamp: string;               // Deployment time
    metadata?: Record<string, any>;  // Additional details
}
```

### Error Handling and Validation

#### Precondition Checking

Before any SDK operation, the extension validates:

1. **Python Environment**: Correct interpreter selected
2. **SDK Installation**: acme-portal-sdk package available
3. **Project Structure**: `.acme_portal_sdk` directory exists
4. **Git Repository**: Valid Git repo with remote origin
5. **Project Configuration**: SDK properly initialized

#### Error Types and Handling

**Configuration Errors:**
- Missing or incorrect flows path
- Invalid Python interpreter
- Missing SDK installation

**Runtime Errors:**
- Python execution failures
- SDK module import errors
- Network connectivity issues
- Authentication problems

**Data Errors:**
- Invalid flow definitions
- Malformed SDK responses
- Missing required metadata

### Customization and Extension

#### Custom SDK Objects

The architecture supports custom SDK objects:

1. **Add Custom Module**: Place in `.acme_portal_sdk` directory
2. **Implement Required Interface**: Follow SDK patterns
3. **Update Extension**: Modify TypeScript to call new objects

#### Configuration Options

SDK behavior can be customized through:
- **Environment Variables**: Python environment configuration
- **Config Files**: SDK-specific configuration
- **Extension Settings**: VS Code extension preferences

### Security Considerations

#### Data Handling
- **No Credential Storage**: Extension doesn't store sensitive data
- **Temporary Files**: JSON data files cleaned up after use
- **Sandboxed Execution**: Python scripts run in controlled environment

#### Network Access
- **SDK Managed**: All external communication through SDK
- **No Direct API Calls**: Extension doesn't make direct network requests
- **Authentication**: Handled by SDK configuration

### Troubleshooting SDK Integration

#### Common Issues

**Import Errors:**
```
ModuleNotFoundError: No module named 'acme_portal_sdk'
```
**Solution**: Verify Python interpreter and SDK installation

**Permission Errors:**
```
PermissionError: [Errno 13] Permission denied
```
**Solution**: Check file permissions and Python environment

**JSON Parse Errors:**
```
JSONDecodeError: Expecting value
```
**Solution**: Check SDK object return values and error logs

#### Debugging Steps

1. **Check Output Panel**: Select "ACME Portal" for detailed logs
2. **Verify Python Execution**: Test SDK objects manually
3. **Review SDK Configuration**: Check `.acme_portal_sdk` setup
4. **Test Network Connectivity**: Ensure external systems accessible

For more details on SDK setup and configuration, see the [acme-portal-sdk documentation](https://blackwhitehere.github.io/acme-portal-sdk/).

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