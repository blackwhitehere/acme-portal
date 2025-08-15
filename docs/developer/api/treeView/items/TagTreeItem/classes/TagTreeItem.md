[**acmeportal**](../../../../README.md)

***

[acmeportal](../../../../README.md) / [treeView/items/TagTreeItem](../README.md) / TagTreeItem

# Class: TagTreeItem

Defined in: [treeView/items/TagTreeItem.ts:9](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/TagTreeItem.ts#L9)

Tree item representing an individual tag

## Extends

- [`BaseTreeItem`](../../BaseTreeItem/classes/BaseTreeItem.md)

## Constructors

### Constructor

> **new TagTreeItem**(`tag`, `flowData`, `deploymentData`, `parentId`): `TagTreeItem`

Defined in: [treeView/items/TagTreeItem.ts:10](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/TagTreeItem.ts#L10)

#### Parameters

##### tag

`string`

##### flowData

[`FlowDetails`](../../../../actions/findFlows/interfaces/FlowDetails.md)

##### deploymentData

[`DeploymentDetails`](../../../../actions/findDeployments/interfaces/DeploymentDetails.md)

##### parentId

`string`

#### Returns

`TagTreeItem`

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

### tag

> `readonly` **tag**: `string`

Defined in: [treeView/items/TagTreeItem.ts:11](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/TagTreeItem.ts#L11)

***

### flowData

> `readonly` **flowData**: [`FlowDetails`](../../../../actions/findFlows/interfaces/FlowDetails.md)

Defined in: [treeView/items/TagTreeItem.ts:12](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/TagTreeItem.ts#L12)

***

### deploymentData

> `readonly` **deploymentData**: [`DeploymentDetails`](../../../../actions/findDeployments/interfaces/DeploymentDetails.md)

Defined in: [treeView/items/TagTreeItem.ts:13](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/TagTreeItem.ts#L13)
