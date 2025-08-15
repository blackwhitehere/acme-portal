import * as assert from 'assert';
import { FlowUtils } from '../utils/flowUtils';
import { FlowDetails } from '../actions/findFlows';

suite('FlowUtils Unit Tests', () => {

    test('should get field values from direct properties', () => {
        const flow: FlowDetails = {
            name: 'test_flow',
            original_name: 'test_flow',
            description: 'Test flow description',
            id: 'test_id',
            source_path: '/path/to/test.py',
            source_relative: 'test.py',
            grouping: ['group1'],
            // Legacy fields as direct properties
            obj_type: 'function',
            obj_name: 'test_flow',
            obj_parent_type: 'module',
            obj_parent: 'test_module',
            module: 'test_module',
            import_path: 'test_module.test'
        };

        assert.strictEqual(FlowUtils.getObjType(flow), 'function');
        assert.strictEqual(FlowUtils.getObjName(flow), 'test_flow');
        assert.strictEqual(FlowUtils.getObjParentType(flow), 'module');
        assert.strictEqual(FlowUtils.getObjParent(flow), 'test_module');
        assert.strictEqual(FlowUtils.getModule(flow), 'test_module');
        assert.strictEqual(FlowUtils.getImportPath(flow), 'test_module.test');
    });

    test('should get field values from child_attributes', () => {
        const flow: FlowDetails = {
            name: 'test_flow',
            original_name: 'test_flow',
            description: 'Test flow description',
            id: 'test_id',
            source_path: '/path/to/test.py',
            source_relative: 'test.py',
            grouping: ['group1'],
            child_attributes: {
                obj_type: 'function',
                obj_name: 'test_flow',
                obj_parent_type: 'module',
                obj_parent: 'test_module',
                module: 'test_module',
                import_path: 'test_module.test'
            }
        };

        assert.strictEqual(FlowUtils.getObjType(flow), 'function');
        assert.strictEqual(FlowUtils.getObjName(flow), 'test_flow');
        assert.strictEqual(FlowUtils.getObjParentType(flow), 'module');
        assert.strictEqual(FlowUtils.getObjParent(flow), 'test_module');
        assert.strictEqual(FlowUtils.getModule(flow), 'test_module');
        assert.strictEqual(FlowUtils.getImportPath(flow), 'test_module.test');
    });

    test('should prefer direct properties over child_attributes for backward compatibility', () => {
        const flow: FlowDetails = {
            name: 'test_flow',
            original_name: 'test_flow',
            description: 'Test flow description',
            id: 'test_id',
            source_path: '/path/to/test.py',
            source_relative: 'test.py',
            grouping: ['group1'],
            // Direct property
            obj_type: 'direct_function',
            child_attributes: {
                // Child attribute with different value
                obj_type: 'child_function'
            }
        };

        // Should prefer direct property
        assert.strictEqual(FlowUtils.getObjType(flow), 'direct_function');
    });

    test('should return undefined when neither direct property nor child_attributes have the field', () => {
        const flow: FlowDetails = {
            name: 'test_flow',
            original_name: 'test_flow',
            description: 'Test flow description',
            id: 'test_id',
            source_path: '/path/to/test.py',
            source_relative: 'test.py',
            grouping: ['group1']
        };

        assert.strictEqual(FlowUtils.getObjType(flow), undefined);
        assert.strictEqual(FlowUtils.getModule(flow), undefined);
        assert.strictEqual(FlowUtils.getImportPath(flow), undefined);
    });

    test('should handle generic field values', () => {
        const flow: FlowDetails = {
            name: 'test_flow',
            original_name: 'test_flow',
            description: 'Test flow description',
            id: 'test_id',
            source_path: '/path/to/test.py',
            source_relative: 'test.py',
            grouping: ['group1'],
            child_attributes: {
                custom_field: 'custom_value'
            }
        };

        assert.strictEqual(FlowUtils.getFieldValue(flow, 'custom_field'), 'custom_value');
        assert.strictEqual(FlowUtils.getFieldValue(flow, 'nonexistent_field'), undefined);
    });
});