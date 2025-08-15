[**acmeportal**](../../../../README.md)

***

[acmeportal](../../../../README.md) / [treeView/items/DetailTreeItem](../README.md) / DetailTreeItem

# Class: DetailTreeItem

Defined in: [treeView/items/DetailTreeItem.ts:9](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/DetailTreeItem.ts#L9)

Tree item representing a detail or property of a flow or deployment

## Extends

- [`BaseTreeItem`](../../BaseTreeItem/classes/BaseTreeItem.md)

## Constructors

### Constructor

> **new DetailTreeItem**(`label`, `flowData?`, `deploymentData?`, `parentId?`): `DetailTreeItem`

Defined in: [treeView/items/DetailTreeItem.ts:10](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/DetailTreeItem.ts#L10)

#### Parameters

##### label

`string`

##### flowData?

[`FlowDetails`](../../../../actions/findFlows/interfaces/FlowDetails.md)

##### deploymentData?

[`DeploymentDetails`](../../../../actions/findDeployments/interfaces/DeploymentDetails.md)

##### parentId?

`string`

#### Returns

`DetailTreeItem`

#### Overrides

[`BaseTreeItem`](../../BaseTreeItem/classes/BaseTreeItem.md).[`constructor`](../../BaseTreeItem/classes/BaseTreeItem.md#constructor)

## Properties

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

### label

> `readonly` **label**: `string`

Defined in: [treeView/items/DetailTreeItem.ts:11](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/DetailTreeItem.ts#L11)

#### Inherited from

[`BaseTreeItem`](../../BaseTreeItem/classes/BaseTreeItem.md).[`label`](../../BaseTreeItem/classes/BaseTreeItem.md#label)

***

### flowData?

> `readonly` `optional` **flowData**: [`FlowDetails`](../../../../actions/findFlows/interfaces/FlowDetails.md)

Defined in: [treeView/items/DetailTreeItem.ts:12](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/DetailTreeItem.ts#L12)

***

### deploymentData?

> `readonly` `optional` **deploymentData**: [`DeploymentDetails`](../../../../actions/findDeployments/interfaces/DeploymentDetails.md)

Defined in: [treeView/items/DetailTreeItem.ts:13](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/DetailTreeItem.ts#L13)
