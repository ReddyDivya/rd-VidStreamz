import {asyncHandler} from "../utils/asyncHandler.js";

//asyncHandler is a Higher Order Function
const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "ok"
    })
})

export {registerUser};