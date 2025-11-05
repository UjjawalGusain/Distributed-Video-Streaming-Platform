'use client';
import React from 'react'
import { Navbar14 } from '@/components/ui/shadcn-io/navbar-14';


const Header = () => {
  return (
    <div className="relative w-full">
      <Navbar14 searchPlaceholder="Search for video" addLink="/uploadVideo" />
    </div>
  );
};

export default Header