# API Reference

## Overview

This document provides technical details about the ACME Portal extension's integration with the acme-portal-sdk, including data structures, SDK object interfaces, and extension APIs.

## SDK Integration

### Core SDK Objects

The extension communicates with the following SDK objects located in the `.acme_portal_sdk` directory:

#### FlowFinder

**Module**: `flow_finder`
**Class**: `FlowFinder`
**Purpose**: Discovers and catalogs flows in the project

**Interface**:
```python
class FlowFinder:
    def __call__(self) -> Dict[str, FlowDetails]:
        """
        Scan project for flows and return flow details.
        
        Returns:
            Dictionary mapping flow IDs to FlowDetails objects
        """
```

**Return Data Structure**:
```typescript
interface FlowDetails {
    name: string;                    // Display name for the flow
    original_name: string;           // Original name as defined in code
    description: string;             // Flow description/documentation
    id: string;                      // Unique identifier for the flow
    source_path: string;             // Absolute path to source file
    source_relative: string;         // Relative path from project root
    grouping: string[];              // Hierarchical grouping for display
    child_attributes?: Record<string, any>; // Extended attributes from subclasses
    
    // Legacy fields (optional, may be in child_attributes)
    obj_type?: string;               // Type of object ('function', 'method', etc.)
    obj_name?: string;               // Name of the object defining the flow
    obj_parent_type?: string;        // Type of parent container ('class', 'module')
    obj_parent?: string;             // Name of parent container
    module?: string;                 // Python module name
    import_path?: string;            // Python import path
}
}
```

**API Changes Note**: As of acme-portal-sdk v1.0.0, implementation-specific fields (`obj_type`, `obj_name`, `obj_parent_type`, `obj_parent`, `module`, `import_path`) are optional in the base interface and may be found in the `child_attributes` dictionary for better flexibility across different workflow implementations.
```

#### DeployWorkflow

**Module**: `flow_deploy`
**Class**: `DeployWorkflow`
**Purpose**: Handles deployment of flows to target environments

**Interface**:
```python
class DeployWorkflow:
    def __call__(self, **kwargs) -> str | None:
        """
        Deploy flows to target environment.
        
        Args:
            flows_to_deploy (List[str]): List of flow names to deploy
            ref (str): Git reference (branch/tag/commit)
            additional_context (Dict, optional): Extra deployment context
            
        Returns:
            Deployment URL if successful, None if failed
        """
```

**Parameters**:
```typescript
interface DeploymentParameters {
    flows_to_deploy: string[];       // Array of flow names
    ref: string;                     // Git branch, tag, or commit SHA
    additional_context?: Record<string, any>; // Optional extra context
}
```

#### PromoteWorkflow

**Module**: `flow_promote`
**Class**: `PromoteWorkflow`  
**Purpose**: Promotes flows between environments

**Interface**:
```python
class PromoteWorkflow:
    def __call__(self, **kwargs) -> str | None:
        """
        Promote flows from source to target environment.
        
        Args:
            flows_to_promote (List[str]): Flows to promote
            source_environment (str): Current environment
            target_environment (str): Destination environment
            additional_context (Dict, optional): Extra promotion context
            
        Returns:
            Promotion URL if successful, None if failed
        """
```

**Parameters**:
```typescript
interface PromotionParameters {
    flows_to_promote: string[];      // Array of flow names
    source_environment: string;      // Source environment name
    target_environment: string;      // Target environment name
    additional_context?: Record<string, any>; // Optional extra context
}
```

#### DeploymentFinder

**Module**: `deployment_finder`
**Class**: `DeploymentFinder`
**Purpose**: Discovers existing deployments across environments

**Interface**:
```python
class DeploymentFinder:
    def __call__(self) -> Dict[str, DeploymentDetails]:
        """
        Scan for existing deployments across all environments.
        
        Returns:
            Dictionary mapping deployment IDs to DeploymentDetails
        """
