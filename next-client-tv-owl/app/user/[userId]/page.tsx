'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import APIS from '@/apis/apis';

interface UserInterface {
  id: string;
  username: string;
  avatar: string | "";
  isPremium: string;
  email: string;
}

export default function Page() {
  const { userId }: { userId: string } = useParams();
  const [user, setUser] = useState<UserInterface | {}>({});

  useEffect(() => {
    const getUserInfo = async () => {
      const res = await axios.get(`${APIS.GET_USER}/${userId}`);

      console.log("User:", res);
      if (res.data.success === false) return;      

      setUser(res.data.data);
    }

    getUserInfo()
  }, [])

  return <div>{user.avatar}</div>;
}
