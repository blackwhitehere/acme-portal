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
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'searchFlow':
                    this.flowSearchQuery = message.query;
                    this.applySearch();
                    break;
                case 'searchDeployment':
                    this.deploymentSearchQuery = message.query;
                    this.applySearch();
                    break;
                case 'toggleFlowRegex':
                    this.flowRegexMode = message.enabled;
                    this.applySearch();
                    break;
                case 'toggleDeploymentRegex':
                    this.deploymentRegexMode = message.enabled;
                    this.applySearch();
                    break;
                case 'clearSearch':
                    this.clearAllSearch();
                    break;
            }
        });

        // Send initial state
        this.updateWebview();
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ACME Portal Search</title>
    <style>
        body {
            padding: 10px;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        
        .search-section {
            margin-bottom: 15px;
        }
        
        .search-label {
            font-weight: 600;
            margin-bottom: 5px;
            display: block;
            color: var(--vscode-foreground);
        }
        
        .search-container {
            display: flex;
            gap: 5px;
            align-items: center;
        }
        
        .search-input {
            flex: 1;
            padding: 6px 8px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 2px;
            font-size: 13px;
        }
        
        .search-input:focus {
            outline: 1px solid var(--vscode-focusBorder);
            outline-offset: -1px;
        }
        
        .regex-button {
            padding: 4px 8px;
            border: 1px solid var(--vscode-button-border);
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border-radius: 2px;
            cursor: pointer;
            font-size: 11px;
            min-width: 50px;
            text-align: center;
        }
        
        .regex-button.active {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        
        .regex-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .search-help {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-top: 3px;
            line-height: 1.3;
        }
        
        .results-section {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid var(--vscode-widget-border);
        }
        
        .results-count {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
        }
        
        .clear-button {
            width: 100%;
            padding: 6px;
            border: 1px solid var(--vscode-button-border);
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border-radius: 2px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .clear-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
    </style>
</head>
<body>
    <div class="search-section">
        <label class="search-label">Flow Search</label>
        <div class="search-container">
            <input 
                type="text" 
                id="flowSearch" 
                class="search-input" 
                placeholder="name:my-flow, source:data, general search..."
                value=""
            />
            <button id="flowRegexBtn" class="regex-button" title="Toggle regex mode">.*</button>
        </div>
        <div class="search-help">Use field:value for specific searches (name, source, description)</div>
    </div>
    
    <div class="search-section">
        <label class="search-label">Deployment Search</label>
        <div class="search-container">
            <input 
                type="text" 
                id="deploymentSearch" 
                class="search-input" 
                placeholder="env:prod, branch:main, name:deployment..."
                value=""
            />
            <button id="deploymentRegexBtn" class="regex-button" title="Toggle regex mode">.*</button>
        </div>
        <div class="search-help">Use field:value for specific searches (env, branch, name)</div>
    </div>
    
    <div class="results-section">
        <div id="resultsCount" class="results-count">No active search</div>
        <button id="clearBtn" class="clear-button">Clear All Search</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        let debounceTimeout;
        
        function debounce(func, wait) {
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(debounceTimeout);
                    func(...args);
                };
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(later, wait);
            };
        }
        
        // Flow search input
        const flowInput = document.getElementById('flowSearch');
        const flowRegexBtn = document.getElementById('flowRegexBtn');
        
        const debouncedFlowSearch = debounce((query) => {
            vscode.postMessage({
                command: 'searchFlow',
                query: query
            });
        }, 300);
        
        flowInput.addEventListener('input', (e) => {
            debouncedFlowSearch(e.target.value);
        });
        
        flowRegexBtn.addEventListener('click', () => {
            const isActive = flowRegexBtn.classList.toggle('active');
            vscode.postMessage({
                command: 'toggleFlowRegex',
                enabled: isActive
            });
        });
        
        // Deployment search input
        const deploymentInput = document.getElementById('deploymentSearch');
        const deploymentRegexBtn = document.getElementById('deploymentRegexBtn');
        
        const debouncedDeploymentSearch = debounce((query) => {
            vscode.postMessage({
                command: 'searchDeployment',
                query: query
            });
        }, 300);
        
        deploymentInput.addEventListener('input', (e) => {
            debouncedDeploymentSearch(e.target.value);
        });
        
        deploymentRegexBtn.addEventListener('click', () => {
            const isActive = deploymentRegexBtn.classList.toggle('active');
            vscode.postMessage({
                command: 'toggleDeploymentRegex',
                enabled: isActive
            });
        });
        
        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            flowInput.value = '';
            deploymentInput.value = '';
            flowRegexBtn.classList.remove('active');
            deploymentRegexBtn.classList.remove('active');
            vscode.postMessage({ command: 'clearSearch' });
            updateResultsCount(0, 0);
        });
        
        // Update results count
        function updateResultsCount(flows, deployments) {
            const resultsElement = document.getElementById('resultsCount');
            if (flows === 0 && deployments === 0 && !flowInput.value && !deploymentInput.value) {
                resultsElement.textContent = 'No active search';
            } else {
                resultsElement.textContent = \`Found \${flows} flows, \${deployments} deployments\`;
            }
        }
        
        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateResults':
                    updateResultsCount(message.flows, message.deployments);
                    break;
                case 'updateState':
                    flowInput.value = message.flowQuery;
                    deploymentInput.value = message.deploymentQuery;
                    if (message.flowRegexMode) {
                        flowRegexBtn.classList.add('active');
                    } else {
                        flowRegexBtn.classList.remove('active');
                    }
                    if (message.deploymentRegexMode) {
                        deploymentRegexBtn.classList.add('active');
                    } else {
                        deploymentRegexBtn.classList.remove('active');
                    }
                    break;
            }
        });
    </script>
</body>
</html>`;
    }

    private updateWebview() {
        if (this._view) {
            const resultCount = this.treeDataProvider.getFilteredItemsCount();
            this._view.webview.postMessage({
                command: 'updateResults',
                flows: resultCount.flows,
                deployments: resultCount.deployments
            });
            
            this._view.webview.postMessage({
                command: 'updateState',
                flowQuery: this.flowSearchQuery,
                deploymentQuery: this.deploymentSearchQuery,
                flowRegexMode: this.flowRegexMode,
                deploymentRegexMode: this.deploymentRegexMode
            });
        }
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
        
        // Update webview with new results
        this.updateWebview();
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
        this.updateWebview();
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