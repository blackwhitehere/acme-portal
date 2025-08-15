[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [utils/preConditionChecker](../README.md) / PreConditionChecker

# Class: PreConditionChecker

Defined in: [utils/preConditionChecker.ts:29](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/preConditionChecker.ts#L29)

Service to check all preconditions before the extension attempts to start work

## Constructors

### Constructor

> **new PreConditionChecker**(`workspaceService`, `commandExecutor`): `PreConditionChecker`

Defined in: [utils/preConditionChecker.ts:33](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/preConditionChecker.ts#L33)

#### Parameters

##### workspaceService

[`WorkspaceService`](../../workspaceService/classes/WorkspaceService.md) = `...`

##### commandExecutor

[`CommandExecutor`](../../commandExecutor/classes/CommandExecutor.md) = `...`

#### Returns

`PreConditionChecker`

## Methods

### checkAllPreconditions()

> **checkAllPreconditions**(): `Promise`\<[`PreConditionCheckResults`](../interfaces/PreConditionCheckResults.md)\>

Defined in: [utils/preConditionChecker.ts:44](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/preConditionChecker.ts#L44)

Check all preconditions required for the extension to work

#### Returns

`Promise`\<[`PreConditionCheckResults`](../interfaces/PreConditionCheckResults.md)\>

***

### displayResults()

> `static` **displayResults**(`results`): `void`

Defined in: [utils/preConditionChecker.ts:389](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/preConditionChecker.ts#L389)

Display appropriate error or warning messages to the user

#### Parameters

##### results

[`PreConditionCheckResults`](../interfaces/PreConditionCheckResults.md)

#### Returns

`void`
