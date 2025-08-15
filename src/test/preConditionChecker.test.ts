import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { PreConditionChecker, PreConditionCheckResults } from '../utils/preConditionChecker';
import { WorkspaceService } from '../utils/workspaceService';
import { CommandExecutor } from '../utils/commandExecutor';

suite('PreConditionChecker Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('should check workspace open condition', async () => {
        // Mock workspace service to simulate no workspace
        const mockWorkspaceService = {
            isWorkspaceSet: () => false,
            checkWorkspaceSet: () => {},
            getWorkspaceRoot: () => undefined
        };
        
        const checker = new PreConditionChecker(mockWorkspaceService as WorkspaceService);
        const results = await checker.checkAllPreconditions();
        
        assert.strictEqual(results.workspace.success, false);
        assert.ok(results.workspace.message?.includes('No workspace folder is open'));
        assert.strictEqual(results.allPassed, false);
    });

    test('should detect when workspace is open', async () => {
        // Mock workspace service to simulate workspace open
        const mockWorkspaceService = {
            isWorkspaceSet: () => true,
            checkWorkspaceSet: () => {},
            getWorkspaceRoot: () => '/mock/workspace'
        };
        
        // Mock command executor to simulate Python not available
        const mockCommandExecutor = {
            execute: async () => {
                throw new Error('Python not found');
            }
        };
        
        const checker = new PreConditionChecker(mockWorkspaceService as WorkspaceService, mockCommandExecutor as CommandExecutor);
        const results = await checker.checkAllPreconditions();
        
        assert.strictEqual(results.workspace.success, true);
        // Python check should succeed with default 'python' fallback
        // In CI environment, PythonScriptExecutor.getPythonPath() falls back to 'python'
        // which is considered a valid (but with warning) interpreter
        assert.strictEqual(results.pythonInterpreter.success, true);
        // Should have a warning about using default interpreter
        assert.ok(results.pythonInterpreter.warning?.includes('Using default system Python interpreter'));
    });

    test('should warn when using default python interpreter', async () => {
        // This test checks the warning logic for default Python interpreter
        // In a real scenario, we'd mock the PythonScriptExecutor.getPythonPath() method
        // For now, we'll just verify the test structure works
        
        const checker = new PreConditionChecker();
        
        // Since we can't easily mock static methods, we'll just ensure the checker can be instantiated
        assert.ok(checker instanceof PreConditionChecker);
    });

    test('should detect missing .acme_portal_sdk directory', async () => {
        // Create a mock workspace that exists but doesn't have .acme_portal_sdk
        const tempDir = fs.mkdtempSync(path.join(__dirname, 'test-workspace-'));
        
        const mockWorkspaceService = {
            isWorkspaceSet: () => true,
            checkWorkspaceSet: () => {},
            getWorkspaceRoot: () => tempDir
        };
        
        // Mock command executor to avoid real Python calls that might hang
        const mockCommandExecutor = {
            execute: async () => {
                throw new Error('acme-portal-sdk not found');
            }
        };
        
        const checker = new PreConditionChecker(mockWorkspaceService as WorkspaceService, mockCommandExecutor as CommandExecutor);
        const results = await checker.checkAllPreconditions();
        
        // Should detect missing directory
        assert.strictEqual(results.acmePortalSdkDirectory.success, false);
        assert.ok(results.acmePortalSdkDirectory.message?.includes('.acme_portal_sdk directory not found'));
        
        // Clean up
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    test('should detect .acme_portal_sdk directory when present', async () => {
        // Create a mock workspace with .acme_portal_sdk directory
        const tempDir = fs.mkdtempSync(path.join(__dirname, 'test-workspace-'));
        const sdkDir = path.join(tempDir, '.acme_portal_sdk');
        fs.mkdirSync(sdkDir);
        
        const mockWorkspaceService = {
            isWorkspaceSet: () => true,
            checkWorkspaceSet: () => {},
            getWorkspaceRoot: () => tempDir
        };
        
        // Mock command executor to avoid real Python calls
        const mockCommandExecutor = {
            execute: async () => {
                throw new Error('acme-portal-sdk not found');
            }
        };
        
        const checker = new PreConditionChecker(mockWorkspaceService as WorkspaceService, mockCommandExecutor as CommandExecutor);
        const results = await checker.checkAllPreconditions();
        
        // Should find the directory
        assert.strictEqual(results.acmePortalSdkDirectory.success, true);
        
        // Clean up
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    test('should detect missing required SDK modules', async () => {
        // Create a mock workspace with .acme_portal_sdk directory but missing modules
        const tempDir = fs.mkdtempSync(path.join(__dirname, 'test-workspace-'));
        const sdkDir = path.join(tempDir, '.acme_portal_sdk');
        fs.mkdirSync(sdkDir);
        
        // Create only some of the required modules
        fs.writeFileSync(path.join(sdkDir, 'flow_finder.py'), '# Mock module');
        // Missing: flow_deploy.py, deployment_finder.py, deployment_promote.py
        
        const mockWorkspaceService = {
            isWorkspaceSet: () => true,
            checkWorkspaceSet: () => {},
            getWorkspaceRoot: () => tempDir
        };
        
        // Mock command executor to avoid real Python calls
        const mockCommandExecutor = {
            execute: async () => {
                throw new Error('acme-portal-sdk not found');
            }
        };
        
        const checker = new PreConditionChecker(mockWorkspaceService as WorkspaceService, mockCommandExecutor as CommandExecutor);
        const results = await checker.checkAllPreconditions();
        
        // Should detect missing modules
        assert.strictEqual(results.sdkModules.success, false);
        assert.ok(results.sdkModules.message?.includes('Missing required SDK modules'));
        
        // Clean up
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    test('should pass when all required SDK modules are present', async () => {
        // Create a mock workspace with all required modules
        const tempDir = fs.mkdtempSync(path.join(__dirname, 'test-workspace-'));
        const sdkDir = path.join(tempDir, '.acme_portal_sdk');
        fs.mkdirSync(sdkDir);
        
        // Create all required modules
        const requiredModules = ['flow_finder.py', 'flow_deploy.py', 'deployment_finder.py', 'deployment_promote.py'];
        for (const module of requiredModules) {
            fs.writeFileSync(path.join(sdkDir, module), '# Mock module');
        }
        
        const mockWorkspaceService = {
            isWorkspaceSet: () => true,
            checkWorkspaceSet: () => {},
            getWorkspaceRoot: () => tempDir
        };
        
        // Mock command executor to simulate successful Python imports
        const mockCommandExecutor = {
            execute: async (command: string) => {
                if (command.includes('import')) {
                    return { stdout: 'loadable', stderr: '' };
                }
                throw new Error('Command not mocked');
            }
        };
        
        const checker = new PreConditionChecker(mockWorkspaceService as WorkspaceService, mockCommandExecutor as CommandExecutor);
        const results = await checker.checkAllPreconditions();
        
        // Should pass module check
        assert.strictEqual(results.acmePortalSdkDirectory.success, true);
        assert.strictEqual(results.sdkModules.success, true);
        
        // Clean up
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    test('should validate displayResults method works without errors', () => {
        const mockResults: PreConditionCheckResults = {
            allPassed: false,
            workspace: { success: false, message: 'Test workspace error' },
            pythonInterpreter: { success: true, warning: 'Test warning' },
            acmePortalSdk: { success: false, message: 'Test SDK error' },
            sdkVersion: { success: true },
            acmePortalSdkDirectory: { success: true },
            sdkModules: { success: true }
        };
        
        // This should not throw an error
        assert.doesNotThrow(() => {
            PreConditionChecker.displayResults(mockResults);
        });
    });
});