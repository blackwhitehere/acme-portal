import * as vscode from 'vscode';
import { GitService } from '../utils/gitService';
import { FindFlows } from '../actions/findFlows';
import { FlowTreeItem } from '../treeView/items/FlowTreeItem';
import { EnvironmentTreeItem } from '../treeView/items/EnvironmentTreeItem';
import { FlowPromoter } from '../actions/promote';
import { PreConditionChecker } from '../utils/preConditionChecker';
import { GroupUtils } from '../utils/groupUtils';
import { GroupTreeItem } from '../treeView/items/GroupTreeItem';

export class PromotionCommands {
    constructor(
        private readonly gitService: GitService
    ) {}

    /**
     * Promote a flow from one environment to another
     * @param item The tree item representing the flow or environment
     */
    public async promoteEnvironment(item: any): Promise<void> {
        let flowName = '';
        let sourceEnv = '';
        let branchName = '';
        let additionalContext: Record<string, any> | undefined = undefined;
        
        // Check if we're promoting from an environment
        if (item instanceof EnvironmentTreeItem) {
            flowName = item.flowData.name || '';
            sourceEnv = item.getEnvironmentName();
            
            // Extract additional context from flow's child_attributes if present
            if (item.flowData.child_attributes) {
                additionalContext = item.flowData.child_attributes;
                console.log(`Additional context available:`, additionalContext);
            }
            
            // Try to extract branch name from parent ID
            if (item.parentId && item.parentId.includes('Branch:')) {
                // The parent ID for environment items contains "Branch: branchName"
                const branchPrefix = 'Branch: ';
                const parentIdParts = item.parentId.split('-');
                for (const part of parentIdParts) {
                    if (part.startsWith(branchPrefix)) {
                        branchName = part.substring(branchPrefix.length);
                        console.log(`Using branch from environment item: ${branchName}`);
                        break;
                    }
                }
            }
            
            console.log(`Promoting from environment item: flow=${flowName}, sourceEnv=${sourceEnv}, branch=${branchName}`);
        } 
        // Check if we're promoting from a flow
        else if (item instanceof FlowTreeItem) {
            flowName = item.flowData.name || '';
            
            // Extract additional context from flow's child_attributes if present
            if (item.flowData.child_attributes) {
                additionalContext = item.flowData.child_attributes;
            }
            
            console.log(`Promoting from flow item: flow=${flowName}`);
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
                vscode.window.showInformationMessage('No flows found to promote.');
                return;
            }
            
            const flowItems = flows.map(flow => ({ 
                label: flow.name,
                detail: flow.source_relative,
                description: flow.description,
                flow
            }));
            
            const selectedFlow = await vscode.window.showQuickPick(flowItems, {
                title: 'Select Flow to Promote',
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
        
        // If source environment not set from tree item, prompt user
        if (!sourceEnv) {
            const userSourceEnv = await vscode.window.showInputBox({
                title: 'Source Environment',
                prompt: 'Enter the source environment (e.g., dev, tst, prd)',
                placeHolder: 'e.g., dev, tst, prd',
                validateInput: value => {
                    if (!value || value.trim().length === 0) {
                        return 'Source environment cannot be empty';
                    }
                    return null;
                }
            });
            
            if (!userSourceEnv) {
                return; // User cancelled
            }
            else {
                sourceEnv = userSourceEnv;
            }
        }
        
        // Get target environment using input box
        const targetEnv = await vscode.window.showInputBox({
            title: 'Target Environment',
            prompt: 'Enter the target environment (e.g., dev, tst, prd)',
            placeHolder: 'e.g., tst, prd',
            validateInput: value => {
                if (!value || value.trim().length === 0) {
                    return 'Target environment cannot be empty';
                }
                if (value.trim().toLowerCase() === sourceEnv.toLowerCase()) {
                    return 'Target environment must be different from source environment';
                }
                return null;
            }
        });

        if (!targetEnv) {
            return; // User cancelled
        }
        
        // Get current branch if not already set from tree item
        if (!branchName) {
            branchName = await this.gitService.getCurrentBranch() || 'main';
        }
        
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
        
        // Ask for branch name, prepopulating with the one we got from environment or getCurrentBranch
        const userBranchName = await vscode.window.showInputBox({
            title: 'Branch Name for Workflow',
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
        
        branchName = userBranchName; // Update the branch name with user input
        
        // Confirm promotion
        const confirmation = await vscode.window.showInformationMessage(
            `Promote flow "${flowName}" from ${sourceEnv} to ${targetEnv} using branch ${branchName}?`,
            { modal: true },
            'Promote'
        );
        
        if (confirmation === 'Promote') {
            // Show progress notification during promotion
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Promoting flow "${flowName}"`,
                cancellable: false
            }, async (progress) => {
                try {
                    progress.report({ increment: 10, message: 'Starting promotion...' });
                    
                    // Use the new FlowPromoter to handle promotion
                    progress.report({ increment: 30, message: `Promoting from ${sourceEnv} to ${targetEnv}...` });
                    const runUrl = await FlowPromoter.promoteFlows(
                        [flowName],
                        sourceEnv,
                        targetEnv,
                        branchName,
                        additionalContext
                    );
                    
                    progress.report({ increment: 90, message: 'Promotion workflow started' });
                    
                    if (runUrl) {
                        progress.report({ increment: 100, message: 'Promotion initiated successfully!' });
                        
                        // Show success notification with link
                        vscode.window.showInformationMessage(
                            `✅ Started promotion of flow "${flowName}" from ${sourceEnv} to ${targetEnv} on branch ${branchName}`,
                            'View Workflow'
                        ).then(selection => {
                            if (selection === 'View Workflow') {
                                vscode.env.openExternal(vscode.Uri.parse(runUrl));
                            }
                        });
                    } else {
                        progress.report({ increment: 100, message: 'Promotion failed to start' });
                        vscode.window.showErrorMessage('❌ Failed to start promotion. Please check the logs for more details.');
                    }
                } catch (error) {
                    progress.report({ increment: 100, message: 'Promotion failed' });
                    vscode.window.showErrorMessage(`❌ Failed to promote flow: ${error}`);
                }
            });
        }
    }

    /**
     * Promote all flows in a specified group from one environment to another
     */
    public async promoteFlowGroup(): Promise<void> {
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
            vscode.window.showInformationMessage('No flows found to promote.');
            return;
        }

        // Ask user for group path
        const groupPath = await vscode.window.showInputBox({
            title: 'Promote Flow Group',
            prompt: 'Enter the group path to promote (e.g., "aaa/bbb/ccc")',
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

        // Show flows that will be promoted and ask for confirmation
        const flowNames = matchingFlows.map(flow => flow.name);
        const flowsList = flowNames.join(', ');
        
        const confirmation = await vscode.window.showInformationMessage(
            `Promote ${matchingFlows.length} flow(s) in group "${GroupUtils.getGroupDisplayName(groupPath)}"?\n\nFlows: ${flowsList}`,
            { modal: true },
            'Promote All'
        );

        if (confirmation !== 'Promote All') {
            return; // User cancelled
        }

        // Ask for source environment
        const sourceEnv = await vscode.window.showInputBox({
            title: 'Source Environment',
            prompt: 'Enter the source environment to promote from',
            placeHolder: 'e.g., dev, staging',
            validateInput: value => {
                if (!value || value.trim().length === 0) {
                    return 'Source environment cannot be empty';
                }
                return null;
            }
        });

        if (!sourceEnv) {
            return; // User cancelled
        }

        // Ask for target environment
        const targetEnv = await vscode.window.showInputBox({
            title: 'Target Environment',
            prompt: 'Enter the target environment to promote to',
            placeHolder: 'e.g., prod, production',
            validateInput: value => {
                if (!value || value.trim().length === 0) {
                    return 'Target environment cannot be empty';
                }
                if (value.trim() === sourceEnv.trim()) {
                    return 'Target environment must be different from source environment';
                }
                return null;
            }
        });

        if (!targetEnv) {
            return; // User cancelled
        }

        // Get current branch
        let branchName = await this.gitService.getCurrentBranch() || 'main';
        
        // Ask for branch name, prepopulated with current branch
        const userBranchName = await vscode.window.showInputBox({
            title: 'Branch Name for Group Promotion',
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

        // Promote all flows in the group
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Promoting ${matchingFlows.length} flows from group "${GroupUtils.getGroupDisplayName(groupPath)}"`,
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 10, message: 'Starting group promotion...' });
                
                // Collect additional context from all flows (if any have child_attributes)
                const additionalContexts: Record<string, any>[] = [];
                for (const flow of matchingFlows) {
                    if (flow.child_attributes) {
                        additionalContexts.push(flow.child_attributes);
                    }
                }
                
                // For group promotion, we'll use the first flow's additional context if available
                // In the future, this could be enhanced to merge contexts appropriately
                const additionalContext = additionalContexts.length > 0 ? additionalContexts[0] : undefined;
                
                progress.report({ increment: 30, message: 'Triggering promotion workflow...' });
                
                // Use the FlowPromoter to handle promotion of all flows
                const runUrl = await FlowPromoter.promoteFlows(
                    flowNames,
                    sourceEnv,
                    targetEnv,
                    branchName,
                    additionalContext
                );
                
                progress.report({ increment: 90, message: 'Group promotion workflow started' });
                
                if (runUrl) {
                    progress.report({ increment: 100, message: 'Group promotion initiated successfully!' });
                    
                    // Show success notification with link
                    vscode.window.showInformationMessage(
                        `✅ Started promotion of ${matchingFlows.length} flows from group "${GroupUtils.getGroupDisplayName(groupPath)}" (${sourceEnv} → ${targetEnv}) on branch ${branchName}`,
                        'View Workflow'
                    ).then(selection => {
                        if (selection === 'View Workflow') {
                            vscode.env.openExternal(vscode.Uri.parse(runUrl));
                        }
                    });
                } else {
                    progress.report({ increment: 100, message: 'Group promotion failed to start' });
                    vscode.window.showErrorMessage('❌ Failed to start group promotion. Please check the logs for more details.');
                }
            } catch (error) {
                progress.report({ increment: 100, message: 'Group promotion failed' });
                vscode.window.showErrorMessage(`❌ Failed to promote flow group: ${error}`);
            }
        });
    }

