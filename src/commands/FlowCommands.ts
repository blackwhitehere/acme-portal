import * as vscode from 'vscode';
import { AcmeTreeDataProvider } from '../treeView/treeDataProvider';
import { FlowTreeItem } from '../treeView/items/FlowTreeItem';
import { EnvironmentTreeItem } from '../treeView/items/EnvironmentTreeItem';

export class FlowCommands {
    constructor(
        private readonly treeDataProvider: AcmeTreeDataProvider
    ) {}

    /**
     * Refresh the flows in the tree view
     */
    public refreshFlows(): void {
        this.treeDataProvider.loadFlows();
    }

    /**
     * Open the flow file in the editor
     * @param item The tree item containing flow data
     */
    public openFlowFile(item: any): void {
        let sourceFile: string | undefined;
        
        if (item instanceof FlowTreeItem || item instanceof EnvironmentTreeItem) {
            sourceFile = item.flowData.source_file;
        } else if (item.flowData && item.flowData.source_file) {
            // Fallback for old/unknown item types
            sourceFile = item.flowData.source_file;
        }
        
        if (sourceFile) {
            const uri = vscode.Uri.file(sourceFile);
            vscode.window.showTextDocument(uri);
        }
    }
}
