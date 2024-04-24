import { asyncHandler } from "../utils/asyncHandler.js";//asyncHandler utility function
import { ApiError } from "../utils/ApiError.js";//ApiError utility class
import { User } from "../models/user.model.js";// User model
import { uploadOnCloudinary } from "../utils/cloudinary.js";//uploadOnCloudinary utility function
import { ApiResponse } from "../utils/ApiResponse.js";//ApiResponse utility class


// Definition of registerUser function using asyncHandler
// asyncHandler is a Higher Order Function
const registerUser = asyncHandler(async (req, res) => {
    /*
    ## Steps to Register - Logic Building
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
    //console.log("email : ", email);// Logging the email received from the frontend
       
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
})

export {registerUser};// Exporting registerUser function