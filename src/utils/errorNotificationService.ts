import * as vscode from 'vscode';

export interface SdkError {
    error_type: string;
    error_message: string;
    module_name: string;
    class_name: string;
    traceback: string;
}

/**
 * Service for handling and displaying SDK-related errors to users
 */
export class ErrorNotificationService {
    
    /**
     * Show a user-friendly error notification for SDK exceptions
     * @param error The structured SDK error information
     */
    public static showSdkError(error: SdkError): void {
        const friendlyMessage = this.createFriendlyErrorMessage(error);
        const detailAction = 'Show Details';
        
        vscode.window.showErrorMessage(friendlyMessage, detailAction).then(selection => {
            if (selection === detailAction) {
                this.showErrorDetails(error);
            }
        });
    }

    /**
     * Show a generic SDK error when structured error info is not available
     * @param errorMessage The generic error message
     * @param operation The operation that failed (e.g., "scanning for deployments")
     */
    public static showGenericSdkError(errorMessage: string, operation: string): void {
        const message = `Error ${operation}: ${errorMessage}`;
        vscode.window.showErrorMessage(message);
    }

    /**
     * Create a user-friendly error message based on the error type and context
     * @param error The structured SDK error information
     * @returns A user-friendly error message
     */
    private static createFriendlyErrorMessage(error: SdkError): string {
        const operation = this.getOperationName(error.class_name);
        
        // Handle common error types with specific messages
        switch (error.error_type) {
            case 'PrefectHTTPStatusError':
                if (error.error_message.includes('401 Unauthorized')) {
                    return `Authentication failed while ${operation}. Please check your credentials and try again.`;
                } else if (error.error_message.includes('403 Forbidden')) {
                    return `Access denied while ${operation}. Please check your permissions.`;
                } else if (error.error_message.includes('404 Not Found')) {
                    return `Resource not found while ${operation}. Please verify your configuration.`;
                } else {
                    return `HTTP error while ${operation}: ${this.extractHttpErrorMessage(error.error_message)}`;
                }
                
            case 'ConnectionError':
            case 'ConnectTimeout':
            case 'ReadTimeout':
                return `Connection failed while ${operation}. Please check your network connection and try again.`;
                
            case 'ModuleNotFoundError':
                return `Missing dependency while ${operation}. Please ensure all required packages are installed.`;
                
            case 'ImportError':
                return `Configuration error while ${operation}. Please check your project setup.`;
                
            case 'FileNotFoundError':
                return `Missing configuration file while ${operation}. Please check your acme-portal-sdk setup.`;
                
            default:
                return `Error ${operation}: ${error.error_message}`;
        }
    }

    /**
     * Get a human-readable operation name based on the SDK class
     * @param className The SDK class name
     * @returns A human-readable operation description
     */
    private static getOperationName(className: string): string {
        switch (className) {
            case 'DeploymentFinder':
                return 'scanning for deployments';
            case 'FlowFinder':
                return 'scanning for flows';
            case 'FlowDeployer':
                return 'deploying flow';
            case 'EnvironmentPromoter':
                return 'promoting environment';
            default:
                return `running ${className}`;
        }
    }

    /**
     * Extract a cleaner error message from HTTP error text
     * @param errorMessage The raw HTTP error message
     * @returns A cleaner error message
     */
    private static extractHttpErrorMessage(errorMessage: string): string {
        // Try to extract the status code and reason
        const statusMatch = errorMessage.match(/(\d{3})\s+([^']+)/);
        if (statusMatch) {
            return `${statusMatch[1]} ${statusMatch[2]}`;
        }
        return errorMessage;
    }

    /**
     * Show detailed error information in a separate document
     * @param error The structured SDK error information
     */
    private static async showErrorDetails(error: SdkError): Promise<void> {
        const errorContent = [
            '# SDK Error Details',
            '',
            `**Operation:** ${this.getOperationName(error.class_name)}`,
            `**Module:** ${error.module_name}`,
            `**Class:** ${error.class_name}`,
            `**Error Type:** ${error.error_type}`,
            `**Error Message:** ${error.error_message}`,
            '',
            '## Full Traceback',
            '```',
            error.traceback,
            '```',
            '',
            '## Troubleshooting Tips',
            this.getTroubleshootingTips(error),
        ].join('\n');

        // Create a new untitled document with the error details
        const doc = await vscode.workspace.openTextDocument({
            content: errorContent,
            language: 'markdown'
        });
        
        await vscode.window.showTextDocument(doc);
    }

    /**
     * Get troubleshooting tips based on the error type
     * @param error The structured SDK error information
     * @returns Troubleshooting tips as markdown text
     */
    private static getTroubleshootingTips(error: SdkError): string {
        switch (error.error_type) {
            case 'PrefectHTTPStatusError':
                if (error.error_message.includes('401 Unauthorized')) {
                    return [
                        '- Check that your Prefect API key is set correctly',
                        '- Verify that the API key has not expired',
                        '- Ensure you are connecting to the correct Prefect Cloud workspace',
                        '- Try running `prefect auth login` in your terminal'
                    ].join('\n');
                } else {
                    return '- Check your Prefect Cloud connection and API key\n- Verify your workspace and account settings';
                }
                
            case 'ConnectionError':
                return [
                    '- Check your internet connection',
                    '- Verify that the Prefect Cloud API endpoint is accessible',
                    '- Check for any firewall or proxy settings that might block the connection'
                ].join('\n');
                
            case 'ModuleNotFoundError':
                return [
                    '- Ensure acme-portal-sdk is installed in your Python environment',
                    '- Check that your VS Code Python interpreter is set correctly',
                    '- Run `pip install acme-portal-sdk` if needed'
                ].join('\n');
                
            default:
                return '- Check your acme-portal-sdk configuration\n- Verify your Python environment setup';
        }
    }
}