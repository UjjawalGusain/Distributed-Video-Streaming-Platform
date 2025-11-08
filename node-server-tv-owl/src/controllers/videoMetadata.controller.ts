import { Request, Response } from 'express';
import { success, failure, ApiResponse } from "../interfaces/Response";
import UserModel from '../models/User';
import VideoMetadataModel from '../models/Metadata';

interface getVideoMetadataResponse {

}

class VideoMetadataController {

    async updatePublishVideo(req: Request, res: Response<ApiResponse<getVideoMetadataResponse>>) {
        try {
            const { videoId, thumbnail } = req.body;

            const updateFields: {isPublished: boolean; thumbnail?: string;} = {
                isPublished: true
            };

            if (thumbnail !== undefined) {
                updateFields.thumbnail = thumbnail;
            }

            const result = await VideoMetadataModel.updateOne(
                { videoId },
                { $set: updateFields }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json(failure(404, "Video metadata not found"));
            }

            return res
                .status(200)
                .json(success(200, { modifiedCount: result.modifiedCount }, "Video metadata marked published successfully"));
        } catch (err) {
            console.error("Error marking video metadata published:", err);
            return res.status(500).json(failure(500, `Error marking video metadata published: ${err}`));
        }
    }

    async getVideoMetadata(req: Request, res: Response<ApiResponse<getVideoMetadataResponse>>) {
        const { videoId } = req.params;

        const existingMetadata = await VideoMetadataModel.findOne({ videoId });
        if (!existingMetadata) {
            return res.status(404).json(failure(404, "Could not find video metadata"));
        }

        const { _id, ...existingMetadataWithoutId } = existingMetadata.toObject();

        const payload = {
            id: _id,
            ...existingMetadataWithoutId,
        }

        return res.status(200).json(success(200, payload, "Get video metadata successful"));
    }


};

export default new VideoMetadataController();