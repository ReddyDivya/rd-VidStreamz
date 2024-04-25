import {Router} from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//routes

//register route
//`upload` is a middleware which is executed before the `registerUser`
router.route("/register").post(
    //1. file handling - this is a middleware
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
    registerUser, //2. register
);

//login route
router.route("/login").post(loginUser);

//secured routes
//we can give as many middlewares as possible
//`verifyJWT` is a middleware which is executed before the `logoutUser`
//the next() in the `verifyJWT` middleware tells to execute the `logoutUser`
router.route("/logout").post(verifyJWT, logoutUser);

export default router;