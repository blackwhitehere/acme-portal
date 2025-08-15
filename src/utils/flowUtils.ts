import { FlowDetails } from '../actions/findFlows';

/**
 * Utility functions for working with FlowDetails objects that handle the transition
 * from direct properties to child_attributes structure
 */
export class FlowUtils {
    /**
     * Get a field value from FlowDetails, checking both direct property and child_attributes
     * @param flow FlowDetails object
     * @param fieldName Name of the field to retrieve
     * @returns Field value if found, undefined otherwise
     */
    public static getFieldValue(flow: FlowDetails, fieldName: string): string | undefined {
        // For legacy compatibility, check direct property first
        const directValue = (flow as any)[fieldName];
        if (directValue !== undefined) {
            return directValue;
        }
        
        // Then check child_attributes
        return flow.child_attributes?.[fieldName];
    }

    /**
     * Get obj_type from flow (either direct property or child_attributes)
     */
    public static getObjType(flow: FlowDetails): string | undefined {
        return this.getFieldValue(flow, 'obj_type');
    }

    /**
     * Get obj_name from flow (either direct property or child_attributes)
     */
    public static getObjName(flow: FlowDetails): string | undefined {
        return this.getFieldValue(flow, 'obj_name');
    }

    /**
     * Get obj_parent_type from flow (either direct property or child_attributes)
     */
    public static getObjParentType(flow: FlowDetails): string | undefined {
        return this.getFieldValue(flow, 'obj_parent_type');
    }

    /**
     * Get obj_parent from flow (either direct property or child_attributes)
     */
    public static getObjParent(flow: FlowDetails): string | undefined {
        return this.getFieldValue(flow, 'obj_parent');
    }

    /**
     * Get module from flow (either direct property or child_attributes)
     */
    public static getModule(flow: FlowDetails): string | undefined {
        return this.getFieldValue(flow, 'module');
    }

    /**
     * Get import_path from flow (either direct property or child_attributes)
     */
    public static getImportPath(flow: FlowDetails): string | undefined {
        return this.getFieldValue(flow, 'import_path');
    }
}