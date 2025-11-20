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
              className={`text-xs font-semibold ${
                userId === comment.userDetails._id
                  ? "bg-white rounded text-black px-1"
                  : ""
              }`}
            >
              @{comment.userDetails.username}
            </div>

            <div className="text-sm">{comment.text}</div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default CommentCollection;
