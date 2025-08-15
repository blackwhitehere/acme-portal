import * as vscode from 'vscode';
import { BaseTreeItem } from './BaseTreeItem';
import { FlowDetails } from '../../actions/findFlows';

/**
 * Tree item representing a Prefect flow
 */
export class FlowTreeItem extends BaseTreeItem {
    constructor(
        public readonly flowData: FlowDetails
    ) {
        super(
            flowData.name, 
            vscode.TreeItemCollapsibleState.Collapsed
        );
        
        this.id = flowData.id || flowData.name;
        this.contextValue = 'flow deployable'; // Added 'deployable' context to support deploy action
        this.tooltip = flowData.description || `Flow: ${this.label}`;
        this.description = flowData.source_relative;
        this.iconPath = new vscode.ThemeIcon('symbol-event');
        
        // Add a command to open the flow when clicked
        this.command = {
            command: 'acmeportal.openFlowFile',
            title: 'Open Flow File',
            arguments: [this]
        };
    }
}
