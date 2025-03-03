import * as vscode from 'vscode';
import * as path from 'path';
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
			let branchName = ''; // Add a variable to store the branch name
			
			// If command was triggered from an environment tree item, use that environment's info
			if (item && item.flowData && item.environmentName) {
				flowName = item.flowData.name || '';
				sourceEnv = item.environmentName;
				
				// Extract branch name from the parent branch item if this is an environment item
				if (item.parentId && item.parentId.includes('Branch:')) {
					// The parent ID for environment items contains "Branch: branchName"
					const branchPrefix = 'Branch: ';
					const parentIdParts = item.parentId.split('-');
					for (const part of parentIdParts) {
						if (part.startsWith(branchPrefix)) {
							branchName = part.substring(branchPrefix.length);
							console.log(`Using branch from environment item: ${branchName}`);
							break;
						}
					}
				}
				
				console.log(`Promoting from environment item: flow=${flowName}, sourceEnv=${sourceEnv}, branch=${branchName}`);
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
				const userSourceEnv = await vscode.window.showInputBox({
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
				
				if (!userSourceEnv) {
					return; // User cancelled
				}
				else {
					sourceEnv = userSourceEnv;
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
			
			// Get current branch if not already set from tree item
			if (!branchName) {
				branchName = await GitHubWorkflowRunner.getCurrentBranch() || 'main';
			}
			
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
			
			// Ask for branch name, prepopulating with the one we got from environment or getCurrentBranch
			const userBranchName = await vscode.window.showInputBox({
				title: 'Branch Name for Workflow',
				prompt: 'Enter the branch name where the workflow should run',
				value: branchName,
				placeHolder: 'e.g., main, master, develop',
				validateInput: value => {
					if (!value || value.trim().length === 0) {
						return 'Branch name cannot be empty';
					}
					return null;
				}
			});
			
			if (!userBranchName) {
				return; // User cancelled
			}
			
			branchName = userBranchName; // Update the branch name with user input
			
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
		
		 // Updated command for comparing flow versions
        vscode.commands.registerCommand('acmeportal.compareFlowVersions', async (item) => {
            try {
                if (!item || !item.flowData || !item.id) {
                    vscode.window.showErrorMessage('Invalid item selected for comparison.');
                    return;
                }

                // Get the source file path from the flow data
                const sourceFile = item.flowData.source_file;
                if (!sourceFile) {
                    vscode.window.showErrorMessage('Flow source file information is missing.');
                    return;
                }

                // Find all deployment details for this environment
                const tagItems = vscode.workspace.textDocuments.filter(doc => doc.uri.fsPath === sourceFile);
                if (tagItems.length === 0) {
                    // Open the file first since it's not currently open
                    await vscode.commands.executeCommand('acmeportal.openFlowFile', item);
                }

                // Extract the COMMIT_HASH from the environment's deployment
                let commitHash = '';
                
                // First, try to find it in the current item's deploymentData
                if (item.deploymentData?.tags) {
                    const commitTag = item.deploymentData.tags.find((tag: string) => tag.includes('COMMIT_HASH'));
                    if (commitTag) {
                        commitHash = commitTag.split('=')[1];
                    }
                }
                
                // If not found directly, try to find in the child nodes (detail items)
                if (!commitHash && item.id) {
                    // Get environment details from the tree provider
                    const treeProvider = acmeTreeDataProvider as AcmeTreeDataProvider;
                    const childItems = await treeProvider.getChildren(item);
                    
                    // Look for an item containing commit hash information
                    for (const child of childItems) {
                        if (child.label?.toString().startsWith('Commit: ')) {
                            commitHash = child.label.toString().replace('Commit: ', '');
                            break;
                        }
                    }
                }

                if (!commitHash) {
                    vscode.window.showInformationMessage(
                        'No commit hash found for this deployment. Please ensure the deployment has a COMMIT_HASH tag.',
                        'OK'
                    );
                    return;
                }

                const workspaceRoot = GitHubWorkflowRunner.getWorkspaceRoot();
                if (!workspaceRoot) {
                    return; // The getWorkspaceRoot function already shows an error message
                }
            
				// Get the current commit hash
				let currentCommitHash;
				try {
					currentCommitHash = await GitHubWorkflowRunner.getCurrentCommitHash();
					if (!currentCommitHash) {
						throw new Error('Empty result when getting current commit');
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to get current commit: ${error}`);
					return;
				}

				// Get the GitHub repository URL
				let repoUrl;
				try {
					repoUrl = await GitHubWorkflowRunner.getRepositoryUrl();
					if (!repoUrl) {
						throw new Error('Could not get GitHub repository URL');
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to get repository URL: ${error}`);
					return;
				}

				// Construct the comparison URL
				const compareUrl = `${repoUrl}/compare/${commitHash}..${currentCommitHash}`;

				// Show notification with warning about uncommitted changes and link to comparison
				vscode.window.showInformationMessage(
					'Opening GitHub comparison view between current commit and selected deployment.\n' +
					'Note: Uncommitted changes on current branch won\'t be visible in the GitHub comparison view.',
					'View on GitHub'
				).then(selection => {
					if (selection === 'View on GitHub') {
						vscode.env.openExternal(vscode.Uri.parse(compareUrl));
					}
				});
                
            } catch (error) {
                console.error('Error comparing flow versions:', error);
                vscode.window.showErrorMessage(`Error comparing flow versions: ${error}`);
            }
        }),
		
		treeView
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
