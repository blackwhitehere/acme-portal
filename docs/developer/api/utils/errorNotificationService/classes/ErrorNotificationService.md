[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [utils/errorNotificationService](../README.md) / ErrorNotificationService

# Class: ErrorNotificationService

Defined in: [utils/errorNotificationService.ts:14](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/errorNotificationService.ts#L14)

Service for handling and displaying SDK-related errors to users

## Constructors

### Constructor

> **new ErrorNotificationService**(): `ErrorNotificationService`

#### Returns

`ErrorNotificationService`

## Methods

### showSdkError()

> `static` **showSdkError**(`error`): `void`

Defined in: [utils/errorNotificationService.ts:20](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/errorNotificationService.ts#L20)

Show a user-friendly error notification for SDK exceptions

#### Parameters

##### error

[`SdkError`](../interfaces/SdkError.md)

The structured SDK error information

#### Returns

`void`

***

### showGenericSdkError()

> `static` **showGenericSdkError**(`errorMessage`, `operation`): `void`

Defined in: [utils/errorNotificationService.ts:36](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/errorNotificationService.ts#L36)

Show a generic SDK error when structured error info is not available

#### Parameters

##### errorMessage

`string`

The generic error message

##### operation

`string`

The operation that failed (e.g., "scanning for deployments")

#### Returns

`void`
