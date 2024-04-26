
//using promises 
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }


// //using try-catch for practice
// // Define an asynchronous middleware function called asyncHandler
// //HOC
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         // Call the provided asynchronous function (fn) with request, response, and next arguments
//         await fn(req, res, next);
//     } catch (error) {
//         // If an error occurs during execution of the asynchronous function
//         // Set the HTTP response status to the error code or default to 500 (Internal Server Error)
//         // Send a JSON response with success set to false and the error message
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

