import { asyncHandler } from "../utils/asyncHandler.js";//asyncHandler utility function
import { ApiError } from "../utils/ApiError.js";//ApiError utility class
import { User } from "../models/user.model.js";// User model
import { uploadOnCloudinary } from "../utils/cloudinary.js";//uploadOnCloudinary utility function
import { ApiResponse } from "../utils/ApiResponse.js";//ApiResponse utility class
import jwt from "jsonwebtoken";

// Generating access and refresh Tokens
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // Find user with the given userId in the database
        const user = await User.findById(userId);

        // Generate an access token and a refresh token for the user
        const accessToken = user.generateAccessToken(); // Generate access token
        const refreshToken = user.generateRefreshToken(); // Generate refresh token

        // Save the refresh token in the user document
        user.refreshToken = refreshToken;

        // Save the user document in the database without running validations (if any)
        await user.save({ validateBeforeSave: false });

        // Return the generated access token and refresh token
        return { accessToken, refreshToken };
    } catch (error) {
        // If an error occurs during the process, create an instance of ApiError
        // with status code 500 and an error message
        return new ApiError(500, "Something went wrong while generating refresh and access tokens");
    }
}; // generateAccessAndRefreshTokens


// Definition of registerUser function using asyncHandler
// asyncHandler is a Higher Order Function
const registerUser = asyncHandler(async (req, res) => {
    /*
    ## Steps to Register User - Logic Building
        1. Get the user information from the frontend(**user.model.js**)
        2. Validation - not empty
        3. check if user already exists(email/username)
        4. check for images, check for avatar
        5. upload them to Cloudinary, avatar.
        6. create user object - create an entry in DB
        7. remove the password and refresh the token field from the response.
        8. check the user creation.
        9. return response.
    */

    // Step 1: Get the user information from the frontend
    // Destructure fields from the request body
    const { fullname, email, username, password } = req.body;
    console.log("register : ", fullname, email, username, password );// Logging the email received from the frontend
       
    // Step 2: Validation - checking if all fields are provided
    // Checking if any of the fields are empty or whitespace
    if ([fullname, email, username, password].some((field) => !field || field.trim() === "")) {
        // If any of the fields are empty or whitespace, throw an ApiError
        throw new ApiError(400, "All fields are required");
    }

    // Step 3: Check if user already exists (email/username)
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists.");
    }

    //console.log(req.files);

     // Step 4: Check for images, check for avatar, coverImage is not compulsory
     const avatarLocalPath = req.files?.avatar[0]?.path;

    //const coverImageLocalPath = req.files?.coverImage[0]?.path;    
    //the above code lead to an error when no data is passed. so, fixed check the code down
    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) 
    {
        coverImageLocalPath = req.files.coverImage[0].path
    }
 
     // If avatarLocalPath is not provided, throw an error
     if (!avatarLocalPath) {
         throw new ApiError(400, "Avatar file is required!");
     }  

    // Step 5: Upload them to Cloudinary, avatar.
    // Upload avatar image to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // Upload cover image to Cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // If avatar upload fails, throw an error
    if (!avatar) {
        throw new ApiError(400, "Avatar file upload failed!");
    }

    // Step 6: Create user object - create an entry in DB
    const user = await User.create({
        fullname,
        avatar: avatar.url, // Assuming Cloudinary provides the URL for the uploaded avatar
        coverImage: coverImage?.url || "", // Assuming Cloudinary provides the URL for the uploaded cover image, if available
        email,
        password,
        username: username.toLowerCase() // Converting username to lowercase before storing
    });

    // Step 7: Remove the password and refresh token fields from the response
    // Assuming user._id is provided in the request
    // Checking createdUser by id, write fields which are not required with (-)
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    // Step 8: Check the user creation
    // If createdUser is not found, create a new ApiError
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user!");
    }

    // Step 9: Return response
    // Assuming createdUser contains the necessary user data after successful registration
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully!")
    );
});//registerUser

