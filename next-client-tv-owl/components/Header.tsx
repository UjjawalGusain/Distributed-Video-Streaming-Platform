'use client';
import React, { useEffect, useState } from 'react'
import { Navbar14 } from '@/components/ui/shadcn-io/navbar-14';
import { NotificationInterface } from '@/components/ui/shadcn-io/navbar-14';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import axios from 'axios';
import APIS from '@/apis/apis';
import { useRouter } from 'next/navigation';

const Header = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession();
    const [notifications, setNotifications] = useState<NotificationInterface[]>([]);
    const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
    const limit = 8;
    const [currPage, setCurrPage] = useState(1);
    const router = useRouter();

    const routeToSettings = () => { router.push('/settings') };
    const getLatestNotifications = async () => {
        const jwt = session?.user?.jwt;

        if (!jwt) {
            toast.error("Missing authentication token");
            return;
        }


        const unseenNotfications = (await axios.get(APIS.GET_NOTIFICATIONS_FOR_USER, {
            params: {
                page: currPage,
                limit,
                unseen: "true",
            },
            headers: {
                Authorization: `Bearer ${jwt}`,
            }
        })).data.data.notifications

        if (unseenNotfications.length < limit) {
            setHasMoreNotifications(false);
            if (unseenNotfications.length === 0) return;
        }

        setNotifications(prev => {
            const combined = [...prev, ...unseenNotfications];
            return Array.from(new Map(combined.map(v => [v._id, v])).values());
        });
        setCurrPage(currPage + 1);
    }

    useEffect(() => {
        if (status !== "authenticated") return;
        getLatestNotifications();
    }, [status, session])


    return (
        <div className="relative w-full">
            <Navbar14 searchPlaceholder="Search for video" addLink="/uploadVideo" notifications={notifications} getLatestNotifications={getLatestNotifications} hasMoreNotifications={hasMoreNotifications} onSettingsItemClick={routeToSettings}>
                {children}
            </Navbar14>
        </div>
    );
};

export default Header
