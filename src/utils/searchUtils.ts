import { FlowDetails } from '../actions/findFlows';
import { DeploymentDetails } from '../actions/findDeployments';

/**
 * Interface for search criteria
 */
export interface SearchCriteria {
    field: string;
    value: string;
    isRegex?: boolean;
    type?: 'flow' | 'deployment' | 'all';
}

/**
 * Utility class for searching flows and deployments
 */
export class SearchUtils {
    
    /**
     * Search flows based on multiple criteria
     * @param flows Array of flows to search
     * @param criteriaList Array of search criteria
     * @returns Filtered array of flows
     */
    public static searchFlows(flows: FlowDetails[], criteriaList: SearchCriteria[]): FlowDetails[] {
        if (!criteriaList || criteriaList.length === 0) {
            return flows;
        }

        return flows.filter(flow => 
            criteriaList.every(criteria => 
                criteria.type === 'deployment' || this.matchesFlowCriteria(flow, criteria)
            )
        );
    }

    /**
     * Search deployments based on multiple criteria
     * @param deployments Array of deployments to search
     * @param criteriaList Array of search criteria
     * @returns Filtered array of deployments
     */
    public static searchDeployments(deployments: DeploymentDetails[], criteriaList: SearchCriteria[]): DeploymentDetails[] {
        if (!criteriaList || criteriaList.length === 0) {
            return deployments;
        }

        return deployments.filter(deployment => 
            criteriaList.every(criteria => 
                criteria.type === 'flow' || this.matchesDeploymentCriteria(deployment, criteria)
            )
        );
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
        if (!criteria.value.trim()) {
            return true;
        }

        // If field is 'all', search all fields
        if (criteria.field === 'all') {
            const searchableFields = [
                flow.name,
                flow.original_name,
                flow.description,
                flow.child_attributes?.['obj_type'],
                flow.child_attributes?.['obj_name'],
                flow.child_attributes?.['obj_parent_type'],
                flow.child_attributes?.['obj_parent'],
                flow.child_attributes?.['module'],
                flow.source_path,
                flow.source_relative,
                flow.child_attributes?.['import_path'],
                ...(flow.grouping || []),
                ...this.getChildAttributeValues(flow.child_attributes)
            ];

            return searchableFields.some(field => 
                field && this.matchesPattern(field, criteria.value, criteria.isRegex)
            );
        }

        // Search specific field
        const value = this.getFlowFieldValue(flow, criteria.field);
        return value ? this.matchesPattern(value, criteria.value, criteria.isRegex) : false;
    }

    /**
     * Check if a deployment matches the search criteria
     */
    private static matchesDeploymentCriteria(deployment: DeploymentDetails, criteria: SearchCriteria): boolean {
        if (!criteria.value.trim()) {
            return true;
        }

        // If field is 'all', search all fields
        if (criteria.field === 'all') {
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
                field && this.matchesPattern(field, criteria.value, criteria.isRegex)
            );
        }

        // Search specific field
        const value = this.getDeploymentFieldValue(deployment, criteria.field);
        return value ? this.matchesPattern(value, criteria.value, criteria.isRegex) : false;
    }

    /**
     * Check if a string matches the search pattern
     */
    private static matchesPattern(value: string, pattern: string, useRegex: boolean = false): boolean {
        const searchValue = value.toLowerCase();
        const searchPattern = pattern.toLowerCase();
        
        if (useRegex) {
            try {
                const regex = new RegExp(pattern, 'i');
                return regex.test(value);
            } catch (error) {
                // If regex is invalid, fall back to simple contains search
                return searchValue.includes(searchPattern);
            }
        } else {
            return searchValue.includes(searchPattern);
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
            case 'source': return [flow.source_path, flow.source_relative].filter(Boolean).join(' ');
            case 'source_path': return flow.source_path;
            case 'source_relative': return flow.source_relative;
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
            return [];
        }

        // Check if query contains field-specific searches (colon-separated)
        const hasFieldSearch = query.includes(':');
        
        if (!hasFieldSearch) {
            // Simple search - treat the entire query as one pattern
            return [{
                field: 'all',
                value: query.trim(),
                isRegex: false
            }];
        }

        const criteria: SearchCriteria[] = [];
        
        // Split by spaces but handle field:value patterns specially
        const tokens = query.trim().split(/\s+/);
        let i = 0;
        
        while (i < tokens.length) {
            const token = tokens[i];
            
            if (token.includes(':')) {
                const colonIndex = token.indexOf(':');
                const field = token.substring(0, colonIndex);
                let value = token.substring(colonIndex + 1);
                
                // If value is empty, it might be separated by space (e.g. "field: value")
                if (!value && i + 1 < tokens.length) {
                    value = tokens[i + 1];
                    i++; // Skip the next token since we used it as the value
                }
                
                if (field && value) {
                    criteria.push({
                        field: field.trim(),
                        value: value.trim(),
                        isRegex: false
                    });
                }
            } else {
                // Regular search term
                criteria.push({
                    field: 'all',
                    value: token.trim(),
                    isRegex: false
                });
            }
            i++;
        }
        
        // If no valid criteria found, treat the whole query as a single pattern
        return criteria.length > 0 ? criteria : [{
            field: 'all',
            value: query.trim(),
            isRegex: false
        }];
    }
}