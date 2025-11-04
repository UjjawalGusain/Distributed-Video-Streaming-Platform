import { Request, Response } from 'express';
import { success, failure, ApiResponse } from "../interfaces/Response";
import { s3 } from "../utils/a3Multipart";
import { S3_BUCKET } from '../config';

interface startUploadResponse {
    uploadId: string;
};

interface partUploadResponse {
    eTag: string;
};

interface completeUploadResponse {
    fileUrl: string;
};

class VideoController {
    async startUpload(req: Request, res: Response<ApiResponse<startUploadResponse>>) {

        const { fileName, fileType } = req.body;
        const params = {
            Bucket: S3_BUCKET,
            Key: fileName,
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
            Key: fileName,
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
            Key: fileName,
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