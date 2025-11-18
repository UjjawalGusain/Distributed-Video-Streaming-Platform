'use client';
import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios';
import CardPost from '@/components/card-06'
import APIS from '@/apis/apis';
import Loading from '../loading';

export interface VideoMetadata {
    _id: string;
    videoId: string;
    userId: string;
    title: string;
    shortDescription: string;
    thumbnail: string;
    views: number;
    duration: number;
    isPublished: boolean;
    isUploaded: boolean;
    createdAt: string;
    updatedAt: string;
    poster_details: {
        username: string;
        avatar: string;
        email: string;
    }
}

const Page = () => {

    const limit = 10;

    const [videos, setVideos] = useState<VideoMetadata[]>([]);
    const [currPage, setCurrPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const getVideos = async () => {
        if (loading || !hasMore) return;

        setLoading(true);

        try {
            const res = await axios.get(APIS.GET_FEED, {
                params: { page: currPage, limit }
            });

            const newVideos = res.data.data.videos;

            setVideos(prev => {
                const combined = [...prev, ...newVideos];
                const unique = Array.from(new Map(combined.map(v => [v._id, v])).values());
                return unique;
            });

            if (newVideos.length < limit) {
                setHasMore(false);
            }

        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    };

    useEffect(() => {
        getVideos();
    }, [currPage]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && !loading && hasMore) {
                    setCurrPage(prev => prev + 1);
                }
            },
            {
                root: null,
                rootMargin: "0px 0px 200px 0px",
                threshold: 0.1,
            }
        );

        if (sentinelRef.current) observer.observe(sentinelRef.current);

        return () => observer.disconnect();
    }, [loading, hasMore]);

    if (videos.length === 0) return null;

    return (
        <>
            <div className='flex gap-5 px-10 flex-wrap justify-start pt-10'>
                {videos.map((video) => (
                    <CardPost
                        key={video._id}
                        title={video.title}
                        shortDescription={video.shortDescription}
                        thumbnail={video.thumbnail}
                        views={video.views}
                        duration={video.duration}
                        updatedAt={video.updatedAt}
                        username={video.poster_details.username}
                        avatar={video.poster_details.avatar}
                        videoId={video.videoId}
                    />
                ))}
            </div>

            <div ref={sentinelRef} className="h-10 w-full" />

            {loading && (
                <Loading />
            )}

            {!hasMore && (
                <div className="text-center pb-3 text-gray-500 text-sm">
                    Already finished all the videos!
                </div>
            )}
        </>
    );
};

export default Page;
