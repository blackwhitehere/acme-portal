import { SdkObjectRunner } from '../sdk/sdkObjectRunner';

export class FlowPromoter {
    private static readonly PROMOTE_MODULE = 'deployment_promote';
    private static readonly PROMOTE_WORKFLOW_CLASS = 'PromoteWorkflow';

    /**
     * Promote specified flows from source to target environment
     * @param flowsToDeploy List of flow names to promote
     * @param sourceEnv Source environment
     * @param targetEnv Target environment
     * @param ref Git reference (branch/tag) for the workflow
     * @returns The URL of the promotion workflow if successful, null otherwise
     */
    public static async promoteFlows(
        flowsToDeploy: string[], 
        sourceEnv: string,
        targetEnv: string,
        ref: string
    ): Promise<string | null> {
        try {
            console.log(`Promoting flows: ${flowsToDeploy.join(', ')} from ${sourceEnv} to ${targetEnv} on ref: ${ref}`);
            
            // Use SdkObjectRunner to invoke PromoteWorkflow from the SDK
            const result = await SdkObjectRunner.runSdkObject<string | null>(
                this.PROMOTE_MODULE,
                this.PROMOTE_WORKFLOW_CLASS,
                {
                    flows_to_deploy: flowsToDeploy,
                    source_env: sourceEnv,
                    target_env: targetEnv,
                    ref: ref
                }
            );
            
            return result;
        } catch (error) {
            console.error('Error promoting flows:', error);
            throw error;
        }
    }
}
