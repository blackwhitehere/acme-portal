import * as vscode from 'vscode';
import * as path from 'path';
import { FlowScanner, FlowDetails } from '../flowDiscovery/flowScanner';
import { DeploymentScanner, DeploymentDetails } from '../deploymentDiscovery/deploymentScanner';
import { SettingsManager } from '../settings/settingsManager';

// Define the tree item types
export class TreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly itemType: 'flow' | 'branch' | 'env' | 'detail',
        public readonly flowData?: FlowDetails,
        public readonly deploymentData?: DeploymentDetails,
        public readonly parentId?: string,
        public readonly environmentName?: string
    ) {
        super(label, collapsibleState);
        
        // Use the flow's unique id if it's a flow item
        if (itemType === 'flow' && flowData?.id) {
            this.id = flowData.id;
        } else {
            this.id = parentId ? `${parentId}-${label}` : label;
        }
        
        if (itemType === 'flow') {
            this.contextValue = 'flow';
            this.tooltip = flowData?.description || `Flow: ${this.label}`;
            this.description = flowData?.module || '';
            this.iconPath = new vscode.ThemeIcon('symbol-event');
            
            // Add a command to open the flow when clicked
            this.command = {
                command: 'acmeportal.openFlowFile',
                title: 'Open Flow File',
                arguments: [this]
            };
        } else if (itemType === 'detail') {
            this.contextValue = 'flowDetail';
            this.iconPath = new vscode.ThemeIcon('symbol-property');
        } else if (itemType === 'env') {
            this.contextValue = 'environment';  // Changed from 'env' to 'environment' for clarity in menus
            this.iconPath = new vscode.ThemeIcon('server-environment');
        } else if (itemType === 'branch') {
            this.contextValue = 'branch';
            this.iconPath = new vscode.ThemeIcon('git-branch');
        }
    }
}

