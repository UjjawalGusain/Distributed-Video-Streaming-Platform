import { useState, useEffect, useRef } from 'react'
import RelatedRecommendedVideoCard from './RelatedRecommendedVideos/RelatedRecommendedVideoCard'
import axios from 'axios'
import APIS from '@/apis/apis';
import { useSession } from 'next-auth/react';
import { VideoMetadata } from '@/app/home/page';
import Loading from '@/app/loading';

interface RelatedRecommendedVideosProps {
  videoId: string;
}

const RelatedRecommendedVideos = ({ videoId }: RelatedRecommendedVideosProps) => {

  const { data: session } = useSession();
  const limit = 7;

  const [currPage, setCurrPage] = useState(1);
  const [relatedRecommendations, setRelatedRecommendations] = useState<VideoMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      if (loading || !hasMore) return;

      setLoading(true);

      const res = await axios.get(APIS.GET_RELATED_VIDEOS, {
        params: {
          page: currPage,
          limit,
          videoId,
        },
      });

      const newVideos = res.data.data.videos;

      setRelatedRecommendations(prev => {
        const combined = [...prev, ...newVideos];
        const unique = Array.from(new Map(combined.map(v => [v._id, v])).values());
        return unique;
      });

      if (newVideos.length < limit) {
        setHasMore(false);
      }

      setLoading(false);
    };

    fetchVideos();
  }, [currPage, videoId, hasMore]);


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

  return (
    <div className='flex flex-col items-start md:ml-3 gap-4 w-full mt-5'>

      {relatedRecommendations.map((r) => (
        <RelatedRecommendedVideoCard
          key={r.videoId}
          title={r.title}
          duration={r.duration}
          updatedAt={r.updatedAt}
          username={r.poster_details.username}
          videoId={r.videoId}
          views={0}
          avatar={r.poster_details.avatar}
          thumbnail={r.thumbnail}
          shortDescription={r.shortDescription}
        />
      ))}

      <div ref={sentinelRef} className="h-10 w-full" />

      {loading && <Loading />}
    </div>
  )
}

export default RelatedRecommendedVideos;
