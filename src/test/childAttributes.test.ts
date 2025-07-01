import * as assert from 'assert';
import { FlowDetails } from '../actions/findFlows';
import { DeploymentDetails } from '../actions/findDeployments';

suite('Child Attributes Test Suite', () => {
    test('FlowDetails should support child_attributes', () => {
        const flowDetails: FlowDetails = {
            name: 'test_flow',
            original_name: 'test_flow',
            description: 'Test flow description',
            obj_type: 'function',
            obj_name: 'test_flow',
            obj_parent_type: 'module',
            obj_parent: 'test_module',
            id: 'test_id',
            module: 'test_module',
            source_path: '/path/to/test.py',
            source_relative: 'test.py',
            import_path: 'test_module.test',
            grouping: ['group1'],
            child_attributes: {
                custom_field: 'custom_value',
                custom_number: 123,
                custom_boolean: true
            }
        };

        assert.strictEqual(flowDetails.child_attributes?.custom_field, 'custom_value');
        assert.strictEqual(flowDetails.child_attributes?.custom_number, 123);
        assert.strictEqual(flowDetails.child_attributes?.custom_boolean, true);
    });

    test('DeploymentDetails should support child_attributes', () => {
        const deploymentDetails: DeploymentDetails = {
            name: 'test_deployment',
            project_name: 'test_project',
            branch: 'main',
            flow_name: 'test_flow',
            env: 'dev',
            commit_hash: 'abc123',
            package_version: '1.0.0',
            tags: ['tag1', 'tag2'],
            id: 'deploy_id',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            flow_id: 'flow_id',
            url: 'https://example.com',
            child_attributes: {
                deployment_specific: 'value',
                priority: 'high',
                custom_config: {
                    nested: 'value'
                }
            }
        };

        assert.strictEqual(deploymentDetails.child_attributes?.deployment_specific, 'value');
        assert.strictEqual(deploymentDetails.child_attributes?.priority, 'high');
        assert.deepStrictEqual(deploymentDetails.child_attributes?.custom_config, { nested: 'value' });
    });

    test('FlowDetails should work without child_attributes', () => {
        const flowDetails: FlowDetails = {
            name: 'test_flow',
            original_name: 'test_flow',
            description: 'Test flow description',
            obj_type: 'function',
            obj_name: 'test_flow',
            obj_parent_type: 'module',
            obj_parent: 'test_module',
            id: 'test_id',
            module: 'test_module',
            source_path: '/path/to/test.py',
            source_relative: 'test.py',
            import_path: 'test_module.test',
            grouping: ['group1']
            // No child_attributes property
        };

        assert.strictEqual(flowDetails.child_attributes, undefined);
    });

    test('DeploymentDetails should work without child_attributes', () => {
        const deploymentDetails: DeploymentDetails = {
            name: 'test_deployment',
            project_name: 'test_project',
            branch: 'main',
            flow_name: 'test_flow',
            env: 'dev',
            commit_hash: 'abc123',
            package_version: '1.0.0',
            tags: ['tag1', 'tag2'],
            id: 'deploy_id',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            flow_id: 'flow_id',
            url: 'https://example.com'
            // No child_attributes property
        };

        assert.strictEqual(deploymentDetails.child_attributes, undefined);
    });
});