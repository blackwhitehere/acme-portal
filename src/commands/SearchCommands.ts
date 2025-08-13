import * as vscode from 'vscode';
import { FlowTreeDataProvider } from '../treeView/treeDataProvider';
import { SearchUtils, SearchCriteria } from '../utils/searchUtils';

/**
 * Commands for search functionality
 */
export class SearchCommands {
    private currentSearchQuery: string = '';
    private searchInputBox: vscode.InputBox | undefined;

    constructor(
        private readonly treeDataProvider: FlowTreeDataProvider
    ) {}

    /**
     * Open search input dialog
     */
    public async searchFlows(): Promise<void> {
        const query = await vscode.window.showInputBox({
            prompt: 'Search flows and deployments (use field:value for specific fields)',
            placeHolder: 'e.g., name:my-flow env:prod branch:main',
            value: this.currentSearchQuery,
            valueSelection: this.currentSearchQuery ? [0, this.currentSearchQuery.length] : undefined
        });

        if (query !== undefined) {
            this.currentSearchQuery = query;
            this.applySearch(query);
        }
    }

    /**
     * Clear current search and show all items
     */
    public clearSearch(): void {
        this.currentSearchQuery = '';
        this.treeDataProvider.clearSearch();
        vscode.window.showInformationMessage('Search cleared');
    }

    /**
     * Apply search with the given query
     */
    private applySearch(query: string): void {
        if (!query.trim()) {
            this.clearSearch();
            return;
        }

        const criteria = SearchUtils.parseSearchQuery(query);
        this.treeDataProvider.applySearch(criteria);
        
        const resultCount = this.treeDataProvider.getFilteredItemsCount();
        vscode.window.showInformationMessage(
            `Search applied: "${query}" (${resultCount.flows} flows, ${resultCount.deployments} deployments)`
        );
    }

    /**
     * Show search help information
     */
    public showSearchHelp(): void {
        const helpMessage = `
**ACME Portal Search Help**

**Basic Search:**
- Enter any text to search across all flow and deployment fields
- Search is case-insensitive by default

**Field-Specific Search:**
Use "field:value" format to search specific fields:

**Flow Fields:**
- name: Flow name
- description: Flow description  
- module: Python module name
- grouping: Grouping path
- obj_type: Object type (function, method, etc.)

**Deployment Fields:**
- env: Environment (dev, staging, prod)
- branch: Git branch name
- project_name: Project name
- tags: Deployment tags

**Examples:**
- \`name:my-flow\` - Find flows with "my-flow" in name
- \`env:prod\` - Find deployments in production environment
- \`branch:main env:staging\` - Multiple criteria
- \`my-flow\` - General search across all fields

**Tips:**
- Use spaces to separate multiple search terms
- Combine flow and deployment searches
- Use the clear button to reset search
        `.trim();

        vscode.window.showInformationMessage(helpMessage, { modal: true });
    }

    /**
     * Get current search query
     */
    public getCurrentSearchQuery(): string {
        return this.currentSearchQuery;
    }

    /**
     * Check if search is currently active
     */
    public isSearchActive(): boolean {
        return this.currentSearchQuery.trim().length > 0;
    }
}