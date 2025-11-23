'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import APIS from '@/apis/apis';
import Loading from '@/app/loading';
import Image from 'next/image';
import { ItemMedia } from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';

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

  useEffect(() => {
    const getUserInfo = async () => {
      console.log(userId);

      const res = await axios.get(`${APIS.GET_USER}/${userId}`);

      console.log("User:", res);
      if (res.data.success === false) return;

      setUser(res.data.data);
    }

    getUserInfo()
  }, [])

  if (!user) return <Loading />;

  return (
    <div className='flex flex-col w-full px-10'>
      <div className='flex gap-3 items-center'>
        <div>
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
        </div>
        <div>
          <div className='text-4xl uppercase'>{user.username}</div>
          <div className='flex items-center gap-1'>
            <div className='text-sm'>{user.email}</div> 
            •
            <div className='text-sm text-muted-foreground'>{user.subscriberCount} subscribers</div>
          </div>
        </div>
      </div>
      <Separator className='my-4'/>
      <div>down</div>
    </div>
  );
}
