import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


//asyncHandler is a Higher Order Function
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
    // res.status(200).json({
    //     message: "ok"
    // })

    //1. Get the user information from the frontend
    const {fullName, email, username, password} = req.body;
    console.log("email : ", email);

    //2. Validation - all fields
    if([fullName, email, username, password].some((field) => field?.trim() === ""))
    {
        throw new ApiError(400, "All fields are required");
    }

    //3. check if user already exists(email/username)
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists.")
    }

    //4. check for images, check for avatar, coverImage is not compulsory
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImageLocalPath;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required!");
    }   

    //5. upload them to Cloudinary, avatar.
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar file is required!");
    }

    //6. create user object - create an entry in DB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //7. remove the password and refresh the token field from the response.
    // Checking createdUser by id, write fields which are not required with (-)
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    //8. check the user creation.
    // If createdUser is not found, create a new ApiError
    if(!createdUser){
        new ApiError(500, "Something went wrong while registering the user!");
    }

    //9. return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully!")
    )

})

export {registerUser};