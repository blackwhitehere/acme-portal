import { SdkObjectRunner } from '../sdk/sdkObjectRunner';

export class FlowDeployer {
    private static readonly DEPLOY_MODULE = 'flow_deploy';
    private static readonly DEPLOY_WORKFLOW_CLASS = 'DeployWorkflow';

    /**
     * Deploy specified flows to the target environment
     * @param flowsToDeploy List of flow names to deploy
     * @param ref Git reference (branch/tag) for the workflow
     * @param additionalContext Optional additional context from FlowDetails child_attributes
     * @returns The URL of the deployment if successful, null otherwise
     */
    public static async deployFlows(
        flowsToDeploy: string[], 
        ref: string,
        additionalContext?: Record<string, any>
    ): Promise<string | null> {
        try {
            console.log(`Deploying flows: ${flowsToDeploy.join(', ')} on ref: ${ref}`);
            
            // Prepare base arguments
            const args: Record<string, any> = {
                flows_to_deploy: flowsToDeploy,
                ref: ref
            };
            
            // Add additional context if provided
            if (additionalContext) {
                args.additional_context = additionalContext;
                console.log(`Deploying with additional context:`, additionalContext);
            }
            
            // Use SdkObjectRunner to invoke DeployWorkflow from the SDK
            const result = await SdkObjectRunner.runSdkObject<string | null>(
                this.DEPLOY_MODULE,
                this.DEPLOY_WORKFLOW_CLASS,
                args
            );
            
            return result;
        } catch (error) {
            console.error('Error deploying flows:', error);
            throw error;
        }
    }
}
