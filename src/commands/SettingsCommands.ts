import * as vscode from 'vscode';

export class SettingsCommands {
    /**
     * Open extension settings
     */
    public openSettings(): void {
        vscode.commands.executeCommand('workbench.action.openSettings', 'acmeportal');
    }
}
