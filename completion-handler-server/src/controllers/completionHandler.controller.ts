import { Request, Response } from 'express';
import CompletionQueue from '../external/completionQueue';
import { CompletionMessageInterface } from '../completion-handler-service/completionHandler';

class CompletionHandlerController {
    addToQueue = async (req: Request, res: Response) => {
        try {
            const {videoId, formats, masterPlaylistUrl, thumbnail, video_title, user_name, userId} = req.body;

            const completionObject: CompletionMessageInterface = {
                videoId,
                formats,
                masterPlaylistUrl,
                video_title,
                user_name,
                userId,
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