import { Request, Response } from 'express';
import PreTranscodingQueue from '../external/PreTranscodingQueue';

class TranscoderController {
    addToQueue = async (req: Request, res: Response) => {
        try {
            const {videoId} = req.body;
            await PreTranscodingQueue.sendMessage(videoId);
            console.log(`Message with video id: ${videoId} sent`);
            res.status(200).json({success: true, message: `Message with video id: ${videoId} sent`})
        } catch (error) {
            console.error("Error is sending message: ", error);
            res.status(500).json({success: false, message: `Message send failure with error: ${error}`})
        }
    }
};

export default new TranscoderController();