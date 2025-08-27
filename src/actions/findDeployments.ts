import * as vscode from 'vscode';
import { SdkObjectRunner } from '../sdk/sdkObjectRunner';
import { FlowDetails } from './findFlows';

export interface DeploymentDetails {
    name: string;  // Original name of the deployment config in the deployment system
    project_name: string;  // Project name to which the deployment belongs to (repo name)
    branch: string;  // Branch of code which is run in the deployment
    flow_name: string;  // Name of the flow run in the deployment
    env: string;  // Environment/Namespace for which the deployment is run (e.g., dev, prod)
    commit_hash: string;  // Commit hash of the code in the deployment
    package_version: string;  // Package version of the code in the deployment
    tags: string[];  // Tags associated with the deployment
    id: string;  // Unique identifier for the deployment in the end system
    created_at: string;  // Timestamp of when the deployment was created
    updated_at: string;  // Timestamp of when the deployment was last updated
    flow_id: string;  // Unique identifier for the flow in the deployment system
    url: string;  // URL to the deployment in the deployment system
    child_attributes?: Record<string, any>;  // Additional attributes from subclassed SDK DeploymentDetails
}

export class FindDeployments {
    private static readonly DEPLOYMENT_FINDER_MODULE = 'deployment_finder';
    private static readonly DEPLOYMENT_FINDER_CLASS = 'DeploymentFinder';
    
    /**
     * Scan for Prefect deployments in the Prefect backend
     */
    public static async scanForDeployments(): Promise<DeploymentDetails[]> {
        try {
            console.log('Scanning for deployments...');
            
            try {
                // Use SdkObjectRunner to invoke the DeploymentFinder object from the SDK
                console.log(`Running DeploymentFinder from SDK module: ${this.DEPLOYMENT_FINDER_MODULE}`);
                
                // The DeploymentFinder instance is callable with no arguments
                // and returns a list of DeploymentDetails objects
                const result = await SdkObjectRunner.runSdkObject<DeploymentDetails[]>(
                    this.DEPLOYMENT_FINDER_MODULE,
                    this.DEPLOYMENT_FINDER_CLASS
                );
                
                console.log(`Found ${result.length} deployments via SDK`);
                
                // Log the deployment names to help debug
                result.forEach(deployment => {
                    console.log(`Deployment: ${deployment.project_name}/${deployment.flow_name} (${deployment.branch}/${deployment.env})`);
                });
                
                return result;
            } catch (sdkError) {
                console.error('Error using SDK DeploymentFinder:', sdkError);
                // Error notification is now handled by SdkObjectRunner
                return [];
            }
        } catch (error) {
            console.error('Deployment scanning error:', error);
            vscode.window.showErrorMessage(`Error scanning for deployments: ${error}`);
            return [];
        }
    }

    /**
     * Scan for deployments for specific flows
     * @param flowDetails Array of flow details to get deployments for
     */
    public static async scanDeploymentsForFlows(flowDetails: FlowDetails[]): Promise<DeploymentDetails[]> {
        try {
            console.log(`Scanning deployments for ${flowDetails.length} specific flows...`);
            
            try {
                // Use SdkObjectRunner to invoke the DeploymentFinder object from the SDK
                // Pass flow details as kwargs
                console.log(`Running DeploymentFinder from SDK module: ${this.DEPLOYMENT_FINDER_MODULE} with flow details`);
                
                // Convert flow details to the format expected by the SDK
                const deploymentsKwargs = {
                    flow_details: flowDetails
                };
                
                const result = await SdkObjectRunner.runSdkObject<DeploymentDetails[]>(
                    this.DEPLOYMENT_FINDER_MODULE,
                    this.DEPLOYMENT_FINDER_CLASS,
                    deploymentsKwargs
                );
                
                console.log(`Found ${result.length} deployments for specific flows via SDK`);
                
                // Log the deployment names to help debug
                result.forEach(deployment => {
                    console.log(`Deployment for specific flows: ${deployment.project_name}/${deployment.flow_name} (${deployment.branch}/${deployment.env})`);
                });
                
                return result;
            } catch (sdkError) {
                console.error('Error using SDK DeploymentFinder for specific flows:', sdkError);
                // Error notification is now handled by SdkObjectRunner
                return [];
            }
        } catch (error) {
            console.error('Deployment scanning error for specific flows:', error);
            vscode.window.showErrorMessage(`Error scanning deployments for specific flows: ${error}`);
            return [];
        }
    }
}
