import * as vscode from 'vscode';
import { FlowTreeDataProvider } from './treeDataProvider';
import { SearchUtils, SearchCriteria } from '../utils/searchUtils';

/**
 * Provides webview-based persistent search interface
 */
export class SearchViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'acmePortalSearchView';

    private _view?: vscode.WebviewView;
    private flowSearchQuery: string = '';
    private deploymentSearchQuery: string = '';
    private flowRegexMode: boolean = false;
    private deploymentRegexMode: boolean = false;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly treeDataProvider: FlowTreeDataProvider
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            message => {
                switch (message.type) {
                    case 'flowSearchChanged':
                        this.flowSearchQuery = message.value;
                        this.flowRegexMode = message.isRegex;
                        this.applySearch();
                        break;
                    case 'deploymentSearchChanged':
                        this.deploymentSearchQuery = message.value;
                        this.deploymentRegexMode = message.isRegex;
                        this.applySearch();
                        break;
                    case 'clearSearch':
                        this.clearAllSearch();
                        break;
                }
            },
            undefined,
        );
    }

    /**
     * Apply current search criteria to tree data provider
     */
    private applySearch(): void {
        const criteria: SearchCriteria[] = [];

        // Add flow search criteria
        if (this.flowSearchQuery.trim()) {
            if (this.flowSearchQuery.includes(':')) {
                // Parse field-specific search
                criteria.push(...SearchUtils.parseSearchQuery(this.flowSearchQuery));
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
                // Parse field-specific search
                criteria.push(...SearchUtils.parseSearchQuery(this.deploymentSearchQuery));
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

        // Update search result counts in the webview
        this.updateSearchResults();
    }

    /**
     * Clear all search filters
     */
    private clearAllSearch(): void {
        this.flowSearchQuery = '';
        this.deploymentSearchQuery = '';
        this.flowRegexMode = false;
        this.deploymentRegexMode = false;
        this.treeDataProvider.clearSearch();
        
        // Reset webview inputs
        if (this._view) {
            this._view.webview.postMessage({
                type: 'resetInputs'
            });
        }
        
        this.updateSearchResults();
    }

    /**
     * Update search result counts in the webview
     */
    private updateSearchResults(): void {
        if (this._view) {
            const resultCount = this.treeDataProvider.getFilteredItemsCount();
            this._view.webview.postMessage({
                type: 'updateResults',
                flows: resultCount.flows,
                deployments: resultCount.deployments
            });
        }
    }

    /**
     * Generate HTML content for the webview
     */
    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Get path to resource on disk
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'search.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'search.css'));

        // Use a nonce to only allow specific scripts to be run
        const nonce = this.getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>ACME Portal Search</title>
            </head>
            <body>
                <div class="search-container">
                    <details class="search-section-collapsible">
                        <summary class="search-section-header">Search</summary>
                        <div class="search-content">
                            <div class="search-input-section">
                                <div class="search-input-wrapper">
                                    <div class="search-input-container">
                                        <input type="text" id="flowSearch" placeholder="Search flows..." class="search-input" />
                                        <button id="flowRegexToggle" class="regex-toggle" title="Toggle regex mode">.*</button>
                                    </div>
                                    <label class="search-label">Flows</label>
                                </div>
                                
                                <div class="search-input-wrapper">
                                    <div class="search-input-container">
                                        <input type="text" id="deploymentSearch" placeholder="Search deployments..." class="search-input" />
                                        <button id="deploymentRegexToggle" class="regex-toggle" title="Toggle regex mode">.*</button>
                                    </div>
                                    <label class="search-label">Deployments</label>
                                </div>
                            </div>
                            
                            <div class="search-actions">
                                <button id="clearSearch" class="clear-button">Clear</button>
                                <div class="search-results">
                                    <span id="flowCount">0</span> flows, <span id="deploymentCount">0</span> deployments
                                </div>
                            </div>
                            
                            <details class="search-help">
                                <summary>Help</summary>
                                <div class="help-content">
                                    <div class="help-section">
                                        <span class="help-title">Field search:</span>
                                        <span class="help-text">name:value, env:prod, source:file</span>
                                    </div>
                                    <div class="help-section">
                                        <span class="help-title">Examples:</span>
                                        <span class="help-text">name:analytics, env:prod, general search</span>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </details>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
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