import VideoMetadataModel, {VideoMetadata} from "../models/Metadata"
class TrendingVideoService {
    // currently we are just doing it as a demo
    getTrendingVideos = async (limit: number, page: number) => {

        console.log("Limit: ", limit);
        

        const videos = await VideoMetadataModel.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean<VideoMetadata[]>();

        return videos;
    }

};

export default new TrendingVideoService();