import * as vscode from 'vscode';
import { BaseTreeItem } from './BaseTreeItem';

/**
 * Tree item representing a grouping/folder in the flow hierarchy
 */
export class GroupTreeItem extends BaseTreeItem {
    constructor(
        public readonly groupName: string,
        parentId?: string,
        public readonly fullGroupPath?: string
    ) {
        super(
            groupName,
            vscode.TreeItemCollapsibleState.Collapsed,
            parentId
        );
        
        this.contextValue = 'group';
        this.iconPath = new vscode.ThemeIcon('folder');
    }
}
