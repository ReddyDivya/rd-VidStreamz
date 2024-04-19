//import and configure dotenv, as early as possible in your application.
//require('dotenv').config({path: './env'})

//Connect Database
import mongoose from "mongoose";
import {DB_NAME} from "./constants.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

//.env is in the home directory
dotenv.config({
    path: './env'
})


//2nd approach to connect to DB
connectDB()
.then(() => {
    
    app.on("error", (error) => {
        console.log("Error: ", error);
        throw error;
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at the port: ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("Mongo db connection failed!!");
})







/*
-> 1st approach to connect to Database; 2nd approach is in the db/index.js
import express from "express";
const app = express();

(async() => {
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error", (error) => {
        console.log("Error: ", error);
        throw error;
       })

       app.listen(process.env.PORT, () => {
        console.log(`App is listening on port ${process.env.PORT}`)
       })
    }
    catch(error){
        console.error("ERROR: ", error);
        throw error;
    }
})()
*/