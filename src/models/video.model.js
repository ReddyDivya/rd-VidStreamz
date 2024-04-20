import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Define the schema for Video data
const videoSchema = new Schema({
    // URL of the video file stored in Cloudinary
    videoFile: {
        type: String,
        required: true,
    },
    // URL of the video thumbnail stored in Cloudinary
    thumbnail: {
        type: String,
        required: true,
    },
    // Title of the video
    title: {
        type: String,
        required: true,
    },
    // Description of the video
    description: {
        type: String,
        required: true,
    },
    // Duration of the video in seconds
    duration: {
        type: Number,
        required: true,
    },
    // Number of views for the video
    views: {
        type: Number,
        default: 0,
    },
    // Flag indicating if the video is published
    isPublished: {
        type: Boolean,
        default: true,
    },
    // Reference to the owner user of the video
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, {timestamps: true});

// Create and export the video model based on the schema
export const Video = mongoose.model("Video", videoSchema);
