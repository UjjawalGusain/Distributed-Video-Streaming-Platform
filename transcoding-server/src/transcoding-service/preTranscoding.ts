import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import TranscodingService from "./transcoder";

class PreTranscodingService {

    private transcodingService: TranscodingService;

    constructor(private sqsClient: SQSClient, private queueUrl: string) {
        this.transcodingService = new TranscodingService();
    }

    sendMessage = async (videoId: string) => {
        try {
            const params = {
                QueueUrl: this.queueUrl,
                MessageAttributes: {
                    videoId: {
                        DataType: "String",
                        StringValue: videoId,
                    }
                },
                MessageBody: "New video uploaded"
            };
            const data = await this.sqsClient.send(new SendMessageCommand(params));
            console.log("Message sent:", data.MessageId);
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    receiveMessage = async () => {
        try {
            const params = {
                QueueUrl: this.queueUrl,
                MaxNumberOfMessages: 1,
                VisibilityTimeout: 30,
                MessageAttributeNames: ["All"], 
            };
            const response = await this.sqsClient.send(new ReceiveMessageCommand(params));

            if (!response.Messages || response.Messages.length === 0) {
                return;
            }

            if (response.Messages) {
                const message = response.Messages[0];
                console.log("Received message:", message.Body);

                const videoId = message.MessageAttributes?.videoId?.StringValue;
                if(!videoId) {
                    throw new Error("Undefined video id");
                }
                console.log("Video ID:", videoId);

                // here we will process message
                this.processMessage(videoId);

                // here we will delete message
               this.deleteMessage(message.ReceiptHandle!); 

                return response;

            } else {
                console.log("No messages in the queue.");
            }
        } catch (err) {
            console.error("Error receiving message:", err);
        }
    };

    processMessage = async (videoId: string) => {
        try {
            console.log(`Starting processing for videoId: ${videoId}`);
            await this.transcodingService.transcodeVideo(videoId);
            console.log(`Completed processing for videoId: ${videoId}`);
        } catch (error) {
            console.error(`Error processing videoId ${videoId}:`, error);
        }
    };

    deleteMessage = async (receiptHandle: string) => {
        try {
            const params = {
                QueueUrl: this.queueUrl,
                ReceiptHandle: receiptHandle
            };
            await this.sqsClient.send(new DeleteMessageCommand(params));
            console.log("Message deleted from SQS queue");
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };
};

export default PreTranscodingService;