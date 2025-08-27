import * as vscode from 'vscode';
import { FlowTreeDataProvider } from '../treeView/treeDataProvider';
import { EnvironmentTreeItem } from '../treeView/items/EnvironmentTreeItem';
import { DetailTreeItem } from '../treeView/items/DetailTreeItem';

export class TreeViewCommands {
    constructor(
        private readonly treeDataProvider: FlowTreeDataProvider
    ) {}

    /**
     * Refresh the tree view
     */
    public refreshTreeView(): void {
        this.treeDataProvider.refresh();
    }

    /**
     * Open a URL in the default external browser after confirmation
     * @param item The tree item or direct URL to open
     */
    public async openExternalUrl(item: any): Promise<void> {
        let displayUrl: string;
        let url: string | vscode.Uri;
        
        // Handle the case where an EnvironmentTreeItem is passed
        if (item instanceof EnvironmentTreeItem && item.deploymentData?.url) {
            url = item.deploymentData.url;
            displayUrl = url.toString();
        } 
        // Handle direct URI or string
        else if (typeof item === 'string' || item instanceof vscode.Uri) {
            url = item;
            displayUrl = typeof url === 'string' ? url : url.toString();
        }
        else {
            vscode.window.showErrorMessage('No valid URL found to open');
            return;
        }
        
        const selection = await vscode.window.showInformationMessage(
            `Open external URL of the deployment?`, 
            'Open', 
            'Cancel'
        );
        
        if (selection === 'Open') {
            const finalUri = typeof url === 'string' ? vscode.Uri.parse(url) : url;
            vscode.env.openExternal(finalUri);
        }
    }

    /**
     * Copy the value part of an attribute to clipboard
     * @param item The DetailTreeItem containing the attribute
     */
    public async copyAttributeValue(item: any): Promise<void> {
        // Check if this is a DetailTreeItem
        if (!(item instanceof DetailTreeItem)) {
            vscode.window.showErrorMessage('Can only copy values from detail items');
            return;
        }

        // Parse the label to extract the value after the colon
        const label = item.label;
        const colonIndex = label.indexOf(':');
        
        if (colonIndex === -1) {
            vscode.window.showErrorMessage('No value found to copy');
            return;
        }

        // Extract the value part (everything after the colon, trimmed)
        const value = label.substring(colonIndex + 1).trim();
        
        if (!value) {
            vscode.window.showErrorMessage('No value found to copy');
            return;
        }

        // Copy to clipboard
        await vscode.env.clipboard.writeText(value);
        vscode.window.showInformationMessage(`Copied to clipboard: ${value}`);
    }
}
