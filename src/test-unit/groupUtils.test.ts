import * as assert from 'assert';
import { GroupUtils } from '../utils/groupUtils';
import { FlowDetails } from '../actions/findFlows';

suite('GroupUtils Unit Tests', () => {
    
    const sampleFlows: FlowDetails[] = [
        {
            name: 'flow1',
            original_name: 'flow1',
            description: 'Test flow 1',
            obj_type: 'function',
            obj_name: 'flow1',
            obj_parent_type: 'module',
            obj_parent: 'test_module',
            id: 'flow1',
            module: 'test_module',
            source_path: '/test/flow1.py',
            source_relative: 'test/flow1.py',
            import_path: 'test.flow1',
            grouping: ['backend', 'data', 'etl']
        },
        {
            name: 'flow2',
            original_name: 'flow2',
            description: 'Test flow 2',
            obj_type: 'function',
            obj_name: 'flow2',
            obj_parent_type: 'module',
            obj_parent: 'test_module',
            id: 'flow2',
            module: 'test_module',
            source_path: '/test/flow2.py',
            source_relative: 'test/flow2.py',
            import_path: 'test.flow2',
            grouping: ['backend', 'data', 'etl']
        },
        {
            name: 'flow3',
            original_name: 'flow3',
            description: 'Test flow 3',
            obj_type: 'function',
            obj_name: 'flow3',
            obj_parent_type: 'module',
            obj_parent: 'test_module',
            id: 'flow3',
            module: 'test_module',
            source_path: '/test/flow3.py',
            source_relative: 'test/flow3.py',
            import_path: 'test.flow3',
            grouping: ['frontend', 'ui']
        },
        {
            name: 'flow4',
            original_name: 'flow4',
            description: 'Test flow 4',
            obj_type: 'function',
            obj_name: 'flow4',
            obj_parent_type: 'module',
            obj_parent: 'test_module',
            id: 'flow4',
            module: 'test_module',
            source_path: '/test/flow4.py',
            source_relative: 'test/flow4.py',
            import_path: 'test.flow4',
            grouping: []
        }
    ];

    test('should find flows by exact group path match', () => {
        const result = GroupUtils.findFlowsByGroupPath(sampleFlows, 'backend/data/etl');
        
        assert.strictEqual(result.length, 2);
        const flowNames = result.map((f: FlowDetails) => f.name);
        assert.ok(flowNames.includes('flow1'));
        assert.ok(flowNames.includes('flow2'));
    });

    test('should return empty array for non-matching group path', () => {
        const result = GroupUtils.findFlowsByGroupPath(sampleFlows, 'nonexistent/group');
        
        assert.strictEqual(result.length, 0);
    });

    test('should find flows by different group path', () => {
        const result = GroupUtils.findFlowsByGroupPath(sampleFlows, 'frontend/ui');
        
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].name, 'flow3');
    });

    test('should return empty array for empty group path', () => {
        const result = GroupUtils.findFlowsByGroupPath(sampleFlows, '');
        
        assert.strictEqual(result.length, 0);
    });

    test('should return empty array for null/undefined group path', () => {
        const result1 = GroupUtils.findFlowsByGroupPath(sampleFlows, null as any);
        const result2 = GroupUtils.findFlowsByGroupPath(sampleFlows, undefined as any);
        
        assert.strictEqual(result1.length, 0);
        assert.strictEqual(result2.length, 0);
    });

    test('should handle flows with empty grouping', () => {
        const result = GroupUtils.findFlowsByGroupPath(sampleFlows, '');
        
        assert.strictEqual(result.length, 0);
    });

    test('should not match partial group paths', () => {
        // Should not match "backend/data/etl" when searching for just "backend" or "backend/data"
        const result1 = GroupUtils.findFlowsByGroupPath(sampleFlows, 'backend');
        const result2 = GroupUtils.findFlowsByGroupPath(sampleFlows, 'backend/data');
        
        assert.strictEqual(result1.length, 0);
        assert.strictEqual(result2.length, 0);
    });

    test('should provide correct display names', () => {
        assert.strictEqual(GroupUtils.getGroupDisplayName('backend/data/etl'), 'backend/data/etl');
        assert.strictEqual(GroupUtils.getGroupDisplayName('frontend/ui'), 'frontend/ui');
        assert.strictEqual(GroupUtils.getGroupDisplayName(''), 'Root');
        assert.strictEqual(GroupUtils.getGroupDisplayName('   '), 'Root');
    });

    test('should handle group paths with extra whitespace', () => {
        const result = GroupUtils.findFlowsByGroupPath(sampleFlows, ' backend/data/etl ');
        
        assert.strictEqual(result.length, 2);
        const flowNames = result.map((f: FlowDetails) => f.name);
        assert.ok(flowNames.includes('flow1'));
        assert.ok(flowNames.includes('flow2'));
    });
});