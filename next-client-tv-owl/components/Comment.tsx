import React, { useEffect, useState } from 'react'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import axios from 'axios'
import APIS from '@/apis/apis'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { ArrowBigRightDash } from 'lucide-react'
import { ItemMedia } from './ui/item'
import Image from 'next/image'
import CommentCollection from './Comment/CommentCollection'

const Comment = ({ videoId }: { videoId: string }) => {
    const { data: session } = useSession();
    const [text, setText] = useState("");

    const submitComment = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const jwt = session?.user?.jwt;
        if (!jwt) {
            toast.error("Missing authentication token");
            return;
        }

        try {
            await axios.post(
                APIS.CREATE_COMMENT,
                { text: trimmed, targetType: "Video", targetId: videoId },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );

            setText("");
            toast.success("Comment added");
        } catch (err) {
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
        <div className='w-full flex flex-col gap-3'>
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
                <input type="text" name="comment" id="comment" className='w-full focus:outline-0 focus:shadow-0 border-b-2 text-sm' placeholder='Write a comment...' onKeyDown={handleKeyDown} onChange={(e) => setText(e.target.value)} value={text}/>

                <Button type="submit" className='lg:hidden'>
                    <ArrowBigRightDash />
                </Button>
            </form>

            <CommentCollection videoId={videoId}/>
        </div>
    );
};

export default Comment;
