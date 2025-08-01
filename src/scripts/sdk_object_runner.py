import sys
import os
import json
import importlib
import traceback

def find_object_of_class(module, cls_obj):
    """Find an object in the module that is an instance of the specified class."""
    # Get all objects in the module
    for name in dir(module):
        obj = getattr(module, name)
        
        # Check if this object is an instance of the target class
        if isinstance(obj, cls_obj):
            return obj, name
    
    return None, None

def main():
    if len(sys.argv) < 4:
        print(f"Usage: {sys.argv[0]} <module_name> <class_name> <output_file> [kwargs_json]", file=sys.stderr)
        sys.exit(1)
    
    module_name = sys.argv[1]
    class_name = sys.argv[2]
    output_file = sys.argv[3]
    error_file = output_file.replace('.json', '_error.json')
    
    # Parse kwargs if provided
    kwargs = {}
    if len(sys.argv) > 4:
        try:
            kwargs = json.loads(sys.argv[4])
            print(f"Received kwargs: {kwargs}", file=sys.stderr)
        except json.JSONDecodeError as e:
            print(f"Error parsing kwargs JSON: {e}", file=sys.stderr)
            sys.exit(1)
    
    try:
        # Find the workspace root (where .acme_portal_sdk is expected)
        workspace_root = os.getcwd()
        
        # Add the .acme_portal_sdk directory to the Python path
        sdk_path = os.path.join(workspace_root, ".acme_portal_sdk")
        if not os.path.exists(sdk_path):
            raise FileNotFoundError(f".acme_portal_sdk directory not found at {sdk_path}")
        
        sys.path.insert(0, sdk_path)

        # Import class
        print(f"Importing class {class_name}...", file=sys.stderr)
        try:
            pkg = importlib.import_module("acme_portal_sdk")
        except ImportError as e:
            raise ImportError(f"Failed to import acme_portal_sdk. Make sure it's installed in your Python environment: {e}")
            
        if not hasattr(pkg, class_name):
            raise AttributeError(f"Class '{class_name}' not found in acme_portal_sdk")
        cls_obj = getattr(pkg, class_name)
        
        # Import the module
        print(f"Importing module: {module_name}", file=sys.stderr)
        try:
            module_path = f"{module_name}"
            module = importlib.import_module(module_path)
        except ImportError as e:
            raise ImportError(f"Module '{module_name}' not found: {e}")
            
        if module is None:
            raise ImportError(f"Module '{module_name}' not found")
        print(f"Module '{module_name}' imported successfully", file=sys.stderr)
        
        # Find the object
        print(f"Looking for instance of class: {class_name}", file=sys.stderr)
        obj, obj_name = find_object_of_class(module, cls_obj)
        
        if obj is None:
            raise ValueError(f"No instance of class '{class_name}' found in module '{module_name}'")
        
        print(f"Found object '{obj_name}' of class '{class_name}'", file=sys.stderr)
        
        # Call the object with kwargs if provided
        print(f"Calling object with kwargs: {kwargs}", file=sys.stderr)
        result = obj(**kwargs)
        # Save the result to a file
        with open(output_file, 'w') as f:
            json.dump(result, f)
        
        print(f"Output saved to {output_file}", file=sys.stderr)
        
    except Exception as e:
        # Create structured error information
        error_info = {
            "error_type": type(e).__name__,
            "error_message": str(e),
            "module_name": module_name,
            "class_name": class_name,
            "traceback": traceback.format_exc()
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
