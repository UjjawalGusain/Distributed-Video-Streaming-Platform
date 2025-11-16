import { Request, Response } from 'express';
import { success, failure, ApiResponse } from "../interfaces/Response";
import UserModel from '../models/User';
import VideoMetadataModel from '../models/Metadata';
import recommendationService from '../services/recommendationService';
import trendingVideoService from '../services/trendingVideoService';

interface getVideoMetadataResponse {

}

export interface VideoMetadata {
  _id: string;
  videoId: string;
  userId: string;
  title: string;
  shortDescription: string;
  thumbnail?: string;
  views: number;
  duration: number;
  isPublished: boolean;
  isUploaded: boolean;
  createdAt: string;
  updatedAt: string;
}


class VideoMetadataController {

    async updatePublishVideo(req: Request, res: Response<ApiResponse<getVideoMetadataResponse>>) {
        try {
            const { videoId, thumbnail } = req.body;

            const updateFields: { isPublished: boolean; thumbnail?: string; } = {
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

        const existingMetadata = await VideoMetadataModel.findOne({ videoId })
                                .populate('userId', 'username avatar email');
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

    async getUserFeed(req: Request, res: Response) {
        
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const userWithSession = req.user;
        const userId = userWithSession?.id;

        let videos: any[];
        if(!userWithSession || !userId) {
            videos = await trendingVideoService.getTrendingVideos(limit, page);
        } else {
            videos = await recommendationService.getRecommendedVideos(userId, limit, page);
        }
        const payload = {
            videos,
        }

        return res.status(200).json(success(200, payload, "Get videos metadata successful"));
    }

    async getUserRelatedVideoRecommendation(req: Request, res: Response) {
        
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const videoId = req.query.videoId as string;
        const userWithSession = req.user;
        const userId = userWithSession?.id;

     

        if(!videoId) {
            return res.status(400).json(failure(400, "Video Id is not there"));
        }

        let videos: any[];
        if(!userWithSession || !userId) {
            videos = await trendingVideoService.getTrendingVideosByVideo(videoId, limit, page);
        } else {
            videos = await recommendationService.getRecommendedVideosByVideo(userId, videoId, limit, page);
        }
        const payload = {
            videos,
        }

        return res.status(200).json(success(200, payload, "Get videos metadata successful"));
    }


};

export default new VideoMetadataController();