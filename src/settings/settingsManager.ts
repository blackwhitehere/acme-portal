import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class SettingsManager {
    private static readonly CONFIG_SECTION = 'acmeportal';
    private static readonly FLOWS_PATH = 'flowsPath';

    /**
     * Get the configured flows path
     */
    public static getFlowsPath(): string {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        return config.get<string>(this.FLOWS_PATH) || 'flows';
    }

    /**
     * Set the flows path
     */
    public static async setFlowsPath(newPath: string): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        await config.update(this.FLOWS_PATH, newPath, vscode.ConfigurationTarget.Global);
    }

    /**
     * Get the absolute path to the flows directory
     */
    public static getAbsoluteFlowsPath(): string | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return undefined;
        }

        const relativePath = this.getFlowsPath();
        return path.join(workspaceFolders[0].uri.fsPath, relativePath);
    }

    /**
     * Check if the configured flows path exists
     */
    public static async flowsPathExists(): Promise<boolean> {
        const absolutePath = this.getAbsoluteFlowsPath();
        if (!absolutePath) {
            return false;
        }

        try {
            const stats = await fs.promises.stat(absolutePath);
            return stats.isDirectory();
        } catch (error) {
            return false;
        }
    }
}
