import * as vscode from 'vscode';
import { GitService } from '../utils/gitService';
import { WorkspaceService } from '../utils/workspaceService';
import { AcmeTreeDataProvider } from '../treeView/treeDataProvider';
import { EnvironmentTreeItem } from '../treeView/items/EnvironmentTreeItem';
import { DetailTreeItem } from '../treeView/items/DetailTreeItem';

export class ComparisonCommands {
    constructor(
        private readonly gitService: GitService,
        private readonly workspaceService: WorkspaceService,
        private readonly treeDataProvider: AcmeTreeDataProvider
    ) {}

    /**
     * Compare flow versions between deployments
     * @param item The tree item representing the environment to compare
     */
    public async compareFlowVersions(item: any): Promise<void> {
        try {
            // Check if the item is an EnvironmentTreeItem
            if (!item || !(item instanceof EnvironmentTreeItem)) {
                vscode.window.showErrorMessage('Please select an environment item to compare.');
                return;
            }

            // Get the source file path from the flow data
            const sourceFile = item.flowData.source_file;
            if (!sourceFile) {
                vscode.window.showErrorMessage('Flow source file information is missing.');
                return;
            }

            // Find all deployment details for this environment
            const tagItems = vscode.workspace.textDocuments.filter(doc => doc.uri.fsPath === sourceFile);
            if (tagItems.length === 0) {
                // Open the file first since it's not currently open
                await vscode.commands.executeCommand('acmeportal.openFlowFile', item);
            }

            // Extract the COMMIT_HASH from the environment's deployment
            let commitHash = '';
            
            // First, try to find it in the item's deploymentData
            if (item.deploymentData?.tags) {
                const commitTag = item.deploymentData.tags.find((tag: string) => tag.includes('COMMIT_HASH'));
                if (commitTag) {
                    commitHash = commitTag.split('=')[1];
                }
            }
            
            // If not found directly, try to find in the child nodes (detail items)
            if (!commitHash && item.id) {
                // Get environment details from the tree provider
                const childItems = await this.treeDataProvider.getChildren(item);
                
                // Look for a DetailTreeItem containing commit hash information
                for (const child of childItems) {
                    if (child instanceof DetailTreeItem && 
                        child.label.toString().startsWith('Commit: ')) {
                        commitHash = child.label.toString().replace('Commit: ', '');
                        break;
                    }
                }
            }

            if (!commitHash) {
                vscode.window.showInformationMessage(
                    'No commit hash found for this deployment. Please ensure the deployment has a COMMIT_HASH tag.',
                    'OK'
                );
                return;
            }

            // Check workspace root using workspace service directly
            const workspaceRoot = this.workspaceService.getWorkspaceRoot();
            if (!workspaceRoot) {
                return; // The getWorkspaceRoot function already shows an error message
            }
        
            // Get the current commit hash directly from git service
            let currentCommitHash;
            try {
                currentCommitHash = await this.gitService.getCurrentCommitHash();
                if (!currentCommitHash) {
                    throw new Error('Empty result when getting current commit');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to get current commit: ${error}`);
                return;
            }

            // Get the GitHub repository URL directly from git service
            let repoUrl;
            try {
                repoUrl = await this.gitService.getRepositoryUrl();
                if (!repoUrl) {
                    throw new Error('Could not get GitHub repository URL');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to get repository URL: ${error}`);
                return;
            }

            // Construct the comparison URL
            const compareUrl = `${repoUrl}/compare/${commitHash}..${currentCommitHash}`;

            // Show notification with warning about uncommitted changes and link to comparison
            vscode.window.showInformationMessage(
                'Opening GitHub comparison view between current commit and selected deployment. ' +
                'Note: Uncommitted changes on current branch won\'t be visible in the GitHub comparison view.',
                'View on GitHub'
            ).then(selection => {
                if (selection === 'View on GitHub') {
                    vscode.env.openExternal(vscode.Uri.parse(compareUrl));
                }
            });
            
        } catch (error) {
            console.error('Error comparing flow versions:', error);
            vscode.window.showErrorMessage(`Error comparing flow versions: ${error}`);
        }
    }
}
