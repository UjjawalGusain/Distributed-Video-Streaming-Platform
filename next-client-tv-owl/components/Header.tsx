'use client';
import React from 'react'
import { Navbar14 } from '@/components/ui/shadcn-io/navbar-14';


const Header = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="relative w-full">
      <Navbar14 searchPlaceholder="Search for video" addLink="/uploadVideo" >
      {children}
      </Navbar14>
    </div>
  );
};

export default Header