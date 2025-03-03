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
     * Get the workspace root directory
     */
    public static getWorkspaceRoot(): string | undefined {
        const workspaces = vscode.workspace.workspaceFolders;
        if (!workspaces || workspaces.length === 0) {
            vscode.window.showErrorMessage('No workspace folder is open.');
            return undefined;
        }
        
        return workspaces[0].uri.fsPath;
    }

    /**
     * Trigger a GitHub Actions workflow using multiple methods if needed
     */
    public static async triggerWorkflow(
        workflowFile: string, 
        workflowInputs: WorkflowInput,
        workflowRef: string = 'main'
    ): Promise<string | undefined> {
        try {
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
     * Attempt to trigger workflow via GitHub CLI
     */
    private static async triggerWorkflowViaGitHubCLI(
        workflowFile: string,
        workflowInputs: WorkflowInput,
        workflowRef: string
    ): Promise<string | undefined> {
        try {
            const workspaceRoot = this.getWorkspaceRoot();
            if (!workspaceRoot) {
                return undefined;
            }

            const inputArgs = Object.entries(workflowInputs).map(([key, value]) => `-f ${key}=${value}`).join(' ');
            const command = `gh workflow run ${workflowFile} -r ${workflowRef} ${inputArgs}`;
            const { stdout } = await this.runCommand(command, workspaceRoot);
            console.log('Workflow triggered, getting run info...');
            // Extract the workflow filename from the path if needed
            const workflowName = path.basename(workflowFile);
            // Wait briefly to ensure the workflow has been registered
            await new Promise(resolve => setTimeout(resolve, 2000));
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
     * Create a URL for a GitHub repository
     */
    public static async getRepositoryUrl(): Promise<string | undefined> {
        try {
            const workspaceRoot = this.getWorkspaceRoot();
            if (!workspaceRoot) {
                return undefined;
            }
            
            // Get the remote URL (usually origin)
            const { stdout } = await this.runCommand('git config --get remote.origin.url', workspaceRoot);
            
            if (!stdout.trim()) {
                return undefined;
            }
            
            let url = stdout.trim();
            
            // Convert SSH URL format to HTTPS URL format
            // Example: git@github.com:username/repo.git -> https://github.com/username/repo
            if (url.startsWith('git@github.com:')) {
                url = url.replace('git@github.com:', 'https://github.com/');
            }
            
            // Remove .git suffix if it exists
            if (url.endsWith('.git')) {
                url = url.substring(0, url.length - 4);
            }
            
            return url;
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
            const workspaceRoot = this.getWorkspaceRoot();
            if (!workspaceRoot) {
                return 'main'; // Default if no workspace
            }
            
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
            const workspaceRoot = this.getWorkspaceRoot();
            if (!workspaceRoot) {
                return false;
            }
            
            const { stdout } = await this.runCommand('git status --porcelain', workspaceRoot);
            
            // If stdout has any content, there are uncommitted changes
            return stdout.trim().length > 0;
        } catch (error) {
            console.error('Error checking for uncommitted changes:', error);
            return false;
        }
    }

    /**
     * Get the current commit hash of the workspace
     */
    public static async getCurrentCommitHash(): Promise<string | undefined> {
        try {
            const workspaceRoot = this.getWorkspaceRoot();
            if (!workspaceRoot) {
                return undefined;
            }
            
            const { stdout } = await this.runCommand('git rev-parse HEAD', workspaceRoot);
            return stdout.trim();
        } catch (error) {
            console.error('Error getting current commit hash:', error);
            return undefined;
        }
    }

    /**
     * Run a command in the terminal
     */
    public static async runCommand(command: string, cwd: string): Promise<{stdout: string, stderr: string}> {
        try {
            return await execAsync(command, { cwd });
        } catch (error) {
            console.error(`Command execution failed: ${command}`, error);
            throw error;
        }
    }
}
