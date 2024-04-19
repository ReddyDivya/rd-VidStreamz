// Define a custom class named ApiResponse
class ApiResponse {
    // Constructor function for initializing an instance of ApiResponse
    constructor(statusCode, data, message = "Success") {
        // Set properties specific to the ApiResponse instance
        this.statusCode = statusCode;  // HTTP status code
        this.data = data;               // Data to be sent in the response
        this.message = message;         // Response message
        this.success = statusCode < 400; // Determine if the operation was successful based on status code

        // If the status code is less than 400, consider the response successful,
        // as HTTP status codes in the 2xx and 3xx ranges are typically successful.
        // (NOTE: This logic might need adjustment depending on specific requirements)
    }
}

// Export the ApiResponse class to make it accessible from other modules
export { ApiResponse };
