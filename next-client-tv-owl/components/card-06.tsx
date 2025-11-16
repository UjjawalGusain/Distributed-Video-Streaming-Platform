'use client';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  ItemMedia,
} from "@/components/ui/item";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface CardPostProps {
  title: string;
  shortDescription: string;
  thumbnail: string;
  views: number;
  duration: number;
  updatedAt: string;
  username: string;
  avatar: string;
  videoId: string;
}

export default function CardPost({
  title,
  shortDescription,
  thumbnail,
  views,
  duration,
  updatedAt,
  username,
  avatar,
  videoId,
}: CardPostProps) {
  const router = useRouter();
  return (
    <Card className="w-full max-w-xl md:max-w-96 min-w-60 lg:min-w-72 flex-1 shrink shadow-none py-0 gap-0 rounded-md hover:opacity-65 hover:cursor-pointer transition-opacity duration-200" onClick={() => {router.push(`/home/${videoId}`)}}>

      <CardContent className="p-0">

        <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="eager"
          />
        </div>
        <div className="py-5 px-2 flex justify-start items-start gap-2 ">
          <ItemMedia>
            <Image
              src={avatar}
              className="h-9 w-9 rounded-full bg-secondary object-contain border"
              alt=""
              height={32}
              width={32}
            />
          </ItemMedia>
          <div><h2 className="font-semibold text-md">{title}</h2>
            <div className="mt-1 text-sm">
              {username} <br />
              <p className="truncate w-72 text-muted-foreground">{shortDescription}<br /></p>
              <span className="text-muted-foreground">{views} views</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
