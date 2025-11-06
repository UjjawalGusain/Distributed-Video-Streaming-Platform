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
export default PreTranscodingQueue;