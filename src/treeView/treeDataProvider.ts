import * as vscode from 'vscode';
import * as path from 'path';
import { FlowScanner, FlowDetails } from '../flowDiscovery/flowScanner';
import { DeploymentScanner, DeploymentDetails } from '../deploymentDiscovery/deploymentScanner';
import { SettingsManager } from '../settings/settingsManager';
import { 
    BaseTreeItem,
    FlowTreeItem,
    BranchTreeItem,
    EnvironmentTreeItem,
    DetailTreeItem
} from './items';

// Tree data provider implementation
export class AcmeTreeDataProvider implements vscode.TreeDataProvider<BaseTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<BaseTreeItem | undefined | null | void> = new vscode.EventEmitter<BaseTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<BaseTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    // Store the flow data
    private flows: FlowDetails[] = [];
    // Store deployment data
    private deployments: DeploymentDetails[] = [];
    // Store tree data
    private data: { [key: string]: BaseTreeItem[] } = {};
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
        const flowItems = this.flows.map(flow => new FlowTreeItem(flow));
        
        this.data['root'] = flowItems;
        
        // For each flow, create its details and branch/env structure
        for (const flow of this.flows) {
            const flowId = flow.id || flow.name; // Fallback to name if id is missing
            
            // Find all deployments for this flow
            const flowDeployments = this.deployments.filter(
                d => d.flow_name === flow.name
            );
            
            console.log(`Flow ${flow.name} has ${flowDeployments.length} deployments`);
            
            const children: BaseTreeItem[] = []; // Children of the flow item
            
            // Add basic flow details
            if (flow.description) {
                children.push(new DetailTreeItem(
                    `Description: ${flow.description}`,
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
            
            children.push(new DetailTreeItem(
                `Source: ${sourcePath}`,
                flow,
                undefined,
                flowId
            ));
            
            // Check if original_name property exists before using it
            if (flow.original_name && flow.original_name !== flow.name) {
                children.push(new DetailTreeItem(
                    `Function: ${flow.original_name}`,
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
                const branchItem = new BranchTreeItem(branch, flow, flowId);
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
                
                const envItems: BaseTreeItem[] = [];
                for (const [env, envDeployments] of envMap.entries()) {
                    // Check if there are multiple deployments for this environment
                    if (envDeployments.length > 1) {
                        vscode.window.showErrorMessage(
                            `Multiple deployments found for environment '${env}' in branch '${branch}' for flow '${flow.name}'.`
                        );
                    }
                    
                    const envItem = new EnvironmentTreeItem(
                        env, 
                        flow, 
                        envDeployments[0], 
                        branchId
                    );
                    envItems.push(envItem);
                    
                    // Create details for this environment's deployments
                    const envId = envItem.id!;
                    const envDetailItems: BaseTreeItem[] = [];
                    
                    // Use index to ensure unique IDs for details with the same content
                    let detailIndex = 0;
                    
                    for (const deployment of envDeployments) {
                        // Add tag information
                        for (const tag of deployment.tags) {
                            if (tag.includes('COMMIT_HASH')) {
                                const hash = tag.split('=')[1];
                                envDetailItems.push(new DetailTreeItem(
                                    `Commit: ${hash}`,
                                    flow,
                                    deployment,
                                    `${envId}-detail-${detailIndex++}`
                                ));
                            } else if (tag.includes('PACKAGE_VERSION')) {
                                const version = tag.split('=')[1];
                                envDetailItems.push(new DetailTreeItem(
                                    `Package Version: ${version}`,
                                    flow,
                                    deployment,
                                    `${envId}-detail-${detailIndex++}`
                                ));
                            }
                        }
                        
                        // Add creation date
                        const d = new Date(deployment.updated);
                        const formattedDate = d.toISOString().replace('T', ' ').substring(0, 19);
                        
                        envDetailItems.push(new DetailTreeItem(
                            `Updated: ${formattedDate}`,
                            flow,
                            deployment,
                            `${envId}-detail-${detailIndex++}`
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

    getTreeItem(element: BaseTreeItem): vscode.TreeItem {
        if (this.isLoading && !element) {
            const item = new vscode.TreeItem("Loading flows...");
            item.iconPath = new vscode.ThemeIcon('loading~spin');
            return item;
        }
        return element;
    }

    // Made public so it can be used by the compareFlowVersions command
    public getChildren(element?: BaseTreeItem): Thenable<BaseTreeItem[]> {
        if (this.isLoading && !element) {
            return Promise.resolve([
                new DetailTreeItem("Loading flows...")
            ]);
        }
        
        if (!element) {
            // Root level - return flows
            return Promise.resolve(this.data['root'] || []);
        }

        // Return children of the element if they exist
        const children = this.data[element.id!];
        return Promise.resolve(children || []);
    }

    getParent(element: BaseTreeItem): vscode.ProviderResult<BaseTreeItem> {
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