// Tree data provider implementation
export class AcmeTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    // Store the flow data
    private flows: FlowDetails[] = [];
    // Store deployment data
    private deployments: DeploymentDetails[] = [];
    // Store tree data
    private data: { [key: string]: TreeItem[] } = {};
    // Loading state
    private isLoading: boolean = false;

    constructor() {
        // Initial load
        this.loadFlows();
    }

    /**
     * Load flows from Python files and deployment info from Prefect
     */
    public async loadFlows(): Promise<void> {
        this.isLoading = true;
        this.refresh(); // Show loading indicator
        
        try {
            // Load flows first
            this.flows = await FlowScanner.scanForFlows();
            console.log(`Loaded ${this.flows.length} flows`);
            
            // Then load deployments
            this.deployments = await DeploymentScanner.scanForDeployments();
            console.log(`Loaded ${this.deployments.length} deployments`);
            
            this.buildTreeData();
        } catch (error) {
            vscode.window.showErrorMessage(`Error loading data: ${error}`);
            this.flows = [];
            this.deployments = [];
            this.data = {};
        } finally {
            this.isLoading = false;
            this.refresh();
        }
    }

    /**
     * Build the tree data from flows and deployments
     */
    private buildTreeData(): void {
        this.data = {}; // Reset the data

        console.log(`Building tree data from ${this.flows.length} flows and ${this.deployments.length} deployments`);
        
        // Create flow items for first level
        const flowItems = this.flows.map(flow => {
            // Use flow.name for display but ensure id is used for identification
            const flowName = flow.name;
            console.log(`Creating tree item for flow: ${flowName} with id: ${flow.id}`);
            
            return new TreeItem(
                flowName, 
                vscode.TreeItemCollapsibleState.Collapsed, 
                'flow', 
                flow
            );
        });
        
        this.data['root'] = flowItems;
        
        // For each flow, create its details and branch/env structure
        for (const flow of this.flows) {
            const flowName = flow.name;
            const flowId = flow.id || flowName; // Fallback to name if id is missing
            
            // Find all deployments for this flow
            const flowDeployments = this.deployments.filter(
                d => d.flow_name === flowName
            );
            
            console.log(`Flow ${flowName} has ${flowDeployments.length} deployments`);
            
            const children = []; // Children of the flow item
            
            // Add basic flow details
            if (flow.description) {
                children.push(new TreeItem(
                    `Description: ${flow.description}`,
                    vscode.TreeItemCollapsibleState.None,
                    'detail',
                    flow,
                    undefined,
                    flowId
                ));
            }
            
            // Get relative source path from flows root directory
            const flowsPath = SettingsManager.getAbsoluteFlowsPath();
            let sourcePath = path.basename(flow.source_file);
            
            if (flowsPath && flow.source_file.startsWith(flowsPath)) {
                sourcePath = path.relative(flowsPath, flow.source_file);
            }
            
            children.push(new TreeItem(
                `Source: ${sourcePath}`,
                vscode.TreeItemCollapsibleState.None,
                'detail',
                flow,
                undefined,
                flowId
            ));
            
            // Check if original_name property exists before using it
            if (flow.original_name && flow.original_name !== flow.name) {
                children.push(new TreeItem(
                    `Function: ${flow.original_name}`,
                    vscode.TreeItemCollapsibleState.None,
                    'detail',
                    flow,
                    undefined,
                    flowId
                ));
            }
            
            // Group deployments by branch
            const branchMap = new Map<string, DeploymentDetails[]>();
            for (const deployment of flowDeployments) {
                if (!branchMap.has(deployment.branch)) {
                    branchMap.set(deployment.branch, []);
                }
                branchMap.get(deployment.branch)!.push(deployment);
            }
            
            // Add branch items
            for (const [branch, branchDeployments] of branchMap.entries()) {
                const branchItem = new TreeItem(
                    `Branch: ${branch}`,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'branch',
                    flow,
                    undefined,
                    flowId
                );
                children.push(branchItem);
                
                // Create environment items under this branch
                const branchId = branchItem.id!;
                const envMap = new Map<string, DeploymentDetails[]>();
                
                for (const deployment of branchDeployments) {
                    if (!envMap.has(deployment.env)) {
                        envMap.set(deployment.env, []);
                    }
                    envMap.get(deployment.env)!.push(deployment);
                }
                
                const envItems = [];
                for (const [env, envDeployments] of envMap.entries()) {
                    // Extract the environment name without the "Environment: " prefix
                    const envName = env;
                    
                    const envItem = new TreeItem(
                        `Environment: ${env}`,
                        vscode.TreeItemCollapsibleState.Collapsed,
                        'env',
                        flow,
                        undefined,
                        branchId,
                        envName  // Pass the environment name
                    );
                    envItems.push(envItem);
                    
                    // Create details for this environment's deployments
                    const envId = envItem.id!;
                    const envDetailItems = [];
                    
                    // Use index to ensure unique IDs for details with the same content
                    let detailIndex = 0;
                    
                    for (const deployment of envDeployments) {
                        // Add tag information
                        for (const tag of deployment.tags) {
                            if (tag.includes('COMMIT_HASH')) {
                                const hash = tag.split('=')[1];
                                envDetailItems.push(new TreeItem(
                                    `Commit: ${hash}`,
                                    vscode.TreeItemCollapsibleState.None,
                                    'detail',
                                    flow,
                                    deployment,
                                    `${envId}-detail-${detailIndex++}` // Use unique index-based ID
                                ));
                            } else if (tag.includes('PACKAGE_VERSION')) {
                                const version = tag.split('=')[1];
                                envDetailItems.push(new TreeItem(
                                    `Package: ${version}`,
                                    vscode.TreeItemCollapsibleState.None,
                                    'detail',
                                    flow,
                                    deployment,
                                    `${envId}-detail-${detailIndex++}` // Use unique index-based ID
                                ));
                            }
                        }
                        
                        // Add creation date
                        envDetailItems.push(new TreeItem(
                            `Created: ${new Date(deployment.created).toLocaleString()}`,
                            vscode.TreeItemCollapsibleState.None,
                            'detail',
                            flow,
                            deployment,
                            `${envId}-detail-${detailIndex++}` // Use unique index-based ID
                        ));
                    }
                    
                    // Store env details
                    this.data[envId] = envDetailItems;
                }
                
                // Store environment items under the branch
                this.data[branchId] = envItems;
            }
            
            // Store all flow children (details + branches)
            this.data[flowId] = children;
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TreeItem): vscode.TreeItem {
        if (this.isLoading && !element) {
            const item = new vscode.TreeItem("Loading flows...");
            item.iconPath = new vscode.ThemeIcon('loading~spin');
            return item;
        }
        return element;
    }

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        if (this.isLoading && !element) {
            return Promise.resolve([new TreeItem("Loading flows...", vscode.TreeItemCollapsibleState.None, 'detail')]);
        }
        
        if (!element) {
            // Root level - return flows
            return Promise.resolve(this.data['root'] || []);
        }

        // Return children of the element if they exist
        const children = this.data[element.id!];
        return Promise.resolve(children || []);
    }

    getParent(element: TreeItem): vscode.ProviderResult<TreeItem> {
        if (element.parentId) {
            // Find parent element based on parentId
            for (const key in this.data) {
                const items = this.data[key];
                for (const item of items) {
                    if (item.id === element.parentId) {
                        return item;
                    }
                }
            }
        }
        return null;
    }
}
