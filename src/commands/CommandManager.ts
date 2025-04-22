import * as vscode from 'vscode';
import { TreeViewCommands } from '../commands/TreeViewCommands';
import { SettingsCommands } from '../commands/SettingsCommands';
import { FlowCommands } from '../commands/FlowCommands';
import { PromotionCommands } from '../commands/PromotionCommands';
import { ComparisonCommands } from '../commands/ComparisonCommands';
import { DeploymentCommands } from '../commands/DeploymentCommands';

export class CommandManager {
    /**
     * Registers all commands with VS Code
     * */
    private readonly disposables: vscode.Disposable[] = [];

    constructor(
        private readonly treeViewCommands: TreeViewCommands,
        private readonly settingsCommands: SettingsCommands,
        private readonly flowCommands: FlowCommands,
        private readonly promotionCommands: PromotionCommands,
        private readonly comparisonCommands: ComparisonCommands,
        private readonly deploymentCommands: DeploymentCommands
    ) {}

    /**
     * Register all commands with VS Code
     * @returns Array of disposables for all registered commands
     */
    public registerCommands(): vscode.Disposable[] {
        // Tree view commands
        this.disposables.push(
            vscode.commands.registerCommand(
                'acmeportal.refreshTreeView',
                this.treeViewCommands.refreshTreeView.bind(this.treeViewCommands)
            ),
        );

        // Settings commands
        this.disposables.push(
            vscode.commands.registerCommand(
                'acmeportal.openSettings',
                this.settingsCommands.openSettings.bind(this.settingsCommands)
            ),
            vscode.commands.registerCommand(
                'acmeportal.setFlowsPath',
                this.settingsCommands.setFlowsPath.bind(this.settingsCommands)
            )
        );

        // Flow commands
        this.disposables.push(
            vscode.commands.registerCommand(
                'acmeportal.refreshFlows',
                this.flowCommands.refreshFlows.bind(this.flowCommands)
            ),
            vscode.commands.registerCommand(
                'acmeportal.openFlowFile',
                this.flowCommands.openFlowFile.bind(this.flowCommands)
            )
        );

        // Promotion commands
        this.disposables.push(
            vscode.commands.registerCommand(
                'acmeportal.promoteEnvironment',
                this.promotionCommands.promoteEnvironment.bind(this.promotionCommands)
            )
        );

        // Deployment commands
        this.disposables.push(
            vscode.commands.registerCommand(
                'acmeportal.deployFlow',
                this.deploymentCommands.deployFlow.bind(this.deploymentCommands)
            )
        );

        // Comparison commands
        this.disposables.push(
            vscode.commands.registerCommand(
                'acmeportal.compareFlowVersions',
                this.comparisonCommands.compareFlowVersions.bind(this.comparisonCommands)
            )
        );

        return this.disposables;
    }

    /**
     * Dispose of all registered commands
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}
