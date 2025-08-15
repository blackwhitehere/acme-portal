[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [treeView/searchViewProvider](../README.md) / SearchViewProvider

# Class: SearchViewProvider

Defined in: [treeView/searchViewProvider.ts:8](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/searchViewProvider.ts#L8)

Provides webview-based persistent search interface

## Implements

- `WebviewViewProvider`

## Constructors

### Constructor

> **new SearchViewProvider**(`_extensionUri`, `treeDataProvider`): `SearchViewProvider`

Defined in: [treeView/searchViewProvider.ts:17](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/searchViewProvider.ts#L17)

#### Parameters

##### \_extensionUri

`Uri`

##### treeDataProvider

[`FlowTreeDataProvider`](../../treeDataProvider/classes/FlowTreeDataProvider.md)

#### Returns

`SearchViewProvider`

## Properties

### viewType

> `readonly` `static` **viewType**: `"acmePortalSearchView"` = `'acmePortalSearchView'`

Defined in: [treeView/searchViewProvider.ts:9](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/searchViewProvider.ts#L9)

## Methods

### resolveWebviewView()

> **resolveWebviewView**(`webviewView`, `context`, `_token`): `void`

Defined in: [treeView/searchViewProvider.ts:22](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/searchViewProvider.ts#L22)

Resolves a webview view.

`resolveWebviewView` is called when a view first becomes visible. This may happen when the view is
first loaded or when the user hides and then shows a view again.

#### Parameters

##### webviewView

`WebviewView`

Webview view to restore. The provider should take ownership of this view. The
   provider must set the webview's `.html` and hook up all webview events it is interested in.

##### context

`WebviewViewResolveContext`

Additional metadata about the view being resolved.

##### \_token

`CancellationToken`

#### Returns

`void`

Optional thenable indicating that the view has been fully resolved.

#### Implementation of

`vscode.WebviewViewProvider.resolveWebviewView`

***

### clearAllSearch()

> **clearAllSearch**(): `void`

Defined in: [treeView/searchViewProvider.ts:395](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/searchViewProvider.ts#L395)

Clear all search filters

#### Returns

`void`

***

### getCurrentSearchState()

> **getCurrentSearchState**(): `object`

Defined in: [treeView/searchViewProvider.ts:407](https://github.com/blackwhitehere/acme-portal/blob/main/src/treeView/searchViewProvider.ts#L407)

Get current search state

#### Returns

`object`

##### flowQuery

> **flowQuery**: `string`

##### deploymentQuery

> **deploymentQuery**: `string`

##### flowRegexMode

> **flowRegexMode**: `boolean`

##### deploymentRegexMode

> **deploymentRegexMode**: `boolean`
