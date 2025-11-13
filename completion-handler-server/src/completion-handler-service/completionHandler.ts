import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import CompletionService from "./completionService";
import knockClient from "../external/knock";


export interface CompletionMessageInterface {
    videoId: string;
    formats: {
        resolution: string;
        url: string;
    }[];
    masterPlaylistUrl: string;
    thumbnail?: string;
    video_title: string;
    user_name: string;
    userId: string;
};

class CompletionHandlerService {

    private completionService: CompletionService;

    constructor(private sqsClient: SQSClient, private queueUrl: string) {
        this.completionService = new CompletionService();
    }

    sendMessage = async (completionObject: CompletionMessageInterface) => {
        try {
            const params = {
                QueueUrl: this.queueUrl,
                MessageAttributes: {
                    videoId: {
                        DataType: "String",
                        StringValue: completionObject.videoId,
                    },
                    formats: {
                        DataType: "String",
                        StringValue: JSON.stringify(completionObject.formats),
                    },
                    masterPlaylistUrl: {
                        DataType: "String",
                        StringValue: completionObject.masterPlaylistUrl,
                    },
                    userId: {
                        DataType: "String",
                        StringValue: completionObject.userId,
                    },
                    user_name: {
                        DataType: "String",
                        StringValue: completionObject.user_name,
                    },
                    video_title: {
                        DataType: "String",
                        StringValue: completionObject.video_title,
                    },
                    ...(completionObject.thumbnail && {
                        thumbnail: {
                            DataType: "String",
                            StringValue: completionObject.thumbnail,
                        },
                    }),
                },
                MessageBody: "New video published"
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
                console.log("No messages available in the queue.");
                return;
            }

            if (response.Messages) {
                const message = response.Messages[0];
                console.log("Received message:", message.Body);

                const attrs = message.MessageAttributes;
                if (!attrs) throw new Error("Undefined message attributes in completion handler");

                if (!attrs.formats?.StringValue || !attrs.videoId?.StringValue || !attrs.masterPlaylistUrl?.StringValue
                    || !attrs.userId?.StringValue || !attrs.user_name.StringValue || !attrs.video_title.StringValue
                ) {
                    throw new Error("Missing required message attributes");
                }

                const completionObject: CompletionMessageInterface = {
                    videoId: attrs.videoId.StringValue,
                    formats: JSON.parse(attrs.formats.StringValue),
                    masterPlaylistUrl: attrs.masterPlaylistUrl.StringValue,
                    thumbnail: attrs.thumbnail?.StringValue,
                    userId: attrs.userId.StringValue,
                    user_name: attrs.user_name.StringValue,
                    video_title: attrs.video_title.StringValue,
                };

                console.log("Completion Object:", completionObject);

                await this.processMessage(completionObject);
                await this.deleteMessage(message.ReceiptHandle!);
            } else {
                console.log("No messages in the queue.");
            }
        } catch (err) {
            console.error("Error receiving message:", err);
        }
    };

    processMessage = async (completionObject: CompletionMessageInterface) => {
        try {
            console.log(`Starting marking video published for videoId: ${completionObject.videoId}`);

            const isSuccess = await this.completionService.markVideoPublished(completionObject);

            const basePayload = {
                user_name: completionObject.user_name,
                video_title: completionObject.video_title,
                current_year: new Date().getFullYear(),
            };

            const payload = isSuccess
                ? {
                    ...basePayload,
                    success: true,
                    video_url: "https://demo_video_url.com",
                    upload_date: new Date().toISOString(),
                }
                : {
                    ...basePayload,
                    success: false,
                    reupload_url: "https://demo_video_reupload_url.com",
                    failed_date: new Date().toISOString(),
                };

            const response = await knockClient.workflows.trigger("video-published", {
                recipients: [completionObject.userId],
                data: payload,
            });

            console.log(
                `Completed ${isSuccess ? "successful" : "failed"} publishing for videoId: ${completionObject.videoId}`
            );

            return response;
        } catch (error) {
            console.error(`Error processing videoId ${completionObject.videoId}:`, error);
            throw error;
        }
    };


    deleteMessage = async (receiptHandle: string) => {
        try {
            const params = {
                QueueUrl: this.queueUrl,
                ReceiptHandle: receiptHandle
            };
            await this.sqsClient.send(new DeleteMessageCommand(params));
            console.log("Message deleted from SQS completion queue");
        } catch (error) {
            console.error("Error deleting message in completion queue:", error);
        }
    };
};

export default CompletionHandlerService;