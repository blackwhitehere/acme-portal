[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [commands/ComparisonCommands](../README.md) / ComparisonCommands

# Class: ComparisonCommands

Defined in: [commands/ComparisonCommands.ts:22](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/ComparisonCommands.ts#L22)

## Constructors

### Constructor

> **new ComparisonCommands**(`gitService`, `workspaceService`, `treeDataProvider`): `ComparisonCommands`

Defined in: [commands/ComparisonCommands.ts:23](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/ComparisonCommands.ts#L23)

#### Parameters

##### gitService

[`GitService`](../../../utils/gitService/classes/GitService.md)

##### workspaceService

[`WorkspaceService`](../../../utils/workspaceService/classes/WorkspaceService.md)

##### treeDataProvider

[`FlowTreeDataProvider`](../../../treeView/treeDataProvider/classes/FlowTreeDataProvider.md)

#### Returns

`ComparisonCommands`

## Methods

### compareFlowVersions()

> **compareFlowVersions**(`item`): `Promise`\<`void`\>

Defined in: [commands/ComparisonCommands.ts:70](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/ComparisonCommands.ts#L70)

Compare flow versions between deployments

#### Parameters

##### item

`any`

The tree item representing the environment to compare

#### Returns

`Promise`\<`void`\>
