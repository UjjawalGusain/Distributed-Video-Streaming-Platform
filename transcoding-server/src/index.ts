import express from "express";
import { pollQueue } from "./external/PreTranscodingQueue";
import cors from "cors";
import TranscoderRouter from "./routes/transcoder.route";
import { PORT as CONFIG_PORT } from "./config";

const app = express();

app.use(cors({ origin: "http://localhost:5000" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/transcoder', TranscoderRouter);

const PORT = Number(process.env.PORT) || Number(CONFIG_PORT);

app.listen(PORT, "0.0.0.0", () => { 
    pollQueue().catch((err) => console.error("Error polling SQS:", err));
});

