import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

// here void means we dont care what datatype comes inside
async function dbConnect(): Promise<void> {
    if(connection.isConnected) {
        console.log("Already connected to database");
        return;
    }

    try {
        const db = await mongoose.connect(MONGODB_URI || "", {});

        connection.isConnected = db.connections[0].readyState;
        console.log("Db Connected Successfuly");
        
    } catch (error) {
        console.error("Database connection failed", error);
        process.exit(1);
    }
}

export default dbConnect;