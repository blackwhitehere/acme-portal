[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [actions/deploy](../README.md) / FlowDeployer

# Class: FlowDeployer

Defined in: [actions/deploy.ts:3](https://github.com/blackwhitehere/acme-portal/blob/main/src/actions/deploy.ts#L3)

## Constructors

### Constructor

> **new FlowDeployer**(): `FlowDeployer`

#### Returns

`FlowDeployer`

## Methods

### deployFlows()

> `static` **deployFlows**(`flowsToDeploy`, `ref`, `additionalContext?`): `Promise`\<`null` \| `string`\>

Defined in: [actions/deploy.ts:14](https://github.com/blackwhitehere/acme-portal/blob/main/src/actions/deploy.ts#L14)

Deploy specified flows to the target environment

#### Parameters

##### flowsToDeploy

`string`[]

List of flow names to deploy

##### ref

`string`

Git reference (branch/tag) for the workflow

##### additionalContext?

`Record`\<`string`, `any`\>

Optional additional context from FlowDetails child_attributes

#### Returns

`Promise`\<`null` \| `string`\>

The URL of the deployment if successful, null otherwise
