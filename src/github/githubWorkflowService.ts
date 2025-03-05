import * as path from 'path';
import * as vscode from 'vscode';
import { CommandExecutor } from '../utils/commandExecutor';
import { GitService } from '../utils/gitService';
import { WorkspaceService } from '../utils/workspaceService';

interface WorkflowInput {
    [key: string]: string;
}

/**
 * Service for GitHub workflow operations
 */
export class GitHubWorkflowService {
    constructor(
        private commandExecutor: CommandExecutor,
        private gitService: GitService,
        private workspaceService: WorkspaceService
    ) {}

    /**
     * Trigger a GitHub workflow
     * @param workflowFile The workflow file name
     * @param workflowInputs The inputs for the workflow
     * @param workflowRef The git ref (branch/tag) for the workflow
     * @returns URL to the workflow run or undefined on error
     */
    public async triggerWorkflow(
        workflowFile: string,
        workflowInputs: WorkflowInput,
        workflowRef: string
    ): Promise<string | undefined> {
        try {
            const runUrl = await this.triggerWorkflowViaGitHubCLI(workflowFile, workflowInputs, workflowRef);
            
            if (runUrl) {
                return runUrl;
            }

            // If GitHub CLI fails, notify the user about other options
            vscode.window.showErrorMessage(
                'Failed to trigger workflow. Please ensure GitHub CLI is installed or manually trigger the workflow.',
                'Install GitHub CLI', 'Open GitHub'
            ).then(async selection => {
                if (selection === 'Install GitHub CLI') {
                    vscode.env.openExternal(vscode.Uri.parse('https://cli.github.com/'));
                } else if (selection === 'Open GitHub') {
                    const repoUrl = await this.gitService.getRepositoryUrl();
                    if (repoUrl) {
                        vscode.env.openExternal(vscode.Uri.parse(`${repoUrl}/actions`));
                    }
                }
            });

            return undefined;
        } catch (error) {
            console.error('Error triggering GitHub workflow:', error);
            vscode.window.showErrorMessage(`Error triggering workflow: ${error}`);
            return undefined;
        }
    }

    /**
     * Trigger a GitHub workflow specifically using the GitHub CLI
     * @private This is an implementation detail, use triggerWorkflow instead
     */
    private async triggerWorkflowViaGitHubCLI(
        workflowFile: string,
        workflowInputs: WorkflowInput,
        workflowRef: string
    ): Promise<string | undefined> {
        try {
            const workspaceRoot = await this.workspaceService.getWorkspaceRoot();
            if (!workspaceRoot) {
                return undefined;
            }

            // Format workflow inputs for CLI command
            const inputArgs = Object.entries(workflowInputs)
                .map(([key, value]) => `-f ${key}=${value}`)
                .join(' ');
                
            // Run the workflow using GitHub CLI
            const command = `gh workflow run ${workflowFile} -r ${workflowRef} ${inputArgs}`;
            const { stdout } = await this.commandExecutor.execute(command, workspaceRoot);
            console.log('Workflow triggered, getting run info...');
            
            // Extract the workflow filename from the path if needed
            const workflowName = path.basename(workflowFile);
            
            // Wait briefly to ensure the workflow has been registered
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Get the list of runs for this workflow
            const listCommand = `gh run list --workflow=${workflowName} --limit=1 --json databaseId,url`;
            const { stdout: runListOutput } = await this.commandExecutor.execute(listCommand, workspaceRoot);

            return this.parseWorkflowRunResponse(runListOutput);
        } catch (error) {
            console.error('Error using GitHub CLI:', error);
            return undefined;
        }
    }
    
    /**
     * Parse the GitHub CLI response for workflow run information
     * @param runListOutput The output from the GitHub CLI run list command
     * @returns URL to the workflow run or undefined
     */
    private async parseWorkflowRunResponse(runListOutput: string): Promise<string | undefined> {
        try {
            const runData = JSON.parse(runListOutput);
            if (runData && runData.length > 0) {
                const latestRun = runData[0];
                if (latestRun.url) {
                    console.log(`Workflow triggered via CLI: ${latestRun.url}`);
                    return latestRun.url;
                } else if (latestRun.databaseId) {
                    // Construct URL manually if only ID is available
                    const repoUrl = await this.gitService.getRepositoryUrl();
                    if (repoUrl) {
                        const runUrl = `${repoUrl}/actions/runs/${latestRun.databaseId}`;
                        console.log(`Workflow triggered via CLI: ${runUrl}`);
                        return runUrl;
                    }
                }
            }
            console.log('Failed to get workflow run URL from CLI output');
            return undefined;
        } catch (error) {
            console.error('Error parsing workflow run data:', error);
            return undefined;
        }
    }
    
}
