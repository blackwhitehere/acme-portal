import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { WorkspaceService } from './workspaceService';
import { CommandExecutor } from './commandExecutor';
import { PythonScriptExecutor } from './pythonScriptExecutor';
import { parseSemanticVersion, isVersionCompatible } from './versionUtils';

export interface PreConditionResult {
    success: boolean;
    message?: string;
    warning?: string;
}

export interface PreConditionCheckResults {
    allPassed: boolean;
    workspace: PreConditionResult;
    pythonInterpreter: PreConditionResult;
    acmePortalSdk: PreConditionResult;
    sdkVersion: PreConditionResult;
    acmePortalSdkDirectory: PreConditionResult;
    sdkModules: PreConditionResult;
}

/**
 * Service to check all preconditions before the extension attempts to start work
 */
export class PreConditionChecker {
    private workspaceService: WorkspaceService;
    private commandExecutor: CommandExecutor;

    constructor(
        workspaceService: WorkspaceService = new WorkspaceService(),
        commandExecutor: CommandExecutor = new CommandExecutor()
    ) {
        this.workspaceService = workspaceService;
        this.commandExecutor = commandExecutor;
    }

    /**
     * Check all preconditions required for the extension to work
     */
    public async checkAllPreconditions(): Promise<PreConditionCheckResults> {
        const results: PreConditionCheckResults = {
            allPassed: false,
            workspace: await this.checkWorkspaceOpen(),
            pythonInterpreter: await this.checkPythonInterpreter(),
            acmePortalSdk: { success: false },
            sdkVersion: { success: false },
            acmePortalSdkDirectory: { success: false },
            sdkModules: { success: false }
        };

        // Only check remaining conditions if workspace and python are available
        if (results.workspace.success && results.pythonInterpreter.success) {
            results.acmePortalSdk = await this.checkAcmePortalSdkInstalled();
            
            // Only check version if SDK is installed
            if (results.acmePortalSdk.success) {
                results.sdkVersion = await this.checkSdkVersion();
            }
            
            results.acmePortalSdkDirectory = await this.checkAcmePortalSdkDirectory();
            
            // Only check modules if directory exists
            if (results.acmePortalSdkDirectory.success) {
                results.sdkModules = await this.checkSdkModulesLoadable();
            }
        }

        // All passed if no failures
        results.allPassed = results.workspace.success && 
                           results.pythonInterpreter.success &&
                           results.acmePortalSdk.success &&
                           results.sdkVersion.success &&
                           results.acmePortalSdkDirectory.success &&
                           results.sdkModules.success;

        return results;
    }

    /**
     * Check if user has opened a project/directory in vscode
     */
    private async checkWorkspaceOpen(): Promise<PreConditionResult> {
        if (!this.workspaceService.isWorkspaceSet()) {
            return {
                success: false,
                message: 'No workspace folder is open. Please open a folder containing your ACME Portal project.'
            };
        }
        return { success: true };
    }

    /**
     * Check if project has a python interpreter set, warn if default is used
     */
    private async checkPythonInterpreter(): Promise<PreConditionResult> {
        try {
            const pythonPath = await PythonScriptExecutor.getPythonPath();
            
            // Check if it's just 'python' (default/system)
            if (pythonPath === 'python') {
                return {
                    success: true,
                    warning: 'Using default system Python interpreter. Consider selecting a specific Python environment for your project using the Python extension.'
                };
            }

            // Check if the interpreter path exists (for absolute paths)
            if (path.isAbsolute(pythonPath)) {
                try {
                    await fs.promises.access(pythonPath, fs.constants.F_OK);
                } catch {
                    return {
                        success: false,
                        message: `Python interpreter not found at: ${pythonPath}. Please configure a valid Python interpreter.`
                    };
                }
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: `Failed to determine Python interpreter: ${error}`
            };
        }
    }

