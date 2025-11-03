import express from "express"
import cors from "cors"
import dbConnect from "./db/dbConnect";
import dotenv from "dotenv"
import path  from "path";

dotenv.config({ path: path.resolve(__dirname, '../.env') });


const app = express()
dbConnect();
// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
// }))


app.use(express.static("public"))

export default app;