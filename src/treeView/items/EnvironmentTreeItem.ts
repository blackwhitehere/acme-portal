import * as vscode from 'vscode';
import { BaseTreeItem } from './BaseTreeItem';
import { FlowDetails } from '../../actions/findFlows';
import { DeploymentDetails } from '../../actions/findDeployments';

/**
 * Tree item representing an environment with a deployed flow
 */
export class EnvironmentTreeItem extends BaseTreeItem {
    constructor(
        public readonly environmentName: string,
        public readonly flowData: FlowDetails,
        public readonly deploymentData: DeploymentDetails,
        parentId: string
    ) {
        super(
            `Environment: ${environmentName}`,
            vscode.TreeItemCollapsibleState.Collapsed,
            parentId
        );
        
        this.contextValue = 'environment';
        this.iconPath = new vscode.ThemeIcon('server-environment');
    }

    /**
     * Get the environment name without the prefix
     */
    public getEnvironmentName(): string {
        return this.environmentName;
    }
}
