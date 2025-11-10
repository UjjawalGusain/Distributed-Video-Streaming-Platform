import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_BUCKET } from "../config"
import path from "path";
import { exec } from "child_process";
import util from "util";
import * as fsPromise from 'fs/promises';
import fs from "fs";
import axios from "axios";
import APIS from "../apis";
import { uploadVideoFileToS3, uploadThumbnailToS3 } from "../utils/uploadFileToS3";


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

        if (fs.existsSync(thumbnailPath)) {
            console.log(`Thumbnail already exists at ${thumbnailPath}, skipping generation.`);
            return thumbnailPath;
        }
        const command = `ffmpeg -ss 1 -i "${downloadedVideoPath}" -frames:v 1 -q:v 2 -update 1 "${thumbnailPath}"`;
        console.log("We will be running the command: ", command);

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
            console.log("transcodeToHLS started");


            // video height
            const commandGetHeight = `ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "${normalizedVideoPath}"`;
            const { stdout: heightStr } = await this.execPromise(commandGetHeight);
            const height = parseInt(heightStr.trim(), 10);
            console.log(`Video height detected: ${height}`);

            const formats: { resolution: string; name: string; }[] = [];

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

                    formats.push({
                        resolution: `${r.res}p`,
                        name: `${r.res}p.m3u8`,
                    });
                } else {
                    console.log(`Skipping ${r.res}p — input resolution too low`);
                }
            }

            // master playlist
            const masterPlaylistPath = path.join(normalizedOutputDir, "master.m3u8");
            let masterPlaylistContent = "#EXTM3U\n";

            for (const r of this.allowedRenditions) {
                if (height >= r.res) {
                    const bandwidth = parseInt(r.bitrate) * 1000;
                    masterPlaylistContent += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=1280x${r.res}\n${r.res}p.m3u8\n`;
                }
            }

            fs.writeFileSync(masterPlaylistPath, masterPlaylistContent);
            console.log(`Master playlist created: ${masterPlaylistPath}`);

            const masterPlaylistName = "master.m3u8";

            return {
                videoJustName,
                formats,
                masterPlaylistName,
            };
        } catch (err) {
            console.error("Transcoding failed:", err);
            throw err;
        }
    };

    removeTemporaryFiles = async (
        thumbnailPath?: string,
        transcodedOutputPath?: string
    ) => {
        try {
            if (thumbnailPath && fs.existsSync(thumbnailPath)) {
                await fsPromise.rm(thumbnailPath, { recursive: true, force: true });
                console.log("Thumbnail removed from temp");
            }
        } catch (err) {
            console.error("Failed to remove thumbnail:", err);
        }

        try {
            if (transcodedOutputPath && fs.existsSync(transcodedOutputPath)) {
                await fsPromise.rm(transcodedOutputPath, { recursive: true, force: true });
                console.log("Transcoded output removed from temp");
            }
        } catch (err) {
            console.error("Failed to remove transcoded output:", err);
        }
    };


    transcodeVideo = async (videoId: string) => {

        try {
            console.log("Reached transcode video");

            const videoResponse = await axios.get(`${APIS.GET_VIDEO}/${videoId}`);
            if (!videoResponse || videoResponse.data.success == false) {
                throw new Error("Video not found during transcoding")
            }

            const existingVideo = videoResponse.data.data;

            const videoMetadataResponse = await axios.get(`${APIS.GET_VIDEO_METADATA}/${videoId}`);
            const existingVideoMetadata = videoMetadataResponse.data.data;

            if (!existingVideoMetadata.isUploaded) {
                throw new Error("Video is not uploaded till now");
            }

            if (existingVideoMetadata.isPublished) {
                throw new Error("Video is already published.");
            }

            const originalVideoUrl = existingVideo.originalVideoUrl;
            const downloadedVideoName = await this.downloadVideoFromS3(originalVideoUrl);

            let ffmpegGeneratedThumbnailPath: string | undefined;
            console.log("existingVideoMetadata: ", existingVideoMetadata);

            if (!existingVideoMetadata.thumbnail) {
                ffmpegGeneratedThumbnailPath = await this.generateThumbnail(downloadedVideoName);
                console.log("Maybe the issue was here: ", ffmpegGeneratedThumbnailPath);

                if (!ffmpegGeneratedThumbnailPath) {
                    throw new Error("Cannot generate thumbnail for your video");
                }
            }

            // ffmpeg transcode command
            console.log("We will be going to transcodeToHLS now");

            const { videoJustName, formats, masterPlaylistName } = await this.transcodeToHLS(downloadedVideoName);
            console.log("videoJustName: ", videoJustName);
            console.log("formats: ", formats);
            console.log("masterPlaylistName: ", masterPlaylistName);

            if (formats.length === 0) {
                throw new Error("Video is too low quality. The video should be atleast 480p");
            }
            console.log("Video name: ", videoJustName);


            // aws put transcoded videos in bucket transcoded_videos folder
            const currentVideoTranscodedFolder = path.join(this.transcoderOutputPath, videoJustName);
            const files = await fsPromise.readdir(currentVideoTranscodedFolder);
            await Promise.all(
                files.map(async (file) => {
                    const currentFilePath = path.join(currentVideoTranscodedFolder, file);
                    await uploadVideoFileToS3(existingVideo.userId, videoId, currentFilePath);
                })
            );

            const transcoderFolderUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/transcoded_videos/${existingVideo.userId}/${videoId}`;

            let thumbnailUrl: string | undefined;
            if (!existingVideoMetadata.thumbnail && ffmpegGeneratedThumbnailPath) {
                thumbnailUrl = await uploadThumbnailToS3(ffmpegGeneratedThumbnailPath, videoId);
            }

            const formatsWithUrl = formats.map(f => ({
                resolution: f.resolution,
                url: `${transcoderFolderUrl}/${f.name}`,
            }));

            const masterPlaylistUrl = `${transcoderFolderUrl}/${masterPlaylistName}`;
            const completionObjectPayload: {videoId: string, formats: {resolution: string, url: string}[], masterPlaylistUrl: string, thumbnail?: string} = {
                videoId,
                formats: formatsWithUrl,
                masterPlaylistUrl,
            }
            if(thumbnailUrl) completionObjectPayload.thumbnail = thumbnailUrl;

            await axios.post(APIS.SEND_TO_COMPLETION_QUEUE, completionObjectPayload);

            await this.removeTemporaryFiles(ffmpegGeneratedThumbnailPath, currentVideoTranscodedFolder)

        } catch (error) {
            console.error("Error in transcoding the video: ", error);
            throw new Error(`Error while transcoding the video: ${error}`);
        }
    }
};

export default TranscodingService;