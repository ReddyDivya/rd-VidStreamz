import mongoose, { Schema } from "mongoose"; // Importing mongoose library for MongoDB interaction
import jwt from "jsonwebtoken"; // Importing JSON Web Token library for token generation and verification
import bcrypt from "bcrypt"; // Importing bcrypt library for password hashing

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

}, { timestamps: true });

// This pre-save middleware function is executed whenever the 'save' method is called on a user document.
// It checks if the password field has been modified. If yes, it hashes the password before saving it to the database.
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next(); // If password is not modified, proceed to the next middleware
    
    // Hashing the password using bcrypt with a salt round of 10
    this.password = await bcrypt.hash(this.password, 10); // password string, number of rounds
    next(); // Proceed to the next middleware or save operation
});

// This method compares a given password with the encrypted password stored in the database to check if they match.
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password); // Comparing the given password with the encrypted password
}

// Generating access token using JSON Web Token (JWT)
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        // Payload contains user data (id, email, username, fullname) that will be encoded into the token.
        // It's important to include only necessary data to keep the token lightweight and secure.
        {
            _id: this._id,          // User's unique ID
            email: this.email,      // User's email address
            username: this.username,// User's username
            fullname: this.fullname // User's full name (if available)
        }, 
        process.env.ACCESS_TOKEN_SECRET, // Signing key for the token, retrieved from environment variables
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY} // Setting expiration time for the token
    );
}

// Generating refresh token using JSON Web Token (JWT)
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        // Payload contains only the user's unique ID.
        // Refresh tokens typically contain minimal data for security reasons.
        {
            _id: this._id, // User's unique ID
        }, 
        process.env.REFRESH_TOKEN_SECRET, // Signing key for the token, retrieved from environment variables
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY} // Setting expiration time for the token
    );
}

// Creating and exporting the User model based on the defined schema.
export const User = mongoose.model("User", userSchema);