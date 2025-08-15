[**acmeportal**](../../../../README.md)

***

[acmeportal](../../../../README.md) / [treeView/items/EnvironmentTreeItem](../README.md) / EnvironmentTreeItem

# Class: EnvironmentTreeItem

Defined in: [treeView/items/EnvironmentTreeItem.ts:9](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/EnvironmentTreeItem.ts#L9)

Tree item representing an environment with a deployed flow

## Extends

- [`BaseTreeItem`](../../BaseTreeItem/classes/BaseTreeItem.md)

## Constructors

### Constructor

> **new EnvironmentTreeItem**(`environmentName`, `flowData`, `deploymentData`, `parentId`): `EnvironmentTreeItem`

Defined in: [treeView/items/EnvironmentTreeItem.ts:10](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/EnvironmentTreeItem.ts#L10)

#### Parameters

##### environmentName

`string`

##### flowData

[`FlowDetails`](../../../../actions/findFlows/interfaces/FlowDetails.md)

##### deploymentData

[`DeploymentDetails`](../../../../actions/findDeployments/interfaces/DeploymentDetails.md)

##### parentId

`string`

#### Returns

`EnvironmentTreeItem`

#### Overrides

[`BaseTreeItem`](../../BaseTreeItem/classes/BaseTreeItem.md).[`constructor`](../../BaseTreeItem/classes/BaseTreeItem.md#constructor)

## Properties

### label

> `readonly` **label**: `string`

Defined in: [treeView/items/BaseTreeItem.ts:8](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/BaseTreeItem.ts#L8)

#### Inherited from

[`BaseTreeItem`](../../BaseTreeItem/classes/BaseTreeItem.md).[`label`](../../BaseTreeItem/classes/BaseTreeItem.md#label)

***

### collapsibleState

> `readonly` **collapsibleState**: `TreeItemCollapsibleState`

Defined in: [treeView/items/BaseTreeItem.ts:9](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/BaseTreeItem.ts#L9)

#### Inherited from

[`BaseTreeItem`](../../BaseTreeItem/classes/BaseTreeItem.md).[`collapsibleState`](../../BaseTreeItem/classes/BaseTreeItem.md#collapsiblestate)

***

### parentId?

> `readonly` `optional` **parentId**: `string`

Defined in: [treeView/items/BaseTreeItem.ts:10](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/BaseTreeItem.ts#L10)

#### Inherited from

[`BaseTreeItem`](../../BaseTreeItem/classes/BaseTreeItem.md).[`parentId`](../../BaseTreeItem/classes/BaseTreeItem.md#parentid)

***

### environmentName

> `readonly` **environmentName**: `string`

Defined in: [treeView/items/EnvironmentTreeItem.ts:11](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/EnvironmentTreeItem.ts#L11)

***

### flowData

> `readonly` **flowData**: [`FlowDetails`](../../../../actions/findFlows/interfaces/FlowDetails.md)

Defined in: [treeView/items/EnvironmentTreeItem.ts:12](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/EnvironmentTreeItem.ts#L12)

***

### deploymentData

> `readonly` **deploymentData**: [`DeploymentDetails`](../../../../actions/findDeployments/interfaces/DeploymentDetails.md)

Defined in: [treeView/items/EnvironmentTreeItem.ts:13](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/EnvironmentTreeItem.ts#L13)

## Methods

### getEnvironmentName()

> **getEnvironmentName**(): `string`

Defined in: [treeView/items/EnvironmentTreeItem.ts:29](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/EnvironmentTreeItem.ts#L29)

Get the environment name without the prefix

#### Returns

`string`
