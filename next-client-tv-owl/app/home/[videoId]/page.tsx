'use client';
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import VideoPlayer from "@/components/VideoPlayer";
import { useRef } from 'react'
import videojs from 'video.js';
import type Player from "video.js/dist/types/player";
import axios from 'axios';
import APIS from '@/apis/apis';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MdOutlineSubscriptions } from "react-icons/md";
import { ButtonGroup } from "@/components/ui/button-group"
import { FcLike, FcDislike } from "react-icons/fc";
import { FaComment, FaShare } from "react-icons/fa";
import { useSession } from 'next-auth/react';

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
    const { videoId } = params as { videoId: string };
    const playerRef = useRef<Player | null>(null);
    const [videoData, setVideoData] = useState<videoDataInterface | null>(null);
    const { data: session } = useSession();
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [userReaction, setUserReaction] = useState<"Like" | "Dislike" | null>(null);

    const handleReaction = async (reaction: "Like" | "Dislike") => {
        if (!session?.user?.id) return;

        await axios.post(APIS.POST_REACTION, {
            targetId: videoId,
            targetType: "Video",
            reactionType: reaction,
            userId: session.user.id,
        });

        if (userReaction === reaction) {
            if (reaction === "Like") setLikes(likes - 1);
            else setDislikes(dislikes - 1);

            setUserReaction(null);
        } else {
            if (reaction === "Like") {
                setLikes(likes + 1);
                if (userReaction === "Dislike") setDislikes(dislikes - 1);
            } else {
                setDislikes(dislikes + 1);
                if (userReaction === "Like") setLikes(likes - 1);
            }

            setUserReaction(reaction);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const videoData = (await axios.get(`${APIS.GET_VIDEO}/${videoId}`)).data;
                const videoMetadata = (await axios.get(`${APIS.GET_VIDEO_METADATA}/${videoId}`)).data;

                if (videoData.success === false) return;

                const likesCount = (await axios.get(APIS.COUNT_REACTION, {
                    params: { targetId: videoId, reactionType: "Like", targetType: "Video" }
                })).data.data.count;

                const dislikesCount = (await axios.get(APIS.COUNT_REACTION, {
                    params: { targetId: videoId, reactionType: "Dislike", targetType: "Video" }
                })).data.data.count;

                const userReactionRes = session?.user?.id
                    ? await axios.get(APIS.USER_REACTION, {
                        params: {
                            targetId: videoId,
                            targetType: "Video",
                            userId: session.user.id
                        }
                    })
                    : null;

                setUserReaction(userReactionRes?.data?.data?.reactionType || null);

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
                };

                setLikes(likesCount);
                setDislikes(dislikesCount);
                setVideoData(videoDataObject);

            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [videoId, session?.user?.id]);

    if (!videoData) return <div>Loading...</div>;

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
    };

    const handlePlayerReady = (player: Player) => {
        playerRef.current = player;
        player.on("waiting", () => console.log("player is waiting"));
        player.on("dispose", () => console.log("player will dispose"));
    };

    return (
        <div className='px-5 flex'>
            <div className='flex flex-col items-start gap-5 w-4/6 '>
                <div className='p-4 w-full rounded-xl border-4'>
                    <VideoPlayer
                        options={videoPlayerOptions}
                        onReady={handlePlayerReady}
                    />
                </div>

                <div className='flex flex-col gap-4 w-full'>
                    <div className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        {videoData.title}
                    </div>

                    <div className='flex gap-3 w-full items-center justify-between'>
                        <div className='flex gap-2 items-center'>
                            <Avatar className="rounded-full size-10 border-2">
                                <AvatarImage src={videoData.avatar} alt={videoData.username} />
                                <AvatarFallback>
                                    {videoData.username.trim().split(/\s+/).map(w => w[0]?.toUpperCase()).join("")}
                                </AvatarFallback>
                            </Avatar>

                            <div className='scroll-m-20 text-lg font-semibold tracking-tight'>
                                {videoData.username}
                            </div>
                        </div>

                        <div className='flex gap-4 items-center'>
                            <Button variant="outline">
                                <MdOutlineSubscriptions /> Subscribe
                            </Button>

                            <ButtonGroup>
                                <Button
                                    variant={userReaction === "Like" ? "default" : "outline"}
                                    onClick={() => handleReaction("Like")}
                                >
                                    <FcLike /> {likes} {likes === 1 ? "Like" : "Likes"}
                                </Button>

                                <Button
                                    variant={userReaction === "Dislike" ? "default" : "outline"}
                                    onClick={() => handleReaction("Dislike")}
                                >
                                    <FcDislike /> {dislikes} {dislikes === 1 ? "Dislike" : "Dislikes"}
                                </Button>
                            </ButtonGroup>

                            <Button variant="outline"><FaComment /> Comment</Button>
                            <Button variant="outline"><FaShare /> Share</Button>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                recommendations
            </div>
        </div>
    );
};

export default page;
