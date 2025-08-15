/**
 * LEGACY FILE - NOT CURRENTLY IN USE
 * 
 * This JavaScript file was originally intended for handling webview interactions
 * in the ACME Portal VSCode extension search interface. However, the current 
 * implementation uses inline JavaScript within src/treeView/searchViewProvider.ts instead.
 * 
 * Current search implementation location: src/treeView/searchViewProvider.ts
 * This file contains the _getHtmlForWebview() method with embedded JavaScript in a <script> tag.
 * 
 * This file remains as a reference for potential future refactoring to external scripts.
 */

// @ts-check
(function() {
    // @ts-ignore
    const vscode = acquireVsCodeApi();

    // Get references to DOM elements
    const flowSearchInput = document.getElementById('flowSearch');
    const deploymentSearchInput = document.getElementById('deploymentSearch');
    const flowRegexToggle = document.getElementById('flowRegexToggle');
    const deploymentRegexToggle = document.getElementById('deploymentRegexToggle');
    const clearButton = document.getElementById('clearSearch');
    const flowCountSpan = document.getElementById('flowCount');
    const deploymentCountSpan = document.getElementById('deploymentCount');
    const searchDetails = document.querySelector('.search-section-collapsible');

    let flowRegexMode = false;
    let deploymentRegexMode = false;

    // Debounce function to limit search frequency
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Handle flow search input changes
    const debouncedFlowSearch = debounce(() => {
        vscode.postMessage({
            type: 'flowSearchChanged',
            value: flowSearchInput.value,
            isRegex: flowRegexMode
        });
    }, 300);

    // Handle deployment search input changes
    const debouncedDeploymentSearch = debounce(() => {
        vscode.postMessage({
            type: 'deploymentSearchChanged',
            value: deploymentSearchInput.value,
            isRegex: deploymentRegexMode
        });
    }, 300);

    // Flow search input event listeners
    flowSearchInput.addEventListener('input', () => {
        // Auto-open search section if user starts typing
        if (flowSearchInput.value && !searchDetails.open) {
            searchDetails.open = true;
        }
        debouncedFlowSearch();
    });
    
    flowSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            debouncedFlowSearch.cancel();
            vscode.postMessage({
                type: 'flowSearchChanged',
                value: flowSearchInput.value,
                isRegex: flowRegexMode
            });
        }
    });

    // Deployment search input event listeners
    deploymentSearchInput.addEventListener('input', () => {
        // Auto-open search section if user starts typing
        if (deploymentSearchInput.value && !searchDetails.open) {
            searchDetails.open = true;
        }
        debouncedDeploymentSearch();
    });
    
    deploymentSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            debouncedDeploymentSearch.cancel();
            vscode.postMessage({
                type: 'deploymentSearchChanged',
                value: deploymentSearchInput.value,
                isRegex: deploymentRegexMode
            });
        }
    });

    // Flow regex toggle
    flowRegexToggle.addEventListener('click', () => {
        flowRegexMode = !flowRegexMode;
        flowRegexToggle.classList.toggle('active', flowRegexMode);
        flowRegexToggle.setAttribute('title', 
            flowRegexMode ? 'Regex mode active' : 'Toggle regex mode'
        );
        
        // Trigger search update if there's content
        if (flowSearchInput.value.trim()) {
            vscode.postMessage({
                type: 'flowSearchChanged',
                value: flowSearchInput.value,
                isRegex: flowRegexMode
            });
        }
    });

    // Deployment regex toggle
    deploymentRegexToggle.addEventListener('click', () => {
        deploymentRegexMode = !deploymentRegexMode;
        deploymentRegexToggle.classList.toggle('active', deploymentRegexMode);
        deploymentRegexToggle.setAttribute('title', 
            deploymentRegexMode ? 'Regex mode active' : 'Toggle regex mode'
        );
        
        // Trigger search update if there's content
        if (deploymentSearchInput.value.trim()) {
            vscode.postMessage({
                type: 'deploymentSearchChanged',
                value: deploymentSearchInput.value,
                isRegex: deploymentRegexMode
            });
        }
    });

    // Clear search button
    clearButton.addEventListener('click', () => {
        vscode.postMessage({
            type: 'clearSearch'
        });
    });

    // Handle messages from extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.type) {
            case 'updateResults':
                flowCountSpan.textContent = message.flows.toString();
                deploymentCountSpan.textContent = message.deployments.toString();
                break;
                
            case 'resetInputs':
                flowSearchInput.value = '';
                deploymentSearchInput.value = '';
                flowRegexMode = false;
                deploymentRegexMode = false;
                flowRegexToggle.classList.remove('active');
                deploymentRegexToggle.classList.remove('active');
                flowRegexToggle.setAttribute('title', 'Toggle regex mode');
                deploymentRegexToggle.setAttribute('title', 'Toggle regex mode');
                flowCountSpan.textContent = '0';
                deploymentCountSpan.textContent = '0';
                break;
        }
    });

    // Add debounce cancel to global scope for cleanup
    debouncedFlowSearch.cancel = function() {
        clearTimeout(this.timeout);
    };
    
    debouncedDeploymentSearch.cancel = function() {
        clearTimeout(this.timeout);
    };
})();