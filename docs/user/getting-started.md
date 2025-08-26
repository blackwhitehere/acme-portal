# Getting Started

## Prerequisites

Before using the ACME Portal extension:

1. **VS Code** (version 1.102.0 or later)
2. **Microsoft Python Extension** installed
3. **Git CLI** installed and available in your PATH
4. **acme-portal-sdk** set up in your project

## Installation

### VS Code Marketplace (Recommended)

1. Open VS Code Extensions view (`Ctrl+Shift+X`)
2. Search for "ACME Portal" by blackwhitehere
3. Click "Install" and reload VS Code if prompted

### Manual Installation

1. Download `.vsix` from [GitHub releases](https://github.com/blackwhitehere/acme-portal/releases)
2. Command Palette (`Ctrl+Shift+P`) → "Extensions: Install from VSIX..."
3. Select the downloaded file

## Project Setup

### Configure acme-portal-sdk

Your Python project must be configured with acme-portal-sdk first. Follow the [SDK documentation](https://blackwhitehere.github.io/acme-portal-sdk/user/getting-started/#step-2-project-setup) for complete setup.

See the [acme-prefect sample project](https://github.com/blackwhitehere/acme-prefect/tree/main/.acme_portal_sdk) for a working example.

### Open Your Project

Open a folder containing:
- A Git repository with remote origin
- A `.acme_portal_sdk` directory (created during SDK setup)
- Python flows that are SDK-compatible
- The `acme-portal-sdk` Python package installed

### Configure Python Interpreter

The extension needs access to your Python environment:

1. Command Palette (`Ctrl+Shift+P`) → "Python: Select Interpreter"
2. Choose the environment where acme-portal-sdk is installed
3. For virtual environments, select the interpreter from that environment

### Verify Setup

1. Open ACME Portal sidebar (click ACME icon in Activity Bar)
2. You should see "Flows & Deployments" view with your flows in a tree structure
3. If properly configured, flows will be listed; if not, you'll see a welcome message

## Troubleshooting Setup

### Extension Not Loading
- Ensure VS Code 1.102.0 or later
- Check extension is installed in Extensions view
- Restart VS Code
- Check Output panel (select "ACME Portal") for errors

### Welcome Message Instead of Flows
- Ensure folder contains a Git repository
- Check `.acme_portal_sdk` directory exists
- Verify folder contains SDK-compatible Python flows

### No Flows Visible
- Ensure flows are configured with acme-portal-sdk
- Check Python interpreter points to correct environment
- Review Output panel for errors
- Try refresh button (🔄)

### Python/SDK Issues
- Verify Git CLI is installed and accessible
- Confirm acme-portal-sdk installed in selected Python environment
- Check `.acme_portal_sdk` directory contains required modules
- Review [SDK documentation](https://blackwhitehere.github.io/acme-portal-sdk/) for setup

## First Steps

Once set up:

### Immediate Actions
1. **Browse Flows**: Explore tree structure in Flows & Deployments
2. **Open Flow File**: Click file icon next to any flow
3. **Test Refresh**: Use refresh button to reload flow data

### Try Operations
- **Deploy Flow**: If deployable flows exist, try development deployment
- **Compare Versions**: If deployments exist, try version comparison
- **Promote Flow**: Practice promoting between environments

### Key Features
**Individual Operations**: Deploy/promote single flows, compare versions  
**Group Operations**: Deploy/promote all flows in a group using group paths

## Getting Help

If issues persist:
1. Check Output Panel (select "ACME Portal") for detailed logs
2. Review [SDK documentation](https://blackwhitehere.github.io/acme-portal-sdk/)
3. Check [sample project](https://github.com/blackwhitehere/acme-prefect)
4. Report issues on [GitHub](https://github.com/blackwhitehere/acme-portal/issues)

## Next Steps

Explore the [User Guide](user-guide.md) for comprehensive feature documentation and [API Reference](api-reference.md) for technical details.
