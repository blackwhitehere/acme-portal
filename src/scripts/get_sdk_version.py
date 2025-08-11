#!/usr/bin/env python3
"""
Script to get the version of the acme-portal-sdk package.
"""

import sys
import json
import traceback


def get_sdk_version():
    """Get the version of acme-portal-sdk package."""
    try:
        # Try to import acme_portal_sdk and get version
        import acme_portal_sdk
        
        # First try to get version from __version__ attribute
        if hasattr(acme_portal_sdk, '__version__'):
            return acme_portal_sdk.__version__
        
        # If no __version__, try to get from metadata
        try:
            import importlib.metadata
            return importlib.metadata.version('acme-portal-sdk')
        except ImportError:
            # Fallback for Python < 3.8
            import pkg_resources
            return pkg_resources.get_distribution('acme-portal-sdk').version
            
    except ImportError as e:
        raise ImportError(f"acme-portal-sdk is not installed: {e}")
    except Exception as e:
        raise Exception(f"Unable to determine acme-portal-sdk version: {e}")


def main():
    """Main function to get SDK version and output as JSON."""
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <output_file>", file=sys.stderr)
        sys.exit(1)
    
    output_file = sys.argv[1]
    error_file = output_file.replace('.json', '_error.json')
    
    try:
        version = get_sdk_version()
        
        # Save the result to a file
        result = {
            "version": version,
            "success": True
        }
        
        with open(output_file, 'w') as f:
            json.dump(result, f)
        
        print(f"SDK version {version} saved to {output_file}", file=sys.stderr)
        
    except Exception as e:
        # Create structured error information
        error_info = {
            "error_type": type(e).__name__,
            "error_message": str(e),
            "traceback": traceback.format_exc(),
            "success": False
        }
        
        # Save error information to error file
        try:
            with open(error_file, 'w') as f:
                json.dump(error_info, f, indent=2)
        except Exception as file_error:
            print(f"Failed to write error file: {file_error}", file=sys.stderr)
        
        # Still print to stderr for backward compatibility
        print(f"Error: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()