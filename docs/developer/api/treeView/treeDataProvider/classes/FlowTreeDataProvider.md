[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [treeView/treeDataProvider](../README.md) / FlowTreeDataProvider

# Class: FlowTreeDataProvider

Defined in: [treeView/treeDataProvider.ts:18](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/treeDataProvider.ts#L18)

## Implements

- `TreeDataProvider`\<[`BaseTreeItem`](../../items/BaseTreeItem/classes/BaseTreeItem.md)\>

## Constructors

### Constructor

> **new FlowTreeDataProvider**(): `FlowTreeDataProvider`

Defined in: [treeView/treeDataProvider.ts:35](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/treeDataProvider.ts#L35)

#### Returns

`FlowTreeDataProvider`

## Properties

### onDidChangeTreeData

> `readonly` **onDidChangeTreeData**: `Event`\<`undefined` \| `null` \| `void` \| [`BaseTreeItem`](../../items/BaseTreeItem/classes/BaseTreeItem.md)\>

Defined in: [treeView/treeDataProvider.ts:20](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/treeDataProvider.ts#L20)

An optional event to signal that an element or root has changed.
This will trigger the view to update the changed element/root and its children recursively (if shown).
To signal that root has changed, do not pass any argument or pass `undefined` or `null`.

#### Implementation of

`vscode.TreeDataProvider.onDidChangeTreeData`

## Methods

### loadFlows()

> **loadFlows**(): `Promise`\<`void`\>

Defined in: [treeView/treeDataProvider.ts:47](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/treeDataProvider.ts#L47)

Load flows from Python files and deployment info from Prefect

#### Returns

`Promise`\<`void`\>

***

### refresh()

> **refresh**(): `void`

Defined in: [treeView/treeDataProvider.ts:359](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/treeDataProvider.ts#L359)

#### Returns

`void`

***

### getTreeItem()

> **getTreeItem**(`element`): `TreeItem`

Defined in: [treeView/treeDataProvider.ts:363](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/treeDataProvider.ts#L363)

Get TreeItem representation of the `element`

#### Parameters

##### element

[`BaseTreeItem`](../../items/BaseTreeItem/classes/BaseTreeItem.md)

The element for which TreeItem representation is asked for.

#### Returns

`TreeItem`

TreeItem representation of the element.

#### Implementation of

`vscode.TreeDataProvider.getTreeItem`

***

### getChildren()

> **getChildren**(`element?`): `Thenable`\<[`BaseTreeItem`](../../items/BaseTreeItem/classes/BaseTreeItem.md)[]\>

Defined in: [treeView/treeDataProvider.ts:373](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/treeDataProvider.ts#L373)

Get the children of `element` or root if no element is passed.

#### Parameters

##### element?

[`BaseTreeItem`](../../items/BaseTreeItem/classes/BaseTreeItem.md)

The element from which the provider gets children. Can be `undefined`.

#### Returns

`Thenable`\<[`BaseTreeItem`](../../items/BaseTreeItem/classes/BaseTreeItem.md)[]\>

Children of `element` or root if no element is passed.

#### Implementation of

`vscode.TreeDataProvider.getChildren`

***

### getParent()

> **getParent**(`element`): `ProviderResult`\<[`BaseTreeItem`](../../items/BaseTreeItem/classes/BaseTreeItem.md)\>

Defined in: [treeView/treeDataProvider.ts:390](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/treeDataProvider.ts#L390)

Optional method to return the parent of `element`.
Return `null` or `undefined` if `element` is a child of root.

**NOTE:** This method should be implemented in order to access TreeView.reveal reveal API.

#### Parameters

##### element

[`BaseTreeItem`](../../items/BaseTreeItem/classes/BaseTreeItem.md)

The element for which the parent has to be returned.

#### Returns

`ProviderResult`\<[`BaseTreeItem`](../../items/BaseTreeItem/classes/BaseTreeItem.md)\>

Parent of `element`.

#### Implementation of

`vscode.TreeDataProvider.getParent`

***

### applySearch()

> **applySearch**(`criteria`): `void`

Defined in: [treeView/treeDataProvider.ts:409](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/treeDataProvider.ts#L409)

Apply search criteria to filter flows and deployments

#### Parameters

##### criteria

[`SearchCriteria`](../../../utils/searchUtils/interfaces/SearchCriteria.md)[]

Array of search criteria

#### Returns

`void`

***

### clearSearch()

> **clearSearch**(): `void`

Defined in: [treeView/treeDataProvider.ts:433](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/treeDataProvider.ts#L433)

Clear search and show all items

#### Returns

`void`

***

### isSearchActive()

> **isSearchActive**(): `boolean`

Defined in: [treeView/treeDataProvider.ts:444](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/treeDataProvider.ts#L444)

Check if search is currently active

#### Returns

`boolean`

***

### getFilteredItemsCount()

> **getFilteredItemsCount**(): `object`

Defined in: [treeView/treeDataProvider.ts:451](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/treeDataProvider.ts#L451)

Get count of filtered items

#### Returns

`object`

##### flows

> **flows**: `number`

##### deployments

> **deployments**: `number`

***

### getSearchCriteria()

> **getSearchCriteria**(): [`SearchCriteria`](../../../utils/searchUtils/interfaces/SearchCriteria.md)[]

Defined in: [treeView/treeDataProvider.ts:467](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/treeDataProvider.ts#L467)

Get current search criteria

#### Returns

[`SearchCriteria`](../../../utils/searchUtils/interfaces/SearchCriteria.md)[]