    /**
     * Check if Python environment has "acme-portal-sdk" package installed
     */
    private async checkAcmePortalSdkInstalled(): Promise<PreConditionResult> {
        try {
            const pythonPath = await PythonScriptExecutor.getPythonPath();
            const workspaceRoot = this.workspaceService.getWorkspaceRoot();
            
            // Use pip list to check if acme-portal-sdk is installed
            const command = `"${pythonPath}" -m pip list | grep acme-portal-sdk`;
            
            try {
                const result = await this.commandExecutor.execute(command, workspaceRoot);
                
                if (result.stdout.includes('acme-portal-sdk')) {
                    return { success: true };
                } else {
                    return {
                        success: false,
                        message: 'acme-portal-sdk package is not installed in the Python environment. Please install it using: pip install acme-portal-sdk'
                    };
                }
            } catch (error) {
                // Try alternative check using importlib
                const importCommand = `"${pythonPath}" -c "import importlib.util; print('installed' if importlib.util.find_spec('acme_portal_sdk') else 'not_found')"`;
                
                try {
                    const importResult = await this.commandExecutor.execute(importCommand, workspaceRoot);
                    
                    if (importResult.stdout.trim() === 'installed') {
                        return { success: true };
                    } else {
                        return {
                            success: false,
                            message: 'acme-portal-sdk package is not installed in the Python environment. Please install it using: pip install acme-portal-sdk'
                        };
                    }
                } catch (importError) {
                    return {
                        success: false,
                        message: `Unable to verify acme-portal-sdk installation: ${importError}`
                    };
                }
            }
        } catch (error) {
            return {
                success: false,
                message: `Error checking acme-portal-sdk installation: ${error}`
            };
        }
    }

    /**
     * Check if the installed acme-portal-sdk version meets minimum requirements
     */
    private async checkSdkVersion(): Promise<PreConditionResult> {
        try {
            const minVersion = this.getMinimumSdkVersion();
            const installedVersion = await this.getInstalledSdkVersion();
            
            if (!installedVersion) {
                return {
                    success: false,
                    message: 'Unable to determine acme-portal-sdk version. Please ensure it is properly installed.'
                };
            }

            if (!isVersionCompatible(installedVersion, minVersion)) {
                return {
                    success: false,
                    message: `acme-portal-sdk version ${installedVersion} is not compatible with this extension. Minimum required version: ${minVersion}. Please upgrade: pip install --upgrade acme-portal-sdk`
                };
            }

            return { 
                success: true,
                message: `acme-portal-sdk version ${installedVersion} is compatible.`
            };
        } catch (error) {
            return {
                success: false,
                message: `Error checking acme-portal-sdk version: ${error}`
            };
        }
    }

    /**
     * Get the minimum required SDK version from package.json configuration
     */
    private getMinimumSdkVersion(): string {
        try {
            const extension = vscode.extensions.getExtension('blackwhitehere.acmeportal');
            if (extension) {
                const packageJson = extension.packageJSON;
                return packageJson.acmePortalConfig?.minSdkVersion || '0.1.0';
            }
            return '0.1.0'; // Default fallback
        } catch (error) {
            console.warn('Failed to get minimum SDK version from package.json:', error);
            return '0.1.0'; // Default fallback
        }
    }

    /**
     * Get the installed SDK version using Python script
     */
    private async getInstalledSdkVersion(): Promise<string | null> {
        try {
            const scriptPath = await PythonScriptExecutor.getScriptPath('get_sdk_version.py');
            if (!scriptPath) {
                throw new Error('Could not locate the SDK version checker script.');
            }

            // Create a temporary file to store the output
            const outputFile = path.join(os.tmpdir(), `acme_portal_version_${Date.now()}.json`);
            
            // Execute the script using PythonScriptExecutor
            const pythonExecutor = new PythonScriptExecutor();
            await pythonExecutor.executeScript(scriptPath, outputFile);
            
            // Read the result from the output file
            if (await PythonScriptExecutor.fileExists(outputFile)) {
                const jsonContent = await fs.promises.readFile(outputFile, 'utf8');
                
                // Clean up the temporary file
                fs.promises.unlink(outputFile).catch(err => {
                    console.warn(`Failed to delete temporary file ${outputFile}:`, err);
                });
                
                const result = JSON.parse(jsonContent);
                return result.success ? result.version : null;
            }
            
            return null;
        } catch (error) {
            console.error('Error getting SDK version:', error);
            return null;
        }
    }

