[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [sdk/sdkObjectRunner](../README.md) / SdkObjectRunner

# Class: SdkObjectRunner

Defined in: [sdk/sdkObjectRunner.ts:10](https://github.com/blackwhitehere/acme-portal/blob/main/src/sdk/sdkObjectRunner.ts#L10)

Class that handles running objects from the ACME Portal SDK

## Constructors

### Constructor

> **new SdkObjectRunner**(): `SdkObjectRunner`

#### Returns

`SdkObjectRunner`

## Methods

### runSdkObject()

> `static` **runSdkObject**\<`T`\>(`moduleName`, `className`, `kwargs?`): `Promise`\<`T`\>

Defined in: [sdk/sdkObjectRunner.ts:20](https://github.com/blackwhitehere/acme-portal/blob/main/src/sdk/sdkObjectRunner.ts#L20)

Run an object from the SDK module and get the result

#### Type Parameters

##### T

`T`

#### Parameters

##### moduleName

`string`

Name of the module in .acme_portal_sdk directory

##### className

`string`

Name of the class whose instance we want to run

##### kwargs?

`Record`\<`string`, `any`\>

Optional dictionary of keyword arguments to pass to the object

#### Returns

`Promise`\<`T`\>

The JSON result of calling the object
