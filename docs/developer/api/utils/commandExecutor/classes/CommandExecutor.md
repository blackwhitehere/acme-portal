[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [utils/commandExecutor](../README.md) / CommandExecutor

# Class: CommandExecutor

Defined in: [utils/commandExecutor.ts:14](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/commandExecutor.ts#L14)

Service for executing shell commands

## Constructors

### Constructor

> **new CommandExecutor**(): `CommandExecutor`

#### Returns

`CommandExecutor`

## Methods

### execute()

> **execute**(`command`, `cwd?`): `Promise`\<[`CommandResult`](../interfaces/CommandResult.md)\>

Defined in: [utils/commandExecutor.ts:21](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/commandExecutor.ts#L21)

Execute a shell command and return the result

#### Parameters

##### command

`string`

Command to execute

##### cwd?

`string`

Working directory for command execution (optional, defaults to current working directory)

#### Returns

`Promise`\<[`CommandResult`](../interfaces/CommandResult.md)\>

Command execution result containing stdout and stderr
