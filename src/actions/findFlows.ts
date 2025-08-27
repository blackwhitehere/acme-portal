import * as vscode from 'vscode';
import { SdkObjectRunner } from '../sdk/sdkObjectRunner';

export interface FlowDetails {
    name: string;  // Display name, may be a normalized version of the original name
    original_name: string;  // Name as defined in the code
    description: string;  // Description of the flow
    id: string;  // Unique identifier for the flow definition in memory
    source_path: string;  // Unambiguous path to the source file from the root of the project
    source_relative: string;  // Relative path to the source file from some known root
    grouping: string[];  // Desired grouping of the flow in the context of the project (for navigation)
    line_number?: number;  // Optional line number where the flow is defined in the source file
    child_attributes?: Record<string, any>;  // Additional attributes from subclassed SDK FlowDetails
}

export class FindFlows {
    private static readonly FLOW_FINDER_MODULE = 'flow_finder';
    private static readonly FLOW_FINDER_CLASS = 'FlowFinder';

    /**
     * Scan for Prefect flows in the configured flows directory
     */
    public static async scanForFlows(): Promise<FlowDetails[]> {
        try {

            console.log(`Scanning for flows...`);

            try {
                // Use SdkObjectRunner to invoke the FlowFinder object from the SDK
                console.log(`Running FlowFinder from SDK module: ${this.FLOW_FINDER_MODULE}`);
                
                // The FlowFinder instance is expected to be callable with no arguments
                // and return an object that can be parsed as a collection of FlowDetails
                const result = await SdkObjectRunner.runSdkObject<Record<string, FlowDetails>>(
                    this.FLOW_FINDER_MODULE,
                    this.FLOW_FINDER_CLASS
                );
                
                // Convert result to array of FlowDetails
                const flows = Object.values(result);
                console.log(`Found ${flows.length} flows via SDK`);
                
                // Log the flow names to help debug
                flows.forEach(flow => {
                    console.log(`Flow: ${flow.name} (${flow.source_path})`);
                });
                
                return flows;
            } catch (sdkError) {
                console.error('Error using SDK FlowFinder:', sdkError);
                // Error notification is now handled by SdkObjectRunner
                return [];
            }
        } catch (error) {
            console.error('Settings error when flow scanning:', error);
            vscode.window.showErrorMessage(`Settings error when flow scanning: ${error}`);
            return [];
        }
    }

    /**
     * Scan for specific flows by passing existing flow details
     * @param existingFlows Array of existing flow details to refresh
     */
    public static async scanSpecificFlows(existingFlows: FlowDetails[]): Promise<FlowDetails[]> {
        try {
            console.log(`Scanning for ${existingFlows.length} specific flows...`);

            try {
                // Use SdkObjectRunner to invoke the FlowFinder object from the SDK
                // Pass existing flows as kwargs to the find_flow method  
                console.log(`Running FlowFinder from SDK module: ${this.FLOW_FINDER_MODULE} with existing flows`);
                
                // Convert flows to the format expected by the SDK
                const flowsKwargs = {
                    existing_flows: existingFlows
                };
                
                const result = await SdkObjectRunner.runSdkObject<Record<string, FlowDetails>>(
                    this.FLOW_FINDER_MODULE,
                    this.FLOW_FINDER_CLASS,
                    flowsKwargs
                );
                
                // Convert result to array of FlowDetails
                const flows = Object.values(result);
                console.log(`Found ${flows.length} refreshed flows via SDK`);
                
                // Log the flow names to help debug
                flows.forEach(flow => {
                    console.log(`Refreshed Flow: ${flow.name} (${flow.source_path})`);
                });
                
                return flows;
            } catch (sdkError) {
                console.error('Error using SDK FlowFinder for specific flows:', sdkError);
                // Error notification is now handled by SdkObjectRunner
                return [];
            }
        } catch (error) {
            console.error('Settings error when scanning specific flows:', error);
            vscode.window.showErrorMessage(`Settings error when scanning specific flows: ${error}`);
            return [];
        }
    }
}
