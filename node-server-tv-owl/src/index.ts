import express from "express"
import cors from "cors"
import dbConnect from "./db/dbConnect";
import { pollQueue } from "./external/sqsClient";

import authRouter from "./routes/auth.route"
import videoRouter from "./routes/video.route"

const app = express()
dbConnect();
// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
// }))
app.use(cors({ origin: "http://localhost:3000" }));

app.use(express.static("public"))
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/video', videoRouter);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  pollQueue().catch((err) => console.error("Error polling SQS:", err));
});