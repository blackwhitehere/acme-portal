import * as vscode from 'vscode';
import { SettingsManager } from '../settings/settingsManager';

export class SettingsCommands {
    /**
     * Open extension settings
     */
    public openSettings(): void {
        vscode.commands.executeCommand('workbench.action.openSettings', 'acmeportal');
    }

    /**
     * Set the path to flows directory
     */
    public async setFlowsPath(): Promise<void> {
        const currentPath = SettingsManager.getFlowsPath();
        
        const newPath = await vscode.window.showInputBox({
            title: 'Set Path to Flows',
            prompt: 'Enter relative path to your Python flows directory',
            value: currentPath,
            placeHolder: 'flows'
        });
        
        if (newPath !== undefined) {
            await SettingsManager.setFlowsPath(newPath);
            
            const pathExists = await SettingsManager.flowsPathExists();
            if (!pathExists) {
                const createIt = await vscode.window.showWarningMessage(
                    `Directory '${newPath}' doesn't exist. Create it?`,
                    'Yes', 'No'
                );
                
                if (createIt === 'Yes') {
                    const absolutePath = SettingsManager.getAbsoluteFlowsPath();
                    if (absolutePath) {
                        const fs = require('fs');
                        try {
                            await fs.promises.mkdir(absolutePath, { recursive: true });
                            vscode.window.showInformationMessage(`Created directory: ${newPath}`);
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to create directory: ${error}`);
                        }
                    }
                }
            }
        }
    }
}
