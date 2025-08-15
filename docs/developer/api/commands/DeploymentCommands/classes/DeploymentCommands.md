[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [commands/DeploymentCommands](../README.md) / DeploymentCommands

# Class: DeploymentCommands

Defined in: [commands/DeploymentCommands.ts:10](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/DeploymentCommands.ts#L10)

## Constructors

### Constructor

> **new DeploymentCommands**(`gitService`): `DeploymentCommands`

Defined in: [commands/DeploymentCommands.ts:11](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/DeploymentCommands.ts#L11)

#### Parameters

##### gitService

[`GitService`](../../../utils/gitService/classes/GitService.md)

#### Returns

`DeploymentCommands`

## Methods

### deployFlow()

> **deployFlow**(`item`): `Promise`\<`void`\>

Defined in: [commands/DeploymentCommands.ts:19](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/DeploymentCommands.ts#L19)

Deploy a flow to an environment

#### Parameters

##### item

`any`

The tree item representing the flow or null to select a flow

#### Returns

`Promise`\<`void`\>

***

### deployFlowGroup()

> **deployFlowGroup**(): `Promise`\<`void`\>

Defined in: [commands/DeploymentCommands.ts:172](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/DeploymentCommands.ts#L172)

Deploy all flows in a specified group

#### Returns

`Promise`\<`void`\>

***

### deployFlowGroupFromContext()

> **deployFlowGroupFromContext**(`item`): `Promise`\<`void`\>

Defined in: [commands/DeploymentCommands.ts:328](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/DeploymentCommands.ts#L328)

Deploy flows in a group from a tree view context (right-click on group)

#### Parameters

##### item

[`GroupTreeItem`](../../../treeView/items/GroupTreeItem/classes/GroupTreeItem.md)

The GroupTreeItem representing the group

#### Returns

`Promise`\<`void`\>