```

**Return Data Structure**:
```typescript
interface DeploymentDetails {
    flow_name: string;               // Name of the deployed flow
    environment: string;             // Target environment
    branch: string;                  // Git branch
    commit_sha: string;              // Git commit SHA
    deployment_id: string;           // Unique deployment identifier
    status: string;                  // Deployment status
    url?: string;                    // External deployment URL
    timestamp: string;               // Deployment timestamp (ISO format)
    metadata?: Record<string, any>;  // Additional deployment metadata
}
```

### SDK Object Runner

**Location**: `src/scripts/sdk_object_runner.py`
**Purpose**: Bridge between VS Code extension and SDK objects

**Usage**:
```python
python sdk_object_runner.py <module_name> <class_name> <output_file> [kwargs_json]
```

**Parameters**:
- `module_name`: SDK module name (e.g., 'flow_finder')
- `class_name`: Class name within module (e.g., 'FlowFinder')
- `output_file`: Path for JSON output file
- `kwargs_json`: Optional JSON string with keyword arguments

**Process**:
1. Imports specified module from `.acme_portal_sdk` directory
2. Creates instance of specified class
3. Calls the instance with provided kwargs
4. Serializes result to JSON and writes to output file

## Extension API

### Commands

All extension commands are registered in `package.json` and implemented in TypeScript:

#### Core Commands

**acmeportal.refreshFlows**
```typescript
command: 'acmeportal.refreshFlows'
title: 'Refresh Flows'
implementation: FlowCommands.refreshFlows()
```
Reloads the flow tree by calling FlowFinder and DeploymentFinder.

**acmeportal.openFlowFile**
```typescript
command: 'acmeportal.openFlowFile'
title: 'Open Flow File'
implementation: FlowCommands.openFlowFile(item: TreeItem)
```
Opens the source file for the specified flow in VS Code editor.

**acmeportal.deployFlow**
```typescript
command: 'acmeportal.deployFlow'
title: 'Deploy Flow'
implementation: DeploymentCommands.deployFlow(item: TreeItem)
```
Deploys the specified flow using DeployWorkflow SDK object.

**acmeportal.promoteEnvironment**
```typescript
command: 'acmeportal.promoteEnvironment'
title: 'Promote Flow'
implementation: PromotionCommands.promoteFlow(item: TreeItem)
```
Promotes flow between environments using PromoteWorkflow SDK object.

**acmeportal.compareFlowVersions**
```typescript
command: 'acmeportal.compareFlowVersions'
title: 'Compare Flow Versions'
implementation: ComparisonCommands.compareVersions(item: TreeItem)
```
Compares flow versions across environments or branches.

**acmeportal.openSettings**
```typescript
command: 'acmeportal.openSettings'
title: 'ACME: Open Settings'
implementation: SettingsCommands.openSettings()
```
Opens VS Code settings filtered to ACME Portal extension.

**acmeportal.searchFlows**
```typescript
command: 'acmeportal.searchFlows'
title: 'ACME: Search Flows & Deployments'
implementation: SearchCommands.searchFlows()
```
Opens search input dialog for filtering flows and deployments by various criteria.

**acmeportal.clearSearch**
```typescript
command: 'acmeportal.clearSearch'
title: 'ACME: Clear Search'
implementation: SearchCommands.clearSearch()
```
Clears current search filter and shows all flows and deployments.

**acmeportal.showSearchHelp**
```typescript
command: 'acmeportal.showSearchHelp'
title: 'ACME: Search Help'
implementation: SearchCommands.showSearchHelp()
```
Displays help information about search syntax and available fields.

#### Utility Commands

**acmeportal.openExternalUrl**
```typescript
command: 'acmeportal.openExternalUrl'
title: 'Open URL'
implementation: TreeViewCommands.openExternalUrl(item: TreeItem)
```
Opens external URLs associated with deployments.

### Configuration

#### Extension Settings

All configuration is now handled automatically by the acme-portal-sdk. No manual settings are required for flow discovery.

### Tree Data Provider

#### FlowTreeDataProvider

**Location**: `src/treeView/treeDataProvider.ts`
**Purpose**: Implements VS Code TreeDataProvider interface for ACME Portal tree

**Key Methods**:

```typescript
class FlowTreeDataProvider implements vscode.TreeDataProvider<BaseTreeItem> {
    // Refresh the tree data
    refresh(): void
    
    // Load flows and deployments from SDK
    loadFlows(): Promise<void>
    
    // Get tree item for display
    getTreeItem(element: BaseTreeItem): vscode.TreeItem
    
