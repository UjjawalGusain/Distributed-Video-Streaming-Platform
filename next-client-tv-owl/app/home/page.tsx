'use client';
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import CardPost from '@/components/card-06'
import APIS from '@/apis/apis';

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


const page = () => {

    const limit = 10;
    const [videos, setVideos] = useState<VideoMetadata[]>([]);
    const [currPage, setCurrPage] = useState(1);

    const getVideos = async () => {
        try {
            const newVideos = await axios.get(APIS.GET_FEED, {
                params: { page: currPage, limit }
            })

            console.log("newVideos: ", newVideos.data.data.videos);


            setVideos((prev) => [...prev, ...newVideos.data.data.videos]);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getVideos();
    }, [])

    if (videos.length === 0) return;

    return (
        <div className='flex gap-5 px-10 flex-wrap justify-start pt-10'>
            {
                (videos.length !== 0 && videos.map((video) => {
                    return (<CardPost key={video._id} title={video.title} shortDescription={video.shortDescription} thumbnail={video.thumbnail} views={video.views} duration={video.duration} updatedAt={video.updatedAt} username={video.poster_details.username} avatar={video.poster_details.avatar}/>)
                }))
            }

        </div>
    )
}

export default page