/**
 * Utility functions for determining appropriate icons for tree items
 */
export class IconUtils {
    /**
     * Determine appropriate icon based on the label content
     * @param label The label text to analyze
     * @returns The appropriate VSCode theme icon name
     */
    public static getIconForDetailLabel(label: string): string {
        if (label.startsWith('Description:')) {
            return 'comment';
        } else if (label.startsWith('Source:')) {
            return 'file-code';
        } else if (label.startsWith('Function:')) {
            return 'symbol-function';
        } else if (label.startsWith('Commit:')) {
            return 'git-commit';
        } else if (label.startsWith('Package Version:')) {
            return 'package';
        } else if (label.startsWith('Updated:')) {
            return 'clock';
        }
        // Default for child_attributes and unknown fields
        return 'symbol-property';
    }
}