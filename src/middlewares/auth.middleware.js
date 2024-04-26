// This is a middleware for authentication
import { User } from "../models/user.model.js";//User model
import { ApiError } from "../utils/ApiError.js";//handles api errors
import { asyncHandler } from "../utils/asyncHandler.js";//utility function
import jwt from "jsonwebtoken";//jwt module

// Defining the verifyJWT middleware function using asyncHandler
// We are not making use of `res` here. So, we can replace it with `_`
export const verifyJWT = asyncHandler(async(req, _, next) => {
    
    try{
        // Comment explaining the usage of cookies in the application
        // cookieParser middleware in app.js allows access to cookies in both the request and response objects
        // cookies aren't set for mobile app. So, the user will send the cookies through request header
        // We don't require `Bearer`, so we replace it.
        
        // Checking if the accessToken cookie exists in the request object or if there is an Authorization header
        // If the accessToken cookie exists, it will be used for authentication
        // If not, it checks for the presence of an Authorization header and extracts the token from it
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")

        if(!token){
            // If token is not present, throw an unauthorized error
            throw new ApiError(401, "Unauthorized request");
        }

        // Decode jwt
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Making a database request to find the user by id decoded from the token
        // We have given `_id` in `userSchema.methods.generateAccessToken` in user.model.js.
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user){
            // If user is not found, throw an invalid access token error
            throw new ApiError(401, "Invalid Access Token");
        }

        // Set the user object in the request for further use
        req.user = user;
        
        // Call the next middleware function in the chain
        next(); // this tells to execute the next function when its job is done
    }
    catch(error){
        // If any error occurs, throw an unauthorized error
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
})
