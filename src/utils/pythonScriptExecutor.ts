import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { CommandExecutor } from './commandExecutor';
import { WorkspaceService } from './workspaceService';

/**
 * A utility class for executing Python scripts within a VSCode extension
 */
export class PythonScriptExecutor {
    private commandExecutor: CommandExecutor;
    private workspaceService: WorkspaceService;

    /**
     * Constructor for PythonScriptExecutor
     * @param commandExecutor Service for executing shell commands
     * @param workspaceService Service for VS Code workspace operations
     */
    constructor(
        commandExecutor: CommandExecutor = new CommandExecutor(),
        workspaceService: WorkspaceService = new WorkspaceService()
    ) {
        this.commandExecutor = commandExecutor;
        this.workspaceService = workspaceService;
    }

    /**
     * Execute a Python script with the provided arguments
     * @param scriptPath Path to the Python script
     * @param args Arguments to pass to the script
     * @returns The script's stdout output as a string
     */
    public async executeScript(scriptPath: string, ...args: string[]): Promise<string> {
        try {
            // Get the configured Python path
            const pythonPath = await PythonScriptExecutor.getPythonPath();
            
            // Escape arguments to handle spaces and special characters
            const escapedArgs = this.escapeCommandArguments(args);
            
            // Construct the command
            const command = `"${pythonPath}" "${scriptPath}" ${escapedArgs}`;
            
            // Get workspace root directory
            const workspaceRoot = this.workspaceService.getWorkspaceRoot();
            
            // Execute the command
            const result = await this.commandExecutor.execute(command, workspaceRoot);
            
            if (result.stderr && result.stderr.trim()) {
                console.log(`Python script messages: ${result.stderr}`);
            }
            
            console.log(`Python script output length: ${result.stdout.length}`);
            return result.stdout;
        } catch (err) {
            console.error('Failed to execute Python script:', err);
            throw err;
        }
    }

    /**
     * Escapes command arguments to handle spaces and special characters
     * @param args Array of argument strings to escape
     * @returns A single string with all arguments properly escaped
     */
    private escapeCommandArguments(args: string[]): string {
        return args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ');
    }

    /**
     * Use VS Code settings to get the Python path
     */
    public static async getPythonPath(): Promise<string> {
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

    /**
     * Check if a file exists
     */
    public static async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get the path to a script in the extension
     * @param scriptName Name of the script file
     * @returns Full path to the script
     */
    public static async getScriptPath(scriptName: string): Promise<string | undefined> {
        // First, try to locate the script in the extension's directory
        const extension = vscode.extensions.getExtension('blackwhitehere.acmeportal');
        if (extension) {
            const scriptPath = path.join(extension.extensionPath, 'out', 'scripts', scriptName);
            if (await this.fileExists(scriptPath)) {
                return scriptPath;
            }
        }

        // If we're in development mode, try a different path
        const devPath = path.join(__dirname, '..', '..', 'src', 'scripts', scriptName);
        if (await this.fileExists(devPath)) {
            return devPath;
        }

        return undefined;
    }
}
