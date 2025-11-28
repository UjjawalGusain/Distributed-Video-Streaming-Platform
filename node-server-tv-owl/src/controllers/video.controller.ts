import { Request, Response } from 'express';
import { success, failure, ApiResponse } from "../interfaces/Response";
import { s3 } from "../utils/a3Multipart";
import { S3_BUCKET, AWS_REGION } from '../config';
import UserModel from '../models/User';
import VideoModel from '../models/Video';
import VideoMetadataModel from '../models/Metadata';
import axios from "axios";
import APIS from '../apis';
import mongoose from 'mongoose';
import { deleteS3File } from '../utils/deleteFileFromS3';
import { deleteS3Folder } from '../utils/deleteFolderFromS3';

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

interface AuthenticatedRequest extends Request {
    user?: any;
}

function extractS3KeyFromUrl(url: string): string | null {
    try {
        const decoded = decodeURIComponent(url);
        const splitIndex = decoded.indexOf(".com/") + 5;
        return decoded.substring(splitIndex);
    } catch {
        return null;
    }
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

    async submitVideoForPublish(req: AuthenticatedRequest, res: Response<ApiResponse<submitVideoForPublishResponse>>) {
        const { title, shortDescription, longDescription, tags, duration, originalVideoUrl } = req.body;

        const userId = req?.user?.id;
        if (!userId) {
            return res.status(401).json(failure(401, "No jwt token provided"));
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

    async startUpload(req: AuthenticatedRequest, res: Response<ApiResponse<startUploadResponse>>) {

        const userId = req?.user?.id;
        if (!userId) {
            return res.status(401).json(failure(401, "No jwt token provided"));
        }
        const existingUser = await UserModel.findById(userId);
        if (!existingUser) {
            return res.status(404).json(failure(404, "Could not find user"));
        }

        const { fileName, fileType } = req.body;
        const timestampedFileName = `${Date.now()}_${fileName}`;
        const params = {
            Bucket: S3_BUCKET,
            Key: `original_videos/${timestampedFileName}`,
            ContentType: fileType,
        };

        try {
            const upload = await s3.createMultipartUpload(params).promise();

            if (!upload || !upload.UploadId) {
                return res.status(500).json(failure(500, "s3 server did not give upload id"));
            }

            const payload = {
                uploadId: upload.UploadId,
                fileName: timestampedFileName,
            }
            return res.status(200).json(success(200, payload, "Upload started successfully"));
        } catch (error) {
            return res.status(500).json(failure(500, `Could not start the upload: ${error}`));
        }
    }

    async partUpload(req: Request, res: Response<ApiResponse<partUploadResponse>>) {
        const { fileName, partNumber, uploadId, fileChunk } = req.body;
        console.log("filename: ", `original_videos/${fileName}`);

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

    async deleteVideo(req: Request, res: Response) {

        async function deleteVideoAssetsFromS3(userId: string, videoId: string, originalUrl?: string) {
            await deleteS3Folder(`transcoded_videos/${userId}/${videoId}/`);
            await deleteS3Folder(`thumbnails/${videoId}/`);

            if (originalUrl) {
                const key = extractS3KeyFromUrl(originalUrl);
                if (key) await deleteS3File(key);
            }
        }

        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            const userId = req.user?.id;
            const { videoId } = req.body;

            if (!userId) {
                await session.abortTransaction();
                return res.status(401).json(failure(401, "No jwt token provided"));
            }

            if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
                await session.abortTransaction();
                return res.status(400).json(failure(400, "Invalid videoId"));
            }

            const user = await UserModel.findById(userId).session(session);
            if (!user) {
                await session.abortTransaction();
                return res.status(404).json(failure(404, "User not found"));
            }

            const video = await VideoModel.findOne({ _id: videoId, userId }).session(session);
            if (!video) {
                await session.abortTransaction();
                return res.status(403).json(failure(403, "Not allowed to delete this video"));
            }

            const originalVideoUrl = video.originalVideoUrl;

            const deleteVideoResult = await VideoModel.deleteOne({ _id: videoId }).session(session);
            if (deleteVideoResult.deletedCount === 0) {
                await session.abortTransaction();
                return res.status(404).json(failure(404, "Video not found"));
            }

            const deleteMeta = await VideoMetadataModel.deleteOne({ videoId }).session(session);
            if (deleteMeta.deletedCount === 0) {
                await session.abortTransaction();
                return res.status(404).json(failure(404, "Video metadata not found"));
            }

            await session.commitTransaction();

            setImmediate(async () => {
                await deleteVideoAssetsFromS3(userId, videoId, originalVideoUrl);
            });

            return res.status(200).json(success(200, "Video deleted successfully"));

        } catch (error) {
            await session.abortTransaction();
            return res.status(500).json(failure(500, `Error deleting video: ${error}`));
        } finally {
            session.endSession();
        }
    }



};

export default new VideoController();