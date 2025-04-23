import * as vscode from 'vscode';
import { GitService } from '../utils/gitService';
import { FindFlows } from '../actions/findFlows';
import { FlowTreeItem } from '../treeView/items/FlowTreeItem';
import { FlowDeployer } from '../actions/deploy';

export class DeploymentCommands {
    constructor(
        private readonly gitService: GitService
    ) {}

    /**
     * Deploy a flow to an environment
     * @param item The tree item representing the flow or null to select a flow
     */
    public async deployFlow(item: any): Promise<void> {
        let flowName = '';
        let branchName = '';
        
        // Check if we're deploying a flow from the tree
        if (item instanceof FlowTreeItem) {
            flowName = item.flowData.name || '';
            console.log(`Deploying from flow item: flow=${flowName}`);
        }
        
        // If no valid data, let user select from available flows
        if (!flowName) {
            const flows = await FindFlows.scanForFlows();
            if (flows.length === 0) {
                vscode.window.showInformationMessage('No flows found to deploy.');
                return;
            }
            
            const flowItems = flows.map(flow => ({ 
                label: flow.name,
                detail: flow.module || flow.source_path,
                description: flow.description,
                flow
            }));
            
            const selectedFlow = await vscode.window.showQuickPick(flowItems, {
                title: 'Select Flow to Deploy',
                placeHolder: 'Choose a flow'
            });
            
            if (!selectedFlow) {
                return; // User cancelled
            }
            
            flowName = selectedFlow.label;
        }
        
        // Get current branch
        branchName = await this.gitService.getCurrentBranch() || 'main';
        
        // Check for uncommitted changes and warn if present
        const hasUncommittedChanges = await this.gitService.hasUncommittedChanges();
        if (hasUncommittedChanges) {
            const warningResult = await vscode.window.showWarningMessage(
                'There are uncommitted changes in your workspace. These changes will not be reflected in the deployment.',
                'Continue Anyway',
                'Cancel'
            );
            
            if (warningResult !== 'Continue Anyway') {
                return; // User cancelled
            }
        }
        
        // Ask for branch name, prepopulated with current branch
        const userBranchName = await vscode.window.showInputBox({
            title: 'Branch Name for Deployment',
            prompt: 'Enter the branch name where the workflow should run',
            value: branchName,
            placeHolder: 'e.g., main, master, develop',
            validateInput: value => {
                if (!value || value.trim().length === 0) {
                    return 'Branch name cannot be empty';
                }
                return null;
            }
        });
        
        if (!userBranchName) {
            return; // User cancelled
        }
        
        branchName = userBranchName;
        
        // Confirm deployment
        const confirmation = await vscode.window.showInformationMessage(
            `Deploy flow "${flowName}" using branch ${branchName}?`,
            { modal: true },
            'Deploy'
        );
        
        if (confirmation === 'Deploy') {
            try {
                // Use the FlowDeployer to handle deployment
                const runUrl = await FlowDeployer.deployFlows(
                    [flowName],
                    branchName
                );
                
                if (runUrl) {
                    vscode.window.showInformationMessage(
                        `Started deployment of flow "${flowName}" on branch ${branchName}`,
                        'View Workflow'
                    ).then(selection => {
                        if (selection === 'View Workflow') {
                            vscode.env.openExternal(vscode.Uri.parse(runUrl));
                        }
                    });
                }
                else {
                    vscode.window.showErrorMessage('Failed to start deployment. Please check the logs for more details.');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to deploy flow: ${error}`);
            }
        }
    }
}
