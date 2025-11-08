import express from "express";
import { pollQueue } from "./external/PreTranscodingQueue";
import cors from "cors";
import TranscoderRouter from "./routes/transcoder.route";
import { PORT } from "./config";

const app = express();

app.use(cors({ origin: "http://localhost:5000" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/transcoder', TranscoderRouter);

app.listen(PORT, () => {
    pollQueue().catch((err) => console.error("Error polling SQS:", err));
});

