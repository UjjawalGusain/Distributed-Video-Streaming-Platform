'use client';
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner';
import APIS from '@/apis/apis';

interface NotficationInterface {
    _id: string;
    userId: string;
    message: string;
    seen: boolean;
    updatedAt: string;
    createdAt: string;
    url: string | null;
};

const page = () => {

    const { data: session, status } = useSession();
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [notifications, setNotifications] = useState<NotficationInterface[]>([]);

    const limit = 10;
    useEffect(() => {
        if (status !== "authenticated") return;
        console.log("Is authenticated");

        const getLastestNotifications = async () => {
            const jwt = session?.user?.jwt;

            if (!jwt) {
                toast.error("Missing authentication token");
                return;
            }
            const newNotifications = (await axios.get(APIS.GET_NOTIFICATIONS_FOR_USER, {
                params: {
                    page: 1,
                    limit,
                },
                headers: {
                    Authorization: `Bearer ${jwt}`,
                }
            })).data.data.notifications


            setNotifications(prev => {
                const combined = [...prev, ...newNotifications];
                return Array.from(new Map(combined.map(v => [v._id, v])).values());
            });

            if (newNotifications.length < limit) setHasMore(false);

            setLoading(false);

        }

        getLastestNotifications();
    }, [status, session])

    return (
        <div>

        </div>
    )
}

export default page