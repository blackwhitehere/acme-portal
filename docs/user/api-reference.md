# API Reference

## Overview

The ACME Portal VS Code extension integrates with the acme-portal-sdk to provide flow management capabilities. This document covers the integration points and technical details.

## SDK Integration

### Flow Detection

The extension scans the configured flows directory for Python files that use the acme-portal-sdk. It looks for:

- Python files with proper SDK imports
- Flow configuration files
- Environment-specific configurations

### Flow Structure Requirements

For flows to be recognized by the extension, they should follow this structure:

```
flows/
├── my-flow/
│   ├── flow.py          # Main flow file
│   ├── config.yaml      # Flow configuration
│   └── environments/    # Environment configs
│       ├── dev.yaml
│       ├── staging.yaml
│       └── prod.yaml
└── another-flow/
    ├── flow.py
    └── config.yaml
```

### SDK Methods Used

The extension relies on these acme-portal-sdk capabilities:

#### Flow Discovery
```python
# SDK methods for finding flows
sdk.discover_flows(directory)
sdk.get_flow_info(flow_path)
```

#### Environment Management
```python
# Environment operations
sdk.get_environments(flow)
sdk.promote_flow(flow, from_env, to_env)
sdk.deploy_flow(flow, environment)
```

#### Version Control
```python
# Version comparison
sdk.compare_versions(flow, env1, env2)
sdk.get_flow_status(flow, environment)
```

## Extension API

### Commands

The extension exposes these commands that can be called programmatically:

#### acmeportal.helloWorld
Basic test command for extension functionality.

#### acmeportal.setFlowsPath
Programmatically set the flows directory path.

**Parameters:**
- `path` (string): Relative path to flows directory

#### acmeportal.refreshFlows
Reload the flow list from the file system.

#### acmeportal.deployFlow
Deploy a specific flow to an environment.

**Parameters:**
- `flowId` (string): Identifier of the flow
- `environment` (string): Target environment name

#### acmeportal.promoteEnvironment
Promote a flow between environments.

**Parameters:**
- `flowId` (string): Identifier of the flow
- `sourceEnv` (string): Source environment
- `targetEnv` (string): Target environment

### Configuration

#### Extension Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `acmeportal.flowsPath` | string | `"flows"` | Path to directory containing flows |

#### Accessing Settings Programmatically

```typescript
import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration('acmeportal');
const flowsPath = config.get<string>('flowsPath');
```

### Events

The extension emits events that other extensions can subscribe to:

#### onFlowsRefreshed
Fired when the flows list is refreshed.

#### onFlowDeployed
Fired when a flow deployment completes.

**Event Data:**
- `flowId`: Identifier of the deployed flow
- `environment`: Target environment
- `success`: Boolean indicating success/failure

#### onFlowPromoted
Fired when a flow is promoted between environments.

**Event Data:**
- `flowId`: Identifier of the promoted flow
- `sourceEnv`: Source environment
- `targetEnv`: Target environment
- `success`: Boolean indicating success/failure

## Data Models

### Flow Object

```typescript
interface Flow {
  id: string;
  name: string;
  path: string;
  environments: Environment[];
  status: FlowStatus;
}
```

### Environment Object

```typescript
interface Environment {
  name: string;
  status: EnvironmentStatus;
  version: string;
  url?: string;
  deployedAt?: Date;
}
```

### Status Enums

```typescript
enum FlowStatus {
  Ready = 'ready',
  Deploying = 'deploying',
  Error = 'error',
  Unknown = 'unknown'
}

enum EnvironmentStatus {
  Deployed = 'deployed',
  Pending = 'pending',
  Failed = 'failed',
  NotDeployed = 'not-deployed'
}
```

## Tree View Integration

### Custom Tree Data Provider

The extension implements VS Code's TreeDataProvider interface:

```typescript
export class FlowTreeProvider implements vscode.TreeDataProvider<FlowItem> {
  getTreeItem(element: FlowItem): vscode.TreeItem;
  getChildren(element?: FlowItem): Thenable<FlowItem[]>;
  refresh(): void;
}
```

### Tree Item Types

- **FlowItem**: Represents a flow in the tree
- **EnvironmentItem**: Represents an environment under a flow
- **ActionItem**: Represents available actions for flows/environments

## Error Handling

### Common Error Scenarios

1. **SDK Not Found**: When acme-portal-sdk is not installed
2. **Invalid Flow Structure**: When flows don't follow expected structure
3. **Permission Issues**: When file system access is restricted
4. **Network Errors**: When deployment operations fail

### Error Reporting

Errors are reported through:
- VS Code's notification system
- Output panel (ACME Portal channel)
- Extension host console (for debugging)

## Development Integration

### Testing

The extension supports testing through VS Code's test framework:

```bash
npm run test
```

Tests cover:
- Flow discovery functionality
- Command execution
- Tree view operations
- Error handling scenarios

### Debugging

For debugging the extension:

1. Open the extension in VS Code
2. Press F5 to launch Extension Development Host
3. Set breakpoints in the source code
4. Use the Debug Console for inspection

### Building

The extension uses webpack for bundling:

```bash
npm run package      # Production build
npm run compile-web  # Development build
```

## Migration and Compatibility

### SDK Version Compatibility

| Extension Version | SDK Version | Notes |
|------------------|-------------|--------|
| 0.0.1+ | 1.0.0+ | Initial compatibility |

### Breaking Changes

When upgrading SDK versions, check for:
- API method signature changes
- Configuration format updates
- New requirements or dependencies

## Performance Considerations

### Flow Discovery
- Flows are cached after initial discovery
- Use refresh command to update cache
- Large flow directories may impact startup time

### Memory Usage
- Extension maintains minimal memory footprint
- Tree view items are created on demand
- Flow data is garbage collected when not needed

### Network Operations
- Deployment operations are asynchronous
- Progress is reported through VS Code's progress API
- Operations can be cancelled by users

For more information about the acme-portal-sdk itself, visit the [official SDK documentation](https://blackwhitehere.github.io/acme-portal-sdk/).