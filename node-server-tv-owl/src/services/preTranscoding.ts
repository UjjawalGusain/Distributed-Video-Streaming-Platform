import { SQSClient, SendMessageCommand, ReceiveMessageCommand } from "@aws-sdk/client-sqs";

class PreTranscodingService {
    constructor(private sqsClient: SQSClient, private queueUrl: string) { }

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
            };
            const response = await this.sqsClient.send(new ReceiveMessageCommand(params));

            if (!response.Messages || response.Messages.length === 0) {
                console.log("No messages available in the queue.");
                return;
            }

            if (response.Messages) {
                const message = response.Messages[0];
                console.log("Received message:", message.Body);

                const videoId = message.MessageAttributes?.videoId?.StringValue ?? "unknown";
                console.log("Video ID:", videoId);

                // here we will process message
                this.processMessage(videoId);

                // here we will delete message
               this.deleteMessage(); 

                return response;

            } else {
                console.log("No messages in the queue.");
            }
        } catch (err) {
            console.error("Error receiving message:", err);
        }
    };

    processMessage = async (videoId: string) => {

        const delay = Math.random() * 10000;
        setTimeout(() => {
            console.log(`We now have a delay of ${delay/1000} secs for videoId: ${videoId}`);
        }, delay);
    }

    deleteMessage = async () => {

        const delay = Math.random() * 10000;
        setTimeout(() => {
            console.log(`We will now delete with delay ${delay/1000} secs}`);
        }, delay);
    }
};

export default PreTranscodingService;