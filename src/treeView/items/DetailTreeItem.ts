import * as vscode from 'vscode';
import { BaseTreeItem } from './BaseTreeItem';
import { FlowDetails } from '../../actions/findFlows';
import { DeploymentDetails } from '../../actions/findDeployments';

/**
 * Tree item representing a detail or property of a flow or deployment
 */
export class DetailTreeItem extends BaseTreeItem {
    constructor(
        public readonly label: string,
        public readonly flowData?: FlowDetails,
        public readonly deploymentData?: DeploymentDetails,
        parentId?: string
    ) {
        super(
            label,
            vscode.TreeItemCollapsibleState.None,
            parentId
        );
        
        this.contextValue = 'flowDetail';
        this.iconPath = new vscode.ThemeIcon('symbol-property');
    }
}
