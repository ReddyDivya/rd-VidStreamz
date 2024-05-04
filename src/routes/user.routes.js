import { Router } from "express";
import { registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory } from "../controllers/user.controller.js";
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

router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)
export default router;
