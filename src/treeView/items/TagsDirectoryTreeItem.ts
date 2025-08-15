import * as vscode from 'vscode';
import { BaseTreeItem } from './BaseTreeItem';
import { FlowDetails } from '../../actions/findFlows';
import { DeploymentDetails } from '../../actions/findDeployments';

/**
 * Tree item representing a tags directory containing all deployment tags
 */
export class TagsDirectoryTreeItem extends BaseTreeItem {
    constructor(
        public readonly flowData: FlowDetails,
        public readonly deploymentData: DeploymentDetails,
        parentId: string
    ) {
        super(
            'Tags',
            vscode.TreeItemCollapsibleState.Collapsed,
            parentId
        );
        
        this.contextValue = 'tagsDirectory';
        this.iconPath = new vscode.ThemeIcon('folder');
    }
}