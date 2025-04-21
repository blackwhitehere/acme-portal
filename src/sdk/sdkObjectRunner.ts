import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { PythonScriptExecutor } from '../utils/pythonScriptExecutor';

/**
 * Class that handles running objects from the ACME Portal SDK
 */
export class SdkObjectRunner {
    private static readonly OBJECT_RUNNER_SCRIPT = 'sdk_object_runner.py';

    /**
     * Run an object from the SDK module and get the result
     * @param moduleName Name of the module in .acme_portal_sdk directory
     * @param className Name of the class whose instance we want to run
     * @returns The JSON result of calling the object
     */
    public static async runSdkObject<T>(moduleName: string, className: string): Promise<T> {
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
            
            // Execute the script using the instance method instead of static method
            await pythonExecutor.executeScript(scriptPath, moduleName, className, outputFile);
            
            // Read the result from the output file
            if (await PythonScriptExecutor.fileExists(outputFile)) {
                const jsonContent = await fs.promises.readFile(outputFile, 'utf8');
                
                // Clean up the temporary file
                fs.promises.unlink(outputFile).catch(err => {
                    console.warn(`Failed to delete temporary file ${outputFile}:`, err);
                });
                
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
}
