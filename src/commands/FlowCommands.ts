import * as vscode from 'vscode';
import { FlowTreeDataProvider } from '../treeView/treeDataProvider';
import { FlowTreeItem } from '../treeView/items/FlowTreeItem';
import { GroupTreeItem } from '../treeView/items/GroupTreeItem';
import { EnvironmentTreeItem } from '../treeView/items/EnvironmentTreeItem';
import { GroupUtils } from '../utils/groupUtils';

export class FlowCommands {
    constructor(
        private readonly treeDataProvider: FlowTreeDataProvider
    ) {}

    /**
     * Refresh the flows in the tree view
     */
    public refreshFlows(): void {
        this.treeDataProvider.loadFlows();
    }

    /**
     * Refresh flows for a specific group
     * @param item The GroupTreeItem to refresh flows for
     */
    public async refreshGroup(item: any): Promise<void> {
        if (!(item instanceof GroupTreeItem)) {
            vscode.window.showErrorMessage('Can only refresh group items');
            return;
        }

        if (!item.fullGroupPath) {
            vscode.window.showErrorMessage('Group path not available for refresh');
            return;
        }

        console.log(`Refreshing group: ${item.fullGroupPath}`);
        
        // Find flows that belong to this group
        const currentFlows = this.treeDataProvider.getAllFlows();
        const groupFlows = GroupUtils.findFlowsByGroupPath(currentFlows, item.fullGroupPath);
        
        if (groupFlows.length === 0) {
            vscode.window.showInformationMessage(`No flows found in group "${item.groupName}" to refresh`);
            return;
        }

        // Refresh the group flows
        await this.treeDataProvider.refreshFlowsSubset(groupFlows);
        
        vscode.window.showInformationMessage(`Refreshed ${groupFlows.length} flows in group "${item.groupName}"`);
    }

    /**
     * Refresh a specific flow
     * @param item The FlowTreeItem to refresh
     */  
    public async refreshFlow(item: any): Promise<void> {
        let flowData: any;
        
        if (item instanceof FlowTreeItem || item instanceof EnvironmentTreeItem) {
            flowData = item.flowData;
        } else if (item.flowData) {
            // Fallback for old/unknown item types
            flowData = item.flowData;
        }
        
        if (!flowData) {
            vscode.window.showErrorMessage('No flow data available for refresh');
            return;
        }

        console.log(`Refreshing flow: ${flowData.name}`);
        
        // Refresh the single flow
        await this.treeDataProvider.refreshFlowsSubset([flowData]);
        
        vscode.window.showInformationMessage(`Refreshed flow "${flowData.name}"`);
    }

    /**
     * Open the flow file in the editor
     * @param item The tree item containing flow data
     */
    public async openFlowFile(item: any): Promise<void> {
        let sourceFile: string | undefined;
        let lineNumber: number | undefined;
        
        if (item instanceof FlowTreeItem || item instanceof EnvironmentTreeItem) {
            sourceFile = item.flowData.source_path;
            lineNumber = item.flowData.line_number;
        } else if (item.flowData && item.flowData.source_path) {
            // Fallback for old/unknown item types
            sourceFile = item.flowData.source_path;
            lineNumber = item.flowData.line_number;
        }
        
        if (!sourceFile) {
            vscode.window.showErrorMessage('No source file path available for this flow');
            return;
        }

        try {
            const uri = vscode.Uri.file(sourceFile);
            
            // Check if file exists by trying to get stats
            try {
                await vscode.workspace.fs.stat(uri);
            } catch (statError) {
                vscode.window.showErrorMessage(`Cannot locate source file: ${sourceFile}`);
                return;
            }

            // Prepare options for opening the document
            const options: vscode.TextDocumentShowOptions = {};
            
            // If line number is provided, set the selection to that line
            if (lineNumber !== undefined && lineNumber > 0) {
                // Convert to 0-based line number for VSCode API
                const position = new vscode.Position(lineNumber - 1, 0);
                options.selection = new vscode.Range(position, position);
            }

            // Open the document
            const document = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(document, options);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to open source file: ${errorMessage}`);
        }
    }
}
