[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [utils/groupUtils](../README.md) / GroupUtils

# Class: GroupUtils

Defined in: [utils/groupUtils.ts:6](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/groupUtils.ts#L6)

Utility functions for working with flow groups

## Constructors

### Constructor

> **new GroupUtils**(): `GroupUtils`

#### Returns

`GroupUtils`

## Methods

### findFlowsByGroupPath()

> `static` **findFlowsByGroupPath**(`flows`, `groupPath`): [`FlowDetails`](../../../actions/findFlows/interfaces/FlowDetails.md)[]

Defined in: [utils/groupUtils.ts:13](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/groupUtils.ts#L13)

Find all flows that match a specific group path

#### Parameters

##### flows

[`FlowDetails`](../../../actions/findFlows/interfaces/FlowDetails.md)[]

Array of all available flows

##### groupPath

`string`

Group path in format "aaa/bbb/ccc"

#### Returns

[`FlowDetails`](../../../actions/findFlows/interfaces/FlowDetails.md)[]

Array of flows that match the group path

***

### getGroupDisplayName()

> `static` **getGroupDisplayName**(`groupPath`): `string`

Defined in: [utils/groupUtils.ts:59](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/groupUtils.ts#L59)

Get a formatted display name for a group path

#### Parameters

##### groupPath

`string`

Group path in format "aaa/bbb/ccc"

#### Returns

`string`

Formatted display name
