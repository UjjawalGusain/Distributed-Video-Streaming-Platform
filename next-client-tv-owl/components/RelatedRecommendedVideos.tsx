import { useState, useEffect } from 'react'
import RelatedRecommendedVideoCard from './RelatedRecommendedVideos/RelatedRecommendedVideoCard'
import axios from 'axios'
import APIS from '@/apis/apis';
import { useSession } from 'next-auth/react';
import { VideoMetadata } from '@/app/home/page';

interface RelatedRecommendedVideosProps {
  videoId: string;
}

const RelatedRecommendedVideos = ({ videoId }: RelatedRecommendedVideosProps) => {

  const { data: session } = useSession();
  const limit = 10;
  const [currPage, setCurrPage] = useState(1);
  const [relatedRecommendations, setRelatedRecommendations] = useState<VideoMetadata[]>([]);

  useEffect(() => {
    console.log("VideoId: ", videoId);
    
    const setVideos = async () => {
      const newVideos = await axios.get(APIS.GET_RELATED_VIDEOS, {
        params: {
          page: currPage,
          limit,
          videoId,
        },
      });

      setRelatedRecommendations(prev => {
        const combined = [...prev, ...newVideos.data.data.videos];
        const unique = Array.from(new Map(combined.map(v => [v._id, v])).values());
        return unique;
      });
    };

    setVideos();
  }, [currPage, videoId]);


  return (
    <div className='flex flex-col items-start md:ml-3 gap-4 w-full mt-5'>
      {
        relatedRecommendations.map((recommendation) => (
          <RelatedRecommendedVideoCard title={recommendation.title} duration={recommendation.duration} updatedAt={recommendation.updatedAt} username={recommendation.poster_details.username} videoId={recommendation.videoId} key={recommendation.videoId} views={0} avatar={recommendation.poster_details.avatar} thumbnail={recommendation.thumbnail} shortDescription={recommendation.shortDescription}/>
        ))
      }

    </div>


  )
}

export default RelatedRecommendedVideos