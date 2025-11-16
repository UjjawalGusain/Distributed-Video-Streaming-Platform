import VideoMetadataModel from "../models/Metadata"
import { VideoMetadataWithPoster } from "./trendingVideoService";
class RecommendationService {
    // currently we are just doing it as a demo
    getRecommendedVideos = async (userId: string, limit: number, page: number) => {
        const videos = (await VideoMetadataModel
            .aggregate([
                {
                    $match: {
                        isPublished: true,
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "poster_details",
                    },
                },
                {
                    $addFields: {
                        poster_details: { $arrayElemAt: ["$poster_details", 0] },
                    },
                },
                {
                    $unset: [
                        "poster_details._id",
                        "poster_details.watchHistory",
                        "poster_details.isPremium",
                    ],
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ])) as VideoMetadataWithPoster[];

        return videos;
    }
    getRecommendedVideosByVideo = async (userId: string, videoId: string, limit: number, page: number) => {
        const videos = (await VideoMetadataModel
            .aggregate([
                {
                    $match: {
                        isPublished: true,
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "poster_details",
                    },
                },
                {
                    $addFields: {
                        poster_details: { $arrayElemAt: ["$poster_details", 0] },
                    },
                },
                {
                    $unset: [
                        "poster_details._id",
                        "poster_details.watchHistory",
                        "poster_details.isPremium",
                    ],
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ])) as VideoMetadataWithPoster[];

        return videos;
    }
};

export default new RecommendationService();