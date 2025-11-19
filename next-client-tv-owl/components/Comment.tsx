import React, { useState } from 'react'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import axios from 'axios'
import APIS from '@/apis/apis'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { ArrowBigRightDash } from 'lucide-react'

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


    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitComment();
        }
    };

    return (
        <div className='w-full flex flex-col'>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submitComment();
                }}
                className="flex w-full gap-3 items-center"
            >
                <Textarea
                    id="comment"
                    placeholder="Write a comment..."
                    className="w-full"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <Button type="submit" className='lg:hidden'>
                    <ArrowBigRightDash />
                </Button>
            </form>


        </div>
    );
};

export default Comment;
