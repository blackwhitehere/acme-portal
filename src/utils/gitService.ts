import { CommandExecutor } from './commandExecutor';
import { WorkspaceService } from './workspaceService';

/**
 * Service for Git repository operations
 */
export class GitService {
    constructor(
        private commandExecutor: CommandExecutor,
        private workspaceService: WorkspaceService
    ) {}

    /**
     * Check if Git is installed on the system
     * @returns True if Git is installed, false otherwise
     */
    public async isGitInstalled(): Promise<boolean> {
        try {
            await this.commandExecutor.execute('git --version');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if Git is installed and show an error message if not
     * @returns True if Git is installed, false otherwise
     */
    public async checkGitInstalled(): Promise<boolean> {
        const isInstalled = await this.isGitInstalled();
        if (!isInstalled) {
            console.error('Git is not installed or not available in PATH. Please install Git to use this feature.');
        }
        return isInstalled;
    }

    /**
     * Get the current branch name of the workspace
     * @returns The current branch name or 'main' as default
     */
    public async getCurrentBranch(): Promise<string | undefined> {
        if (!await this.checkGitInstalled()) {
            return 'main'; // Default if Git not installed
        }
        try {
            const workspaceRoot = this.workspaceService.getWorkspaceRoot();
            if (!workspaceRoot) {
                return 'main'; // Default if no workspace
            }            
            const { stdout } = await this.commandExecutor.execute('git rev-parse --abbrev-ref HEAD', workspaceRoot);
            
            return stdout.trim() || 'main';
        } catch (error) {
            console.error('Error getting current branch:', error);
            return 'main';
        }
    }
    
    /**
     * Check if there are uncommitted changes in the workspace
     * @returns True if there are uncommitted changes, false otherwise
     */
    public async hasUncommittedChanges(): Promise<boolean> {
        if (!await this.checkGitInstalled()) {
            return false;
        }

        try {
            const workspaceRoot = this.workspaceService.getWorkspaceRoot();
            if (!workspaceRoot) {
                return false;
            }
            
            const { stdout } = await this.commandExecutor.execute('git status --porcelain', workspaceRoot);
            
            // If stdout has any content, there are uncommitted changes
            return stdout.trim().length > 0;
        } catch (error) {
            console.error('Error checking for uncommitted changes:', error);
            return false;
        }
    }

    /**
     * Get the current commit hash of the workspace
     * @returns The current commit hash or undefined on error
     */
    public async getCurrentCommitHash(): Promise<string | undefined> {
        if (!await this.checkGitInstalled()) {
            return undefined;
        }

        try {
            const workspaceRoot = this.workspaceService.getWorkspaceRoot();
            if (!workspaceRoot) {
                return undefined;
            }
            
            const { stdout } = await this.commandExecutor.execute('git rev-parse HEAD', workspaceRoot);
            return stdout.trim();
        } catch (error) {
            console.error('Error getting current commit hash:', error);
            return undefined;
        }
    }

    /**
     * Get list of local branches
     * @returns Array of branch names or undefined on error
     */
    public async getLocalBranches(): Promise<string[] | undefined> {
        if (!await this.checkGitInstalled()) {
            return undefined;
        }

        try {
            const workspaceRoot = this.workspaceService.getWorkspaceRoot();
            if (!workspaceRoot) {
                return undefined;
            }
            
            const { stdout } = await this.commandExecutor.execute('git branch --format="%(refname:short)"', workspaceRoot);
            return stdout.trim().split('\n').filter(branch => branch.trim() !== '');
        } catch (error) {
            console.error('Error getting local branches:', error);
            return undefined;
        }
    }

    /**
     * Get commit hash of a specific branch
     * @param branchName Name of the branch
     * @returns The commit hash of the branch or undefined on error
     */
    public async getBranchCommitHash(branchName: string): Promise<string | undefined> {
        if (!await this.checkGitInstalled()) {
            return undefined;
        }

        try {
            const workspaceRoot = this.workspaceService.getWorkspaceRoot();
            if (!workspaceRoot) {
                return undefined;
            }
            
            const { stdout } = await this.commandExecutor.execute(`git rev-parse ${branchName}`, workspaceRoot);
            return stdout.trim();
        } catch (error) {
            console.error(`Error getting commit hash for branch ${branchName}:`, error);
            return undefined;
        }
    }

    /**
     * Get the GitHub repository URL for the current workspace
     * @returns The GitHub repository URL or undefined on error
     */
    public async getRepositoryUrl(): Promise<string | undefined> {
        if (!await this.checkGitInstalled()) {
            return undefined;
        }

        try {
            const workspaceRoot = this.workspaceService.getWorkspaceRoot();
            if (!workspaceRoot) {
                return undefined;
            }
            
            const { stdout } = await this.commandExecutor.execute('git config --get remote.origin.url', workspaceRoot);
            
            if (!stdout.trim()) {
                return undefined;
            }
            
            let url = stdout.trim();
            
            // Convert SSH URL format to HTTPS URL format
            // Example: git@github.com:username/repo.git -> https://github.com/username/repo
            if (url.match(/^git@[^:]+:/)) {
                url = url.replace(/^git@([^:]+):/, 'https://$1/');
            }
            
            // Remove .git suffix if it exists
            if (url.endsWith('.git')) {
                url = url.substring(0, url.length - 4);
            }
            
            return url;
        } catch (error) {
            console.error('Error getting repository URL:', error);
            return undefined;
        }
    }
}
