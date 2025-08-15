import * as vscode from 'vscode';
import { BaseTreeItem } from './BaseTreeItem';
import { FlowDetails } from '../../actions/findFlows';
import { DeploymentDetails } from '../../actions/findDeployments';

/**
 * Tree item representing an individual tag
 */
export class TagTreeItem extends BaseTreeItem {
    constructor(
        public readonly tag: string,
        public readonly flowData: FlowDetails,
        public readonly deploymentData: DeploymentDetails,
        parentId: string
    ) {
        super(
            tag,
            vscode.TreeItemCollapsibleState.None,
            parentId
        );
        
        this.contextValue = 'tag';
        this.iconPath = new vscode.ThemeIcon('tag');
    }
}