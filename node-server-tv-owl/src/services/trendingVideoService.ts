import VideoMetadataModel, { VideoMetadata } from "../models/Metadata"

export interface VideoMetadataWithPoster extends VideoMetadata {
    poster_details: {
        username: string;
        avatar: string;
        email: string;
    }
};

class TrendingVideoService {
    // currently we are just doing it as a demo
    getTrendingVideos = async (limit: number, page: number) => {

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

export default new TrendingVideoService();