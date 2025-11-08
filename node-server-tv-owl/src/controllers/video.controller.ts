import { Request, Response } from 'express';
import { success, failure, ApiResponse } from "../interfaces/Response";
import { s3 } from "../utils/a3Multipart";
import { S3_BUCKET, AWS_REGION } from '../config';
import UserModel from '../models/User';
import VideoModel from '../models/Video';
import VideoMetadataModel from '../models/Metadata';
import axios from "axios";
import APIS from '../apis';
// import PreTranscodingQueue from '../external/PreTranscodingQueue';

interface startUploadResponse {
    uploadId: string;
};

interface partUploadResponse {
    eTag: string;
};

interface completeUploadResponse {
    fileUrl: string;
};

interface submitVideoForPublishResponse {

}

interface getVideoResponse {

}

class VideoController {

    async addVideoUrl(req: Request, res: Response<ApiResponse<getVideoResponse>>) {
        try {
            const { videoId, formats, masterPlaylistUrl } = req.body;

            const result = await VideoModel.updateOne(
                { _id: videoId },
                { $set: { formats, masterPlaylistUrl } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json(failure(404, "Video not found"));
            }

            return res
                .status(200)
                .json(success(200, { modifiedCount: result.modifiedCount }, "Video format updated successfully"));
        } catch (err) {
            console.error("Error updating video URLs:", err);
            return res.status(500).json(failure(500, "Internal server error"));
        }
    }


    async getVideo(req: Request, res: Response<ApiResponse<getVideoResponse>>) {
        const { videoId } = req.params;

        const existingVideo = await VideoModel.findById(videoId);
        if (!existingVideo) {
            return res.status(404).json(failure(404, "Could not find video"));
        }

        const { _id, ...existingVideoWithoutId } = existingVideo.toObject();

        const payload = {
            id: _id,
            ...existingVideoWithoutId,
        }

        return res.status(200).json(success(200, payload, "Get video successful"));
    }

    async submitVideoForPublish(req: Request, res: Response<ApiResponse<submitVideoForPublishResponse>>) {
        const { userId, title, shortDescription, longDescription, tags, duration, originalVideoUrl } = req.body;

        if (!userId) {
            return res.status(400).json(failure(400, "No user id provided"));
        }

        const existingUser = await UserModel.findById(userId);
        if (!existingUser) {
            return res.status(404).json(failure(404, "Could not find user"));
        }

        if (!title) {
            return res.status(400).json(failure(400, "No title provided for the video"));
        }

        if (!shortDescription) {
            return res.status(400).json(failure(400, "No shortDescription provided for the video"));
        }

        if (!originalVideoUrl) {
            return res.status(400).json(failure(400, "No originalVideoUrl provided for the video"));
        }

        if (!duration) {
            return res.status(400).json(failure(400, "No duration provided for the video"));
        }

        // i should also check if video url is actually in the location we are tryig to find

        const thumbnail: Express.Multer.File | undefined = req.file;
        let thumbnailUrl: string | undefined;

        if (thumbnail) {
            const thumbnailFileName: string | undefined = `${Date.now()}_${thumbnail.originalname}`;
            const fileType = thumbnail.mimetype;
            const fileBuffer = thumbnail.buffer;

            const params = {
                Bucket: S3_BUCKET,
                Key: `thumbnails/${thumbnailFileName}`,
                ContentType: fileType,
                Body: fileBuffer
            };

            try {
                await s3.putObject(params).promise();
                console.log(`File uploaded successfully to S3: ${thumbnailFileName}`);
                thumbnailUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/thumbnails/${thumbnailFileName}`;
            } catch (err) {
                console.error(`Error uploading file to S3: ${err}`);
                return res.status(400).json(failure(400, `Could not upload the thumbnail: ${err}`));
            }
        }

        const payloadVideo = {
            userId,
            ...(longDescription !== undefined && { longDescription }),
            originalVideoUrl,
        }

        const newVideo = await VideoModel.create(payloadVideo);

        if (!newVideo) {
            return res.status(500).json(failure(400, `Could not create the new video`));
        }

        // console.log("newVideo: ", newVideo);


        const payloadMetadata = {
            videoId: newVideo._id,
            userId,
            title,
            duration,
            shortDescription,
            ...(tags !== undefined && { tags }),
            ...(thumbnailUrl !== undefined && { thumbnail: thumbnailUrl }),
            isPublished: false,
            isUploaded: true,
        }

        const newMetadata = await VideoMetadataModel.create(payloadMetadata);

        if (!newMetadata) {
            await VideoModel.deleteOne({ _id: newVideo._id }).catch(() => null);
            return res
                .status(500)
                .json(failure(500, "Could not create video metadata"));
        }

        // console.log("newMetadata: ", newMetadata);

        // now here I have to put it in sqs queue??
        try {
            console.log("video id: ", newVideo._id);
            console.log("api: ", APIS.PRETRANSCODER_QUEUE_SEND)
            const response = await axios.post(APIS.PRETRANSCODER_QUEUE_SEND, { videoId: newVideo._id.toString() });
            console.log("Transcoder response: ", response.data);

        } catch (error) {
            await VideoModel.deleteOne({ _id: newVideo._id }).catch(() => null);
            await VideoMetadataModel.deleteOne({ _id: newMetadata._id }).catch(() => null);
            return res.status(500).json(failure(500, `Could not push the new video too queue: ${error}`));
        }

        return res.status(200).json(success(200, {}, "Video submitted for publish"));
    }

    async startUpload(req: Request, res: Response<ApiResponse<startUploadResponse>>) {

        const { fileName, fileType } = req.body;
        const params = {
            Bucket: S3_BUCKET,
            Key: `original_videos/${fileName}`,
            ContentType: fileType,
        };

        try {
            const upload = await s3.createMultipartUpload(params).promise();

            if (!upload || !upload.UploadId) {
                return res.status(500).json(failure(500, "s3 server did not give upload id"));
            }

            const payload = {
                uploadId: upload.UploadId,
            }
            return res.status(200).json(success(200, payload, "Upload started successfully"));
        } catch (error) {
            return res.status(500).json(failure(500, `Could not start the upload: ${error}`));
        }
    }

    async partUpload(req: Request, res: Response<ApiResponse<partUploadResponse>>) {
        const { fileName, partNumber, uploadId, fileChunk } = req.body;

        const params = {
            Bucket: S3_BUCKET,
            Key: `original_videos/${fileName}`,
            PartNumber: partNumber,
            UploadId: uploadId,
            Body: Buffer.from(fileChunk, "base64"),
        };

        try {
            const uploadParts = await s3.uploadPart(params).promise();

            if (!uploadParts) {
                return res.status(500).json(failure(500, "Did not receive upload part confirmation"));
            }

            if (!uploadParts.ETag) {
                return res.status(500).json(failure(500, "Did not receive ETag for upload part"));
            }

            const payload = {
                eTag: uploadParts.ETag,
            }

            return res.status(200).json(success(200, payload, "Video part upload completed"));
        } catch (error) {
            return res.status(500).json(failure(500, `Part upload failed with error: ${error}`))
        }
    }

    async completeUpload(req: Request, res: Response<ApiResponse<completeUploadResponse>>) {
        const { fileName, uploadId, parts } = req.body;

        const params = {
            Bucket: S3_BUCKET,
            Key: `original_videos/${fileName}`,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: parts,
            },
        };

        try {
            const complete = await s3.completeMultipartUpload(params).promise();

            if (!complete) {
                return res.status(500).json(failure(500, "Did not complete upload confirmation"));
            }

            if (!complete.Location) {
                return res.status(500).json(failure(500, "Did not receive Location for complete upload"));
            }

            const payload = {
                fileUrl: complete.Location,
            }

            return res.status(200).json(success(200, payload, "Video fully uploaded"));
        } catch (error) {
            return res.status(500).json(failure(500, `Video complete upload failed with error: ${error}`))
        }
    }

};

export default new VideoController();