import * as vscode from 'vscode';
import { GitService } from '../utils/gitService';
import { FindFlows } from '../actions/findFlows';
import { FlowTreeItem } from '../treeView/items/FlowTreeItem';
import { FlowDeployer } from '../actions/deploy';
import { PreConditionChecker } from '../utils/preConditionChecker';
import { GroupUtils } from '../utils/groupUtils';
import { GroupTreeItem } from '../treeView/items/GroupTreeItem';

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
            // Check preconditions before scanning for flows
            const preConditionChecker = new PreConditionChecker();
            const results = await preConditionChecker.checkAllPreconditions();
            
            if (!results.allPassed) {
                PreConditionChecker.displayResults(results);
                return;
            }
            
            const flows = await FindFlows.scanForFlows();
            if (flows.length === 0) {
                vscode.window.showInformationMessage('No flows found to deploy.');
                return;
            }
            
            const flowItems = flows.map(flow => ({ 
                label: flow.name,
                detail: flow.child_attributes?.['module'] || flow.source_path,
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

    /**
     * Deploy all flows in a specified group
     */
    public async deployFlowGroup(): Promise<void> {
        // Check preconditions before proceeding
        const preConditionChecker = new PreConditionChecker();
        const results = await preConditionChecker.checkAllPreconditions();
        
        if (!results.allPassed) {
            PreConditionChecker.displayResults(results);
            return;
        }

        // Get available flows
        const flows = await FindFlows.scanForFlows();
        if (flows.length === 0) {
            vscode.window.showInformationMessage('No flows found to deploy.');
            return;
        }

        // Ask user for group path
        const groupPath = await vscode.window.showInputBox({
            title: 'Deploy Flow Group',
            prompt: 'Enter the group path to deploy (e.g., "aaa/bbb/ccc")',
            placeHolder: 'group/subgroup/category',
            validateInput: value => {
                if (!value || value.trim().length === 0) {
                    return 'Group path cannot be empty';
                }
                // Basic validation for path format
                if (value.includes('//') || value.startsWith('/') || value.endsWith('/')) {
                    return 'Invalid group path format. Use format like "aaa/bbb/ccc"';
                }
                return null;
            }
        });

        if (!groupPath) {
            return; // User cancelled
        }

        // Find flows matching the group path
        const matchingFlows = GroupUtils.findFlowsByGroupPath(flows, groupPath);
        
        if (matchingFlows.length === 0) {
            vscode.window.showInformationMessage(`No flows found for group "${groupPath}".`);
            return;
        }

        // Show flows that will be deployed and ask for confirmation
        const flowNames = matchingFlows.map(flow => flow.name);
        const flowsList = flowNames.join(', ');
        
        const confirmation = await vscode.window.showInformationMessage(
            `Deploy ${matchingFlows.length} flow(s) in group "${GroupUtils.getGroupDisplayName(groupPath)}"?\n\nFlows: ${flowsList}`,
            { modal: true },
            'Deploy All'
        );

        if (confirmation !== 'Deploy All') {
            return; // User cancelled
        }

        // Get current branch
        let branchName = await this.gitService.getCurrentBranch() || 'main';
        
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
            title: 'Branch Name for Group Deployment',
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

        // Deploy all flows in the group
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Deploying ${matchingFlows.length} flows from group "${GroupUtils.getGroupDisplayName(groupPath)}"`,
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 10, message: 'Starting group deployment...' });
                
                // Collect additional context from all flows (if any have child_attributes)
                const additionalContexts: Record<string, any>[] = [];
                for (const flow of matchingFlows) {
                    if (flow.child_attributes) {
                        additionalContexts.push(flow.child_attributes);
                    }
                }
                
                // For group deployment, we'll use the first flow's additional context if available
                // In the future, this could be enhanced to merge contexts appropriately
                const additionalContext = additionalContexts.length > 0 ? additionalContexts[0] : undefined;
                
                progress.report({ increment: 30, message: 'Triggering deployment workflow...' });
                
                // Use the FlowDeployer to handle deployment of all flows
                const runUrl = await FlowDeployer.deployFlows(
                    flowNames,
                    branchName,
                    additionalContext
                );
                
                progress.report({ increment: 90, message: 'Group deployment workflow started' });
                
                if (runUrl) {
                    progress.report({ increment: 100, message: 'Group deployment initiated successfully!' });
                    
                    // Show success notification with link
                    vscode.window.showInformationMessage(
                        `✅ Started deployment of ${matchingFlows.length} flows from group "${GroupUtils.getGroupDisplayName(groupPath)}" on branch ${branchName}`,
                        'View Workflow'
                    ).then(selection => {
                        if (selection === 'View Workflow') {
                            vscode.env.openExternal(vscode.Uri.parse(runUrl));
                        }
                    });
                } else {
                    progress.report({ increment: 100, message: 'Group deployment failed to start' });
                    vscode.window.showErrorMessage('❌ Failed to start group deployment. Please check the logs for more details.');
                }
            } catch (error) {
                progress.report({ increment: 100, message: 'Group deployment failed' });
                vscode.window.showErrorMessage(`❌ Failed to deploy flow group: ${error}`);
            }
        });
    }

    /**
     * Deploy flows in a group from a tree view context (right-click on group)
     * @param item The GroupTreeItem representing the group
     */
    public async deployFlowGroupFromContext(item: GroupTreeItem): Promise<void> {
        if (!item || !item.fullGroupPath) {
            vscode.window.showErrorMessage('Invalid group selected for deployment.');
            return;
        }

        // Check preconditions before proceeding
        const preConditionChecker = new PreConditionChecker();
        const results = await preConditionChecker.checkAllPreconditions();
        
        if (!results.allPassed) {
            PreConditionChecker.displayResults(results);
            return;
        }

        // Get available flows
        const flows = await FindFlows.scanForFlows();
        if (flows.length === 0) {
            vscode.window.showInformationMessage('No flows found to deploy.');
            return;
        }

        // Find flows matching the group path
        const matchingFlows = GroupUtils.findFlowsByGroupPath(flows, item.fullGroupPath);
        
        if (matchingFlows.length === 0) {
            vscode.window.showInformationMessage(`No flows found for group "${item.fullGroupPath}".`);
            return;
        }

        // Show flows that will be deployed and ask for confirmation
        const flowNames = matchingFlows.map(flow => flow.name);
        const flowsList = flowNames.join(', ');
        
        const confirmation = await vscode.window.showInformationMessage(
            `Deploy ${matchingFlows.length} flow(s) in group "${GroupUtils.getGroupDisplayName(item.fullGroupPath)}"?\n\nFlows: ${flowsList}`,
            { modal: true },
            'Deploy All'
        );

        if (confirmation !== 'Deploy All') {
            return; // User cancelled
        }

        // Get current branch
        let branchName = await this.gitService.getCurrentBranch() || 'main';
        
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
            title: 'Branch Name for Group Deployment',
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

        // Deploy all flows in the group using the same logic as deployFlowGroup
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Deploying ${matchingFlows.length} flows from group "${GroupUtils.getGroupDisplayName(item.fullGroupPath)}"`,
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 10, message: 'Starting group deployment...' });
                
                // Collect additional context from all flows (if any have child_attributes)
                const additionalContexts: Record<string, any>[] = [];
                for (const flow of matchingFlows) {
                    if (flow.child_attributes) {
                        additionalContexts.push(flow.child_attributes);
                    }
                }
                
                // For group deployment, we'll use the first flow's additional context if available
                const additionalContext = additionalContexts.length > 0 ? additionalContexts[0] : undefined;
                
                progress.report({ increment: 30, message: 'Triggering deployment workflow...' });
                
                // Use the FlowDeployer to handle deployment of all flows
                const runUrl = await FlowDeployer.deployFlows(
                    flowNames,
                    branchName,
                    additionalContext
                );
                
                progress.report({ increment: 90, message: 'Group deployment workflow started' });
                
                if (runUrl) {
                    progress.report({ increment: 100, message: 'Group deployment initiated successfully!' });
                    
                    // Show success notification with link
                    vscode.window.showInformationMessage(
                        `✅ Started deployment of ${matchingFlows.length} flows from group "${GroupUtils.getGroupDisplayName(item.fullGroupPath!)}" on branch ${branchName}`,
                        'View Workflow'
                    ).then(selection => {
                        if (selection === 'View Workflow') {
                            vscode.env.openExternal(vscode.Uri.parse(runUrl));
                        }
                    });
                } else {
                    progress.report({ increment: 100, message: 'Group deployment failed to start' });
                    vscode.window.showErrorMessage('❌ Failed to start group deployment. Please check the logs for more details.');
                }
            } catch (error) {
                progress.report({ increment: 100, message: 'Group deployment failed' });
                vscode.window.showErrorMessage(`❌ Failed to deploy flow group: ${error}`);
            }
        });
    }
}
