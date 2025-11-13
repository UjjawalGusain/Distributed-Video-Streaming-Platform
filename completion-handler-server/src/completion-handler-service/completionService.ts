import axios from "axios";
import APIS from "../apis";
import { CompletionMessageInterface } from "./completionHandler";

class CompletionService {

    markVideoPublished = async(completionMessageObject: CompletionMessageInterface) => {
        try {
            await axios.patch(APIS.PUBLISH_VIDEO_FORMATS, { videoId: completionMessageObject.videoId, formats: completionMessageObject.formats, masterPlaylistUrl: completionMessageObject.masterPlaylistUrl });

            const payload: { videoId: string; thumbnail?: string } = { videoId: completionMessageObject.videoId };
            if (completionMessageObject.thumbnail) payload.thumbnail = completionMessageObject.thumbnail;

            await axios.patch(APIS.MARK_VIDEO_PUBLISHED, payload);
            return true;
        } catch (error) {
            console.error("Error in marking video published: ", error);
            return false;
        }

    }

};

export default CompletionService;