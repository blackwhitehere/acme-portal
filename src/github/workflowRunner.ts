import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as https from 'https';

const execAsync = promisify(exec);

interface WorkflowInput {
    [key: string]: string;
}

export class GitHubWorkflowRunner {
    /**
     * Trigger a GitHub Actions workflow using multiple methods if needed
     */
    public static async triggerWorkflow(
        workflowFile: string, 
        workflowInputs: WorkflowInput,
        workflowRef: string = 'main'
    ): Promise<string | undefined> {
        try {
            // First, try using the GitHub Actions extension
            const runUrlFromExtension = await this.triggerWorkflowViaExtension(workflowFile, workflowInputs, workflowRef);
            if (runUrlFromExtension) {
                return runUrlFromExtension;
            }

            // If extension fails, try using GitHub CLI
            console.log("Extension method failed, falling back to GitHub CLI...");
            const runUrlFromCLI = await this.triggerWorkflowViaGitHubCLI(workflowFile, workflowInputs, workflowRef);
            if (runUrlFromCLI) {
                return runUrlFromCLI;
            }

            // If GitHub CLI fails, notify the user about other options
            vscode.window.showErrorMessage(
                'Failed to trigger workflow. Please ensure GitHub CLI is installed or manually trigger the workflow.',
                'Install GitHub CLI', 'Open GitHub'
            ).then(selection => {
                if (selection === 'Install GitHub CLI') {
                    vscode.env.openExternal(vscode.Uri.parse('https://cli.github.com/'));
                } else if (selection === 'Open GitHub') {
                    const repoUrl = this.getRepositoryUrl();
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
     * Attempt to trigger workflow via GitHub Actions extension
     */
    private static async triggerWorkflowViaExtension(
        workflowFile: string,
        workflowInputs: WorkflowInput,
        workflowRef: string
    ): Promise<string | undefined> {
        try {
            // Check if GitHub Actions extension is installed
            const githubActionsExtension = vscode.extensions.getExtension('github.vscode-github-actions');
            
            if (!githubActionsExtension) {
                console.log('GitHub Actions extension is not installed.');
                return undefined;
            }
            
            // Ensure GitHub Actions extension is activated
            if (!githubActionsExtension.isActive) {
                await githubActionsExtension.activate();
                // Add a small delay to ensure the extension is fully activated
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Try to get the GitHub Actions API
            const actionsAPI = githubActionsExtension.exports;
            
            if (!actionsAPI) {
                console.log('Failed to get GitHub Actions API from extension');
                return undefined;
            }

            if (typeof actionsAPI.manuallyDispatchWorkflow !== 'function') {
                console.log('manuallyDispatchWorkflow is not a function in the API');
                // Try to find an alternative method in the API
                console.log('Available API methods:', Object.keys(actionsAPI));
                return undefined;
            }
            
            // Call the GitHub Actions API to trigger the workflow
            console.log(`Attempting to trigger workflow ${workflowFile} via extension with inputs:`, workflowInputs);
            const result = await actionsAPI.manuallyDispatchWorkflow(workflowFile, workflowRef, workflowInputs);
            
            if (result && result.runUrl) {
                console.log(`Workflow triggered: ${result.runUrl}`);
                return result.runUrl;
            } else {
                console.log('Extension returned no run URL');
                return undefined;
            }
        } catch (error) {
            console.error('Error using GitHub Actions extension:', error);
            return undefined;
        }
    }

    /**
     * Attempt to trigger workflow via GitHub CLI
     */
    private static async triggerWorkflowViaGitHubCLI(
        workflowFile: string,
        workflowInputs: WorkflowInput,
        workflowRef: string
    ): Promise<string | undefined> {
        try {
            const workspaces = vscode.workspace.workspaceFolders;
            if (!workspaces || workspaces.length === 0) {
                vscode.window.showErrorMessage('No workspace folder is open.');
                return undefined;
            }

            const workspaceRoot = workspaces[0].uri.fsPath;
            const inputArgs = Object.entries(workflowInputs).map(([key, value]) => `-f ${key}=${value}`).join(' ');
            const command = `gh workflow run ${workflowFile} -r ${workflowRef} ${inputArgs}`;
            const { stdout } = await this.runCommand(command, workspaceRoot);
            console.log('Workflow triggered, getting run info...');
            // Extract the workflow filename from the path if needed
            const workflowName = path.basename(workflowFile);
            // Wait briefly to ensure the workflow has been registered
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Get the list of runs for this workflow
            const listCommand = `gh run list --workflow=${workflowName} --limit=1 --json databaseId,url`;
            const { stdout: runListOutput } = await this.runCommand(listCommand, workspaceRoot);

            try {
                const runData = JSON.parse(runListOutput);
                if (runData && runData.length > 0) {
                    const latestRun = runData[0];
                    if (latestRun.url) {
                        console.log(`Workflow triggered via CLI: ${latestRun.url}`);
                        return latestRun.url;
                    } else if (latestRun.databaseId) {
                        // Construct URL manually if only ID is available
                        const repoUrl = this.getRepositoryUrl();
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
        } catch (error) {
            console.error('Error using GitHub CLI:', error);
            return undefined;
        }
    }

    /**
     * Check if a workflow file exists in the current workspace
     */
    private static async checkIfWorkflowExists(workflowFile: string): Promise<boolean> {
        try {
            const workspaces = vscode.workspace.workspaceFolders;
            if (!workspaces || workspaces.length === 0) {
                return false;
            }
            
            const workspaceRoot = workspaces[0].uri.fsPath;
            const fullPath = path.join(workspaceRoot, '.github', 'workflows', workflowFile);
            
            try {
                await fs.promises.access(fullPath, fs.constants.F_OK);
                return true;
            } catch {
                return false;
            }
        } catch (error) {
            console.error('Error checking workflow file:', error);
            return false;
        }
    }
    
    /**
     * Create a URL for a GitHub repository
     */
    public static getRepositoryUrl(): string | undefined {
        try {
            // Use GitHub extension to get the repository information
            const githubExtension = vscode.extensions.getExtension('GitHub.vscode-pull-request-github');
            if (githubExtension && githubExtension.isActive) {
                const gitHubAPI = githubExtension.exports.getAPI(1);
                const repositories = gitHubAPI.getRepositories();
                
                if (repositories && repositories.length > 0) {
                    const repository = repositories[0];
                    // Format: https://github.com/{owner}/{repo}
                    return repository.remote.url;
                }
            }
            
            // Fallback to package.json if available
            const workspaces = vscode.workspace.workspaceFolders;
            if (workspaces && workspaces.length > 0) {
                const packageJsonPath = path.join(workspaces[0].uri.fsPath, 'package.json');
                try {
                    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
                    const packageJson = JSON.parse(packageJsonContent);
                    
                    if (packageJson.repository && packageJson.repository.url) {
                        return packageJson.repository.url;
                    }
                } catch {
                    // Failed to read package.json, continue to next method
                }
            }
            
            return undefined;
        } catch (error) {
            console.error('Error getting repository URL:', error);
            return undefined;
        }
    }

    /**
     * Get the current branch name of the workspace using git command
     */
    public static async getCurrentBranch(): Promise<string | undefined> {
        try {
            const workspaces = vscode.workspace.workspaceFolders;
            if (!workspaces || workspaces.length === 0) {
                return 'main'; // Default if no workspace
            }
            
            const workspaceRoot = workspaces[0].uri.fsPath;
            const { stdout } = await this.runCommand('git rev-parse --abbrev-ref HEAD', workspaceRoot);
            
            return stdout.trim() || 'main';
        } catch (error) {
            console.error('Error getting current branch:', error);
            return 'main';
        }
    }
    
    /**
     * Check if there are uncommitted changes in the workspace using git command
     */
    public static async hasUncommittedChanges(): Promise<boolean> {
        try {
            const workspaces = vscode.workspace.workspaceFolders;
            if (!workspaces || workspaces.length === 0) {
                return false;
            }
            
            const workspaceRoot = workspaces[0].uri.fsPath;
            const { stdout } = await this.runCommand('git status --porcelain', workspaceRoot);
            
            // If stdout has any content, there are uncommitted changes
            return stdout.trim().length > 0;
        } catch (error) {
            console.error('Error checking for uncommitted changes:', error);
            return false;
        }
    }

    /**
     * Run a command in the terminal
     */
    private static async runCommand(command: string, cwd: string): Promise<{stdout: string, stderr: string}> {
        try {
            return await execAsync(command, { cwd });
        } catch (error) {
            console.error(`Command execution failed: ${command}`, error);
            throw error;
        }
    }
}
