import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CommandResult {
    stdout: string;
    stderr: string;
}

/**
 * Service for executing shell commands
 */
export class CommandExecutor {
    /**
     * Execute a shell command and return the result
     * @param command Command to execute
     * @param cwd Working directory for command execution (optional, defaults to current working directory)
     * @returns Command execution result containing stdout and stderr
     */
    public async execute(command: string, cwd?: string): Promise<CommandResult> {
        try {
            const workDir = cwd || process.cwd();
            console.log(`Executing command: ${command} in directory: ${workDir}`);
            return await execAsync(command, { cwd: workDir });
        } catch (error) {
            console.error(`Command execution failed: ${command}`, error);
            throw error;
        }
    }
}
