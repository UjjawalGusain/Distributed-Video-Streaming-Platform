import APIS from '@/apis/apis';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { ItemMedia } from '../ui/item';

interface CommentInterface {
  _id: string;
  userId: string;
  targetType: string;
  targetId: string;
  updatedAt: string;
  userDetails: {
    email: string;
    _id: string;
    username: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
}

const CommentCollection = ({
  videoId,
  userId,
  refreshTrigger
}: {
  videoId: string;
  userId: string;
  refreshTrigger: number;
}) => {

  const [comments, setComments] = useState<CommentInterface[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const getTimeAgo = (parsedMs: string) => {
    const msAgo = Date.now() - Number(parsedMs);

    const seconds = Math.floor(msAgo / 1000);
    if (seconds < 60) return seconds === 1 ? "1 second" : `${seconds} seconds`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes === 1 ? "1 minute" : `${minutes} minutes`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours === 1 ? "1 hour" : `${hours} hours`;

    const days = Math.floor(hours / 24);
    if (days < 7) return days === 1 ? "1 day" : `${days} days`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return weeks === 1 ? "1 week" : `${weeks} weeks`;

    const months = Math.floor(days / 30);
    if (months < 12) return months === 1 ? "1 month" : `${months} months`;

    const years = Math.floor(months / 12);
    return years === 1 ? "1 year" : `${years} years`;
  };
  // const durationAgo = getTimeAgo(String(Date.parse(updatedAt)));
  const limit = 10;

  // RESET LOGIC — runs when user posts a new comment
  useEffect(() => {
    setComments([]);
    setPage(1);
    setHasMore(true);
  }, [refreshTrigger]);

  // FETCH LOGIC — runs when page changes
  useEffect(() => {
    const getComments = async () => {
      if (loading || !hasMore) return;

      setLoading(true);

      const res = await axios.get(APIS.GET_COMMENTS_ON_VIDEO, {
        params: { videoId, page, limit }
      });

      const newComments = res.data.data.comments;

      setComments(prev => {
        const combined = [...prev, ...newComments];
        return Array.from(new Map(combined.map(v => [v._id, v])).values());
      });

      if (newComments.length < limit) setHasMore(false);

      setLoading(false);
    };

    getComments();
  }, [page, videoId, hasMore]);

  return (
    <div className="flex flex-col gap-5">
      {comments.map(comment => (
        <div key={comment._id} className="flex gap-2">

          {comment.userDetails.avatar && (
            <ItemMedia>
              <Image
                src={comment.userDetails.avatar}
                alt={comment.userDetails.avatar}
                width={8}
                height={8}
                className="h-8 w-8 rounded-full object-cover border bg-secondary"
              />
            </ItemMedia>
          )}

          <div>
            <div
              className={`text-xs font-semibold gap-2 flex ${userId === comment.userDetails._id
                ? "bg-white rounded text-black px-1"
                : ""
                }`}
            >
              @{comment.userDetails.username}  {(<div className='text-muted-foreground'>{`${getTimeAgo(String(Date.parse(comment.updatedAt)))}`} ago</div>)}
            </div>

            <div className="text-sm">{comment.text}</div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default CommentCollection;
