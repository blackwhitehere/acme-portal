import * as vscode from 'vscode';
import { BaseTreeItem } from './BaseTreeItem';
import { FlowDetails } from '../../actions/findFlows';

/**
 * Tree item representing a Git branch that contains flow deployments
 */
export class BranchTreeItem extends BaseTreeItem {
    constructor(
        public readonly branchName: string,
        public readonly flowData: FlowDetails,
        parentId: string
    ) {
        super(
            `Branch: ${branchName}`,
            vscode.TreeItemCollapsibleState.Collapsed,
            parentId
        );
        
        this.contextValue = 'branch';
        this.iconPath = new vscode.ThemeIcon('git-branch');
    }

    /**
     * Get the branch name without the prefix
     */
    public getBranchName(): string {
        return this.branchName;
    }
}
