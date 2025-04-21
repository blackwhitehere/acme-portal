import * as vscode from 'vscode';
import { SettingsManager } from '../settings/settingsManager';
import { SdkObjectRunner } from '../sdk/sdkObjectRunner';

export interface FlowDetails {
    name: string; // flow name standardized for display
    module: string; // module name derived from the source file
    source_file: string; // full path to file where the flow is defined
    description?: string; // description from decorator or function docstring
    original_name?: string; // flow name before standardization
    class?: string; // class name if flow is defined within a class
    type: string; // 'function' or 'method' based on flow definition location
    id?: string; // unique identifier for the flow
}

export class FlowScanner {
    private static readonly FLOW_FINDER_MODULE = 'flow_finder';
    private static readonly FLOW_FINDER_CLASS = 'FlowFinder';

    /**
     * Scan for Prefect flows in the configured flows directory
     */
    public static async scanForFlows(): Promise<FlowDetails[]> {
        try {
            const flowsPath = SettingsManager.getAbsoluteFlowsPath();
            if (!flowsPath) {
                return [];
            }

            const pathExists = await SettingsManager.flowsPathExists();
            if (!pathExists) {
                vscode.window.showWarningMessage(`Flows directory not found: ${flowsPath}`);
                return [];
            }

            console.log(`Scanning for flows in: ${flowsPath}`);

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
                    console.log(`Flow: ${flow.name} (${flow.source_file})`);
                });
                
                return flows;
            } catch (sdkError) {
                console.error('Error using SDK FlowFinder:', sdkError);
                vscode.window.showErrorMessage(`Error scanning for flows: ${sdkError}`);
                return [];
            }
        } catch (error) {
            console.error('Settings error when flow scanning:', error);
            vscode.window.showErrorMessage(`Settings error when flow scanning: ${error}`);
            return [];
        }
    }
}
