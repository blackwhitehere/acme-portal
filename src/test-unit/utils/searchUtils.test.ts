import { suite, test } from 'mocha';
import * as assert from 'assert';
import { SearchUtils, SearchCriteria } from '../../utils/searchUtils';
import { FlowDetails } from '../../actions/findFlows';
import { DeploymentDetails } from '../../actions/findDeployments';

suite('SearchUtils Unit Tests', () => {
    
    // Sample flow data for testing
    const sampleFlows: FlowDetails[] = [
        {
            name: 'data-processing-flow',
            original_name: 'process_data',
            description: 'Process customer data from various sources',
            obj_type: 'function',
            obj_name: 'process_data',
            obj_parent_type: 'module',
            obj_parent: 'data_processor',
            id: 'flow-1',
            module: 'analytics.data_processor',
            source_path: '/src/analytics/data_processor.py',
            source_relative: 'analytics/data_processor.py',
            import_path: 'analytics.data_processor',
            grouping: ['analytics', 'etl'],
            child_attributes: {
                'priority': 'high',
                'environment': 'production'
            }
        },
        {
            name: 'email-notification-flow',
            original_name: 'send_notifications',
            description: 'Send email notifications to users',
            obj_type: 'function',
            obj_name: 'send_notifications',
            obj_parent_type: 'module',
            obj_parent: 'notification_service',
            id: 'flow-2',
            module: 'communication.notification_service',
            source_path: '/src/communication/notification_service.py',
            source_relative: 'communication/notification_service.py',
            import_path: 'communication.notification_service',
            grouping: ['communication', 'alerts'],
            child_attributes: {
                'priority': 'medium',
                'schedule': 'daily'
            }
        }
    ];

    // Sample deployment data for testing
    const sampleDeployments: DeploymentDetails[] = [
        {
            name: 'data-processing-flow-dev',
            project_name: 'analytics-project',
            branch: 'main',
            flow_name: 'data-processing-flow',
            env: 'development',
            commit_hash: 'abc123',
            package_version: '1.0.0',
            tags: ['COMMIT_HASH=abc123', 'PACKAGE_VERSION=1.0.0'],
            id: 'deployment-1',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T12:00:00Z',
            flow_id: 'flow-1',
            url: 'https://example.com/deployments/1',
            child_attributes: {
                'memory_limit': '2GB',
                'cpu_cores': 4
            }
        },
        {
            name: 'email-notification-flow-prod',
            project_name: 'communication-project',
            branch: 'release',
            flow_name: 'email-notification-flow',
            env: 'production',
            commit_hash: 'def456',
            package_version: '2.1.0',
            tags: ['COMMIT_HASH=def456', 'PACKAGE_VERSION=2.1.0'],
            id: 'deployment-2',
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T12:00:00Z',
            flow_id: 'flow-2',
            url: 'https://example.com/deployments/2',
            child_attributes: {
                'memory_limit': '1GB',
                'retry_count': 3
            }
        }
    ];

    test('should search flows by name pattern', () => {
        const criteria: SearchCriteria = { pattern: 'data' };
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-flow');
    });

    test('should search flows by description', () => {
        const criteria: SearchCriteria = { pattern: 'email' };
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'email-notification-flow');
    });

    test('should search flows by module', () => {
        const criteria: SearchCriteria = { pattern: 'analytics' };
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].module, 'analytics.data_processor');
    });

    test('should search flows by grouping', () => {
        const criteria: SearchCriteria = { pattern: 'etl' };
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-flow');
    });

    test('should search flows by child attributes', () => {
        const criteria: SearchCriteria = { pattern: 'high' };
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].child_attributes?.priority, 'high');
    });

    test('should search flows case insensitively by default', () => {
        const criteria: SearchCriteria = { pattern: 'DATA' };
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-flow');
    });

    test('should search flows case sensitively when specified', () => {
        const criteria: SearchCriteria = { pattern: 'DATA', caseSensitive: true };
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 0);
    });

    test('should search flows by specific field', () => {
        const criteria: SearchCriteria = { 
            pattern: 'analytics', 
            searchFields: ['module'] 
        };
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].module, 'analytics.data_processor');
    });

    test('should return all flows when pattern is empty', () => {
        const criteria: SearchCriteria = { pattern: '' };
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 2);
    });

    test('should search deployments by environment', () => {
        const criteria: SearchCriteria = { pattern: 'production' };
        const results = SearchUtils.searchDeployments(sampleDeployments, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].env, 'production');
    });

    test('should search deployments by branch', () => {
        const criteria: SearchCriteria = { pattern: 'main' };
        const results = SearchUtils.searchDeployments(sampleDeployments, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].branch, 'main');
    });

    test('should search deployments by project name', () => {
        const criteria: SearchCriteria = { pattern: 'analytics' };
        const results = SearchUtils.searchDeployments(sampleDeployments, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].project_name, 'analytics-project');
    });

    test('should search deployments by tags', () => {
        const criteria: SearchCriteria = { pattern: 'abc123' };
        const results = SearchUtils.searchDeployments(sampleDeployments, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].commit_hash, 'abc123');
    });

    test('should search deployments by child attributes', () => {
        const criteria: SearchCriteria = { pattern: '2GB' };
        const results = SearchUtils.searchDeployments(sampleDeployments, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].child_attributes?.memory_limit, '2GB');
    });

    test('should filter deployments by flow names', () => {
        const flowNames = ['data-processing-flow'];
        const results = SearchUtils.filterDeploymentsByFlows(sampleDeployments, flowNames);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].flow_name, 'data-processing-flow');
    });

    test('should parse simple search query', () => {
        const criteria = SearchUtils.parseSearchQuery('test query');
        
        assert.strictEqual(criteria.length, 1);
        assert.strictEqual(criteria[0].pattern, 'test query');
        assert.strictEqual(criteria[0].searchFields, undefined);
    });

    test('should parse field-specific search query', () => {
        const criteria = SearchUtils.parseSearchQuery('name:my-flow env:prod');
        
        assert.strictEqual(criteria.length, 2);
        assert.strictEqual(criteria[0].pattern, 'my-flow');
        assert.deepStrictEqual(criteria[0].searchFields, ['name']);
        assert.strictEqual(criteria[1].pattern, 'prod');
        assert.deepStrictEqual(criteria[1].searchFields, ['env']);
    });

    test('should handle mixed search query formats', () => {
        const criteria = SearchUtils.parseSearchQuery('name:my-flow general-search env:prod');
        
        assert.strictEqual(criteria.length, 3);
        assert.strictEqual(criteria[0].pattern, 'my-flow');
        assert.deepStrictEqual(criteria[0].searchFields, ['name']);
        assert.strictEqual(criteria[1].pattern, 'general-search');
        assert.strictEqual(criteria[1].searchFields, undefined);
        assert.strictEqual(criteria[2].pattern, 'prod');
        assert.deepStrictEqual(criteria[2].searchFields, ['env']);
    });

    test('should handle empty search query', () => {
        const criteria = SearchUtils.parseSearchQuery('');
        
        assert.strictEqual(criteria.length, 1);
        assert.strictEqual(criteria[0].pattern, '');
    });

    test('should handle search query with only spaces', () => {
        const criteria = SearchUtils.parseSearchQuery('   ');
        
        assert.strictEqual(criteria.length, 1);
        assert.strictEqual(criteria[0].pattern, '   ');
    });
});