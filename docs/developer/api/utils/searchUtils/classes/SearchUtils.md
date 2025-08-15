[**acmeportal**](../../../README.md)

***

[acmeportal](../../../README.md) / [utils/searchUtils](../README.md) / SearchUtils

# Class: SearchUtils

Defined in: [utils/searchUtils.ts:17](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/searchUtils.ts#L17)

Utility class for searching flows and deployments

## Constructors

### Constructor

> **new SearchUtils**(): `SearchUtils`

#### Returns

`SearchUtils`

## Methods

### searchFlows()

> `static` **searchFlows**(`flows`, `criteriaList`): [`FlowDetails`](../../../actions/findFlows/interfaces/FlowDetails.md)[]

Defined in: [utils/searchUtils.ts:25](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/searchUtils.ts#L25)

Search flows based on multiple criteria

#### Parameters

##### flows

[`FlowDetails`](../../../actions/findFlows/interfaces/FlowDetails.md)[]

Array of flows to search

##### criteriaList

[`SearchCriteria`](../interfaces/SearchCriteria.md)[]

Array of search criteria

#### Returns

[`FlowDetails`](../../../actions/findFlows/interfaces/FlowDetails.md)[]

Filtered array of flows

***

### searchDeployments()

> `static` **searchDeployments**(`deployments`, `criteriaList`): [`DeploymentDetails`](../../../actions/findDeployments/interfaces/DeploymentDetails.md)[]

Defined in: [utils/searchUtils.ts:43](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/searchUtils.ts#L43)

Search deployments based on multiple criteria

#### Parameters

##### deployments

[`DeploymentDetails`](../../../actions/findDeployments/interfaces/DeploymentDetails.md)[]

Array of deployments to search

##### criteriaList

[`SearchCriteria`](../interfaces/SearchCriteria.md)[]

Array of search criteria

#### Returns

[`DeploymentDetails`](../../../actions/findDeployments/interfaces/DeploymentDetails.md)[]

Filtered array of deployments

***

### filterDeploymentsByFlows()

> `static` **filterDeploymentsByFlows**(`deployments`, `flowNames`): [`DeploymentDetails`](../../../actions/findDeployments/interfaces/DeploymentDetails.md)[]

Defined in: [utils/searchUtils.ts:61](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/searchUtils.ts#L61)

Filter deployments that belong to specific flows

#### Parameters

##### deployments

[`DeploymentDetails`](../../../actions/findDeployments/interfaces/DeploymentDetails.md)[]

Array of deployments

##### flowNames

`string`[]

Array of flow names to filter by

#### Returns

[`DeploymentDetails`](../../../actions/findDeployments/interfaces/DeploymentDetails.md)[]

Filtered deployments

***

### parseSearchQuery()

> `static` **parseSearchQuery**(`query`): [`SearchCriteria`](../interfaces/SearchCriteria.md)[]

Defined in: [utils/searchUtils.ts:209](https://github.com/blackwhitehere/acme-portal/blob/main/src/utils/searchUtils.ts#L209)

Parse search query to extract field-specific searches
Format: "field:value" or just "value"

#### Parameters

##### query

`string`

Search query string

#### Returns

[`SearchCriteria`](../interfaces/SearchCriteria.md)[]

Array of search criteria
