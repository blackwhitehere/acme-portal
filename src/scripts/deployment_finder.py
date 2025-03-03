#!/usr/bin/env python
"""
Deployment Finder Script for ACME Portal

This script connects to Prefect to get deployment information and outputs
JSON data about the discovered deployments.
"""

import sys
import json
import traceback
from typing import Dict, Any, List

def printe(message):
    """Print a message to stderr."""
    print(message, file=sys.stderr)

def get_deployments() -> List[Dict[str, Any]]:
    """Connect to Prefect and get deployment information."""
    try:
        from prefect.client.orchestration import get_client
        client = get_client(sync_client=True)
        deployments = client.read_deployments()
        
        result = []
        for deployment in deployments:
            printe(f"Processing deployment: {deployment.name}")
            
            # Parse deployment name into components
            parts = deployment.name.split("--")
            if len(parts) < 4:
                printe(f"Skipping deployment with insufficient name parts: {deployment.name}")
                continue
                
            # Extract relevant tags (COMMIT_HASH or PACKAGE_VERSION)
            relevant_tags = [tag for tag in deployment.tags if 'COMMIT_HASH' in tag or 'PACKAGE_VERSION' in tag]
            
            # Create a standardized flow name (replace hyphens with underscores)
            flow_name = parts[-2].replace('-', '_')
            
            # Construct deployment info
            deploy_info = {
                'name': deployment.name,
                'project_name': parts[0],
                'branch': parts[1],
                'flow_name': flow_name,
                'env': parts[-1],
                'tags': relevant_tags,
                'id': str(deployment.id),
                'created': str(deployment.created),
                'updated': str(deployment.updated),
                'flow_id': str(deployment.flow_id)
            }
            
            result.append(deploy_info)
            printe(f"Added deployment: {deploy_info['project_name']}/{flow_name} ({deploy_info['branch']}/{deploy_info['env']})")
            
        return result
    except ImportError:
        printe("Error: Prefect package not installed or not found")
        return []
    except Exception as e:
        printe(f"Error getting deployments: {str(e)}")
        traceback.print_exc(file=sys.stderr)
        return []

def main():
    """Main entry point for the deployment finder script."""
    try:
        printe("Starting deployment scan...")
        deployments = get_deployments()
        printe(f"Found {len(deployments)} deployments")
        
        # Output format: JSON
        result = json.dumps(deployments, indent=2)
        
        # Always print to stdout for capture by the extension
        print(result)
        
    except Exception as e:
        printe(f"Unexpected error: {str(e)}")
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
