[**acmeportal**](../../../../README.md)

***

[acmeportal](../../../../README.md) / [treeView/items/BranchTreeItem](../README.md) / BranchTreeItem

# Class: BranchTreeItem

Defined in: [treeView/items/BranchTreeItem.ts:8](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/BranchTreeItem.ts#L8)

Tree item representing a Git branch that contains flow deployments

## Extends

- [`BaseTreeItem`](../../BaseTreeItem/classes/BaseTreeItem.md)

## Constructors

### Constructor

> **new BranchTreeItem**(`branchName`, `flowData`, `parentId`): `BranchTreeItem`

Defined in: [treeView/items/BranchTreeItem.ts:9](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/BranchTreeItem.ts#L9)

#### Parameters

##### branchName

`string`

##### flowData

[`FlowDetails`](../../../../actions/findFlows/interfaces/FlowDetails.md)

##### parentId

`string`

#### Returns

`BranchTreeItem`

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

### branchName

> `readonly` **branchName**: `string`

Defined in: [treeView/items/BranchTreeItem.ts:10](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/BranchTreeItem.ts#L10)

***

### flowData

> `readonly` **flowData**: [`FlowDetails`](../../../../actions/findFlows/interfaces/FlowDetails.md)

Defined in: [treeView/items/BranchTreeItem.ts:11](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/BranchTreeItem.ts#L11)

## Methods

### getBranchName()

> **getBranchName**(): `string`

Defined in: [treeView/items/BranchTreeItem.ts:27](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/BranchTreeItem.ts#L27)

Get the branch name without the prefix

#### Returns

`string`
