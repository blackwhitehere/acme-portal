import { FlowDetails } from '../actions/findFlows';

/**
 * Utility functions for working with flow groups
 */
export class GroupUtils {
    /**
     * Find all flows that match a specific group path
     * @param flows Array of all available flows
     * @param groupPath Group path in format "aaa/bbb/ccc"
     * @returns Array of flows that match the group path
     */
    public static findFlowsByGroupPath(flows: FlowDetails[], groupPath: string): FlowDetails[] {
        if (!groupPath || groupPath.trim() === '') {
            return [];
        }

        // Convert group path string to array (e.g., "aaa/bbb/ccc" -> ["aaa", "bbb", "ccc"])
        const targetGrouping = groupPath.split('/').map(part => part.trim()).filter(part => part.length > 0);
        
        if (targetGrouping.length === 0) {
            return [];
        }

        // Find flows with matching grouping
        return flows.filter(flow => {
            const flowGrouping = flow.grouping || [];
            
            // Check if the flow's grouping matches the target grouping exactly
            return this.arraysEqual(flowGrouping, targetGrouping);
        });
    }

    /**
     * Check if two arrays are equal (same elements in same order)
     * @param arr1 First array
     * @param arr2 Second array
     * @returns true if arrays are equal, false otherwise
     */
    private static arraysEqual(arr1: string[], arr2: string[]): boolean {
        if (arr1.length !== arr2.length) {
            return false;
        }
        
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get a formatted display name for a group path
     * @param groupPath Group path in format "aaa/bbb/ccc"
     * @returns Formatted display name
     */
    public static getGroupDisplayName(groupPath: string): string {
        if (!groupPath || groupPath.trim() === '') {
            return 'Root';
        }
        
        return groupPath;
    }
}