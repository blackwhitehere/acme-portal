import * as vscode from 'vscode';
import { AcmeTreeDataProvider } from './treeView/treeDataProvider';
import { SettingsManager } from './settings/settingsManager';
import { FlowScanner, FlowDetails } from './flowDiscovery/flowScanner';
import { GitHubWorkflowRunner } from './github/workflowRunner';

export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "acmeportal" is now active!');

	// Enable the views to show up
	vscode.commands.executeCommand('setContext', 'acmePortalEnabled', true);

	// Register the tree data provider
	const acmeTreeDataProvider = new AcmeTreeDataProvider();
	const treeView = vscode.window.createTreeView('acmePortalView', {
		treeDataProvider: acmeTreeDataProvider,
		showCollapseAll: true
	});

	// Watch for settings changes
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration('acmeportal.flowsPath')) {
				acmeTreeDataProvider.loadFlows();
			}
		})
	);

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('acmeportal.refreshTreeView', () => {
			acmeTreeDataProvider.refresh();
		}),
		
		vscode.commands.registerCommand('acmeportal.itemClicked', (item) => {
			vscode.window.showInformationMessage(`Clicked on ${item.label}`);
		}),
		
		// Open settings command
		vscode.commands.registerCommand('acmeportal.openSettings', () => {
			vscode.commands.executeCommand('workbench.action.openSettings', 'acmeportal');
		}),
		
		// Set flows path command
		vscode.commands.registerCommand('acmeportal.setFlowsPath', async () => {
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
		}),
		
		vscode.commands.registerCommand('acmeportal.refreshFlows', () => {
			acmeTreeDataProvider.loadFlows();
		}),
		
		vscode.commands.registerCommand('acmeportal.openFlowFile', (item) => {
			if (item.flowData && item.flowData.source_file) {
				const uri = vscode.Uri.file(item.flowData.source_file);
				vscode.window.showTextDocument(uri);
			}
		}),
		
		vscode.commands.registerCommand('acmeportal.promoteEnvironment', async (item) => {
			let flowName = '';
			let sourceEnv = '';
			
			// If command was triggered from an environment tree item, use that environment's info
			if (item && item.flowData && item.environmentName) {
				flowName = item.flowData.name || '';
				sourceEnv = item.environmentName;
				console.log(`Promoting from environment item: flow=${flowName}, sourceEnv=${sourceEnv}`);
			} else if (item && item.flowData) {
				// If triggered from a flow item, use flow name but prompt for source
				flowName = item.flowData.name || '';
				console.log(`Promoting from flow item: flow=${flowName}`);
			}
			
			// If no valid data, let user select from available flows
			if (!flowName) {
				const flows = await FlowScanner.scanForFlows();
				if (flows.length === 0) {
					vscode.window.showInformationMessage('No flows found to promote.');
					return;
				}
				
				const flowItems = flows.map(flow => ({ 
					label: flow.name,
					detail: flow.module || flow.source_file,
					description: flow.description,
					flow
				}));
				
				const selectedFlow = await vscode.window.showQuickPick(flowItems, {
					title: 'Select Flow to Promote',
					placeHolder: 'Choose a flow'
				});
				
				if (!selectedFlow) {
					return; // User cancelled
				}
				
				flowName = selectedFlow.label;
			}
			
			// If source environment not set from tree item, prompt user
			if (!sourceEnv) {
				const sourceEnv = await vscode.window.showInputBox({
					title: 'Source Environment',
					prompt: 'Enter the source environment (e.g., dev, tst, prd)',
					placeHolder: 'e.g., dev, tst, prd',
					validateInput: value => {
						if (!value || value.trim().length === 0) {
							return 'Source environment cannot be empty';
						}
						return null;
					}
				});
				
				if (!sourceEnv) {
					return; // User cancelled
				}
			}
			
			// Get target environment using input box
			const targetEnv = await vscode.window.showInputBox({
				title: 'Target Environment',
				prompt: 'Enter the target environment (e.g., dev, tst, prd)',
				placeHolder: 'e.g., tst, prd',
				validateInput: value => {
					if (!value || value.trim().length === 0) {
						return 'Target environment cannot be empty';
					}
					if (value.trim().toLowerCase() === sourceEnv.toLowerCase()) {
						return 'Target environment must be different from source environment';
					}
					return null;
				}
			});

			if (!targetEnv) {
				return; // User cancelled
			}
			
			// Get current branch and allow user to change it
			const currentBranch = await GitHubWorkflowRunner.getCurrentBranch() || 'main';
			
			// Check for uncommitted changes and warn if present
			const hasUncommittedChanges = await GitHubWorkflowRunner.hasUncommittedChanges();
			if (hasUncommittedChanges) {
				const warningResult = await vscode.window.showWarningMessage(
					'There are uncommitted changes in your workspace. These changes will not be reflected in the deployment.',
					'Continue Anyway',
					'Cancel'
				);
				
				if (warningResult !== 'Continue Anyway') {
					return; // User cancelled
				}
			}
			
			// Ask for branch name
			const branchName = await vscode.window.showInputBox({
				title: 'Branch Name for Workflow',
				prompt: 'Enter the branch name where the workflow should run',
				value: currentBranch,
				placeHolder: 'e.g., main, master, develop',
				validateInput: value => {
					if (!value || value.trim().length === 0) {
						return 'Branch name cannot be empty';
					}
					return null;
				}
			});
			
			if (!branchName) {
				return; // User cancelled
			}
			
			// Confirm promotion
			const confirmation = await vscode.window.showInformationMessage(
				`Promote flow "${flowName}" from ${sourceEnv} to ${targetEnv} using branch ${branchName}?`,
				{ modal: true },
				'Promote'
			);
			
			if (confirmation === 'Promote') {
				// Create inputs for GitHub workflow
				const workflowInputs = {
					'flows-to-deploy': flowName,
					'source-env': sourceEnv,
					'target-env': targetEnv
				};
				
				// Trigger GitHub workflow on the specified branch
				const runUrl = await GitHubWorkflowRunner.triggerWorkflow(
					'promote.yml', 
					workflowInputs,
					branchName  // Pass the branch name here
				);
				
				if (runUrl) {
					vscode.window.showInformationMessage(
						`Started promotion of flow "${flowName}" from ${sourceEnv} to ${targetEnv} on branch ${branchName}`,
						'View Workflow'
					).then(selection => {
						if (selection === 'View Workflow') {
							vscode.env.openExternal(vscode.Uri.parse(runUrl));
						}
					});
				}
			}
		}),
		
		treeView
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
