import * as vscode from 'vscode';
import { FlowTreeDataProvider } from './treeDataProvider';
import { SearchUtils, SearchCriteria } from '../utils/searchUtils';

/**
 * Tree item for search inputs
 */
class SearchInputTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly inputType: 'flow' | 'deployment',
        public readonly searchValue: string = '',
        public readonly isRegexMode: boolean = false
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.contextValue = `searchInput_${inputType}`;
        this.tooltip = this.getTooltip();
        this.description = this.getDescription();
        this.command = {
            command: 'acmeportal.openSearchInput',
            title: 'Edit Search',
            arguments: [inputType, searchValue]
        };
    }

    private getTooltip(): string {
        const examples = this.inputType === 'flow' 
            ? 'Examples: name:my-flow, source:data, general search'
            : 'Examples: env:prod, branch:main, name:deployment';
        return `${this.label}\n${examples}`;
    }

    private getDescription(): string {
        if (this.searchValue) {
            const regexIndicator = this.isRegexMode ? ' (regex)' : '';
            return `"${this.searchValue}"${regexIndicator}`;
        }
        return 'Click to search...';
    }
}

/**
 * Tree item for search results
 */
class SearchResultTreeItem extends vscode.TreeItem {
    constructor(
        public readonly flowCount: number,
        public readonly deploymentCount: number
    ) {
        super('Search Results', vscode.TreeItemCollapsibleState.None);
        this.contextValue = 'searchResults';
        this.description = `${flowCount} flows, ${deploymentCount} deployments`;
        this.tooltip = `Found ${flowCount} matching flows and ${deploymentCount} matching deployments`;
    }
}

/**
 * Tree item for search actions
 */
class SearchActionTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly actionType: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.contextValue = `searchAction_${actionType}`;
        this.command = {
            command: `acmeportal.search${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`,
            title: label
        };
    }
}

/**
 * Provides native VS Code tree view-based search interface
 */
export class SearchViewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    public static readonly viewType = 'acmePortalSearchView';

    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private flowSearchQuery: string = '';
    private deploymentSearchQuery: string = '';
    private flowRegexMode: boolean = false;
    private deploymentRegexMode: boolean = false;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly treeDataProvider: FlowTreeDataProvider
    ) {}

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (!element) {
            // Root level items
            const resultCount = this.treeDataProvider.getFilteredItemsCount();
            
            return Promise.resolve([
                new SearchInputTreeItem('Flow Search', 'flow', this.flowSearchQuery, this.flowRegexMode),
                new SearchInputTreeItem('Deployment Search', 'deployment', this.deploymentSearchQuery, this.deploymentRegexMode),
                new SearchResultTreeItem(resultCount.flows, resultCount.deployments),
                new SearchActionTreeItem('Clear Search', 'clear')
            ]);
        }
        return Promise.resolve([]);
    }

    /**
     * Refresh the tree view
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Open search input for flow or deployment
     */
    public async openSearchInput(inputType: 'flow' | 'deployment', currentValue: string = ''): Promise<void> {
        const title = inputType === 'flow' ? 'Search Flows' : 'Search Deployments';
        const placeholder = inputType === 'flow' 
            ? 'Search flows (e.g., name:my-flow, source:data, general search)'
            : 'Search deployments (e.g., env:prod, branch:main, name:deployment)';

        const searchValue = await vscode.window.showInputBox({
            title,
            placeHolder: placeholder,
            value: currentValue,
            prompt: 'Use field:value for specific searches, or enter general search terms'
        });

        if (searchValue !== undefined) {
            if (inputType === 'flow') {
                this.flowSearchQuery = searchValue;
            } else {
                this.deploymentSearchQuery = searchValue;
            }
            this.applySearch();
            this.refresh();
        }
    }

    /**
     * Toggle regex mode for a search type
     */
    public async toggleRegexMode(inputType: 'flow' | 'deployment'): Promise<void> {
        if (inputType === 'flow') {
            this.flowRegexMode = !this.flowRegexMode;
        } else {
            this.deploymentRegexMode = !this.deploymentRegexMode;
        }
        
        vscode.window.showInformationMessage(
            `Regex mode ${inputType === 'flow' ? this.flowRegexMode : this.deploymentRegexMode ? 'enabled' : 'disabled'} for ${inputType} search`
        );
        
        this.applySearch();
        this.refresh();
    }

    /**
     * Apply current search criteria to tree data provider
     */
    private applySearch(): void {
        const criteria: SearchCriteria[] = [];

        // Add flow search criteria
        if (this.flowSearchQuery.trim()) {
            if (this.flowSearchQuery.includes(':')) {
                // Parse field-specific search and set type to 'flow'
                const flowCriteria = SearchUtils.parseSearchQuery(this.flowSearchQuery);
                flowCriteria.forEach(criterion => {
                    criterion.type = 'flow';
                    criterion.isRegex = this.flowRegexMode;
                });
                criteria.push(...flowCriteria);
            } else {
                // General flow search
                criteria.push({
                    field: 'all',
                    value: this.flowSearchQuery.trim(),
                    isRegex: this.flowRegexMode,
                    type: 'flow'
                });
            }
        }

        // Add deployment search criteria  
        if (this.deploymentSearchQuery.trim()) {
            if (this.deploymentSearchQuery.includes(':')) {
                // Parse field-specific search and set type to 'deployment'
                const deploymentCriteria = SearchUtils.parseSearchQuery(this.deploymentSearchQuery);
                deploymentCriteria.forEach(criterion => {
                    criterion.type = 'deployment';
                    criterion.isRegex = this.deploymentRegexMode;
                });
                criteria.push(...deploymentCriteria);
            } else {
                // General deployment search
                criteria.push({
                    field: 'all',
                    value: this.deploymentSearchQuery.trim(),
                    isRegex: this.deploymentRegexMode,
                    type: 'deployment'
                });
            }
        }

        if (criteria.length > 0) {
            this.treeDataProvider.applySearch(criteria);
        } else {
            this.treeDataProvider.clearSearch();
        }
    }

    /**
     * Clear all search filters
     */
    public clearAllSearch(): void {
        this.flowSearchQuery = '';
        this.deploymentSearchQuery = '';
        this.flowRegexMode = false;
        this.deploymentRegexMode = false;
        this.treeDataProvider.clearSearch();
        this.refresh();
    }

    /**
     * Get current search state
     */
    public getCurrentSearchState(): {
        flowQuery: string;
        deploymentQuery: string;
        flowRegexMode: boolean;
        deploymentRegexMode: boolean;
    } {
        return {
            flowQuery: this.flowSearchQuery,
            deploymentQuery: this.deploymentSearchQuery,
            flowRegexMode: this.flowRegexMode,
            deploymentRegexMode: this.deploymentRegexMode
        };
    }
}