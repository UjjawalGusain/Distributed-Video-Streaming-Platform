'use client';
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import VideoPlayer from "@/components/VideoPlayer";
import { useRef } from 'react'
import type Player from "video.js/dist/types/player";
import axios from 'axios';
import APIS from '@/apis/apis';
import { Button } from '@/components/ui/button';
import { MdOutlineSubscriptions } from "react-icons/md";
import { ButtonGroup } from "@/components/ui/button-group"
import { FcLike, FcDislike } from "react-icons/fc";
import { FaComment, FaShare } from "react-icons/fa";
import { useSession } from 'next-auth/react';
import { HOME_LINK } from '@/clientServerConfig';
import DisabledTooltip from '@/components/DisabledTooltip';
import RelatedRecommendedVideos from '@/components/RelatedRecommendedVideos';
import { toast } from 'sonner';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"


import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Menu } from 'lucide-react';
import Loading from '../../loading';
import Comment from '@/components/Comment';
import { ItemMedia } from '@/components/ui/item';
import Image from 'next/image';

interface videoDataInterface {
    title: string;
    longDescription?: string;
    shortDescription: string;
    formats: [{ resolution: string; url: string; _id: string; }];
    ownerId: string;
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
    const MAX_CHARS_SHORT = 100;
    const MAX_CHARS_LONG = 200;
    const params = useParams();
    const { videoId } = params as { videoId: string };
    const playerRef = useRef<Player | null>(null);
    const [videoData, setVideoData] = useState<videoDataInterface | null>(null);
    const { data: session } = useSession();
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [subscribed, setSubscribed] = useState(false);
    const [userReaction, setUserReaction] = useState<"Like" | "Dislike" | null>(null);
    const [expandedShortDescription, setExpandedShortDescription] = useState(false);
    const [expandedLongDescription, setExpandedLongDescription] = useState(false);

    const router = useRouter();

    const shortDescription = videoData?.shortDescription || "";
    const isShortDescriptionLonger = shortDescription.length > MAX_CHARS_SHORT;
    const visibleShortDescriptionText = expandedShortDescription ? shortDescription : shortDescription.slice(0, MAX_CHARS_SHORT);

    const isLongDescription = videoData?.longDescription != undefined
    const longDescription = videoData?.longDescription || "";
    const isLongDescriptionLonger = longDescription.length > MAX_CHARS_LONG;
    const visibleLongDescriptionText = expandedLongDescription ? longDescription : longDescription.slice(0, MAX_CHARS_LONG);


