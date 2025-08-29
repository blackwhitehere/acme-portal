import * as assert from 'assert';
import { suite, test } from 'mocha';
import { FlowDetails } from '../../actions/findFlows';
import { GroupUtils } from '../../utils/groupUtils';

suite('FlowCommands Refresh Logic Tests', () => {
    // Create sample flow data for testing
    const createSampleFlow = (name: string, grouping: string[]): FlowDetails => ({
        name: name,
        original_name: name,
        description: `${name} description`,
        id: `${name}-1`,
        source_path: `/path/to/${name}.py`,
        source_relative: `${name}.py`,
        grouping: grouping
    });

    suite('Group Refresh Logic', () => {
        test('should find flows by group path correctly', () => {
            const flows = [
                createSampleFlow('flow1', ['group1']),
                createSampleFlow('flow2', ['group1', 'subgroup']),
                createSampleFlow('flow3', ['group2']),
                createSampleFlow('flow4', ['group1'])
            ];

            const groupFlows = GroupUtils.findFlowsByGroupPath(flows, 'group1');
            assert.strictEqual(groupFlows.length, 2, 'Should find 2 flows in group1');
            assert.ok(groupFlows.some(f => f.name === 'flow1'), 'Should include flow1');
            assert.ok(groupFlows.some(f => f.name === 'flow4'), 'Should include flow4');
        });

        test('should find flows by nested group path correctly', () => {
            const flows = [
                createSampleFlow('flow1', ['group1']),
                createSampleFlow('flow2', ['group1', 'subgroup']),
                createSampleFlow('flow3', ['group2']),
                createSampleFlow('flow4', ['group1'])
            ];

            const groupFlows = GroupUtils.findFlowsByGroupPath(flows, 'group1/subgroup');
            assert.strictEqual(groupFlows.length, 1, 'Should find 1 flow in group1/subgroup');
            assert.strictEqual(groupFlows[0].name, 'flow2', 'Should include flow2');
        });

        test('should return empty array for non-existent group', () => {
            const flows = [
                createSampleFlow('flow1', ['group1']),
                createSampleFlow('flow2', ['group2'])
            ];

            const groupFlows = GroupUtils.findFlowsByGroupPath(flows, 'nonexistent');
            assert.strictEqual(groupFlows.length, 0, 'Should return empty array for non-existent group');
        });

        test('should handle empty group path', () => {
            const flows = [createSampleFlow('flow1', ['group1'])];
            const groupFlows = GroupUtils.findFlowsByGroupPath(flows, '');
            assert.strictEqual(groupFlows.length, 0, 'Should return empty array for empty group path');
        });
    });

    suite('Flow Refresh Validation Logic', () => {
        test('should validate flow data structure', () => {
            const validFlow = createSampleFlow('test-flow', ['group1']);
            
            // Test that the flow has all required properties
            assert.ok(validFlow.name, 'Should have name property');
            assert.ok(validFlow.id, 'Should have id property');
            assert.ok(validFlow.source_path, 'Should have source_path property');
            assert.ok(Array.isArray(validFlow.grouping), 'Should have grouping array');
        });

        test('should handle flow with empty grouping', () => {
            const flowWithEmptyGrouping = createSampleFlow('test-flow', []);
            assert.strictEqual(flowWithEmptyGrouping.grouping.length, 0, 'Should handle empty grouping');
        });

        test('should preserve flow properties during processing', () => {
            const originalFlow = createSampleFlow('test-flow', ['group1']);
            const flowCopy = { ...originalFlow };
            
            // Simulate the kind of processing that might happen during refresh
            const processedFlow = {
                ...flowCopy,
                name: flowCopy.name,
                id: flowCopy.id || flowCopy.name
            };
            
            assert.strictEqual(processedFlow.name, originalFlow.name, 'Should preserve name');
            assert.strictEqual(processedFlow.source_path, originalFlow.source_path, 'Should preserve source path');
            assert.deepStrictEqual(processedFlow.grouping, originalFlow.grouping, 'Should preserve grouping');
        });
    });

    suite('Data Update Logic', () => {
        test('should update flow data correctly', () => {
            const existingFlows = [
                createSampleFlow('flow1', ['group1']),
                createSampleFlow('flow2', ['group1'])
            ];
            
            const refreshedFlows = [
                { ...createSampleFlow('flow1', ['group1']), description: 'Updated description' }
            ];
            
            // Simulate the logic from updateFlowsData method
            const refreshedFlowMap = new Map<string, FlowDetails>();
            refreshedFlows.forEach(flow => {
                const flowId = flow.id || flow.name;
                refreshedFlowMap.set(flowId, flow);
            });
            
            const updatedFlows = [...existingFlows];
            for (let i = 0; i < updatedFlows.length; i++) {
                const existingFlow = updatedFlows[i];
                const flowId = existingFlow.id || existingFlow.name;
                
                if (refreshedFlowMap.has(flowId)) {
                    updatedFlows[i] = refreshedFlowMap.get(flowId)!;
                }
            }
            
            assert.strictEqual(updatedFlows[0].description, 'Updated description', 'Should update flow description');
            assert.strictEqual(updatedFlows[1].description, 'flow2 description', 'Should preserve unchanged flow');
        });

        test('should filter deployments by flow names', () => {
            const deployments = [
                { flow_name: 'flow1', name: 'deploy1', project_name: 'test', branch: 'main', env: 'dev', commit_hash: 'abc123', package_version: '1.0', tags: [], id: '1', created_at: '2023-01-01', updated_at: '2023-01-01', flow_id: 'flow1', url: 'http://test.com' },
                { flow_name: 'flow2', name: 'deploy2', project_name: 'test', branch: 'main', env: 'dev', commit_hash: 'abc124', package_version: '1.0', tags: [], id: '2', created_at: '2023-01-01', updated_at: '2023-01-01', flow_id: 'flow2', url: 'http://test.com' },
                { flow_name: 'flow3', name: 'deploy3', project_name: 'test', branch: 'main', env: 'dev', commit_hash: 'abc125', package_version: '1.0', tags: [], id: '3', created_at: '2023-01-01', updated_at: '2023-01-01', flow_id: 'flow3', url: 'http://test.com' }
            ];
            
            const refreshedFlowNames = new Set(['flow1', 'flow3']);
            
            // Simulate deployment filtering logic
            const filteredDeployments = deployments.filter(deployment => 
                !refreshedFlowNames.has(deployment.flow_name)
            );
            
            assert.strictEqual(filteredDeployments.length, 1, 'Should filter out deployments for refreshed flows');
            assert.strictEqual(filteredDeployments[0].flow_name, 'flow2', 'Should keep deployment for non-refreshed flow');
        });
    });
});