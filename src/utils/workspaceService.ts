import * as vscode from 'vscode';

/**
 * Service for VS Code workspace operations
 */
export class WorkspaceService {
    /**
     * Get the workspace root directory
     * @returns Path to workspace root or undefined if no workspace is open
     */
    public isWorkspaceSet(): boolean {
        const workspaces = vscode.workspace.workspaceFolders;
        return !(!workspaces || workspaces.length === 0);
    }

    public checkWorkspaceSet(): void {
        if (!this.isWorkspaceSet()) {
            vscode.window.showErrorMessage('No workspace folder is open.');
        }
    }

    public getWorkspaceRoot(): string | undefined {
        this.checkWorkspaceSet();
        const workspaces = vscode.workspace.workspaceFolders;
        return workspaces ? workspaces[0].uri.fsPath : undefined;
    }
}
