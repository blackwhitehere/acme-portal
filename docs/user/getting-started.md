# Getting Started

## Prerequisites

Before using the ACME Portal extension, ensure you have:

1. **VS Code** (version 1.97.0 or later)
2. **Python Extension** by Microsoft installed
3. **Git CLI** installed and available in your PATH
4. **acme-portal-sdk** set up in your project

## Installation

1. Open VS Code
2. Go to the Extensions view (`Ctrl+Shift+X`)
3. Search for "ACME Portal"
4. Click "Install"

## Initial Setup

### 1. Open Your Project

Open a folder or workspace that contains Python flows using the acme-portal-sdk.

### 2. Configure Python Interpreter

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Run "Python: Select Interpreter"
3. Choose the Python environment where acme-portal-sdk is installed

### 3. Set Flows Path

1. Open VS Code Settings (`Ctrl+,`)
2. Search for "acme portal"
3. Set the "Flows Path" to the directory containing your Python flows (relative to workspace root)
   - Default: `flows`

### 4. Verify Setup

1. Open the ACME Portal sidebar (click the ACME icon in the Activity Bar)
2. You should see your flows listed in the ACME Resources view
3. If no flows appear, check:
   - The flows path is correct
   - Your flows follow the acme-portal-sdk structure
   - Python interpreter is correctly selected

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