import * as vscode from 'vscode';
import { FindFlows, FlowDetails } from '../actions/findFlows';
import { FindDeployments, DeploymentDetails } from '../actions/findDeployments';
import { PreConditionChecker } from '../utils/preConditionChecker';
import { SearchUtils, SearchCriteria } from '../utils/searchUtils';
import { 
    BaseTreeItem,
    FlowTreeItem,
    BranchTreeItem,
    EnvironmentTreeItem,
    DetailTreeItem,
    GroupTreeItem,
    TagsDirectoryTreeItem,
    TagTreeItem
} from './items';

// Tree data provider implementation
export class FlowTreeDataProvider implements vscode.TreeDataProvider<BaseTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<BaseTreeItem | undefined | null | void> = new vscode.EventEmitter<BaseTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<BaseTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    // Store the flow data
    private flows: FlowDetails[] = [];
    // Store deployment data
    private deployments: DeploymentDetails[] = [];
    // Store tree data
    private data: { [key: string]: BaseTreeItem[] } = {};
    // Store filtered data when search is active
    private filteredFlows: FlowDetails[] = [];
    private filteredDeployments: DeploymentDetails[] = [];
    private searchCriteria: SearchCriteria[] = [];
    // Loading state
    private isLoading: boolean = false;

    constructor() {
        // Initial load
        this.loadFlows();
        // Initialize filtered data
        this.filteredFlows = [];
        this.filteredDeployments = [];
        this.searchCriteria = [];
    }

    /**
     * Load flows from Python files and deployment info from Prefect
     */
    public async loadFlows(): Promise<void> {
        this.isLoading = true;
        this.refresh(); // Show loading indicator
        
        // Show progress notification during data loading
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Loading ACME Portal data',
            cancellable: true
        }, async (progress, token) => {
            try {
                progress.report({ increment: 5, message: 'Checking preconditions...' });
                
                // Check all preconditions before attempting to load data
                const preConditionChecker = new PreConditionChecker();
                const results = await preConditionChecker.checkAllPreconditions();
                
                // Display any error or warning messages to the user
                PreConditionChecker.displayResults(results);
                
                // If preconditions are not met, stop loading
                if (!results.allPassed) {
                    progress.report({ increment: 100, message: 'Preconditions not met - loading stopped' });
                    this.flows = [];
                    this.deployments = [];
                    this.data = {};
                    return;
                }
                
                // Check for cancellation after precondition check
                if (token.isCancellationRequested) {
                    progress.report({ increment: 100, message: 'Loading cancelled' });
                    return;
                }
                
                progress.report({ increment: 15, message: 'Scanning for flows...' });
                
                // Load flows first
                this.flows = await FindFlows.scanForFlows();
                console.log(`Loaded ${this.flows.length} flows`);
                
                // Check for cancellation after loading flows
                if (token.isCancellationRequested) {
                    progress.report({ increment: 100, message: 'Loading cancelled' });
                    return;
                }
                
                progress.report({ increment: 50, message: `Found ${this.flows.length} flows, scanning deployments...` });
                
                // Then load deployments
                this.deployments = await FindDeployments.scanForDeployments();
                console.log(`Loaded ${this.deployments.length} deployments`);
                
                // Check for cancellation after loading deployments
                if (token.isCancellationRequested) {
                    progress.report({ increment: 100, message: 'Loading cancelled' });
                    return;
                }
                
                progress.report({ increment: 80, message: `Found ${this.deployments.length} deployments, building tree...` });
                
                this.buildTreeData();
                
                progress.report({ increment: 100, message: `✅ Loaded ${this.flows.length} flows and ${this.deployments.length} deployments` });
                
            } catch (error) {
                progress.report({ increment: 100, message: 'Loading failed' });
                vscode.window.showErrorMessage(`❌ Error loading data: ${error}`);
                this.flows = [];
                this.deployments = [];
                this.data = {};
            } finally {
                this.isLoading = false;
                this.refresh();
            }
        });
    }

    /**
     * Build the tree data from flows and deployments
     */
    private buildTreeData(): void {
        this.data = {}; // Reset the data

        // Use filtered data if search is active, otherwise use all data
        const flowsToUse = this.isSearchActive() ? this.filteredFlows : this.flows;
        const deploymentsToUse = this.isSearchActive() ? this.filteredDeployments : this.deployments;

        console.log(`Building tree data from ${flowsToUse.length} flows and ${deploymentsToUse.length} deployments`);
        
        // Create root items array and a map to track group nodes
        const rootItems: BaseTreeItem[] = [];
        const groupMap = new Map<string, GroupTreeItem>();
        
        // Organize flows into their groupings
        for (const flow of flowsToUse) {
            const flowItem = new FlowTreeItem(flow);
            const grouping = flow.grouping || [];
            
            if (grouping.length === 0) {
                // No grouping, add directly to root
                rootItems.push(flowItem);
            } else {
                // Build the grouping path hierarchy
                let currentPath = '';
                let parentId: string | undefined = undefined;
                
                for (let i = 0; i < grouping.length; i++) {
                    const groupName = grouping[i];
                    const isLastGroup = i === grouping.length - 1;
                    
                    // Build the path for this level
                    currentPath = currentPath ? `${currentPath}/${groupName}` : groupName;
                    
                    // Check if we already have a group for this path
                    if (!groupMap.has(currentPath)) {
                        // Create new group item
                        const groupItem = new GroupTreeItem(groupName, parentId, currentPath);
                        groupMap.set(currentPath, groupItem);
                        
                        // Add to root or parent group
                        if (!parentId) {
                            rootItems.push(groupItem);
                        } else {
                            if (!this.data[parentId]) {
                                this.data[parentId] = [];
                            }
                            this.data[parentId].push(groupItem);
                        }
                        
                        // Initialize empty children array
                        this.data[groupItem.id!] = [];
                    }
                    
                    // Get the current group item
                    const groupItem = groupMap.get(currentPath)!;
                    
                    // If this is the last group in the path, add the flow to it
                    if (isLastGroup) {
                        this.data[groupItem.id!].push(flowItem);
                    }
                    
                    // Update parent ID for next iteration
                    parentId = groupItem.id;
                }
            }
            
            // Setup flow details in the tree
            const flowId = flow.id || flow.name;
            // Find all deployments for this flow from the filtered deployments
            const flowDeployments = deploymentsToUse.filter(
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
            
            children.push(new DetailTreeItem(
                `Source: ${flow.source_relative}`,
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
            
            // Add child attributes if present
            if (flow.child_attributes) {
                for (const [key, value] of Object.entries(flow.child_attributes)) {
                    children.push(new DetailTreeItem(
                        `${key}: ${String(value)}`,
                        flow,
                        undefined,
                        flowId
                    ));
                }
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
                        // Add name attribute from deployment
                        envDetailItems.push(new DetailTreeItem(
                            `Name: ${deployment.name}`,
                            flow,
                            deployment,
                            `${envId}-detail-${detailIndex++}`
                        ));
                        
                        // Add project name attribute from deployment
                        envDetailItems.push(new DetailTreeItem(
                            `Project: ${deployment.project_name}`,
                            flow,
                            deployment,
                            `${envId}-detail-${detailIndex++}`
                        ));
                        
                        // Add commit hash from direct property (not from tags)
                        if (deployment.commit_hash) {
                            envDetailItems.push(new DetailTreeItem(
                                `Commit: ${deployment.commit_hash}`,
                                flow,
                                deployment,
                                `${envId}-detail-${detailIndex++}`
                            ));
                        }
                        
                        // Add package version from direct property (not from tags)
                        if (deployment.package_version) {
                            envDetailItems.push(new DetailTreeItem(
                                `Package Version: ${deployment.package_version}`,
                                flow,
                                deployment,
                                `${envId}-detail-${detailIndex++}`
                            ));
                        }
                        
                        // Add creation date
                        const d = new Date(deployment.updated_at);
                        const formattedDate = d.toISOString().replace('T', ' ').substring(0, 19);
                        
                        envDetailItems.push(new DetailTreeItem(
                            `Updated: ${formattedDate}`,
                            flow,
                            deployment,
                            `${envId}-detail-${detailIndex++}`
                        ));
                        
                        // Add child attributes if present
                        if (deployment.child_attributes) {
                            for (const [key, value] of Object.entries(deployment.child_attributes)) {
                                envDetailItems.push(new DetailTreeItem(
                                    `${key}: ${String(value)}`,
                                    flow,
                                    deployment,
                                    `${envId}-detail-${detailIndex++}`
                                ));
                            }
                        }
                        
                        // Add tags directory if deployment has tags
                        if (deployment.tags && deployment.tags.length > 0) {
                            const tagsDirectoryItem = new TagsDirectoryTreeItem(
                                flow,
                                deployment,
                                `${envId}-detail-${detailIndex++}`
                            );
                            envDetailItems.push(tagsDirectoryItem);
                            
                            // Create tag items for this tags directory
                            const tagItems: BaseTreeItem[] = [];
                            deployment.tags.forEach((tag, tagIndex) => {
                                tagItems.push(new TagTreeItem(
                                    tag,
                                    flow,
                                    deployment,
                                    `${tagsDirectoryItem.id}-tag-${tagIndex}`
                                ));
                            });
                            
                            // Store tag items under the tags directory
                            this.data[tagsDirectoryItem.id!] = tagItems;
                        }
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
        
        // Store root items
        this.data['root'] = rootItems;
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

    /**
     * Apply search criteria to filter flows and deployments
     * @param criteria Array of search criteria
     */
    public applySearch(criteria: SearchCriteria[]): void {
        if (criteria.length === 0) {
            this.clearSearch();
            return;
        }

        this.searchCriteria = criteria;
        
        // Filter flows and deployments using the new multiple criteria approach
        this.filteredFlows = SearchUtils.searchFlows(this.flows, criteria);
        this.filteredDeployments = SearchUtils.searchDeployments(this.deployments, criteria);

        // Additionally filter deployments to only include those belonging to filtered flows
        const filteredFlowNames = this.filteredFlows.map(f => f.name);
        this.filteredDeployments = SearchUtils.filterDeploymentsByFlows(this.filteredDeployments, filteredFlowNames);

        // Rebuild tree with filtered data
        this.buildTreeData();
        this.refresh();
    }

    /**
     * Clear search and show all items
     */
    public clearSearch(): void {
        this.searchCriteria = [];
        this.filteredFlows = [];
        this.filteredDeployments = [];
        this.buildTreeData();
        this.refresh();
    }

    /**
     * Check if search is currently active
     */
    public isSearchActive(): boolean {
        return this.searchCriteria.length > 0;
    }

    /**
     * Get count of filtered items
     */
    public getFilteredItemsCount(): { flows: number; deployments: number } {
        if (this.isSearchActive()) {
            return {
                flows: this.filteredFlows.length,
                deployments: this.filteredDeployments.length
            };
        }
        return {
            flows: this.flows.length,
            deployments: this.deployments.length
        };
    }

    /**
     * Get current search criteria
     */
    public getSearchCriteria(): SearchCriteria[] {
        return [...this.searchCriteria];
    }

    /**
     * Get all flows currently loaded
     */
    public getAllFlows(): FlowDetails[] {
        return [...this.flows];
    }

    /**
     * Refresh a subset of flows and their associated deployments
     * @param flowsToRefresh Array of flow details to refresh
     */
    public async refreshFlowsSubset(flowsToRefresh: FlowDetails[]): Promise<void> {
        if (flowsToRefresh.length === 0) {
            return;
        }

        // Show progress notification during data loading
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Refreshing ${flowsToRefresh.length} flow(s)`,
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 10, message: 'Refreshing flow data...' });
                
                // Refresh flows using the new scanSpecificFlows method
                const refreshedFlows = await FindFlows.scanSpecificFlows(flowsToRefresh);
                console.log(`Refreshed ${refreshedFlows.length} flows`);
                
                progress.report({ increment: 50, message: 'Refreshing deployment data...' });
                
                // Refresh deployments for these flows
                const refreshedDeployments = await FindDeployments.scanDeploymentsForFlows(flowsToRefresh);
                console.log(`Refreshed ${refreshedDeployments.length} deployments`);
                
                progress.report({ increment: 80, message: 'Updating tree data...' });
                
                // Update the main data arrays with refreshed data
                this.updateFlowsData(refreshedFlows);
                this.updateDeploymentsData(refreshedDeployments, flowsToRefresh);
                
                // Rebuild the tree with updated data
                this.buildTreeData();
                
                progress.report({ increment: 100, message: '✅ Refresh complete' });
                
            } catch (error) {
                progress.report({ increment: 100, message: 'Refresh failed' });
                vscode.window.showErrorMessage(`❌ Error refreshing flows: ${error}`);
            } finally {
                this.refresh();
            }
        });
    }

    /**
     * Update flows data by replacing existing flows with refreshed versions
     * @param refreshedFlows Array of refreshed flow details
     */
    private updateFlowsData(refreshedFlows: FlowDetails[]): void {
        // Create a map of refreshed flows by ID for efficient lookup
        const refreshedFlowMap = new Map<string, FlowDetails>();
        refreshedFlows.forEach(flow => {
            const flowId = flow.id || flow.name;
            refreshedFlowMap.set(flowId, flow);
        });
        
        // Update existing flows with refreshed data
        for (let i = 0; i < this.flows.length; i++) {
            const existingFlow = this.flows[i];
            const flowId = existingFlow.id || existingFlow.name;
            
            if (refreshedFlowMap.has(flowId)) {
                this.flows[i] = refreshedFlowMap.get(flowId)!;
                refreshedFlowMap.delete(flowId); // Mark as processed
            }
        }
        
        // Add any new flows that weren't in the existing set
        refreshedFlowMap.forEach(flow => {
            this.flows.push(flow);
        });
        
        // Update filtered flows if search is active
        if (this.isSearchActive()) {
            this.applySearch(this.searchCriteria);
        }
    }

    /**
     * Update deployments data by replacing deployments for the specified flows
     * @param refreshedDeployments Array of refreshed deployment details
     * @param refreshedFlows Array of flows that were refreshed
     */
    private updateDeploymentsData(refreshedDeployments: DeploymentDetails[], refreshedFlows: FlowDetails[]): void {
        // Get flow names for the refreshed flows
        const refreshedFlowNames = new Set(refreshedFlows.map(flow => flow.name));
        
        // Remove existing deployments for these flows
        this.deployments = this.deployments.filter(deployment => 
            !refreshedFlowNames.has(deployment.flow_name)
        );
        
        // Add the refreshed deployments
        this.deployments.push(...refreshedDeployments);
        
        // Update filtered deployments if search is active
        if (this.isSearchActive()) {
            this.applySearch(this.searchCriteria);
        }
    }
}
