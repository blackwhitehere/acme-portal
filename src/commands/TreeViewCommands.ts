import * as vscode from 'vscode';
import { FlowTreeDataProvider } from '../treeView/treeDataProvider';
import { EnvironmentTreeItem } from '../treeView/items/EnvironmentTreeItem';

export class TreeViewCommands {
    constructor(
        private readonly treeDataProvider: FlowTreeDataProvider
    ) {}

    /**
     * Hello World command - displays a simple greeting message
     */
    public helloWorld(): void {
        vscode.window.showInformationMessage('Hello World from ACME Portal!');
    }

    /**
     * Item clicked command - handles generic item click events
     */
    public itemClicked(): void {
        vscode.window.showInformationMessage('Item clicked in ACME Portal!');
    }

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
}
