import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Routes

// Register route
// `upload` is a middleware which is executed before the `registerUser`
router.route("/register").post(
    // 1. File handling - this is a middleware
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser // 2. Register
);

// Login route
router.route("/login").post(loginUser);

// Secured routes
// We can give as many middlewares as possible
// `verifyJWT` is a middleware which is executed before the `logoutUser`
// The next() in the `verifyJWT` middleware tells to execute the `logoutUser`
router.route("/logout").post(verifyJWT, logoutUser);

// Since all JWT verification and token refreshing logic is handled within the `refreshAccessToken` endpoint,
// there's no need for a separate `verifyJWT` middleware.
router.route("/refresh-token").post(refreshAccessToken);


export default router;
