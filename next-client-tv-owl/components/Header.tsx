'use client';
import React, {useEffect, useState} from 'react'
import { Navbar14 } from '@/components/ui/shadcn-io/navbar-14';
import { NotificationInterface } from '@/app/notification/page';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import axios from 'axios';
import APIS from '@/apis/apis';


const Header = ({ children }: { children: React.ReactNode }) => {
  const {data: session, status} = useSession();
  const [notifications, setNotifications] = useState<NotificationInterface[]>([]);
  const limit = 5;
  useEffect(() => {
    if (status !== "authenticated") return;
    console.log("Is authenticated");

    const getLastestNotifications = async () => {
      const jwt = session?.user?.jwt;

      if (!jwt) {
        toast.error("Missing authentication token");
        return;
      }
      const unseenNotfications = (await axios.get(APIS.GET_NOTIFICATIONS_FOR_USER, {
        params: {
          page: 1,
          limit,
          unseen: "true",
        },
        headers: {
          Authorization: `Bearer ${jwt}`,
        }
      })).data.data.notifications
      setNotifications(unseenNotfications);
    }
    getLastestNotifications();
  }, [status, session])
  return (
    <div className="relative w-full">
      <Navbar14 searchPlaceholder="Search for video" addLink="/uploadVideo" notifications={notifications}>
        {children}
      </Navbar14>
    </div>
  );
};

export default Header