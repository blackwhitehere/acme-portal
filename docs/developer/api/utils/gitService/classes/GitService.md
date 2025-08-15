[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [utils/gitService](../README.md) / GitService

# Class: GitService

Defined in: [utils/gitService.ts:7](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/gitService.ts#L7)

Service for Git repository operations

## Constructors

### Constructor

> **new GitService**(`commandExecutor`, `workspaceService`): `GitService`

Defined in: [utils/gitService.ts:8](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/gitService.ts#L8)

#### Parameters

##### commandExecutor

[`CommandExecutor`](../../commandExecutor/classes/CommandExecutor.md)

##### workspaceService

[`WorkspaceService`](../../workspaceService/classes/WorkspaceService.md)

#### Returns

`GitService`

## Methods

### isGitInstalled()

> **isGitInstalled**(): `Promise`\<`boolean`\>

Defined in: [utils/gitService.ts:17](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/gitService.ts#L17)

Check if Git is installed on the system

#### Returns

`Promise`\<`boolean`\>

True if Git is installed, false otherwise

***

### checkGitInstalled()

> **checkGitInstalled**(): `Promise`\<`boolean`\>

Defined in: [utils/gitService.ts:30](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/gitService.ts#L30)

Check if Git is installed and show an error message if not

#### Returns

`Promise`\<`boolean`\>

True if Git is installed, false otherwise

***

### getCurrentBranch()

> **getCurrentBranch**(): `Promise`\<`undefined` \| `string`\>

Defined in: [utils/gitService.ts:42](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/gitService.ts#L42)

Get the current branch name of the workspace

#### Returns

`Promise`\<`undefined` \| `string`\>

The current branch name or 'main' as default

***

### hasUncommittedChanges()

> **hasUncommittedChanges**(): `Promise`\<`boolean`\>

Defined in: [utils/gitService.ts:64](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/gitService.ts#L64)

Check if there are uncommitted changes in the workspace

#### Returns

`Promise`\<`boolean`\>

True if there are uncommitted changes, false otherwise

***

### getCurrentCommitHash()

> **getCurrentCommitHash**(): `Promise`\<`undefined` \| `string`\>

Defined in: [utils/gitService.ts:89](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/gitService.ts#L89)

Get the current commit hash of the workspace

#### Returns

`Promise`\<`undefined` \| `string`\>

The current commit hash or undefined on error

***

### getLocalBranches()

> **getLocalBranches**(): `Promise`\<`undefined` \| `string`[]\>

Defined in: [utils/gitService.ts:112](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/gitService.ts#L112)

Get list of local branches

#### Returns

`Promise`\<`undefined` \| `string`[]\>

Array of branch names or undefined on error

***

### getBranchCommitHash()

> **getBranchCommitHash**(`branchName`): `Promise`\<`undefined` \| `string`\>

Defined in: [utils/gitService.ts:136](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/gitService.ts#L136)

Get commit hash of a specific branch

#### Parameters

##### branchName

`string`

Name of the branch

#### Returns

`Promise`\<`undefined` \| `string`\>

The commit hash of the branch or undefined on error

***

### getRepositoryUrl()

> **getRepositoryUrl**(): `Promise`\<`undefined` \| `string`\>

Defined in: [utils/gitService.ts:159](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/gitService.ts#L159)

Get the GitHub repository URL for the current workspace

#### Returns

`Promise`\<`undefined` \| `string`\>

The GitHub repository URL or undefined on error
