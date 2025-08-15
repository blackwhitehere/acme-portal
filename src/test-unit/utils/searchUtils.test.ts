import * as assert from 'assert';
import { SearchUtils, SearchCriteria } from '../../utils/searchUtils';
import { FlowDetails } from '../../actions/findFlows';
import { DeploymentDetails } from '../../actions/findDeployments';

suite('SearchUtils Test Suite', () => {
    const sampleFlows: FlowDetails[] = [
        {
            name: 'data-processing-flow',
            original_name: 'data_processing_flow',
            description: 'Process data from multiple sources',
            id: 'flow-123',
            source_path: '/path/to/data/analytics/processor.py',
            source_relative: 'data/analytics/processor.py',
            grouping: ['Data', 'Analytics'],
            child_attributes: {
                obj_type: 'function',
                obj_name: 'process_data',
                obj_parent_type: 'module',
                obj_parent: 'data_processor',
                module: 'data.analytics.processor',
                import_path: 'data.analytics.processor.process_data',
                priority: 'high',
                category: 'etl'
            }
        },
        {
            name: 'email-notification-flow',
            original_name: 'email_notification_flow', 
            description: 'Send email notifications to users',
            id: 'flow-456',
            source_path: '/path/to/notification/email.py',
            source_relative: 'notification/email.py',
            grouping: ['Notifications'],
            child_attributes: {
                obj_type: 'function',
                obj_name: 'send_email',
                obj_parent_type: 'class',
                obj_parent: 'NotificationService',
                module: 'notification.email',
                import_path: 'notification.email.NotificationService.send_email',
                priority: 'medium',
                category: 'communication'
            }
        }
    ];

    const sampleDeployments: DeploymentDetails[] = [
        {
            name: 'data-processing-dev',
            flow_name: 'data-processing-flow',
            project_name: 'analytics-project',
            branch: 'develop',
            env: 'dev',
            commit_hash: 'abc123',
            package_version: '1.0.0',
            tags: ['priority', 'etl'],
            id: 'deploy-123',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
            flow_id: 'flow-123',
            url: 'https://prefect.dev.com/flows/data-processing',
            child_attributes: {
                memory: '2GB',
                cpu: '1'
            }
        },
        {
            name: 'email-notification-prod',
            flow_name: 'email-notification-flow',
            project_name: 'notification-project',
            branch: 'main',
            env: 'prod',
            commit_hash: 'def456',
            package_version: '2.1.0',
            tags: ['communication'],
            id: 'deploy-456',
            created_at: '2023-01-02T00:00:00Z',
            updated_at: '2023-01-02T00:00:00Z',
            flow_id: 'flow-456',
            url: 'https://prefect.prod.com/flows/email-notification',
            child_attributes: {
                memory: '1GB',
                cpu: '0.5'
            }
        }
    ];

    test('should search flows by general pattern', () => {
        const criteria: SearchCriteria[] = [{ field: 'all', value: 'data', isRegex: false }];
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-flow');
    });

    test('should search flows by description', () => {
        const criteria: SearchCriteria[] = [{ field: 'all', value: 'email', isRegex: false }];
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'email-notification-flow');
    });

    test('should search flows by module', () => {
        const criteria: SearchCriteria[] = [{ field: 'all', value: 'analytics', isRegex: false }];
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-flow');
    });

    test('should search flows by custom attribute', () => {
        const criteria: SearchCriteria[] = [{ field: 'all', value: 'etl', isRegex: false }];
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-flow');
    });

    test('should search flows by priority', () => {
        const criteria: SearchCriteria[] = [{ field: 'all', value: 'high', isRegex: false }];
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-flow');
    });

    test('should be case insensitive by default', () => {
        const criteria: SearchCriteria[] = [{ field: 'all', value: 'DATA', isRegex: false }];
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-flow');
    });

    test('should support regex search', () => {
        const criteria: SearchCriteria[] = [{ 
            field: 'all', 
            value: 'analytics|notification', 
            isRegex: true 
        }];
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 2);
    });

    test('should handle field-specific search', () => {
        const criteria: SearchCriteria[] = [{ field: 'name', value: 'data-processing', isRegex: false }];
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-flow');
    });

    test('should search flows with multiple criteria (AND logic)', () => {
        const criteria: SearchCriteria[] = [
            { field: 'all', value: 'data', isRegex: false },
            { field: 'all', value: 'analytics', isRegex: false }
        ];
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-flow');
    });

    test('should return no results when no flows match criteria', () => {
        const criteria: SearchCriteria[] = [{ field: 'all', value: 'nonexistent', isRegex: false }];
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 0);
    });

    test('should search deployments by environment', () => {
        const criteria: SearchCriteria[] = [{ field: 'all', value: 'dev', isRegex: false }];
        const results = SearchUtils.searchDeployments(sampleDeployments, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-dev');
    });

    test('should search deployments by branch', () => {
        const criteria: SearchCriteria[] = [{ field: 'all', value: 'main', isRegex: false }];
        const results = SearchUtils.searchDeployments(sampleDeployments, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'email-notification-prod');
    });

    test('should search deployments by project name', () => {
        const criteria: SearchCriteria[] = [{ field: 'all', value: 'analytics', isRegex: false }];
        const results = SearchUtils.searchDeployments(sampleDeployments, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-dev');
    });

    test('should search deployments by tags', () => {
        const criteria: SearchCriteria[] = [{ field: 'all', value: 'communication', isRegex: false }];
        const results = SearchUtils.searchDeployments(sampleDeployments, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'email-notification-prod');
    });

    test('should search deployments by custom attributes', () => {
        const criteria: SearchCriteria[] = [{ field: 'all', value: '2GB', isRegex: false }];
        const results = SearchUtils.searchDeployments(sampleDeployments, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-dev');
    });

    test('should filter deployments by flow names', () => {
        const flowNames = ['data-processing-flow'];
        const results = SearchUtils.filterDeploymentsByFlows(sampleDeployments, flowNames);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-dev');
    });

    test('should parse simple search query', () => {
        const criteria = SearchUtils.parseSearchQuery('test query');
        
        assert.strictEqual(criteria.length, 1);
        assert.strictEqual(criteria[0].field, 'all');
        assert.strictEqual(criteria[0].value, 'test query');
        assert.strictEqual(criteria[0].isRegex, false);
    });

    test('should parse field-specific search query', () => {
        const criteria = SearchUtils.parseSearchQuery('name:my-flow env:prod');
        
        assert.strictEqual(criteria.length, 2);
        assert.strictEqual(criteria[0].field, 'name');
        assert.strictEqual(criteria[0].value, 'my-flow');
        assert.strictEqual(criteria[1].field, 'env');
        assert.strictEqual(criteria[1].value, 'prod');
    });

    test('should parse mixed search query', () => {
        const criteria = SearchUtils.parseSearchQuery('name:my-flow general-search env:prod');
        
        assert.strictEqual(criteria.length, 3);
        assert.strictEqual(criteria[0].field, 'name');
        assert.strictEqual(criteria[0].value, 'my-flow');
        assert.strictEqual(criteria[1].field, 'all');
        assert.strictEqual(criteria[1].value, 'general-search');
        assert.strictEqual(criteria[2].field, 'env');
        assert.strictEqual(criteria[2].value, 'prod');
    });

    test('should handle empty search query', () => {
        const criteria = SearchUtils.parseSearchQuery('');
        
        assert.strictEqual(criteria.length, 0);
    });

    test('should handle whitespace-only search query', () => {
        const criteria = SearchUtils.parseSearchQuery('   ');
        
        assert.strictEqual(criteria.length, 0);
    });

    test('should parse field-specific search without space after colon', () => {
        const criteria = SearchUtils.parseSearchQuery('source:example');
        
        assert.strictEqual(criteria.length, 1);
        assert.strictEqual(criteria[0].field, 'source');
        assert.strictEqual(criteria[0].value, 'example');
    });

    test('should parse field-specific search with space after colon', () => {
        const criteria = SearchUtils.parseSearchQuery('source: example');
        
        assert.strictEqual(criteria.length, 1);
        assert.strictEqual(criteria[0].field, 'source');
        assert.strictEqual(criteria[0].value, 'example');
    });

    test('should search flows by source field', () => {
        const criteria: SearchCriteria[] = [{ field: 'source', value: 'analytics', isRegex: false }];
        const results = SearchUtils.searchFlows(sampleFlows, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-flow');
    });

    test('should search deployments by env field specifically', () => {
        const criteria: SearchCriteria[] = [{ field: 'env', value: 'dev', isRegex: false, type: 'deployment' }];
        const results = SearchUtils.searchDeployments(sampleDeployments, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'data-processing-dev');
    });

    test('should search deployments by env field with prod value', () => {
        const criteria: SearchCriteria[] = [{ field: 'env', value: 'prod', isRegex: false, type: 'deployment' }];
        const results = SearchUtils.searchDeployments(sampleDeployments, criteria);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].name, 'email-notification-prod');
    });
});