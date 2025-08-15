[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [commands/CommandManager](../README.md) / CommandManager

# Class: CommandManager

Defined in: [commands/CommandManager.ts:9](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/CommandManager.ts#L9)

## Constructors

### Constructor

> **new CommandManager**(`treeViewCommands`, `settingsCommands`, `flowCommands`, `promotionCommands`, `comparisonCommands`, `deploymentCommands`): `CommandManager`

Defined in: [commands/CommandManager.ts:15](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/CommandManager.ts#L15)

#### Parameters

##### treeViewCommands

[`TreeViewCommands`](../../TreeViewCommands/classes/TreeViewCommands.md)

##### settingsCommands

[`SettingsCommands`](../../SettingsCommands/classes/SettingsCommands.md)

##### flowCommands

[`FlowCommands`](../../FlowCommands/classes/FlowCommands.md)

##### promotionCommands

[`PromotionCommands`](../../PromotionCommands/classes/PromotionCommands.md)

##### comparisonCommands

[`ComparisonCommands`](../../ComparisonCommands/classes/ComparisonCommands.md)

##### deploymentCommands

[`DeploymentCommands`](../../DeploymentCommands/classes/DeploymentCommands.md)

#### Returns

`CommandManager`

## Methods

### registerCommands()

> **registerCommands**(): `Disposable`[]

Defined in: [commands/CommandManager.ts:28](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/CommandManager.ts#L28)

Register all commands with VS Code

#### Returns

`Disposable`[]

Array of disposables for all registered commands

***

### dispose()

> **dispose**(): `void`

Defined in: [commands/CommandManager.ts:107](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/CommandManager.ts#L107)

Dispose of all registered commands

#### Returns

`void`
