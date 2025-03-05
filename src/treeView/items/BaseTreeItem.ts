import * as vscode from 'vscode';

/**
 * Base class for all tree items in the ACME Portal tree view
 */
export abstract class BaseTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly parentId?: string
    ) {
        super(label, collapsibleState);
        this.id = parentId ? `${parentId}-${label}` : label;
    }
}
