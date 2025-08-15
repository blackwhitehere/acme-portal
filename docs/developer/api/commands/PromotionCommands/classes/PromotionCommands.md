[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [commands/PromotionCommands](../README.md) / PromotionCommands

# Class: PromotionCommands

Defined in: [commands/PromotionCommands.ts:11](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/PromotionCommands.ts#L11)

## Constructors

### Constructor

> **new PromotionCommands**(`gitService`): `PromotionCommands`

Defined in: [commands/PromotionCommands.ts:12](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/PromotionCommands.ts#L12)

#### Parameters

##### gitService

[`GitService`](../../../utils/gitService/classes/GitService.md)

#### Returns

`PromotionCommands`

## Methods

### promoteEnvironment()

> **promoteEnvironment**(`item`): `Promise`\<`void`\>

Defined in: [commands/PromotionCommands.ts:20](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/PromotionCommands.ts#L20)

Promote a flow from one environment to another

#### Parameters

##### item

`any`

The tree item representing the flow or environment

#### Returns

`Promise`\<`void`\>

***

### promoteFlowGroup()

> **promoteFlowGroup**(): `Promise`\<`void`\>

Defined in: [commands/PromotionCommands.ts:247](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/PromotionCommands.ts#L247)

Promote all flows in a specified group from one environment to another

#### Returns

`Promise`\<`void`\>

***

### promoteFlowGroupFromContext()

> **promoteFlowGroupFromContext**(`item`): `Promise`\<`void`\>

Defined in: [commands/PromotionCommands.ts:428](https://github.com/blackwhitehere/acme-portal/blob/main/src/commands/PromotionCommands.ts#L428)

Promote flows in a group from a tree view context (right-click on group)

#### Parameters

##### item

[`GroupTreeItem`](../../../treeView/items/GroupTreeItem/classes/GroupTreeItem.md)

The GroupTreeItem representing the group

#### Returns

`Promise`\<`void`\>
