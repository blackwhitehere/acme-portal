import sys
import os
import json
import importlib
import traceback

def find_object_of_class(module, class_name):
    """Find an object in the module that is an instance of the specified class."""
    # Get all objects in the module
    for name in dir(module):
        obj = getattr(module, name)
        
        # Check if this object is an instance of the target class
        if hasattr(obj, "__class__") and obj.__class__.__name__ == class_name:
            return obj, name
    
    return None, None

def main():
    if len(sys.argv) < 4:
        print(f"Usage: {sys.argv[0]} <module_name> <class_name> <output_file>", file=sys.stderr)
        sys.exit(1)
    
    module_name = sys.argv[1]
    class_name = sys.argv[2]
    output_file = sys.argv[3]
    
    try:
        # Find the workspace root (where .acme_portal_sdk is expected)
        workspace_root = os.getcwd()
        
        # Add the .acme_portal_sdk directory to the Python path
        sdk_path = os.path.join(workspace_root, ".acme_portal_sdk")
        if not os.path.exists(sdk_path):
            print(f"Error: .acme_portal_sdk directory not found at {sdk_path}", file=sys.stderr)
            sys.exit(1)
        
        sys.path.insert(0, workspace_root)
        
        # Import the module
        print(f"Importing module: {module_name}", file=sys.stderr)
        module_path = f"{module_name}"
        module = importlib.import_module(module_path)
        
        # Find the object
        print(f"Looking for instance of class: {class_name}", file=sys.stderr)
        obj, obj_name = find_object_of_class(module, class_name)
        
        if not obj:
            print(f"Error: No instance of class '{class_name}' found in module '{module_name}'", file=sys.stderr)
            sys.exit(1)
        
        print(f"Found object '{obj_name}' of class '{class_name}'", file=sys.stderr)
        
        # Call the object
        print("Calling object...", file=sys.stderr)
        result = obj()
        
        # Save the result to a file
        with open(output_file, 'w') as f:
            json.dump(result, f)
        
        print(f"Output saved to {output_file}", file=sys.stderr)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
