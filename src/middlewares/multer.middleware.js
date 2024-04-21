import multer from "multer"; // Importing the multer library for handling file uploads

// Configuring storage settings for multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./public/temp"); // Setting the destination folder where uploaded files will be stored temporarily
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname); // Setting the filename to be the same as the original filename
    }
});

// Creating a multer middleware instance with the configured storage settings
export const upload = multer({
    storage: storage // Setting the storage configuration for multer
});
