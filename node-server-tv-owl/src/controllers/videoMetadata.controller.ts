import { Request, Response } from 'express';
import { success, failure, ApiResponse } from "../interfaces/Response";
import UserModel from '../models/User';
import VideoMetadataModel from '../models/Metadata';

interface getVideoMetadataResponse{

}

class VideoMetadataController {
    async getVideoMetadata(req: Request, res: Response<ApiResponse<getVideoMetadataResponse>>) {
        const {videoId} = req.body;

        const existingMetadata = await VideoMetadataModel.findOne({videoId});
        if(!existingMetadata) {
            return res.status(404).json(failure(404, "Could not find video metadata"));
        }

        const {_id, ...existingMetadataWithoutId} = existingMetadata.toObject();

        const payload = {
            id: _id,
            ...existingMetadataWithoutId,
        }

        return res.status(200).json(success(200, payload, "Get video metadata successful"));
    }
};

export default new VideoMetadataController();