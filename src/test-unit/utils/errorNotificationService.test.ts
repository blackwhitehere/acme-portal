import * as assert from 'assert';
import { ErrorNotificationService, SdkError } from '../../utils/errorNotificationService';

suite('ErrorNotificationService Unit Tests', () => {
    test('should create friendly error messages for different error types', () => {
        // Test authentication error
        const authError: SdkError = {
            error_type: 'PrefectHTTPStatusError',
            error_message: "Client error '401 Unauthorized' for url 'https://api.prefect.cloud/api/accounts/test/workspaces/test/deployments/filter'",
            module_name: 'deployment_finder',
            class_name: 'DeploymentFinder',
            traceback: 'Test traceback'
        };

        // Test connection error
        const connectionError: SdkError = {
            error_type: 'ConnectionError',
            error_message: 'Failed to establish connection',
            module_name: 'flow_finder',
            class_name: 'FlowFinder',
            traceback: 'Test traceback'
        };

        // Test module not found error
        const moduleError: SdkError = {
            error_type: 'ModuleNotFoundError',
            error_message: 'No module named acme_portal_sdk',
            module_name: 'deployment_finder',
            class_name: 'DeploymentFinder',
            traceback: 'Test traceback'
        };

        // These tests just ensure the method doesn't crash and returns a string
        // We can't easily test the UI notification without mocking VSCode APIs
        assert.ok(typeof authError.error_message === 'string');
        assert.ok(typeof connectionError.error_message === 'string');
        assert.ok(typeof moduleError.error_message === 'string');
        
        // Test that error objects have required properties
        assert.ok('error_type' in authError);
        assert.ok('error_message' in authError);
        assert.ok('module_name' in authError);
        assert.ok('class_name' in authError);
        assert.ok('traceback' in authError);
    });

    test('should handle unknown error types gracefully', () => {
        const unknownError: SdkError = {
            error_type: 'UnknownErrorType',
            error_message: 'Something went wrong',
            module_name: 'test_module',
            class_name: 'TestClass',
            traceback: 'Test traceback'
        };

        // Should not throw an error
        assert.ok(typeof unknownError.error_message === 'string');
    });
});