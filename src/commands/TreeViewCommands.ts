import * as vscode from 'vscode';
import { FlowTreeDataProvider } from '../treeView/treeDataProvider';

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
}
