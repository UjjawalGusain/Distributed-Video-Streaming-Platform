import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";
import { S3_BUCKET, AWS_REGION } from "../config";
import s3Client from "./awsClient";

async function uploadVideoFileToS3(userId: string, videoId: string, filePath: string) {
    try {
        const fileStream = fs.createReadStream(filePath);
        fileStream.on("error", (err) => {
            throw new Error(`File read error: ${err.message}`);
        });

        const fileName = path.basename(filePath);
        const contentType = mime.lookup(fileName) || "application/octet-stream";

        const params = {
            Bucket: S3_BUCKET,
            Key: `transcoded_videos/${userId}/${videoId}/${fileName}`,
            Body: fileStream,
            ContentType: contentType,
        };

        await s3Client.send(new PutObjectCommand(params));
        console.log(`Uploaded: transcoded_videos/${userId}/${videoId}/${fileName}`);
    } catch (err) {
        console.error("Error uploading video file to S3:", err);
        throw new Error(`Error uploading video file to S3: ${err}`);
    }
}

async function uploadThumbnailToS3(thumbnailPath: string, videoId: string) {
    try {
        const fileStream = fs.createReadStream(thumbnailPath);
        fileStream.on("error", (err) => {
            throw new Error(`File read error: ${err.message}`);
        });

        const fileName = path.basename(thumbnailPath);
        const contentType = mime.lookup(fileName) || "image/jpeg";

        const params = {
            Bucket: S3_BUCKET,
            Key: `thumbnails/${videoId}/${fileName}`,
            Body: fileStream,
            ContentType: contentType,
        };

        await s3Client.send(new PutObjectCommand(params));
        console.log(`Thumbnail uploaded: thumbnails/${videoId}/${fileName}`);

        return `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/thumbnails/${videoId}/${fileName}`;
    } catch (err) {
        console.error("Error uploading thumbnail to S3:", err);
        throw new Error(`Error uploading thumbnail to S3: ${err}`);
    }
}

export { uploadVideoFileToS3, uploadThumbnailToS3 };
