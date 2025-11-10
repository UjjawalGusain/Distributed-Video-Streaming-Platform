import VideoMetadataModel, {VideoMetadata} from "../models/Metadata"
class RecommendationService {
    // currently we are just doing it as a demo
    getRecommendedVideos = async (userId: string, limit: number, page: number) => {
        const videos = await VideoMetadataModel.find()
            .sort({ createdAt: -1 }) 
            .skip((page - 1) * limit)
            .limit(limit)
            .lean<VideoMetadata[]>();

        return videos;
    }

};

export default new RecommendationService();