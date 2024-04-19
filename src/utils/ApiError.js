// Define a custom class named ApiError that extends the built-in Error class
class ApiError extends Error {
    // Constructor function for initializing an instance of ApiError
    constructor(
        statusCode,            // HTTP status code for the error
        message = "Something went wrong",  // Default error message
        error = [],            // Array to hold additional error details (optional)
        stack = ""             // Stack trace of the error (optional)
    ) {
        // Call the constructor of the parent class (Error) with the provided message
        super(message);

        // Set properties specific to the ApiError instance
        this.statusCode = statusCode;     // HTTP status code
        this.data = null;                 // Placeholder for additional data (not used in the provided code)
        this.message = message;           // Error message
        this.success = false;             // Indicate that the operation was not successful
        this.errors = this.errors;        // Assign the provided error array to the 'errors' property (NOTE: this may be a typo, should it be 'error' instead of 'this.errors'?)

        // If a stack trace is provided, assign it to the 'stack' property
        // Otherwise, capture the stack trace using Node.js's built-in Error.captureStackTrace() method
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Export the ApiError class to make it accessible from other modules
export { ApiError };
