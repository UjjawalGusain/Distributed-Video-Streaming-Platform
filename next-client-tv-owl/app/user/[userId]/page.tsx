'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import APIS from '@/apis/apis';
import Loading from '@/app/loading';
import Image from 'next/image';
import { ItemMedia } from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';
import { VideoMetadata } from '@/app/home/page';
import CardPost from '@/components/card-06'

interface UserInterface {
  id: string;
  username: string;
  avatar: string | "";
  isPremium: string;
  email: string;
  subscriberCount: number;
}

export default function Page() {
  const { userId }: { userId: string } = useParams();
  const [user, setUser] = useState<UserInterface | null>(null);
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [currPage, setCurrPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleDelete = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.videoId !== id));
  };

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const res = await axios.get(`${APIS.GET_USER}/${userId}`);
        if (res.data.success) setUser(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    getUserInfo();
  }, [userId]);

  useEffect(() => {
    const getUserVideos = async () => {
      if (loading || !hasMore) return;

      setLoading(true);
      try {
        const res = await axios.get(`${APIS.GET_USER_VIDEOS}/${userId}`, {
          params: { page: currPage, limit }
        });

        const newVideos = res.data.data.videos;

        setVideos(prev => {
          const combined = [...prev, ...newVideos];
          const unique = Array.from(new Map(combined.map(v => [v._id, v])).values());
          return unique;
        });

        if (newVideos.length < limit) setHasMore(false);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    getUserVideos();
  }, [currPage, userId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
          setCurrPage(prev => prev + 1);
        }
      },
      { root: null, rootMargin: "0px 0px 200px 0px", threshold: 0.1 }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  if (!user) return <Loading />;

  return (
    <div className='flex flex-col w-full px-10'>
      <div className='flex gap-3 items-center'>
        {user?.avatar && (
          <ItemMedia>
            <Image
              src={user.avatar}
              className="rounded-full size-44 border-2 border-muted-foreground"
              alt=""
              height={32}
              width={32}
            />
          </ItemMedia>
        )}
        <div>
          <div className='text-4xl uppercase'>{user.username}</div>
          <div className='flex items-center gap-1'>
            <div className='text-sm'>{user.email}</div>
            •
            <div className='text-sm text-muted-foreground'>{user.subscriberCount} subscribers</div>
          </div>
        </div>
      </div>
      <Separator className='my-4' />

      <p className='text-xl'>Your videos</p>
      <div className="px-10 pt-10">
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map(video => (
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
              userId={video.userId}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <div ref={sentinelRef} className="h-10 w-full" />

        {loading && <Loading />}

        {!hasMore && (
          <div className="text-center pb-3 text-gray-500 text-sm">
            Already finished all the videos!
          </div>
        )}
      </div>
    </div>
  );
}
