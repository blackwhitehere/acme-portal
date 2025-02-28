import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import { SettingsManager } from '../settings/settingsManager';

export interface FlowDetails {
    name: string; // flow name standardized for display
    module: string; // module name where flow is defined
    source_file: string; // full path to file with flow
    description?: string; // description property of from a flow
    original_name?: string; // flow name before any renaming
    class?: string; // class name in case flow is defined in a class
    type: string; // used to distinguish between flows created with decorator or a subclass
    id?: string; // unique identifier of flow function
}

export class FlowScanner {
    private static readonly FLOW_FINDER_SCRIPT = 'flow_finder.py';

    /**
     * Scan for Prefect flows in the configured flows directory
     */
    public static async scanForFlows(): Promise<FlowDetails[]> {
        try {
            const flowsPath = SettingsManager.getAbsoluteFlowsPath();
            if (!flowsPath) {
                return [];
            }

            const pathExists = await SettingsManager.flowsPathExists();
            if (!pathExists) {
                vscode.window.showWarningMessage(`Flows directory not found: ${flowsPath}`);
                return [];
            }

            console.log(`Scanning for flows in: ${flowsPath}`);

            // Get the path to our flow finder script
            const scriptPath = await this.getScriptPath();
            if (!scriptPath) {
                vscode.window.showErrorMessage('Could not locate the flow finder script.');
                return [];
            }

            console.log(`Script path: ${scriptPath}`);

            // Execute the Python script synchronously
            const result = await this.executePythonScriptSync(scriptPath, flowsPath);

            // Parse the output directly from the script's stdout
            return this.parseFlowResults(result);
        } catch (error) {
            console.error('Flow scanning error:', error);
            vscode.window.showErrorMessage(`Error scanning for flows: ${error}`);
            return [];
        }
    }

    /**
     * Execute Python script synchronously using child_process
     */
    private static async executePythonScriptSync(scriptPath: string, flowsPath: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                // Get the configured Python path
                const pythonPath = await this.getPythonPath();

                // Execute with child_process.exec for better output capture
                const process = cp.exec(
                    `"${pythonPath}" "${scriptPath}" "${flowsPath}"`,
                    { maxBuffer: 1024 * 1024 },
                    (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Python execution error: ${error}`);
                            console.error(`stderr: ${stderr}`);
                            reject(error);
                            return;
                        }

                        if (stderr && stderr.trim()) {
                            console.log(`Python scanner messages: ${stderr}`);
                        }

                        console.log(`Python script output length: ${stdout.length}`);
                        resolve(stdout);
                    }
                );
            } catch (err) {
                console.error('Failed to execute Python script:', err);
                reject(err);
            }
        });
    }

    /**
     * Parse the JSON output from the flow finder script
     */
    private static parseFlowResults(output: string): FlowDetails[] {
        try {
            console.log("Parsing flow results...");

            // Trim any leading/trailing whitespace or non-JSON characters
            const jsonStartIdx = output.indexOf('{');
            const jsonEndIdx = output.lastIndexOf('}') + 1;

            if (jsonStartIdx >= 0 && jsonEndIdx > jsonStartIdx) {
                const jsonStr = output.substring(jsonStartIdx, jsonEndIdx);
                console.log(`Extracted JSON from output (length: ${jsonStr.length})`);

                try {
                    const flowsDict = JSON.parse(jsonStr) as Record<string, FlowDetails>;

                    // Convert to array if it's an object with name keys
                    const flows = Object.values(flowsDict) as FlowDetails[];
                    console.log(`Parsed ${flows.length} flows`);

                    // Log the flow names to help debug
                    flows.forEach(flow => {
                        console.log(`Flow: ${flow.name} (${flow.source_file})`);
                    });
                    return flows;
                } catch (jsonErr) {
                    console.error('JSON parsing error:', jsonErr);
                    return [];
                }
            } else {
                console.error('No JSON data found in output');
                console.debug('Raw output:', output.substring(0, 100) + '...');
                return [];
            }
        } catch (error) {
            console.error('Error parsing flow results:', error);
            console.debug('Raw output:', output.substring(0, 100) + '...');
            return [];
        }
    }

    /**
     * Get the path to the flow finder script
     */
    private static async getScriptPath(): Promise<string | undefined> {
        // First, try to locate the script in the extension's directory
        const extension = vscode.extensions.getExtension('acmeportal');
        if (extension) {
            const scriptPath = path.join(extension.extensionPath, 'src', 'scripts', this.FLOW_FINDER_SCRIPT);
            if (await this.fileExists(scriptPath)) {
                return scriptPath;
            }
        }

        // If we're in development mode, try a different path
        const devPath = path.join(__dirname, '..', '..', 'src', 'scripts', this.FLOW_FINDER_SCRIPT);
        if (await this.fileExists(devPath)) {
            return devPath;
        }

        return undefined;
    }

    /**
     * Check if a file exists
     */
    private static async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Use VS Code settings to get the Python path
     */
    private static async getPythonPath(): Promise<string> {
        console.log('Getting Python path from Python extension...');
        try {
            // Check if Python extension is installed
            const pythonExtension = vscode.extensions.getExtension('ms-python.python');

            if (!pythonExtension) {
                const message = 'Python extension is not installed. Please install it to use this feature.';
                console.error(message);
                vscode.window.showErrorMessage(message);
                return 'python'; // Fallback to system default
            }

            // Ensure Python extension is activated
            if (!pythonExtension.isActive) {
                await pythonExtension.activate();
            }

            // Get the active Python interpreter
            const pythonApi = pythonExtension.exports;

            if (pythonApi && pythonApi.settings) {
                const activeInterpreterPath = pythonApi.settings.getExecutionDetails().execCommand;

                if (activeInterpreterPath) {
                    console.log(`Using Python interpreter from Python extension: ${activeInterpreterPath}`);
                    return activeInterpreterPath;
                }
            }

            // If couldn't get from API, try configuration
            const pythonConfig = vscode.workspace.getConfiguration('python');
            const pythonPath = pythonConfig.get<string>('defaultInterpreterPath')
                || pythonConfig.get<string>('pythonPath'); // For older versions

            if (pythonPath) {
                console.log(`Using Python from VS Code settings: ${pythonPath}`);
                return pythonPath;
            }

            // Show warning to user that we're using system default
            vscode.window.showWarningMessage(
                'Could not determine Python interpreter path. Using system default "python". ' +
                'Please ensure the Python extension is properly configured.'
            );

            // Fallback to system default
            return 'python';
        } catch (err) {
            console.error('Error retrieving Python path:', err);
            vscode.window.showErrorMessage(`Error determining Python interpreter: ${err}`);
            return 'python';
        }
    }
}
