import APIS from '@/apis/apis';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react'

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
};

const CommentCollection = ({ videoId }: { videoId: string }) => {

  const [comments, setComments] = useState<CommentInterface[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const limit = 10;

  useEffect(() => {

    const getVideos = async () => {
      if (loading || !hasMore) return;

      setLoading(true);

      const res = await axios.get(APIS.GET_COMMENTS_ON_VIDEO, {
        params: {
          videoId,
          page,
          limit,
        }
      })

      const newComments = res.data.data.comments;

      setComments(prev => {
        const combined = [...prev, ...newComments];
        const unique = Array.from(new Map(combined.map(v => [v._id, v])).values());
        return unique;
      });

      if (newComments.length < limit) {
        setHasMore(false);
      }

      setLoading(false);
    }

    getVideos();
  }, [page, videoId, hasMore])

  return (
    <div className="flex flex-col">
  {comments.map((comment) => (
    <div key={comment._id}>{comment.text}</div>
  ))}
</div>

  )
}

export default CommentCollection