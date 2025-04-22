import { SdkObjectRunner } from '../sdk/sdkObjectRunner';

export class FlowDeployer {
    private static readonly DEPLOY_MODULE = 'flow_deploy';
    private static readonly DEPLOY_WORKFLOW_CLASS = 'DeployWorkflow';

    /**
     * Deploy specified flows to the target environment
     * @param flowsToDeploy List of flow names to deploy
     * @param ref Git reference (branch/tag) for the workflow
     * @returns The URL of the deployment if successful, null otherwise
     */
    public static async deployFlows(
        flowsToDeploy: string[], 
        ref: string
    ): Promise<string | null> {
        try {
            console.log(`Deploying flows: ${flowsToDeploy.join(', ')} on ref: ${ref}`);
            
            // Use SdkObjectRunner to invoke DeployWorkflow from the SDK
            const result = await SdkObjectRunner.runSdkObject<string | null>(
                this.DEPLOY_MODULE,
                this.DEPLOY_WORKFLOW_CLASS,
                {
                    flows_to_deploy: flowsToDeploy,
                    ref: ref
                }
            );
            
            return result;
        } catch (error) {
            console.error('Error deploying flows:', error);
            throw error;
        }
    }
}
