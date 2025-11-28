import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import s3Client from "./s3Client";
import { S3_BUCKET } from "../config";

export async function deleteS3Folder(prefix: string) {
    try {
        const listParams = {
            Bucket: S3_BUCKET,
            Prefix: prefix,
        };

        const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            return;
        }

        const deleteParams = {
            Bucket: S3_BUCKET,
            Delete: {
                Objects: listedObjects.Contents.map((obj) => ({ Key: obj.Key! })),
            },
        };

        await s3Client.send(new DeleteObjectsCommand(deleteParams));

        console.log(`Deleted all objects under prefix: ${prefix}`);
    } catch (err) {
        console.error("Error deleting folder from S3:", err);
        throw new Error(`Error deleting folder: ${err}`);
    }
}