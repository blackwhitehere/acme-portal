/**
 * Standalone version checking utility functions for semantic versioning
 * These functions don't depend on VS Code APIs and can be unit tested
 */

export interface SemanticVersion {
    major: number;
    minor: number;
    patch: number;
}

/**
 * Parse semantic version string into components
 */
export function parseSemanticVersion(version: string): SemanticVersion {
    // Remove any 'v' prefix and handle pre-release/build metadata
    const cleanVersion = version.replace(/^v/, '').split(/[-+]/)[0];
    const parts = cleanVersion.split('.').map(part => parseInt(part, 10));
    
    if (parts.length < 3 || parts.some(isNaN)) {
        throw new Error(`Invalid semantic version: ${version}`);
    }
    
    return {
        major: parts[0],
        minor: parts[1],
        patch: parts[2]
    };
}

/**
 * Compare two semantic versions to check compatibility
 * Returns true if installedVersion >= minVersion
 */
export function isVersionCompatible(installedVersion: string, minVersion: string): boolean {
    try {
        const installed = parseSemanticVersion(installedVersion);
        const minimum = parseSemanticVersion(minVersion);
        
        // Compare major.minor.patch
        if (installed.major > minimum.major) {
            return true;
        }
        if (installed.major < minimum.major) {
            return false;
        }
        
        if (installed.minor > minimum.minor) {
            return true;
        }
        if (installed.minor < minimum.minor) {
            return false;
        }
        
        return installed.patch >= minimum.patch;
    } catch (error) {
        console.warn('Error comparing versions:', error);
        // If we can't parse versions, assume incompatible for safety
        return false;
    }
}