// Definition of loginUser function using asyncHandler
// asyncHandler is a Higher Order Function
const loginUser = asyncHandler(async (req, res) => {
    /*
    ## Steps to Login User - Logic Building
        1. Get information from the frontend(req body -> data)
        2. username or email
        3. find the user
        4. password check
        5. access and refresh token
        6. send cookies
    */

   // 1. Get information from the frontend(req body -> data)
   const { email, username, password } = req.body;
   
   // 2. Check if username or email is provided
   if (!username && !email) {
        // If username or email is not provided, throw a bad request error
        throw new ApiError(400, "Username or email is required");
    }

   // 3. Find the user
   // Use Mongoose's findOne() method to search for a user document in the database.
    const user = await User.findOne({
        // Construct a query using the $or operator to find a document where either the username or email matches.
        $or: [
            // Search for a document where the username or email fields matches the value stored in the username or email variable.
            { username }, { email }
        ]
    });
    
    // If user is not found, throw a not found error
    if (!user) {
        throw new ApiError(404, "User doesn't exist!");
    }

    // 4. Password check
    // Check if the provided password matches the user's stored password
    const isPasswordValid = await user.isPasswordCorrect(password);
    
    // If the password is not valid, throw an unauthorized error
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials!");
    }

    // 5. Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // 6. Send cookies
    // Fetch the logged in user details from the database
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Configure options for setting cookies
    const options = {
        httpOnly : true,
        secure: true,
    }

    // Set cookies in the response
    // cookieParser in app.js is allowing us to use cookies here.
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            // Send a success response with the logged in user details and tokens
            new ApiResponse(200, 
                {
                    // Send user details along with tokens
                    // We send tokens here for cases where users want to save tokens on their end (e.g., local storage) or for mobile applications where cookies aren't set
                    user: loggedInUser, 
                    accessToken, 
                    refreshToken
                },
                "User logged in successfully"
            )
        )
}) // loginUser


// Logout User
// This function is responsible for logging out a user by removing cookies and refreshing tokens
// Importing the asyncHandler utility function from the asyncHandler.js file located in the utils directory
const logoutUser = asyncHandler(async (req, res) => {
    // After logout usually we don't have a `req.user` but we are sending `req.user = user;` in `verifyJWT` middleware (the whole function is the reason we have user data with us)
    
    // Update the user document in the database to remove the refresh token
    await User.findByIdAndUpdate(req.user._id, 
        {
            $set: {
                refreshToken: undefined
            }
        },    
        {
            new: true
        }
    )

    // Reset cookies
    // Cookies can be modified by users. So, we are allowing only the server to make changes. 
    const options = {
        httpOnly : true,
        secure: true,
    }

    // Respond with a success status and clear the cookies
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User is logged out successfully"));
})//logoutUser

// Add refresh token endpoint
const refreshAccessToken = asyncHandler(async (req, res) => {
    // For mobile apps, refresh tokens might be sent in the request body or headers
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    // Check if refresh token is missing
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    }

    try{
        // Verify the incoming refresh token
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Fetch user from the database using the user ID from the decoded token
        const user = await User.findById(decodedToken?._id);
        
        // Check if user exists
        if(!user){
            throw new ApiError(401, "Invalid refresh token");
        }

        // Check if the incoming refresh token matches the one stored in the user document
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used");
        }

        // Options for setting cookies
        const options = {
            httpOnly: true,
            secure: true
        }

        // Generate new access and refresh tokens
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);

        // Send response with new tokens and set cookies
        return res.status(200)
            .cookie("accessToken", accessToken)
            .cookie("refreshToken", newRefreshToken)
            .json(
                new ApiResponse(
                    200, 
                    {accessToken, refreshToken: newRefreshToken},
                    "Access token refreshed"
                )
            );
    }
    catch(error){
        // If any error occurs during token verification or generation, throw an ApiError
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});//refreshAccessToken

// Change password endpoint handler
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    //we get `req.user` through a middleware
    // Retrieve user object based on authenticated user ID
    const user = await User.findById(req.user?.id);

    // Check if the old password provided matches the user's current password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    // If old password is incorrect, throw a 400 error
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    // Update user's password with the new password provided
    user.password = newPassword;

    // Save the updated user object, disabling schema validation before saving
    await user.save({ validateBeforeSave: false });

    // Respond with success message
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully!"));
});//changeCurrentPassword

// Get current user endpoint handler
const getCurrentUser = asyncHandler(async (req, res) => {
    // Respond with status 200 and the current user object
    //we get `req.user` through a middleware
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully!"));
});

