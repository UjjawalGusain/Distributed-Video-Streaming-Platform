import { SQSClient } from "@aws-sdk/client-sqs";
import { AWS_REGION, AWS_SECRET_KEY, AWS_ACCESS_KEY, SQS_QUEUE_URL } from "../config";
import PreTranscodingService from "../services/preTranscoding";

const sqsClient = new SQSClient({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
    }
});

const PreTranscodingQueue = new PreTranscodingService(sqsClient, SQS_QUEUE_URL);

export async function pollQueue() {
    console.log("Worker started: polling SQS for new messages...");
    while (true) {
        try {
            await PreTranscodingQueue.receiveMessage();
        } catch (err) {
            console.error("Error while polling SQS:", err);
        }
        await new Promise((r) => setTimeout(r, 5000));
    }
}

export default PreTranscodingQueue;