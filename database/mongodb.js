import mongoose from "mongoose";
import { DB_URI } from "../config/env.js";

if(!DB_URI){
    throw new Error('no database uri');
}

const connectToDatabase = async () => {

    try {
        await mongoose.connect(DB_URI);
        console.log("Succesfully connected to database!")
    } catch(error) {
        console.error("Error connecting to data base", error);
        process.exit(1);
    }
}

export default connectToDatabase;
