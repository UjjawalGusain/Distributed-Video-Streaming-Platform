import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY } from "../config"
import path from "path";
import { exec } from "child_process";
import util from "util";
import fs from "fs";
import axios from "axios";
import APIS from "../apis";

interface Resolution {
    res: number;
    bitrate: string;
    audioBitrate: string;
};

class TranscodingService {

    private s3Client: S3Client;
    private transcoderInputPath: string;
    private transcoderThumbnailPath: string;
    private transcoderOutputPath: string;
    private allowedRenditions: Resolution[];
    private execPromise: (command: string) => Promise<{ stdout: string; stderr: string }>;

    constructor() {
        this.transcoderInputPath = path.join(process.cwd(), "temp", "uploads", "input");
        this.transcoderOutputPath = path.join(process.cwd(), "temp", "transcodedOutputs");
        this.transcoderThumbnailPath = path.join(process.cwd(), "temp", "thumbnails");
        this.execPromise = util.promisify(exec);
        this.allowedRenditions = [
            { res: 1080, bitrate: "5000k", audioBitrate: "128k" },
            { res: 720, bitrate: "2800k", audioBitrate: "128k" },
            { res: 480, bitrate: "1400k", audioBitrate: "96k" },
        ];
        this.s3Client = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY!,
                secretAccessKey: AWS_SECRET_KEY!,
            },
        });
    }

    downloadVideoFromS3 = async (s3Url: string) => {
        const match = s3Url.match(/https:\/\/([^.]*)\.s3\.[^.]*\.amazonaws\.com\/(.*)/);
        if (!match) throw new Error("Invalid S3 URL format");
        const [, bucket, rawKey] = match;
        const key = decodeURIComponent(rawKey.replace(/\+/g, ' '));

        console.log("Bucket: ", bucket);
        console.log("Key: ", key);

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        const response = await this.s3Client.send(command);
        if (!response.Body) throw new Error("No response body from S3");

        const fileName = path.basename(key);
        const filePath = path.join(this.transcoderInputPath, fileName);

        fs.mkdirSync(this.transcoderInputPath, { recursive: true });

        await pipeline(response.Body as NodeJS.ReadableStream, createWriteStream(filePath));

        console.log(`Video downloaded to ${this.transcoderInputPath} with the name ${fileName}`);
        return fileName;
    }

    generateThumbnail = async (downloadedVideoFileName: string) => {
        const downloadedVideoPath = path.join(this.transcoderInputPath, downloadedVideoFileName);
        const thumbnailName = path.parse(downloadedVideoFileName).name + ".jpg";
        const thumbnailPath = path.join(this.transcoderThumbnailPath, thumbnailName);
        fs.mkdirSync(this.transcoderThumbnailPath, { recursive: true });
        const command = `ffmpeg -ss 1 -i "${downloadedVideoPath}" -frames:v 1 -q:v 2 -update 1 "${thumbnailPath}"`;

        try {
            await this.execPromise(command);
            console.log(`Thumbnail generated at ${thumbnailPath} with name ${thumbnailName}`);
            return thumbnailPath;
        } catch (err) {
            console.error("Error generating thumbnail:", err);
            throw err;
        }
    }

    transcodeToHLS = async (videoFileName: string) => {
        const videoPath = path.join(this.transcoderInputPath, videoFileName);
        const videoJustName = path.parse(videoFileName).name;
        const transcodedVideoPath = path.join(this.transcoderOutputPath, videoJustName);
        const normalizedVideoPath = path.normalize(videoPath);
        const normalizedOutputDir = path.normalize(transcodedVideoPath);

        try {
            fs.mkdirSync(normalizedOutputDir, { recursive: true });

            const commandGetHeight = `ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "${normalizedVideoPath}"`;

            const { stdout: heightStr } = await this.execPromise(
                commandGetHeight
            );
            const height = parseInt(heightStr.trim(), 10);
            console.log(`Video height detected: ${height}`);


            for (const r of this.allowedRenditions) {
                if (height >= r.res) {
                    const outputM3U8 = path.join(normalizedOutputDir, `${r.res}p.m3u8`);
                    const segmentPattern = path.join(normalizedOutputDir, `${r.res}p_segment%03d.ts`);

                    const commandCreateSegmentsForResolution = [
                        `ffmpeg -i "${normalizedVideoPath}"`,
                        `-vf "scale=-2:${r.res}"`,
                        `-c:v libx264 -preset veryfast -crf 24`,
                        `-b:v ${r.bitrate}`,
                        `-c:a aac -b:a ${r.audioBitrate}`,
                        `-hls_time 10 -hls_playlist_type vod`,
                        `-hls_segment_filename "${segmentPattern}"`,
                        `"${outputM3U8}"`,
                    ].join(" ");

                    console.log(`\nStarting ${r.res}p transcoding...`);
                    await this.execPromise(commandCreateSegmentsForResolution);
                    console.log(`Generated: ${outputM3U8}`);
                } else {
                    console.log(`Skipping ${r.res}p — input resolution too low`);
                }
            }
        } catch (err) {
            console.error("Transcoding failed:", err);
        }
        return videoJustName;
    };

    transcodeVideo = async (videoId: string) => {

        try {

            const videoResponse = await axios.post(APIS.GET_VIDEO, { videoId });
            if(!videoResponse || videoResponse.data.success == false) {
                throw new Error("Video not found during transcoding")
            }
            console.log("We have a video response: ", videoResponse);
            
            const existingVideo = videoResponse.data.data;

            const videoMetadataResponse = await axios.post(APIS.GET_VIDEO_METADATA, { videoId });
            const existingVideoMetadata = videoMetadataResponse.data.data;

            console.log("Existing video: ", existingVideo);
            
            console.log("Existing video metadata: ", existingVideoMetadata);

            if (!existingVideoMetadata.isUploaded) {
                throw new Error("Video is not uploaded till now");
            }

            if (existingVideoMetadata.isPublished) {
                throw new Error("Video is already published.");
            }

            const originalVideoUrl = existingVideo.originalVideoUrl;
            const downloadedVideoName = await this.downloadVideoFromS3(originalVideoUrl);

            let ffmpegGeneratedThumbnailPath: string | undefined;
            if (!existingVideoMetadata.thumbnail) {
                ffmpegGeneratedThumbnailPath = await this.generateThumbnail(downloadedVideoName);
                if (!ffmpegGeneratedThumbnailPath) {
                    throw new Error("Cannot generate thumbnail for your video");
                }
            }

            // ffmpeg transcode command
            const videoName = this.transcodeToHLS(downloadedVideoName);
            console.log("Video name: ", videoName);


            // aws put transcoded videos in bucket transcoded_videos folder

            // aws put generate thumbnail in bucket thumbnails fodler

            // update thumbnail in videoMetadat

            // update the whole video

        } catch (error) {
            console.error("Error in transcoding the video: ", error);
        }


    }

};

export default TranscodingService;