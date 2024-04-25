// This is a middleware for authentication

// Importing the asyncHandler utility function from a file named asyncHandler.js located in the utils directory
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// Defining the verifyJWT middleware function using asyncHandler
//we are not making use of `res` here. So, we can replace it with `_`
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
            new ApiError(401, "Unauthorized request");
        }

        //decode jwt
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        //making a database request
        //We have given `_id` in `userSchema.methods.generateAccessToken` in user.model.js.
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user){
            //NEXT_VIDEO: discuss about frontend
            new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();//this tells to execute the next function when its job is done
    }
    catch(error){
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
})