    /**
     * Check if the opened project/directory contains ".acme_portal_sdk" directory
     */
    private async checkAcmePortalSdkDirectory(): Promise<PreConditionResult> {
        try {
            const workspaceRoot = this.workspaceService.getWorkspaceRoot();
            if (!workspaceRoot) {
                return {
                    success: false,
                    message: 'Unable to determine workspace root directory.'
                };
            }

            const sdkDirectoryPath = path.join(workspaceRoot, '.acme_portal_sdk');
            
            try {
                const stats = await fs.promises.stat(sdkDirectoryPath);
                if (stats.isDirectory()) {
                    return { success: true };
                } else {
                    return {
                        success: false,
                        message: '.acme_portal_sdk exists but is not a directory. Please ensure it is a proper directory.'
                    };
                }
            } catch (error) {
                return {
                    success: false,
                    message: '.acme_portal_sdk directory not found in workspace. Please initialize your project with acme-portal-sdk.'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `Error checking .acme_portal_sdk directory: ${error}`
            };
        }
    }

    /**
     * Check if all known modules in ".acme_portal_sdk" can be loaded
     */
    private async checkSdkModulesLoadable(): Promise<PreConditionResult> {
        const requiredModules = [
            'flow_finder.py',
            'flow_deploy.py', 
            'deployment_finder.py',
            'deployment_promote.py'
        ];

        try {
            const workspaceRoot = this.workspaceService.getWorkspaceRoot();
            if (!workspaceRoot) {
                return {
                    success: false,
                    message: 'Unable to determine workspace root directory.'
                };
            }

            const sdkDirectoryPath = path.join(workspaceRoot, '.acme_portal_sdk');
            const missingModules: string[] = [];
            const unloadableModules: string[] = [];

            // Check if all required modules exist
            for (const moduleName of requiredModules) {
                const modulePath = path.join(sdkDirectoryPath, moduleName);
                
                try {
                    await fs.promises.access(modulePath, fs.constants.F_OK);
                } catch {
                    missingModules.push(moduleName);
                }
            }

            if (missingModules.length > 0) {
                return {
                    success: false,
                    message: `Missing required SDK modules in .acme_portal_sdk: ${missingModules.join(', ')}`
                };
            }

            // Try to validate that modules can be imported
            const pythonPath = await PythonScriptExecutor.getPythonPath();
            
            for (const moduleName of requiredModules) {
                const moduleNameWithoutExt = moduleName.replace('.py', '');
                const importCommand = `"${pythonPath}" -c "import sys; sys.path.insert(0, '.acme_portal_sdk'); import ${moduleNameWithoutExt}; print('loadable')"`;
                
                try {
                    const result = await this.commandExecutor.execute(importCommand, workspaceRoot);
                    if (!result.stdout.includes('loadable')) {
                        unloadableModules.push(moduleName);
                    }
                } catch (error) {
                    unloadableModules.push(moduleName);
                }
            }

            if (unloadableModules.length > 0) {
                return {
                    success: false,
                    message: `SDK modules cannot be loaded: ${unloadableModules.join(', ')}. Please ensure they are properly initialized.`
                };
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: `Error checking SDK modules: ${error}`
            };
        }
    }

    /**
     * Display appropriate error or warning messages to the user
     */
    public static displayResults(results: PreConditionCheckResults): void {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!results.workspace.success && results.workspace.message) {
            errors.push(results.workspace.message);
        }

        if (!results.pythonInterpreter.success && results.pythonInterpreter.message) {
            errors.push(results.pythonInterpreter.message);
        } else if (results.pythonInterpreter.warning) {
            warnings.push(results.pythonInterpreter.warning);
        }

        if (!results.acmePortalSdk.success && results.acmePortalSdk.message) {
            errors.push(results.acmePortalSdk.message);
        }

        if (!results.sdkVersion.success && results.sdkVersion.message) {
            errors.push(results.sdkVersion.message);
        }

        if (!results.acmePortalSdkDirectory.success && results.acmePortalSdkDirectory.message) {
            errors.push(results.acmePortalSdkDirectory.message);
        }

        if (!results.sdkModules.success && results.sdkModules.message) {
            errors.push(results.sdkModules.message);
        }

        // Show errors as info messages (user feedback requested info instead of error)
        if (errors.length > 0) {
            const errorMessage = `ACME Portal requirements not met:\n\n${errors.join('\n\n')}`;
            vscode.window.showInformationMessage(errorMessage);
        }

        // Show warnings
        if (warnings.length > 0) {
            const warningMessage = warnings.join('\n\n');
            vscode.window.showWarningMessage(warningMessage);
        }
    }
}