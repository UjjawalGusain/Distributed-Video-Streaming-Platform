import express from "express"
import cors from "cors"
import dbConnect from "./db/dbConnect";


const app = express()
dbConnect();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))


app.use(express.static("public"))

export default app;