    const handleReaction = async (reaction: "Like" | "Dislike") => {
        if (!session?.user?.id) return;
        const jwt = session?.user?.jwt;

        await axios.post(APIS.POST_REACTION, {
            targetId: videoId,
            targetType: "Video",
            reactionType: reaction,
        }, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
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

    const handleSubscribed = async () => {
        if (!session?.user?.id) return;
        const jwt = session?.user?.jwt;

        if (!jwt) {
            toast.error("Missing authentication token");
            return;
        }

        await axios.post(APIS.TOGGLE_SUBSCRIPTION, {
            ownerId: videoData?.ownerId,
            subscriptionType: "regular",
        }, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });

        setSubscribed(!subscribed);
    }

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

                const isSubscribed = session?.user?.id ?
                    await axios.get(APIS.IS_SUBSCRIBED, {
                        params: {
                            ownerId: videoData?.data?.userId,
                            subscriberId: session.user.id,
                            subscriptionType: "regular",
                        }
                    }) : null

                const videoDataObject = {
                    ownerId: videoMetadata.data.userId._id,
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

                setSubscribed(isSubscribed?.data?.data?.subscriptionStatus === "subscribed");
                setLikes(likesCount);
                setDislikes(dislikesCount);
                setVideoData(videoDataObject);

            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [videoId, session?.user?.id]);

    if (!videoData) return <Loading />;

    const isUserLoggedIn = Boolean(session?.user?.jwt);

    const videoPlayerOptions = {
        controls: true,
        responsive: true,
        fluid: true,
        sources: [
        {
            src: videoData.url, // master playlist for auto resolution
            type: "application/x-mpegURL",
            label: "Auto"
        },

        ...videoData.formats.map((f) => ({
            src: f.url,
            type: "application/x-mpegURL",
            label: f.resolution
        }))
    ]
    };

    const handlePlayerReady = (player: Player) => {
        console.log(videoData);
        
        playerRef.current = player;
        player.on("waiting", () => console.log("player is waiting"));
        player.on("dispose", () => console.log("player will dispose"));
    };

    return (
        <div className='flex flex-col lg:flex-row w-full overflow-x-hidden'>
            <div className='flex flex-col items-start gap-5 xl:w-4/6 min-w-0 w-full px-4'>
                <div className='p-4 w-full h-auto rounded-xl overflow-hidden'>
                    <VideoPlayer
                        options={videoPlayerOptions}
                        onReady={handlePlayerReady}
                    />
                </div>

                <div className='flex flex-col gap-4 w-full shrink'>
                    <div className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        {videoData.title}
                    </div>

                    <div className='flex gap-1 w-full items-center justify-between'>
                        <div className='flex gap-2 items-center hover:cursor-pointer' onClick={() => { router.push(`/user/${videoData.ownerId}`) }}>

                            {videoData?.avatar && (
                                <ItemMedia>
                                    <Image
                                        src={videoData.avatar}
                                        className="rounded-full size-10 border-2"
                                        alt=""
                                        height={32}
                                        width={32}
                                    />
                                </ItemMedia>
                            )}
                            {!videoData?.avatar && (
                                <ItemMedia>
                                    <Image
                                        src={"/default_avatar"}
                                        className="rounded-full size-10 border-2"
                                        alt=""
                                        height={32}
                                        width={32}
                                    />
                                </ItemMedia>
                            )}

                            <div className='scroll-m-20 text-lg font-semibold tracking-tight text-nowrap'>
                                {videoData.username}
                            </div>
                        </div>

                        <div className="gap-4 items-center flex ">
                            <ButtonGroup className='hidden sm:flex '>
                                <DisabledTooltip disabled={!isUserLoggedIn} label="Sign in to like videos">
                                    <Button
                                        variant={userReaction === "Like" ? "default" : "outline"}
                                        onClick={() => handleReaction("Like")}
                                        disabled={!isUserLoggedIn}
                                    >
                                        <FcLike /> {likes} {likes === 1 ? "Like" : "Likes"}
                                    </Button>
                                </DisabledTooltip>

                                <DisabledTooltip disabled={!isUserLoggedIn} label="Sign in to dislike videos">
                                    <Button
                                        variant={userReaction === "Dislike" ? "default" : "outline"}
                                        onClick={() => handleReaction("Dislike")}
                                        disabled={!isUserLoggedIn}
                                    >
                                        <FcDislike /> {dislikes} {dislikes === 1 ? "Dislike" : "Dislikes"}
                                    </Button>
                                </DisabledTooltip>
                            </ButtonGroup>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="xl:hidden">
                                        <Menu />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end">
                                    <div className="px-2 py-1">
                                        <DisabledTooltip disabled={!isUserLoggedIn} label="Sign in to subscribe">
                                            <Button
                                                variant={subscribed ? "default" : "outline"}
                                                onClick={() => handleSubscribed()}
                                                disabled={!isUserLoggedIn}
                                                className="w-full justify-start p-0"
                                            >
                                                <MdOutlineSubscriptions /> {subscribed ? "Subscribed" : "Subscribe"}
                                            </Button>
                                        </DisabledTooltip>
                                    </div>

                                    <div className="px-2 py-1">
                                        <DisabledTooltip disabled={!isUserLoggedIn} label="Sign in to like videos">
                                            <Button
                                                variant={userReaction === "Like" ? "default" : "outline"}
                                                onClick={() => handleReaction("Like")}
                                                disabled={!isUserLoggedIn}
                                                className="w-full justify-start p-0"
                                            >
                                                <FcLike /> {likes} {likes === 1 ? "Like" : "Likes"}
                                            </Button>
                                        </DisabledTooltip>
                                    </div>

                                    <div className="px-2 py-1">
                                        <DisabledTooltip disabled={!isUserLoggedIn} label="Sign in to dislike videos">
                                            <Button
                                                variant={userReaction === "Dislike" ? "default" : "outline"}
                                                onClick={() => handleReaction("Dislike")}
                                                disabled={!isUserLoggedIn}
                                                className="w-full justify-start p-0"
                                            >
                                                <FcDislike /> {dislikes} {dislikes === 1 ? "Dislike" : "Dislikes"}
                                            </Button>
                                        </DisabledTooltip>
                                    </div>


                                    <div className="px-2 py-1">
                                        <DisabledTooltip disabled={!isUserLoggedIn} label="Sign in to comment">
                                            <Button variant="outline" disabled={!isUserLoggedIn} className="w-full justify-start p-0">
                                                <FaComment /> Comment
                                            </Button>
                                        </DisabledTooltip>
                                    </div>

                                    <div className="px-2 py-1">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start p-0">
                                                    <FaShare /> Share
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Share link</DialogTitle>
                                                    <DialogDescription>
                                                        Anyone who has this link will be able to view this.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex items-center gap-2">
                                                    <div className="grid flex-1 gap-2">
                                                        <Label htmlFor="link" className="sr-only">Link</Label>
                                                        <Input id="link" defaultValue={`${HOME_LINK}/${params.videoId}`} readOnly />
                                                    </div>
                                                </div>
                                                <DialogFooter className="sm:justify-start">
                                                    <DialogClose asChild>
                                                        <Button type="button" variant="secondary">Close</Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>


                            <div className="gap-4 items-center hidden xl:flex">
                                <DisabledTooltip disabled={!isUserLoggedIn} label="Sign in to subscribe">
                                    <Button
                                        variant={subscribed ? "default" : "outline"}
                                        onClick={() => handleSubscribed()}
                                        disabled={!isUserLoggedIn}
                                    >
                                        <MdOutlineSubscriptions /> {subscribed ? "Subscribed" : "Subscribe"}
                                    </Button>
                                </DisabledTooltip>

                                <DisabledTooltip disabled={!isUserLoggedIn} label="Sign in to comment">
                                    <Button variant="outline" disabled={!isUserLoggedIn}>
                                        <FaComment /> Comment
                                    </Button>
                                </DisabledTooltip>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline"><FaShare /> Share</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Share link</DialogTitle>
                                            <DialogDescription>Anyone who has this link will be able to view this.</DialogDescription>
                                        </DialogHeader>
                                        <div className="flex items-center gap-2">
                                            <div className="grid flex-1 gap-2">
                                                <Label htmlFor="link" className="sr-only">Link</Label>
                                                <Input id="link" defaultValue={`${HOME_LINK}/${params.videoId}`} readOnly />
                                            </div>
                                        </div>
                                        <DialogFooter className="sm:justify-start">
                                            <DialogClose asChild>
                                                <Button type="button" variant="secondary">Close</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="w-full rounded-xl bg-muted p-2 text-accent-foreground text-sm leading-relaxed shadow-sm border border-border">

                    <p className="whitespace-pre-line">
                        {visibleShortDescriptionText}{!expandedShortDescription && isShortDescriptionLonger ? "..." : ""}
                    </p>

                    {isShortDescriptionLonger && (
                        <button
                            onClick={() => setExpandedShortDescription(!expandedShortDescription)}
                            className="mt-2 text-primary font-medium hover:underline"
                        >
                            {expandedShortDescription ? "Show less" : "Show more"}
                        </button>
                    )}
                </div>

                {isLongDescription && <div className="w-full rounded-xl bg-muted p-2 text-accent-foreground text-sm leading-relaxed shadow-sm border border-border">

                    <p className="whitespace-pre-line">
                        {visibleLongDescriptionText}{!expandedLongDescription && isLongDescriptionLonger ? "..." : ""}
                    </p>

                    {isLongDescriptionLonger && (
                        <button
                            onClick={() => setExpandedLongDescription(!expandedLongDescription)}
                            className="mt-2 text-primary font-medium hover:underline"
                        >
                            {expandedLongDescription ? "Show less" : "Show more"}
                        </button>
                    )}
                </div>}

                <div className='w-full'>
                    <Comment videoId={videoId} userId={videoData.ownerId} />
                </div>

            </div>

            <div className='lg:w-2/6 flex flex-col items-center min-w-0'>
                <h1 className='text-xl underline text-center mt-3 truncate min-w-0'>Recommended Videos</h1>

                <RelatedRecommendedVideos videoId={videoId} />
            </div>
        </div>
    );
};

export default page;
