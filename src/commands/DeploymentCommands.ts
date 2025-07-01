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
        let additionalContext: Record<string, any> | undefined = undefined;
        
        // Check if we're deploying a flow from the tree
        if (item instanceof FlowTreeItem) {
            flowName = item.flowData.name || '';
            
            // Extract additional context from child_attributes if present
            if (item.flowData.child_attributes) {
                additionalContext = item.flowData.child_attributes;
            }
            
            console.log(`Deploying from flow item: flow=${flowName}`);
            if (additionalContext) {
                console.log(`Additional context available:`, additionalContext);
            }
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
            
            // Extract additional context from selected flow's child_attributes if present
            if (selectedFlow.flow.child_attributes) {
                additionalContext = selectedFlow.flow.child_attributes;
                console.log(`Additional context from selected flow:`, additionalContext);
            }
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
            // Show progress notification during deployment
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Deploying flow "${flowName}"`,
                cancellable: false
            }, async (progress) => {
                try {
                    progress.report({ increment: 10, message: 'Starting deployment...' });
                    
                    // Use the FlowDeployer to handle deployment
                    progress.report({ increment: 30, message: 'Triggering deployment workflow...' });
                    const runUrl = await FlowDeployer.deployFlows(
                        [flowName],
                        branchName,
                        additionalContext
                    );
                    
                    progress.report({ increment: 90, message: 'Deployment workflow started' });
                    
                    if (runUrl) {
                        progress.report({ increment: 100, message: 'Deployment initiated successfully!' });
                        
                        // Show success notification with link
                        vscode.window.showInformationMessage(
                            `✅ Started deployment of flow "${flowName}" on branch ${branchName}`,
                            'View Workflow'
                        ).then(selection => {
                            if (selection === 'View Workflow') {
                                vscode.env.openExternal(vscode.Uri.parse(runUrl));
                            }
                        });
                    } else {
                        progress.report({ increment: 100, message: 'Deployment failed to start' });
                        vscode.window.showErrorMessage('❌ Failed to start deployment. Please check the logs for more details.');
                    }
                } catch (error) {
                    progress.report({ increment: 100, message: 'Deployment failed' });
                    vscode.window.showErrorMessage(`❌ Failed to deploy flow: ${error}`);
                }
            });
        }
    }
}
