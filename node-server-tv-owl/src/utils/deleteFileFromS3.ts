import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./s3Client";
import { S3_BUCKET } from "../config";

export async function deleteS3File(key: string) {
    try {
        const params = {
            Bucket: S3_BUCKET,
            Key: key,
        };

        await s3Client.send(new DeleteObjectCommand(params));
        console.log(`Deleted S3 object: ${key}`);
    } catch (err) {
        console.error("Error deleting S3 file:", err);
        throw new Error(`Error deleting S3 file: ${err}`);
    }
}