// Import necessary modules
import express from "express";      // Importing Express framework
import cors from "cors";            // Importing CORS middleware for enabling cross-origin resource sharing
import cookieParser from "cookie-parser";  // Importing Cookie Parser middleware for parsing cookies

// Create an Express application instance
const app = express();

// Configure CORS middleware to allow requests from specified origins and enable credentials
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN, // Set the origin to the value of the CORS_ORIGIN environment variable
        credentials: true,// Allow credentials to be sent along with the request
    }
))

// Configure middleware for parsing JSON data and setting a size limit
app.use(express.json({limit: "16kb"}));

// Configure middleware for parsing URL-encoded data and setting a size limit
app.use(express.urlencoded({extended: true, limit: "16kb"}));

// Serve static files from the "public" directory, such as images, CSS, and JavaScript
app.use(express.static("public"));

// Use Cookie Parser middleware for parsing cookies sent with the request
app.use(cookieParser());


//routes import
import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);//(/api/v1/users-standard practice and it is a prefix)

// Export the Express application instance
export {app}
