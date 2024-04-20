import mongoose, {Schema} from "mongoose";

// Define the schema for user data
const userSchema = new Schema({
    // Username of the user
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    // Email address of the user
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    // Full name of the user
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    // Avatar URL of the user (stored as a cloudinary URL)
    avatar: {
        type: String,
        required: true,
    },
    // Cover image URL of the user (stored as a cloudinary URL)
    coverImage: {
        type: String,
    },
    // Array to store user's watch history, referencing Video model
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    // User's password
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    // Refresh token for authentication
    refreshToken: {
        type: String,
    }

}, {timestamps: true});

// Create and export the User model based on the schema
export const User = mongoose.model("User", userSchema);
