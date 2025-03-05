import * as vscode from 'vscode';
import { AcmeTreeDataProvider } from '../treeView/treeDataProvider';

export class TreeViewCommands {
    constructor(
        private readonly treeDataProvider: AcmeTreeDataProvider
    ) {}

    /**
     * Refresh the tree view
     */
    public refreshTreeView(): void {
        this.treeDataProvider.refresh();
    }

    /**
     * Handle item click in tree view
     * @param item The clicked tree item
     */
    public itemClicked(item: any): void {
        vscode.window.showInformationMessage(`Clicked on ${item.label}`);
    }
}
