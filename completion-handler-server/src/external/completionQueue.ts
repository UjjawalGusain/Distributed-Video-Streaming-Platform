import { SQSClient } from "@aws-sdk/client-sqs";
import { AWS_REGION, AWS_SECRET_KEY, AWS_ACCESS_KEY, SQS_COMPLETION_QUEUE_URL } from "../config"
import CompletionHandlerService from "../completion-handler-service/completionHandler";

const sqsClient = new SQSClient({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
    }
});

const CompletionQueue = new CompletionHandlerService(sqsClient, SQS_COMPLETION_QUEUE_URL);

export async function pollQueue() {
    console.log("Worker started: polling SQS for new messages for completion...");
    while (true) {
        try {
            await CompletionQueue.receiveMessage();
        } catch (err) {
            console.error("Error while polling SQS for completion:", err);
        }
        await new Promise((r) => setTimeout(r, 5000));
    }
}

export default CompletionQueue;