    // Get children for tree hierarchy
    getChildren(element?: BaseTreeItem): Promise<BaseTreeItem[]>
}
```

#### Tree Item Types

**BaseTreeItem**
```typescript
abstract class BaseTreeItem extends vscode.TreeItem {
    abstract contextValue: string;
    abstract getChildren(): Promise<BaseTreeItem[]>;
}
```

**FlowTreeItem**
```typescript
class FlowTreeItem extends BaseTreeItem {
    contextValue = 'flow';
    flowData: FlowDetails;
    // Represents a flow in the tree
}
```

**EnvironmentTreeItem**
```typescript
class EnvironmentTreeItem extends BaseTreeItem {
    contextValue = 'environment';
    environmentName: string;
    flowData: FlowDetails;
    deployments: DeploymentDetails[];
    // Represents an environment under a flow
}
```

**BranchTreeItem**
```typescript
class BranchTreeItem extends BaseTreeItem {
    contextValue = 'branch';
    branchName: string;
    deployment: DeploymentDetails;
    // Represents a branch under an environment
}
```

### Services and Utilities

#### CommandExecutor

**Location**: `src/utils/commandExecutor.ts`
**Purpose**: Executes system commands with proper error handling

```typescript
class CommandExecutor {
    async executeCommand(command: string, args: string[], cwd?: string): Promise<string>
}
```

#### GitService

**Location**: `src/utils/gitService.ts`
**Purpose**: Git operations for the extension

```typescript
class GitService {
    async getCurrentBranch(): Promise<string>
    async getCurrentCommit(): Promise<string>
    async getRemoteUrl(): Promise<string>
}
```

#### PythonScriptExecutor

**Location**: `src/utils/pythonScriptExecutor.ts`
**Purpose**: Executes Python scripts with proper environment handling

```typescript
class PythonScriptExecutor {
    async executeScript(scriptPath: string, ...args: string[]): Promise<string>
    static async getScriptPath(scriptName: string): Promise<string | null>
}
```

#### PreConditionChecker

**Location**: `src/utils/preConditionChecker.ts`
**Purpose**: Validates extension prerequisites

```typescript
class PreConditionChecker {
    async checkAllPreconditions(): Promise<PreConditionResults>
    static displayResults(results: PreConditionResults): void
}
```

## Error Handling

### Error Types

**ConfigurationError**
- Missing Python interpreter
- Incorrect VS Code settings

**SDKError**
- SDK module import failures
- SDK object execution errors
- Invalid SDK responses

**SystemError**
- Python execution failures
- Git command failures
- File system access errors

**NetworkError**
- External API failures
- Deployment service unavailable
- Authentication errors

### Error Reporting

Errors are reported through multiple channels:

1. **VS Code Notifications**: User-facing error messages
2. **Output Panel**: Detailed error logs and stack traces
3. **Console Logs**: Debug information for development
4. **Status Bar**: Brief error indicators

## Development and Extension

### Adding New SDK Objects

1. **Create SDK Module**: Add to `.acme_portal_sdk` directory
2. **Implement Interface**: Follow callable object pattern
3. **Add TypeScript Interface**: Define parameter and return types
4. **Create Action Class**: Wrapper for SDK object calls
5. **Add Commands**: Register VS Code commands
6. **Update Tree Provider**: Handle new data types

### Custom Tree Items

```typescript
class CustomTreeItem extends BaseTreeItem {
    contextValue = 'custom';
    
    constructor(label: string, customData: any) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.customData = customData;
    }
    
    async getChildren(): Promise<BaseTreeItem[]> {
        return [];
    }
}
```

### Extending Commands

```typescript
class CustomCommands {
    constructor(private treeDataProvider: FlowTreeDataProvider) {}
    
    async customAction(item: TreeItem): Promise<void> {
        // Custom implementation
        await SdkObjectRunner.runSdkObject('custom_module', 'CustomClass', {
            parameter: item.customData
        });
        
        // Refresh tree
        this.treeDataProvider.refresh();
    }
}
```

## References

- [VS Code Extension API](https://code.visualstudio.com/api)
- [acme-portal-sdk Documentation](https://blackwhitehere.github.io/acme-portal-sdk/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Python JSON Module](https://docs.python.org/3/library/json.html)