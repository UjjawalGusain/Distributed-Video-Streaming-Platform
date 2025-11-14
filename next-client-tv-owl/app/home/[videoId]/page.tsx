'use client';
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import VideoPlayer from "@/components/VideoPlayer";
import { useRef } from 'react'
import videojs from 'video.js';
import type Player from "video.js/dist/types/player";
import axios from 'axios';
import APIS from '@/apis/apis';

interface videoDataInterface {
    title: string;
    longDescription?: string;
    shortDescription: string;
    formats: [{ resolution: string; url: string; _id: string; }];
    updatedAt: string;
    username: string;
    avatar?: string;
    email?: string;
    duration: string;
    views: number;
    thumbnail: string;
    url: string;
};

const page = () => {
    const params = useParams();
    const playerRef = useRef<Player | null>(null);
    const [videoData, setVideoData] = useState<videoDataInterface | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const videoData = (await axios.get(`${APIS.GET_VIDEO}/${params.videoId}`)).data;
                const videoMetadata = (await axios.get(`${APIS.GET_VIDEO_METADATA}/${params.videoId}`)).data;

                if (videoData.success === false) {
                    throw new Error("Cannot fetch video data");
                }

                const videoDataObject = {
                    title: videoMetadata.data.title,
                    shortDescription: videoMetadata.data.shortDescription,
                    ...(videoData.data.longDescription?.trim()
                        ? { longDescription: videoData.data.longDescription }
                        : {}),
                    formats: videoData.data.formats,
                    updatedAt: videoData.data.updatedAt,
                    username: videoMetadata.data.userId.username,
                    ...(videoMetadata.data.userId.avatar?.trim()
                        ? { avatar: videoMetadata.data.userId.avatar }
                        : {}),
                    ...(videoMetadata.data.userId.email?.trim()
                        ? { email: videoMetadata.data.userId.email }
                        : {}),
                    duration: videoMetadata.data.duration,
                    views: videoMetadata.data.views,
                    thumbnail: videoMetadata.data.thumbnail,
                    url: videoData.data.masterPlaylistUrl,
                }

                setVideoData(videoDataObject);

            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [params.videoId]);

    if (!videoData) {
        return <div>Loading...</div>;
    }

    const videoPlayerOptions = {
        controls: true,
        responsive: true,
        fluid: true,
        sources: [
            {
                src: videoData.url,
                type: "application/x-mpegURL"
            }
        ]
    }
    const handlePlayerReady = (player: Player) => {
        playerRef.current = player;

        // You can handle player events here, for example:
        player.on("waiting", () => {
            //   videojs.log("player is waiting");
            console.log("player is waiting");

        });

        player.on("dispose", () => {
            //   videojs.log("player will dispose");
            console.log("player will dispose");
        });
    };
    return (
        <>
            <div>
                <h1>Video player</h1>
            </div>
            <VideoPlayer
                options={videoPlayerOptions}
                onReady={handlePlayerReady}
            />
        </>
    )
}

export default page