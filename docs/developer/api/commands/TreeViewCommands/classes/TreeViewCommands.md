[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [commands/TreeViewCommands](../README.md) / TreeViewCommands

# Class: TreeViewCommands

Defined in: [commands/TreeViewCommands.ts:5](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/TreeViewCommands.ts#L5)

## Constructors

### Constructor

> **new TreeViewCommands**(`treeDataProvider`): `TreeViewCommands`

Defined in: [commands/TreeViewCommands.ts:6](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/TreeViewCommands.ts#L6)

#### Parameters

##### treeDataProvider

[`FlowTreeDataProvider`](../../../treeView/treeDataProvider/classes/FlowTreeDataProvider.md)

#### Returns

`TreeViewCommands`

## Methods

### refreshTreeView()

> **refreshTreeView**(): `void`

Defined in: [commands/TreeViewCommands.ts:13](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/TreeViewCommands.ts#L13)

Refresh the tree view

#### Returns

`void`

***

### openExternalUrl()

> **openExternalUrl**(`item`): `Promise`\<`void`\>

Defined in: [commands/TreeViewCommands.ts:21](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/TreeViewCommands.ts#L21)

Open a URL in the default external browser after confirmation

#### Parameters

##### item

`any`

The tree item or direct URL to open

#### Returns

`Promise`\<`void`\>
