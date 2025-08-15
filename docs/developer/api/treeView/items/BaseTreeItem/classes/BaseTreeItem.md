[**acmeportal**](../../../../README.md)

***

[acmeportal](../../../../README.md) / [treeView/items/BaseTreeItem](../README.md) / BaseTreeItem

# Abstract Class: BaseTreeItem

Defined in: [treeView/items/BaseTreeItem.ts:6](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/BaseTreeItem.ts#L6)

Base class for all tree items in the ACME Portal tree view

## Extends

- `TreeItem`

## Extended by

- [`BranchTreeItem`](../../BranchTreeItem/classes/BranchTreeItem.md)
- [`DetailTreeItem`](../../DetailTreeItem/classes/DetailTreeItem.md)
- [`EnvironmentTreeItem`](../../EnvironmentTreeItem/classes/EnvironmentTreeItem.md)
- [`FlowTreeItem`](../../FlowTreeItem/classes/FlowTreeItem.md)
- [`GroupTreeItem`](../../GroupTreeItem/classes/GroupTreeItem.md)
- [`TagTreeItem`](../../TagTreeItem/classes/TagTreeItem.md)
- [`TagsDirectoryTreeItem`](../../TagsDirectoryTreeItem/classes/TagsDirectoryTreeItem.md)

## Constructors

### Constructor

> **new BaseTreeItem**(`label`, `collapsibleState`, `parentId?`): `BaseTreeItem`

Defined in: [treeView/items/BaseTreeItem.ts:7](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/BaseTreeItem.ts#L7)

#### Parameters

##### label

`string`

##### collapsibleState

`TreeItemCollapsibleState`

##### parentId?

`string`

#### Returns

`BaseTreeItem`

#### Overrides

`vscode.TreeItem.constructor`

## Properties

### label

> `readonly` **label**: `string`

Defined in: [treeView/items/BaseTreeItem.ts:8](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/BaseTreeItem.ts#L8)

#### Inherited from

`vscode.TreeItem.label`

***

### collapsibleState

> `readonly` **collapsibleState**: `TreeItemCollapsibleState`

Defined in: [treeView/items/BaseTreeItem.ts:9](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/BaseTreeItem.ts#L9)

#### Inherited from

`vscode.TreeItem.collapsibleState`

***

### parentId?

> `readonly` `optional` **parentId**: `string`

Defined in: [treeView/items/BaseTreeItem.ts:10](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/items/BaseTreeItem.ts#L10)