    /**
     * Promote flows in a group from a tree view context (right-click on group)
     * @param item The GroupTreeItem representing the group
     */
    public async promoteFlowGroupFromContext(item: GroupTreeItem): Promise<void> {
        if (!item || !item.fullGroupPath) {
            vscode.window.showErrorMessage('Invalid group selected for promotion.');
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
            vscode.window.showInformationMessage('No flows found to promote.');
            return;
        }

        // Find flows matching the group path
        const matchingFlows = GroupUtils.findFlowsByGroupPath(flows, item.fullGroupPath);
        
        if (matchingFlows.length === 0) {
            vscode.window.showInformationMessage(`No flows found for group "${item.fullGroupPath}".`);
            return;
        }

        // Show flows that will be promoted and ask for confirmation
        const flowNames = matchingFlows.map(flow => flow.name);
        const flowsList = flowNames.join(', ');
        
        const confirmation = await vscode.window.showInformationMessage(
            `Promote ${matchingFlows.length} flow(s) in group "${GroupUtils.getGroupDisplayName(item.fullGroupPath)}"?\n\nFlows: ${flowsList}`,
            { modal: true },
            'Promote All'
        );

        if (confirmation !== 'Promote All') {
            return; // User cancelled
        }

        // Ask for source environment
        const sourceEnv = await vscode.window.showInputBox({
            title: 'Source Environment',
            prompt: 'Enter the source environment to promote from',
            placeHolder: 'e.g., dev, staging',
            validateInput: value => {
                if (!value || value.trim().length === 0) {
                    return 'Source environment cannot be empty';
                }
                return null;
            }
        });

        if (!sourceEnv) {
            return; // User cancelled
        }

        // Ask for target environment
        const targetEnv = await vscode.window.showInputBox({
            title: 'Target Environment',
            prompt: 'Enter the target environment to promote to',
            placeHolder: 'e.g., prod, production',
            validateInput: value => {
                if (!value || value.trim().length === 0) {
                    return 'Target environment cannot be empty';
                }
                if (value.trim() === sourceEnv.trim()) {
                    return 'Target environment must be different from source environment';
                }
                return null;
            }
        });

        if (!targetEnv) {
            return; // User cancelled
        }

        // Get current branch
        let branchName = await this.gitService.getCurrentBranch() || 'main';
        
        // Ask for branch name, prepopulated with current branch
        const userBranchName = await vscode.window.showInputBox({
            title: 'Branch Name for Group Promotion',
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

        // Promote all flows in the group
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Promoting ${matchingFlows.length} flows from group "${GroupUtils.getGroupDisplayName(item.fullGroupPath)}"`,
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 10, message: 'Starting group promotion...' });
                
                // Collect additional context from all flows (if any have child_attributes)
                const additionalContexts: Record<string, any>[] = [];
                for (const flow of matchingFlows) {
                    if (flow.child_attributes) {
                        additionalContexts.push(flow.child_attributes);
                    }
                }
                
                // For group promotion, we'll use the first flow's additional context if available
                const additionalContext = additionalContexts.length > 0 ? additionalContexts[0] : undefined;
                
                progress.report({ increment: 30, message: 'Triggering promotion workflow...' });
                
                // Use the FlowPromoter to handle promotion of all flows
                const runUrl = await FlowPromoter.promoteFlows(
                    flowNames,
                    sourceEnv,
                    targetEnv,
                    branchName,
                    additionalContext
                );
                
                progress.report({ increment: 90, message: 'Group promotion workflow started' });
                
                if (runUrl) {
                    progress.report({ increment: 100, message: 'Group promotion initiated successfully!' });
                    
                    // Show success notification with link
                    vscode.window.showInformationMessage(
                        `✅ Started promotion of ${matchingFlows.length} flows from group "${GroupUtils.getGroupDisplayName(item.fullGroupPath!)}" (${sourceEnv} → ${targetEnv}) on branch ${branchName}`,
                        'View Workflow'
                    ).then(selection => {
                        if (selection === 'View Workflow') {
                            vscode.env.openExternal(vscode.Uri.parse(runUrl));
                        }
                    });
                } else {
                    progress.report({ increment: 100, message: 'Group promotion failed to start' });
                    vscode.window.showErrorMessage('❌ Failed to start group promotion. Please check the logs for more details.');
                }
            } catch (error) {
                progress.report({ increment: 100, message: 'Group promotion failed' });
                vscode.window.showErrorMessage(`❌ Failed to promote flow group: ${error}`);
            }
        });
    }
}
