"use strict";

/*
 * General purpose utility functions.
 */

// Generic assert for easy catching of issues.  The condition will be evaluated based on "truthiness".
const assert = (condition: any, message: string): void => {
    if (! condition) {
        throw new Error(message || "Assertion failed");
    }
}

const missing = (value: any): boolean => {
    // Returns true if the value is null or undefined.  This is more specific than a truthy check that also looks
    // at empty strings or nulls.
    return (value === undefined || value === null);
}

export { assert, missing };
