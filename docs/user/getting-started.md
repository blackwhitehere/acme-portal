# Getting Started

## Prerequisites

Before using the ACME Portal extension, ensure you have:

1. **VS Code** (version 1.102.0 or later)
2. **Microsoft Python Extension** installed
3. **Git CLI** installed and available in your PATH
4. **acme-portal-sdk** set up in your project

## Installation

### Option 1: VS Code Marketplace (Recommended)

1. Open VS Code
2. Go to the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "ACME Portal" by blackwhitehere
4. Click "Install" on the ACME Portal extension
5. Reload VS Code if prompted

### Option 2: Manual Installation

1. Download the `.vsix` file from the [GitHub releases page](https://github.com/blackwhitehere/acme-portal/releases)
2. Open VS Code
3. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
4. Run "Extensions: Install from VSIX..."
5. Select the downloaded `.vsix` file

### Option 3: Development Installation

For development or preview versions:

1. Clone the repository: `git clone https://github.com/blackwhitehere/acme-portal.git`
2. Open the project in VS Code
3. Run `npm install` to install dependencies
4. Press `F5` to run the extension in a new Extension Development Host window

## Project Setup

### Setting Up acme-portal-sdk

Before using the extension, your Python project must be configured with the acme-portal-sdk. Follow the comprehensive setup guide in the [acme-portal-sdk documentation](https://blackwhitehere.github.io/acme-portal-sdk/).

**Quick Setup Summary:**

1. **Install the SDK**: `pip install acme-portal-sdk` 
2. **Initialize SDK in your project**: Run the SDK initialization command in your project root
3. **Configure your flows**: Set up your Python flows to work with the SDK
4. **Verify setup**: Ensure the `.acme_portal_sdk` directory exists in your project root

For a complete working example, see the [acme-prefect sample project](https://github.com/blackwhitehere/acme-prefect).

## Initial Configuration

### 1. Open Your Project

Open a folder or workspace that contains Python flows configured with the acme-portal-sdk.

**Requirements for the project:**
- Must be a Git repository with a remote origin
- Must contain a `.acme_portal_sdk` directory (created during SDK setup)
- Must have Python flows that are SDK-compatible
- Must have the acme-portal-sdk Python package installed

### 2. Configure Python Interpreter

The extension needs to access your Python environment where acme-portal-sdk is installed:

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run "Python: Select Interpreter"
3. Choose the Python environment where acme-portal-sdk is installed
   - If using a virtual environment, make sure to select the interpreter from that environment
   - The path should show something like `/path/to/venv/bin/python` or similar

### 3. Configure Flows Directory

Tell the extension where to find your Python flows:

1. Open VS Code Settings (`Ctrl+,` / `Cmd+,`)
2. Search for "acme portal"
3. Find "Acmeportal: Flows Path" setting
4. Set the path to your flows directory (relative to workspace root)
   - **Default**: `flows`
   - **Examples**: 
     - `src/flows` - flows in a src subdirectory
     - `my_flows` - custom flows directory name
     - `packages/flows` - flows in a packages subdirectory

### 4. Verify Extension Activation

1. Open the ACME Portal sidebar:
   - Click the ACME icon in the Activity Bar (left sidebar)
   - Or use `View > Open View... > ACME Resources`

2. Check for the extension activation:
   - You should see "ACME Resources" view in the sidebar
   - The extension will show a welcome message if the workspace is not properly configured
   - If properly configured, you should see your flows listed in a tree structure

### 5. First-Time Setup Verification

After setup, verify everything is working:

1. **Check ACME Resources View**: Should display your flows in a tree structure
2. **Test Refresh**: Click the refresh button (🔄) in the ACME Resources toolbar
3. **Try Opening a Flow**: Click the file icon (📄) next to a flow to open its source file
4. **Check Output Panel**: Look for "ACME Portal" in the Output panel for any error messages

## Troubleshooting Initial Setup

### Extension Not Loading

**Symptoms**: ACME Portal icon doesn't appear in Activity Bar, or views don't load

**Solutions**:
- Ensure VS Code version is 1.102.0 or later
- Check that the extension is properly installed in the Extensions view
- Restart VS Code
- Check the Output panel (select "ACME Portal") for error messages

### Welcome Message Shows Instead of Flows

**Symptoms**: Seeing "In order to use extension features, you need to open a folder..." message

**Solutions**:
- Ensure you've opened a folder/workspace containing a Git repository
- Check that the opened folder has a `.acme_portal_sdk` directory
- Verify the folder contains Python flows configured for the SDK

### No Flows Visible

**Symptoms**: ACME Resources view is empty or shows "No flows found"

**Solutions**:
- Verify the flows path in extension settings matches your project structure
- Ensure your flows are properly configured with acme-portal-sdk
- Check that Python interpreter points to environment with acme-portal-sdk installed
- Look for errors in Output panel (select "ACME Portal")
- Try refreshing with the refresh button (🔄)

### Python/SDK Issues

**Symptoms**: Errors related to Python execution or SDK modules

**Solutions**:
- Ensure Git CLI is installed and accessible from command line
- Verify Python interpreter selection points to correct environment
- Confirm acme-portal-sdk is installed in the selected Python environment
- Check that `.acme_portal_sdk` directory exists and contains required modules
- Review [acme-portal-sdk documentation](https://blackwhitehere.github.io/acme-portal-sdk/) for proper setup

### Permission or Path Issues

**Symptoms**: File access errors or path-related problems

**Solutions**:
- Ensure VS Code has proper permissions to access your project directory
- Check that flows path in settings uses forward slashes (even on Windows)
- Verify the flows path is relative to workspace root, not absolute
- Make sure the flows directory actually exists in your project

## Getting Help

If you continue to have issues:

1. **Check the Output Panel**: Select "ACME Portal" from the dropdown for detailed logs
2. **Review SDK Documentation**: Visit [acme-portal-sdk docs](https://blackwhitehere.github.io/acme-portal-sdk/)
3. **Check Sample Project**: Review the [acme-prefect example](https://github.com/blackwhitehere/acme-prefect)
4. **Report Issues**: Create an issue on the [GitHub repository](https://github.com/blackwhitehere/acme-portal/issues)

## First Steps

Once set up, you can:

- **Browse Flows**: View all flows in your project
- **Open Flow Files**: Click the file icon next to any flow
- **Deploy Flows**: Use the deploy button for flows ready for deployment
- **Promote Environments**: Move flows between environments
- **Compare Versions**: See differences between flow versions

## Troubleshooting

### Extension Not Loading

- Ensure VS Code version is 1.97.0 or later
- Check that the Python extension is installed and active
- Restart VS Code

### No Flows Visible

- Verify the flows path in settings
- Ensure your project uses acme-portal-sdk
- Check that Python interpreter is selected
- Look for errors in the Output panel (select "ACME Portal" from the dropdown)

### Deployment Issues

- Ensure Git CLI is installed and accessible
- Check that your flows follow the required structure
- Verify SDK configuration

For more help, visit our [GitHub repository](https://github.com/blackwhitehere/acme-portal) or check the [acme-portal-sdk documentation](https://blackwhitehere.github.io/acme-portal-sdk/).

## Extension Walkthrough

The ACME Portal extension includes a built-in walkthrough to help you get started:

1. **Access the Walkthrough**:
   - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Search for "Getting Started with ACME Portal"
   - Or open the Welcome tab and look for ACME Portal walkthrough

2. **Walkthrough Steps**:
   - Install Microsoft Python Extension
   - Select Python Interpreter
   - Set up acme-portal-sdk (with link to detailed documentation)
   - Install Git CLI

3. **Interactive Guidance**:
   - Each step provides specific instructions
   - Links to relevant commands and documentation
   - Completion tracking for setup verification

## Next Steps

Once your setup is complete, explore these features:

### Immediate Actions
1. **Browse Your Flows**: Explore the tree structure in ACME Resources
2. **Open a Flow File**: Click the file icon next to any flow
3. **Check Settings**: Review and adjust extension configuration
4. **Test Refresh**: Use the refresh button to reload flow data

### Learn the Interface
1. **Tree Navigation**: Practice expanding and collapsing flow groups
2. **Context Menus**: Right-click on different items to see available actions
3. **Toolbar Actions**: Familiarize yourself with global actions
4. **Output Panel**: Check the "ACME Portal" output for detailed logs

### Try Operations
1. **Deploy a Flow**: If you have deployable flows, try a development deployment
2. **Compare Versions**: If you have existing deployments, try version comparison
3. **Promote a Flow**: Practice promoting between environments

### Advanced Setup
1. **Multi-Root Workspaces**: Configure settings for multiple projects
2. **Custom Keyboard Shortcuts**: Set up shortcuts for frequent operations
3. **VS Code Tasks**: Create tasks for automated workflows
4. **Integration**: Connect with other VS Code extensions and tools

## Common Post-Setup Tasks

### Workspace Configuration

**Setting up Multiple Projects**:
```json
// .vscode/settings.json for project-specific configuration
{
  "acmeportal.flowsPath": "src/data_flows",
  "python.defaultInterpreterPath": "./venv/bin/python"
}
```

**Multi-Root Workspace Example**:
```json
// workspace.code-workspace
{
  "folders": [
    {"name": "Project A", "path": "./project-a"},
    {"name": "Project B", "path": "./project-b"}
  ],
  "settings": {
    "acmeportal.flowsPath": "flows"
  }
}
```

### Integration with Development Workflow

**Git Configuration**:
- Ensure remote origin is configured
- Set up branch protection rules if needed
- Configure commit hooks for validation

**Python Environment**:
- Activate virtual environment if using one
- Verify all required packages are installed
- Test SDK functionality outside VS Code

**CI/CD Integration**:
- Ensure deployment pipelines are configured
- Verify environment access permissions
- Test external system connectivity

For comprehensive feature documentation, see the [User Guide](user-guide.md).  
For technical details, see the [API Reference](api-reference.md).