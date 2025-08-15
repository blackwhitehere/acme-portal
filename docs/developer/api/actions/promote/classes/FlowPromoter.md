[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [actions/promote](../README.md) / FlowPromoter

# Class: FlowPromoter

Defined in: [actions/promote.ts:3](https://github.com/blackwhitehere/acme-portal/blob/main/src/actions/promote.ts#L3)

## Constructors

### Constructor

> **new FlowPromoter**(): `FlowPromoter`

#### Returns

`FlowPromoter`

## Methods

### promoteFlows()

> `static` **promoteFlows**(`flowsToDeploy`, `sourceEnv`, `targetEnv`, `ref`, `additionalContext?`): `Promise`\<`null` \| `string`\>

Defined in: [actions/promote.ts:16](https://github.com/blackwhitehere/acme-portal/blob/main/src/actions/promote.ts#L16)

Promote specified flows from source to target environment

#### Parameters

##### flowsToDeploy

`string`[]

List of flow names to promote

##### sourceEnv

`string`

Source environment

##### targetEnv

`string`

Target environment

##### ref

`string`

Git reference (branch/tag) for the workflow

##### additionalContext?

`Record`\<`string`, `any`\>

Optional additional context from FlowDetails child_attributes

#### Returns

`Promise`\<`null` \| `string`\>

The URL of the promotion workflow if successful, null otherwise