// Update account details endpoint handler
const updateAccountDetails = asyncHandler(async (req, res) => {
    
    //Extracts fullname and email from the request body.
    const { fullname, email } = req.body;

    // Check if fullname and email are provided
    if (!fullname || !email) {
        //Throws a 400 error if either fullname or email is missing.
        throw new ApiError(400, "All fields are required!");
    }

    // Find the user by ID and update fullname and email
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname: fullname,
                email: email,
            },
        },
        { new: true }//returns the modified document rather than the original.
    )
    .select("-password");//exclude the password field from the returned user object

    // Respond with status 200 and the updated user object
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details are updated successfully!"));//JSON object containing the updated user information
});//updateAccountDetails

//update user avatar
const updateUserAvatar = asyncHandler(async(req, res) => {
    // Get the local path of the uploaded avatar file from the request
    const avatarLocalPath = req.file?.path;

    // Check if the avatar file exists
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing");
    }

    //TODO: delete old image, make utility function: L19:4m(timestamp)
    // Upload the avatar to Cloudinary and get the URL
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // Check if the avatar was successfully uploaded
    if(!avatar){
        throw new ApiError(400, "Error while uploading avatar");
    }

    // Find the user by ID and update their avatar URL
    const user = await User.findByIdAndUpdate(
        req.user?._id, // Find the user by their ID from the request
        {
            $set: {
                avatar: avatar.url // Set the avatar URL to the Cloudinary URL
            }
        },
        {new: true}, // Return the updated user document
    ).select("-password") // Exclude the password from the returned user object

    // Return a success response with the updated user object
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

//update user cover image
const updateUserCoverImage = asyncHandler(async(req, res) => {
    // Get the local path of the uploaded cover image file from the request
    const coverImageLocalPath = req.file?.path;

    // Check if the cover image file exists
    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image file is missing");
    }

    // Upload the cover image to Cloudinary and get the URL
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // Check if the cover image was successfully uploaded
    if(!coverImage?.url){
        throw new ApiError(400, "Error while uploading cover image");
    }

    // Find the user by ID and update their cover image URL
    const user = await User.findByIdAndUpdate(
        req.user?._id, // Find the user by their ID from the request
        {
            $set: {
                coverImage: coverImage.url // Set the cover image URL to the Cloudinary URL
            }
        },
        {new: true}, // Return the updated user document
    ).select("-password") // Exclude the password from the returned user object

    // Return a success response with the updated user object
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
});//updateUserCoverImage

// Function to get user channel profile
const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params;

    // Check if username is provided
    if(!username?.trim()){
        throw new ApiError(400, "Username is missing");
    }

    // Aggregate query to fetch user's channel profile
    const channel = await User.aggregate([

        // Match the document based on username
        {
            $match: {
                username: username?.toLowerCase()
            }
        },

        // Perform a left outer join with subscriptions collection to get subscribers
        {
            $lookup:{
                // Subscription from subscription.model.js - here the model name converts to plural and lowercase like `subscriptions`
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            }
        },

        // Perform a left outer join with subscriptions collection to get channels subscribed to
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            }
        },

        // Add fields to the document to include subscribers count, channels subscribed to count, and whether the user is subscribed
        {
            $addFields:{
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond:{
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]}, // Check if the logged-in user is among the subscribers
                        then: true,
                        else: false
                    }
                }
            }
        },

        // Project only the required fields for the response
        {
            $project:{
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed : 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ]);

    if(!channel?.length){
        throw new ApiError(404, "Channel doesn't exists");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched succesfully")
    )
}); // End of getUserChannelProfile function

// Function to retrieve user's watch history
const getWatchHistory = asyncHandler(async (req, res) => {
    // Aggregate query to retrieve user's watch history
    const user = await User.aggregate([
        {
            // Match the document based on the user's ID
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                // Perform a left outer join with the videos collection to fetch watch history
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                // Sub-pipelines to further manipulate the joined data
                pipeline: [
                    {
                        $lookup: {
                            // Perform a left outer join with the users collection to fetch video owners' details
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            // Extract the first element of the 'owner' array to simplify the structure
                            owner: {
                                $first: "$owner",
                            }
                        }
                    }
                ]
            }
        }
    ]);

    // Respond with the retrieved watch history
    return res
        .status(200)
        .json(new ApiResponse(200,
            user[0].watchHistory,
            "Watch history fetched successfully")
        );
}); // End of getWatchHistory function


export {registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, updateAccountDetails,  updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory};// Exporting functions