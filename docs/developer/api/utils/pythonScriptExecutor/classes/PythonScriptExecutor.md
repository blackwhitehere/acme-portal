[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [utils/pythonScriptExecutor](../README.md) / PythonScriptExecutor

# Class: PythonScriptExecutor

Defined in: [utils/pythonScriptExecutor.ts:10](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/pythonScriptExecutor.ts#L10)

A utility class for executing Python scripts within a VSCode extension

## Constructors

### Constructor

> **new PythonScriptExecutor**(`commandExecutor`, `workspaceService`): `PythonScriptExecutor`

Defined in: [utils/pythonScriptExecutor.ts:19](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/pythonScriptExecutor.ts#L19)

Constructor for PythonScriptExecutor

#### Parameters

##### commandExecutor

[`CommandExecutor`](../../commandExecutor/classes/CommandExecutor.md) = `...`

Service for executing shell commands

##### workspaceService

[`WorkspaceService`](../../workspaceService/classes/WorkspaceService.md) = `...`

Service for VS Code workspace operations

#### Returns

`PythonScriptExecutor`

## Methods

### executeScript()

> **executeScript**(`scriptPath`, ...`args`): `Promise`\<`string`\>

Defined in: [utils/pythonScriptExecutor.ts:33](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/pythonScriptExecutor.ts#L33)

Execute a Python script with the provided arguments

#### Parameters

##### scriptPath

`string`

Path to the Python script

##### args

...`string`[]

Arguments to pass to the script

#### Returns

`Promise`\<`string`\>

The script's stdout output as a string

***

### getPythonPath()

> `static` **getPythonPath**(): `Promise`\<`string`\>

Defined in: [utils/pythonScriptExecutor.ts:74](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/pythonScriptExecutor.ts#L74)

Use VS Code settings to get the Python path

#### Returns

`Promise`\<`string`\>

***

### fileExists()

> `static` **fileExists**(`filePath`): `Promise`\<`boolean`\>

Defined in: [utils/pythonScriptExecutor.ts:138](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/pythonScriptExecutor.ts#L138)

Check if a file exists

#### Parameters

##### filePath

`string`

#### Returns

`Promise`\<`boolean`\>

***

### getScriptPath()

> `static` **getScriptPath**(`scriptName`): `Promise`\<`undefined` \| `string`\>

Defined in: [utils/pythonScriptExecutor.ts:152](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/pythonScriptExecutor.ts#L152)

Get the path to a script in the extension

#### Parameters

##### scriptName

`string`

Name of the script file

#### Returns

`Promise`\<`undefined` \| `string`\>

Full path to the script
