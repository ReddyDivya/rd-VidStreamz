import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

//2nd approach to connect to Database; 1st approach is in the src/index.js
// Function to connect to MongoDB database
const connectDB = async () => {
    try {
        // Attempt to establish a connection to the MongoDB database using the provided URI
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        
        // Log a success message if the connection is established
        console.log("\n MongoDB connected! DB HOST: ", `${connectionInstance.connection.host}`);
    } catch (error) {
        // If an error occurs during connection, log the error message and exit the process
        console.log("MONGODB connection error ", error);
        process.exit(1);
    }
}

// Export the connectDB function to make it available for use in other files
export default connectDB;
