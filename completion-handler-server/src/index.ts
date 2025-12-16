import express from "express";
import { pollQueue } from "./external/completionQueue"
import cors from "cors";
import { PORT as CONFIG_PORT } from "./config";
import CompletionHandlerRouter from "./routes/completionHandler.route"

const app = express();

app.use(cors({ origin: "http://localhost:5001" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));


app.use('/api/completion-handler', CompletionHandlerRouter);

const PORT = Number(process.env.PORT) || Number(CONFIG_PORT);

app.listen(PORT, "0.0.0.0", () => { 
    pollQueue().catch((err) => console.error("Error polling SQS:", err));
});


