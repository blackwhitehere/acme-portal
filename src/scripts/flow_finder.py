#!/usr/bin/env python
"""
Flow Finder Script for ACME Portal

This script scans Python files for Prefect flows and outputs JSON data
about the discovered flows.
"""

import sys
import os
import ast
import json
import traceback
from typing import Dict, Any

def printe(message):
    """Print a message to stderr."""
    print(message, file=sys.stderr)

class FlowVisitor(ast.NodeVisitor):
    """AST visitor to find Prefect flow decorators in Python code."""
    
    def __init__(self):
        self.flows = {}
        self.current_class = None
        self.current_function = None
    
    def visit_ClassDef(self, node):
        old_class = self.current_class
        self.current_class = node.name
        self.generic_visit(node)
        self.current_class = old_class
    
    def visit_FunctionDef(self, node):
        """Visit a function definition node."""
        self.current_function = node.name
        # Look for decorators that might be flows
        for decorator in node.decorator_list:
            if self._is_flow_decorator(decorator):
                # Found a flow decorator
                # Extract keyword arguments from decorator
                kwargs = self._extract_decorator_kwargs(decorator)
                flow_name = kwargs.get('name', self.current_function)
                display_name = flow_name.replace("-", "_")
                
                description = kwargs.get('description', '') or ast.get_docstring(node)
                # Create a unique ID based on the function name and location
                flow_key = f"{flow_name}_{id(node)}"
                
                self.flows[flow_key] = {
                    'name': display_name,
                    'original_name': flow_name,
                    'description': description,
                    'type': 'function',
                    'id': flow_key,
                }
                
                if self.current_class:
                    self.flows[flow_key]['class'] = self.current_class
                    self.flows[flow_key]['type'] = 'method'
                
                # Debug output to help troubleshoot
                printe(f"Found flow: {display_name} (from function {flow_name})")
        
        self.generic_visit(node)
        self.current_function = None
    
    def _is_flow_decorator(self, decorator):
        """Check if a decorator is a flow decorator."""
        if isinstance(decorator, ast.Call) and isinstance(decorator.func, ast.Name) and decorator.func.id == 'flow':
            return True
        
        # Also check for prefect.flow or from prefect import flow
        if isinstance(decorator, ast.Call) and isinstance(decorator.func, ast.Attribute):
            if decorator.func.attr == 'flow':
                return True
        
        return False
    
    def _extract_decorator_kwargs(self, decorator):
        """Extract keyword arguments from a decorator."""
        kwargs = {}
        if isinstance(decorator, ast.Call):
            for keyword in decorator.keywords:
                if isinstance(keyword.value, ast.Constant):
                    kwargs[keyword.arg] = keyword.value.value
                elif isinstance(keyword.value, ast.Str):  # For Python < 3.8
                    kwargs[keyword.arg] = keyword.value.s
        return kwargs

def scan_file(file_path: str) -> Dict[str, Any]:
    """Scan a single Python file for flows."""
    flows = {}
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parse the file
        tree = ast.parse(content)
        visitor = FlowVisitor()
        visitor.visit(tree)
        
        # Process found flows
        for key, flow_data in visitor.flows.items():
            # Add file information
            flow_data['source_file'] = file_path
            flow_data['module'] = os.path.splitext(os.path.basename(file_path))[0]
            
            # Add the flow to the results
            display_name = flow_data['name']
            flows[key] = flow_data
            
            printe(f"Added flow to results: {display_name}")
    
    except Exception as e:
        printe(f"Error scanning {file_path}: {str(e)}")
        traceback.print_exc(file=sys.stderr)
    
    return flows

def scan_directory(directory_path: str) -> Dict[str, Any]:
    """Recursively scan a directory for Python files with flows."""
    all_flows = {}
    
    printe(f"Scanning directory: {directory_path}")
    
    try:
        for root, dirs, files in os.walk(directory_path):
            for file in files:
                if file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    printe(f"Examining file: {file_path}")
                    flows = scan_file(file_path)
                    if flows:
                        printe(f"Found {len(flows)} flows in {file_path}")
                    all_flows.update(flows)
    except Exception as e:
        printe(f"Error walking directory {directory_path}: {str(e)}")
        traceback.print_exc(file=sys.stderr)
    
    return all_flows

def main():
    """Main entry point for the flow finder script."""
    try:
        if len(sys.argv) < 2:
            printe("Usage: flow_finder.py <directory_to_scan>")
            sys.exit(1)
        
        directory = sys.argv[1]
        printe(f"Starting scan of {directory}")
        flows = scan_directory(directory)
        printe(f"Found {len(flows)} total flows")
        
        # Output format: JSON
        result = json.dumps(flows, indent=2)
        
        # Debug: show the flow names found
        for name in flows.keys():
            printe(f"Flow in results: {name}")
        
        # Always print to stdout for capture by the extension
        print(result)
        
    except Exception as e:
        printe(f"Unexpected error: {str(e)}")
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
