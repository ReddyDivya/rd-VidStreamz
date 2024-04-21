import {v2 as cloudinary} from "cloudinary"; // Importing the Cloudinary library and renaming it as 'cloudinary'
import fs from "fs"; // Importing the Node.js file system module

// Configuring Cloudinary with the credentials stored in environment variables
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY, // Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET // Cloudinary API secret
});

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null; // If no local file path provided, return null

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically detect the resource type (e.g., image, video)
        });

        // Log success message with the URL of the uploaded file
        console.log("File is uploaded on Cloudinary.", response.url);

        return response; // Return the response from Cloudinary
    } catch(error) {
        // If upload operation fails, remove the locally saved temporary file
        fs.unlinkSync(localFilePath);
        return null; // Return null to indicate failure
    }
};

export {uploadOnCloudinary}; // Exporting the uploadOnCloudinary function for external use
