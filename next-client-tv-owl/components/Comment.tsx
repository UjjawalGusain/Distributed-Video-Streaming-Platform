import React, { useState } from 'react'
import axios from 'axios'
import APIS from '@/apis/apis'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { ArrowBigRightDash } from 'lucide-react'
import { ItemMedia } from './ui/item'
import Image from 'next/image'
import CommentCollection from './Comment/CommentCollection'

const Comment = ({ videoId, userId }: { videoId: string; userId: string }) => {
    const { data: session } = useSession();
    const [text, setText] = useState("");
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    const refreshComments = () => setRefreshTrigger(prev => prev + 1);

    const submitComment = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const jwt = session?.user?.jwt;
        if (!jwt) {
            toast.error("Login first to comment");
            return;
        }

        try {
            await axios.post(
                APIS.CREATE_COMMENT,
                { text: trimmed, targetType: "Video", targetId: videoId },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );

            setText("");
            refreshComments();
            toast.success("Comment added");
        } catch {
            toast.error("Failed to comment");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitComment();
        }
    };

    return (
        <div className="w-full flex flex-col gap-3">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submitComment();
                }}
                className="flex w-full gap-3 items-center"
            >
                {session?.user?.avatar && (
                    <ItemMedia>
                        <Image
                            src={session.user.avatar}
                            className="h-9 w-9 rounded-full bg-secondary object-contain border"
                            alt=""
                            height={32}
                            width={32}
                        />
                    </ItemMedia>
                )}

                <input
                    type="text"
                    id="comment"
                    className="w-full border-b-2 text-sm focus:outline-0"
                    placeholder="Write a comment..."
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setText(e.target.value)}
                    value={text}
                />

                <Button type="submit" className="lg:hidden">
                    <ArrowBigRightDash />
                </Button>
            </form>

            <CommentCollection
                videoId={videoId}
                userId={userId}
                refreshTrigger={refreshTrigger}
            />
        </div>
    );
};

export default Comment;
