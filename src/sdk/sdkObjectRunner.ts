import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { PythonScriptExecutor } from '../utils/pythonScriptExecutor';
import { ErrorNotificationService, SdkError } from '../utils/errorNotificationService';

/**
 * Class that handles running objects from the ACME Portal SDK
 */
export class SdkObjectRunner {
    private static readonly OBJECT_RUNNER_SCRIPT = 'sdk_object_runner.py';

    /**
     * Run an object from the SDK module and get the result
     * @param moduleName Name of the module in .acme_portal_sdk directory
     * @param className Name of the class whose instance we want to run
     * @param kwargs Optional dictionary of keyword arguments to pass to the object
     * @returns The JSON result of calling the object
     */
    public static async runSdkObject<T>(
        moduleName: string, 
        className: string, 
        kwargs?: Record<string, any>
    ): Promise<T> {
        try {
            // Create an instance of the python script executor
            const pythonExecutor = new PythonScriptExecutor();
            
            // Get the path to our script
            const scriptPath = await PythonScriptExecutor.getScriptPath(this.OBJECT_RUNNER_SCRIPT);
            if (!scriptPath) {
                throw new Error('Could not locate the SDK object runner script.');
            }

            // Create a temporary file to store the output
            const outputFile = path.join(os.tmpdir(), `acme_portal_${Date.now()}.json`);
            const errorFile = outputFile.replace('.json', '_error.json');
            
            // Prepare arguments for the Python script
            const args = [moduleName, className, outputFile];
            
            // Add kwargs as JSON string if provided
            if (kwargs) {
                const kwargsJson = JSON.stringify(kwargs);
                args.push(kwargsJson);
            }
            
            // Execute the script using the instance method
            try {
                await pythonExecutor.executeScript(scriptPath, ...args);
            } catch (executionError) {
                // Check if there's structured error information available
                if (await PythonScriptExecutor.fileExists(errorFile)) {
                    try {
                        const errorContent = await fs.promises.readFile(errorFile, 'utf8');
                        const sdkError: SdkError = JSON.parse(errorContent);
                        
                        // Clean up the error file
                        fs.promises.unlink(errorFile).catch(err => {
                            console.warn(`Failed to delete error file ${errorFile}:`, err);
                        });
                        
                        // Show user-friendly error notification
                        ErrorNotificationService.showSdkError(sdkError);
                        
                        // Re-throw with the original SDK error message for upstream handling
                        throw new Error(`SDK Error: ${sdkError.error_message}`);
                    } catch (parseError) {
                        console.warn('Failed to parse SDK error information:', parseError);
                        // Fall through to show generic error
                    }
                }
                
                // If no structured error info available, show generic error notification
                const operation = this.getOperationNameFromClass(className);
                ErrorNotificationService.showGenericSdkError(String(executionError), operation);
                
                throw executionError;
            }
            
            // Read the result from the output file
            if (await PythonScriptExecutor.fileExists(outputFile)) {
                const jsonContent = await fs.promises.readFile(outputFile, 'utf8');
                
                // Clean up the temporary file
                fs.promises.unlink(outputFile).catch(err => {
                    console.warn(`Failed to delete temporary file ${outputFile}:`, err);
                });
                
                // Also clean up error file if it exists
                if (await PythonScriptExecutor.fileExists(errorFile)) {
                    fs.promises.unlink(errorFile).catch(err => {
                        console.warn(`Failed to delete error file ${errorFile}:`, err);
                    });
                }
                
                // Parse and return the result
                return JSON.parse(jsonContent);
            } else {
                throw new Error(`Output file not found: ${outputFile}`);
            }
        } catch (error) {
            console.error('Error running SDK object:', error);
            throw error;
        }
    }

    /**
     * Get a human-readable operation name based on the SDK class
     * @param className The SDK class name
     * @returns A human-readable operation description
     */
    private static getOperationNameFromClass(className: string): string {
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
}
