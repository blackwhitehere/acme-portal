import * as vscode from 'vscode';
import { AcmeTreeDataProvider } from './treeView/treeDataProvider';
import { CommandExecutor } from './utils/commandExecutor';
import { WorkspaceService } from './utils/workspaceService';
import { GitService } from './utils/gitService';
import { GitHubWorkflowService } from './github/githubWorkflowService';

// Import command classes
import { CommandManager } from './commands/CommandManager';
import { TreeViewCommands } from './commands/TreeViewCommands';
import { SettingsCommands } from './commands/SettingsCommands';
import { FlowCommands } from './commands/FlowCommands';
import { PromotionCommands } from './commands/PromotionCommands';
import { ComparisonCommands } from './commands/ComparisonCommands';

export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "acmeportal" is now active!');

    // Enable the views to show up
    vscode.commands.executeCommand('setContext', 'acmePortalEnabled', true);

    // Initialize services
    const commandExecutor = new CommandExecutor();
    const workspaceService = new WorkspaceService();
    const gitService = new GitService(commandExecutor, workspaceService);
    const githubWorkflowService = new GitHubWorkflowService(commandExecutor, gitService, workspaceService);

    // Initialize tree data provider
    const acmeTreeDataProvider = new AcmeTreeDataProvider();
    const treeView = vscode.window.createTreeView('acmePortalView', {
        treeDataProvider: acmeTreeDataProvider,
        showCollapseAll: true
    });

    // Initialize command handlers
    const treeViewCommands = new TreeViewCommands(acmeTreeDataProvider);
    const settingsCommands = new SettingsCommands();
    const flowCommands = new FlowCommands(acmeTreeDataProvider);
    const promotionCommands = new PromotionCommands(gitService, githubWorkflowService);
    const comparisonCommands = new ComparisonCommands(gitService, workspaceService, acmeTreeDataProvider);

    // Initialize command manager and register all commands
    const commandManager = new CommandManager(
        treeViewCommands,
        settingsCommands,
        flowCommands,
        promotionCommands,
        comparisonCommands
    );

    // Register all commands and add them to context subscriptions
    context.subscriptions.push(...commandManager.registerCommands());

    // Add the tree view to subscriptions
    context.subscriptions.push(treeView);

    // Watch for settings changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('acmeportal.flowsPath')) {
                acmeTreeDataProvider.loadFlows();
            }
        })
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
