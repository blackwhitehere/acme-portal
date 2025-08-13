import { FlowDetails } from '../actions/findFlows';
import { DeploymentDetails } from '../actions/findDeployments';

/**
 * Interface for search criteria
 */
export interface SearchCriteria {
    pattern: string;
    caseSensitive?: boolean;
    useRegex?: boolean;
    searchFields?: string[]; // Specific fields to search in
}

/**
 * Utility class for searching flows and deployments
 */
export class SearchUtils {
    
    /**
     * Search flows based on the given criteria
     * @param flows Array of flows to search
     * @param criteria Search criteria
     * @returns Filtered array of flows
     */
    public static searchFlows(flows: FlowDetails[], criteria: SearchCriteria): FlowDetails[] {
        if (!criteria.pattern.trim()) {
            return flows;
        }

        return flows.filter(flow => this.matchesFlowCriteria(flow, criteria));
    }

    /**
     * Search deployments based on the given criteria
     * @param deployments Array of deployments to search
     * @param criteria Search criteria
     * @returns Filtered array of deployments
     */
    public static searchDeployments(deployments: DeploymentDetails[], criteria: SearchCriteria): DeploymentDetails[] {
        if (!criteria.pattern.trim()) {
            return deployments;
        }

        return deployments.filter(deployment => this.matchesDeploymentCriteria(deployment, criteria));
    }

    /**
     * Filter deployments that belong to specific flows
     * @param deployments Array of deployments
     * @param flowNames Array of flow names to filter by
     * @returns Filtered deployments
     */
    public static filterDeploymentsByFlows(deployments: DeploymentDetails[], flowNames: string[]): DeploymentDetails[] {
        return deployments.filter(deployment => flowNames.includes(deployment.flow_name));
    }

    /**
     * Check if a flow matches the search criteria
     */
    private static matchesFlowCriteria(flow: FlowDetails, criteria: SearchCriteria): boolean {
        const pattern = criteria.caseSensitive ? criteria.pattern : criteria.pattern.toLowerCase();
        
        // If specific fields are specified, only search those
        if (criteria.searchFields && criteria.searchFields.length > 0) {
            return criteria.searchFields.some(field => {
                const value = this.getFlowFieldValue(flow, field);
                return value && this.matchesPattern(value, pattern, criteria.useRegex, criteria.caseSensitive);
            });
        }

        // Search all relevant fields
        const searchableFields = [
            flow.name,
            flow.original_name,
            flow.description,
            flow.obj_type,
            flow.obj_name,
            flow.obj_parent_type,
            flow.obj_parent,
            flow.module,
            flow.source_path,
            flow.source_relative,
            flow.import_path,
            ...(flow.grouping || []),
            ...this.getChildAttributeValues(flow.child_attributes)
        ];

        return searchableFields.some(field => 
            field && this.matchesPattern(field, pattern, criteria.useRegex, criteria.caseSensitive)
        );
    }

    /**
     * Check if a deployment matches the search criteria
     */
    private static matchesDeploymentCriteria(deployment: DeploymentDetails, criteria: SearchCriteria): boolean {
        const pattern = criteria.caseSensitive ? criteria.pattern : criteria.pattern.toLowerCase();
        
        // If specific fields are specified, only search those
        if (criteria.searchFields && criteria.searchFields.length > 0) {
            return criteria.searchFields.some(field => {
                const value = this.getDeploymentFieldValue(deployment, field);
                return value && this.matchesPattern(value, pattern, criteria.useRegex, criteria.caseSensitive);
            });
        }

        // Search all relevant fields
        const searchableFields = [
            deployment.name,
            deployment.project_name,
            deployment.branch,
            deployment.flow_name,
            deployment.env,
            deployment.commit_hash,
            deployment.package_version,
            ...(deployment.tags || []),
            deployment.url,
            ...this.getChildAttributeValues(deployment.child_attributes)
        ];

        return searchableFields.some(field => 
            field && this.matchesPattern(field, pattern, criteria.useRegex, criteria.caseSensitive)
        );
    }

    /**
     * Check if a string matches the search pattern
     */
    private static matchesPattern(value: string, pattern: string, useRegex: boolean = false, caseSensitive: boolean = false): boolean {
        const searchValue = caseSensitive ? value : value.toLowerCase();
        
        if (useRegex) {
            try {
                const flags = caseSensitive ? 'g' : 'gi';
                const regex = new RegExp(pattern, flags);
                return regex.test(searchValue);
            } catch (error) {
                // If regex is invalid, fall back to simple contains search
                return searchValue.includes(pattern);
            }
        } else {
            return searchValue.includes(pattern);
        }
    }

    /**
     * Get field value from flow object by field name
     */
    private static getFlowFieldValue(flow: FlowDetails, fieldName: string): string | undefined {
        switch (fieldName) {
            case 'name': return flow.name;
            case 'original_name': return flow.original_name;
            case 'description': return flow.description;
            case 'obj_type': return flow.obj_type;
            case 'obj_name': return flow.obj_name;
            case 'obj_parent_type': return flow.obj_parent_type;
            case 'obj_parent': return flow.obj_parent;
            case 'module': return flow.module;
            case 'source_path': return flow.source_path;
            case 'source_relative': return flow.source_relative;
            case 'import_path': return flow.import_path;
            case 'grouping': return flow.grouping?.join('/');
            default: 
                // Check child attributes
                return flow.child_attributes?.[fieldName]?.toString();
        }
    }

    /**
     * Get field value from deployment object by field name
     */
    private static getDeploymentFieldValue(deployment: DeploymentDetails, fieldName: string): string | undefined {
        switch (fieldName) {
            case 'name': return deployment.name;
            case 'project_name': return deployment.project_name;
            case 'branch': return deployment.branch;
            case 'flow_name': return deployment.flow_name;
            case 'env': return deployment.env;
            case 'commit_hash': return deployment.commit_hash;
            case 'package_version': return deployment.package_version;
            case 'tags': return deployment.tags?.join(' ');
            case 'url': return deployment.url;
            default:
                // Check child attributes
                return deployment.child_attributes?.[fieldName]?.toString();
        }
    }

    /**
     * Extract values from child attributes object
     */
    private static getChildAttributeValues(childAttributes?: Record<string, any>): string[] {
        if (!childAttributes) {
            return [];
        }
        
        return Object.values(childAttributes).map(value => String(value));
    }

    /**
     * Parse search query to extract field-specific searches
     * Format: "field:value" or just "value"
     * @param query Search query string
     * @returns Array of search criteria
     */
    public static parseSearchQuery(query: string): SearchCriteria[] {
        if (!query.trim()) {
            return [{ pattern: query }];
        }

        // Check if query contains field-specific searches (colon-separated)
        const hasFieldSearch = query.includes(':');
        
        if (!hasFieldSearch) {
            // Simple search - treat the entire query as one pattern
            return [{ pattern: query }];
        }

        const criteria: SearchCriteria[] = [];
        const parts = query.split(/\s+/);
        
        for (const part of parts) {
            if (part.trim()) {
                if (part.includes(':')) {
                    const [field, ...valueParts] = part.split(':');
                    const value = valueParts.join(':');
                    if (field && value) {
                        criteria.push({
                            pattern: value,
                            searchFields: [field]
                        });
                    }
                } else {
                    criteria.push({
                        pattern: part
                    });
                }
            }
        }
        
        // If no valid criteria found, treat the whole query as a single pattern
        return criteria.length > 0 ? criteria : [{ pattern: query }];
    }
}