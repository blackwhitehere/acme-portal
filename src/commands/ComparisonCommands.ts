import * as vscode from 'vscode';
import { GitService } from '../utils/gitService';
import { WorkspaceService } from '../utils/workspaceService';
import { FlowTreeDataProvider } from '../treeView/treeDataProvider';
import { EnvironmentTreeItem } from '../treeView/items/EnvironmentTreeItem';
import { DetailTreeItem } from '../treeView/items/DetailTreeItem';
import { DeploymentDetails } from '../actions/findDeployments';

interface ComparisonOption {
    label: string;
    description: string;
    value: 'deployment' | 'branch';
}

interface DeploymentOption {
    label: string;
    description: string;
    deploymentData: DeploymentDetails;
    commitHash?: string;
}

export class ComparisonCommands {
    constructor(
        private readonly gitService: GitService,
        private readonly workspaceService: WorkspaceService,
        private readonly treeDataProvider: FlowTreeDataProvider
    ) {}

    /**
     * Find all deployments available for comparison
     * @returns List of deployment options
     */
    private async getDeploymentOptions(): Promise<DeploymentOption[]> {
        const options: DeploymentOption[] = [];
        
        // Get all environments from the tree view
        const rootItems = await this.treeDataProvider.getChildren();
        
        // Helper function to recursively search for environment items
        const findEnvironmentItems = async (items: any[]): Promise<void> => {
            for (const item of items) {
                if (item instanceof EnvironmentTreeItem && item.deploymentData) {
                    const commitHash = item.deploymentData.commit_hash;
                    if (commitHash) {
                        options.push({
                            label: `${item.deploymentData.flow_name} (${item.deploymentData.branch}/${item.environmentName})`,
                            description: `Commit: ${commitHash.substring(0, 7)}`,
                            deploymentData: item.deploymentData,
                            commitHash
                        });
                    }
                }
                
                // Check children
                const children = await this.treeDataProvider.getChildren(item);
                if (children && children.length > 0) {
                    await findEnvironmentItems(children);
                }
            }
        };
        
        await findEnvironmentItems(rootItems);
        return options;
    }

    /**
     * Compare flow versions between deployments
     * @param item The tree item representing the environment to compare
     */
    public async compareFlowVersions(item: any): Promise<void> {
        // Show progress notification during comparison setup
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Setting up flow comparison',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 10, message: 'Validating selection...' });
                
                // Check if the item is an EnvironmentTreeItem
                if (!item || !(item instanceof EnvironmentTreeItem)) {
                    vscode.window.showErrorMessage('Please select an environment item to compare.');
                    return;
                }

                // Get the source file path from the flow data
                const sourceFile = item.flowData.source_path;
                if (!sourceFile) {
                    vscode.window.showErrorMessage('Flow source file information is missing.');
                    return;
                }

                progress.report({ increment: 20, message: 'Extracting commit information...' });

                // Extract the COMMIT_HASH from the environment's deployment
                let sourceCommitHash = item.deploymentData.commit_hash;
                
                // If not found directly, try to find in the child nodes (detail items)
                if (!sourceCommitHash && item.id) {
                    const childItems = await this.treeDataProvider.getChildren(item);
                    
                    // Look for a DetailTreeItem containing commit hash information
                    for (const child of childItems) {
                        if (child instanceof DetailTreeItem && 
                            child.label.toString().startsWith('Commit: ')) {
                            sourceCommitHash = child.label.toString().replace('Commit: ', '');
                            break;
                        }
                    }
                }

                if (!sourceCommitHash) {
                    vscode.window.showInformationMessage(
                        'No commit hash found for this deployment. Please ensure the deployment has a COMMIT_HASH tag.',
                        'OK'
                    );
                    return;
                }

                progress.report({ increment: 40, message: 'Preparing comparison options...' });

                // Ask user how they want to compare
                const comparisonOptions: ComparisonOption[] = [
                    {
                        label: 'Compare with another deployment',
                        description: 'Compare against a commit from another deployed environment',
                        value: 'deployment'
                    },
                    {
                        label: 'Compare with local branch',
                        description: 'Compare against the HEAD of a local Git branch',
                        value: 'branch'
                    }
                ];

                const selectedOption = await vscode.window.showQuickPick(comparisonOptions, {
                    placeHolder: 'How would you like to compare this deployment?'
                });

                if (!selectedOption) {
                    return; // User cancelled
                }

                progress.report({ increment: 60, message: 'Getting comparison target...' });

                let targetCommitHash: string | undefined;
                
                if (selectedOption.value === 'deployment') {
                    // Get deployment options
                    const deploymentOptions = await this.getDeploymentOptions();
                    
                    if (deploymentOptions.length === 0) {
                        vscode.window.showInformationMessage('No deployments found for comparison.');
                        return;
                    }
                    
                    // Filter out the current deployment
                    const filteredOptions = deploymentOptions.filter(
                        opt => opt.commitHash !== sourceCommitHash
                    );
                    
                    if (filteredOptions.length === 0) {
                        vscode.window.showInformationMessage('No other deployments found for comparison.');
                        return;
                    }
                    
                    const selectedDeployment = await vscode.window.showQuickPick(filteredOptions, {
                        placeHolder: 'Select a deployment to compare against'
                    });
                    
                    if (!selectedDeployment) {
                        return; // User cancelled
                    }
                    
                    targetCommitHash = selectedDeployment.commitHash;
                    
                } else {
                    // Get local branches
                    const branches = await this.gitService.getLocalBranches();
                    
                    if (!branches || branches.length === 0) {
                        vscode.window.showErrorMessage('No local branches found.');
                        return;
                    }
                    
                    const branchOptions = branches.map(branch => ({
                        label: branch,
                        description: 'Local branch'
                    }));

                    const selectedBranch = await vscode.window.showQuickPick(branchOptions, {
                        placeHolder: 'Select a branch to compare against'
                    });
                    
                    if (!selectedBranch) {
                        return; // User cancelled
                    }
                    
                    targetCommitHash = await this.gitService.getBranchCommitHash(selectedBranch.label);
                    
                    if (!targetCommitHash) {
                        vscode.window.showErrorMessage(`Could not get commit hash for branch ${selectedBranch.label}`);
                        return;
                    }
                }

                progress.report({ increment: 80, message: 'Building comparison URL...' });

                // Get the GitHub repository URL directly from git service
                const repoUrl = await this.gitService.getRepositoryUrl();
                if (!repoUrl) {
                    vscode.window.showErrorMessage('Could not get GitHub repository URL');
                    return;
                }

                // Construct the comparison URL
                const compareUrl = `${repoUrl}/compare/${sourceCommitHash}..${targetCommitHash}`;

                progress.report({ increment: 100, message: 'Comparison ready!' });

                // Show notification with link to comparison
                vscode.window.showInformationMessage(
                    `✅ GitHub comparison view is ready.`,
                    'View on GitHub'
                ).then(selection => {
                    if (selection === 'View on GitHub') {
                        vscode.env.openExternal(vscode.Uri.parse(compareUrl));
                    }
                });
                
            } catch (error) {
                console.error('Error comparing flow versions:', error);
                vscode.window.showErrorMessage(`❌ Error comparing flow versions: ${error}`);
            }
        });
    }
}
