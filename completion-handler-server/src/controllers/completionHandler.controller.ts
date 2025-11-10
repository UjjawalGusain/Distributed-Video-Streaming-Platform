import { Request, Response } from 'express';
import CompletionQueue from '../external/completionQueue';

// export interface CompletionMessageInterface {
//     videoId: string;
//     formats: {
//         resolution: string;
//         url: string;
//     };
//     masterPlaylistUrl: string;
//     thumbnail?: string;
// };


class CompletionHandlerController {
    addToQueue = async (req: Request, res: Response) => {
        try {
            const {videoId, formats, masterPlaylistUrl, thumbnail} = req.body;

            const completionObject: {videoId: string, formats: {resolution: string, url: string}[], masterPlaylistUrl: string, thumbnail?: string} = {
                videoId,
                formats,
                masterPlaylistUrl,
            };

            if(thumbnail) completionObject.thumbnail = thumbnail;

            await CompletionQueue.sendMessage(completionObject);
            console.log(`Video id: ${videoId} completed`);
            res.status(200).json({success: true, message: `Video id: ${videoId} completed`})
        } catch (error) {
            console.error("Error is sending message: ", error);
            res.status(500).json({success: false, message: `Message completion send failure with error: ${error}`})
        }
    }
};

export default new CompletionHandlerController();