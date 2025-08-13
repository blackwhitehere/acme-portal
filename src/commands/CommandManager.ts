import * as vscode from 'vscode';
import { TreeViewCommands } from '../commands/TreeViewCommands';
import { SettingsCommands } from '../commands/SettingsCommands';
import { FlowCommands } from '../commands/FlowCommands';
import { PromotionCommands } from '../commands/PromotionCommands';
import { ComparisonCommands } from '../commands/ComparisonCommands';
import { DeploymentCommands } from '../commands/DeploymentCommands';
import { SearchCommands } from '../commands/SearchCommands';

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
        private readonly deploymentCommands: DeploymentCommands,
        private readonly searchCommands: SearchCommands
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
            vscode.commands.registerCommand(
                'acmeportal.openExternalUrl',
                this.treeViewCommands.openExternalUrl.bind(this.treeViewCommands)
            )
        );

        // Settings commands
        this.disposables.push(
            vscode.commands.registerCommand(
                'acmeportal.openSettings',
                this.settingsCommands.openSettings.bind(this.settingsCommands)
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
            ),
            vscode.commands.registerCommand(
                'acmeportal.promoteFlowGroup',
                this.promotionCommands.promoteFlowGroup.bind(this.promotionCommands)
            ),
            vscode.commands.registerCommand(
                'acmeportal.promoteFlowGroupFromContext',
                this.promotionCommands.promoteFlowGroupFromContext.bind(this.promotionCommands)
            )
        );

        // Deployment commands
        this.disposables.push(
            vscode.commands.registerCommand(
                'acmeportal.deployFlow',
                this.deploymentCommands.deployFlow.bind(this.deploymentCommands)
            ),
            vscode.commands.registerCommand(
                'acmeportal.deployFlowGroup',
                this.deploymentCommands.deployFlowGroup.bind(this.deploymentCommands)
            ),
            vscode.commands.registerCommand(
                'acmeportal.deployFlowGroupFromContext',
                this.deploymentCommands.deployFlowGroupFromContext.bind(this.deploymentCommands)
            )
        );

        // Comparison commands
        this.disposables.push(
            vscode.commands.registerCommand(
                'acmeportal.compareFlowVersions',
                this.comparisonCommands.compareFlowVersions.bind(this.comparisonCommands)
            )
        );

        // Search commands
        this.disposables.push(
            vscode.commands.registerCommand(
                'acmeportal.searchFlows',
                this.searchCommands.searchFlows.bind(this.searchCommands)
            ),
            vscode.commands.registerCommand(
                'acmeportal.clearSearch',
                this.searchCommands.clearSearch.bind(this.searchCommands)
            ),
            vscode.commands.registerCommand(
                'acmeportal.showSearchHelp',
                this.searchCommands.showSearchHelp.bind(this.searchCommands)
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
