import express from "express";
import { pollQueue } from "./external/completionQueue"
import cors from "cors";
import { PORT } from "./config";

const app = express();

app.use(cors({ origin: "http://localhost:5001" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
    pollQueue().catch((err) => console.error("Error polling SQS:", err));
});

