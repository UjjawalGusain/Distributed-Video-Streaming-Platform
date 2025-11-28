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

  const formatDuration = (totalSeconds: number): string => {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    } else {
      return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }
  }

  const getTimeAgo = (parsedMs: string) => {
    
    const msAgo = Date.now() - Number(parsedMs);

    const seconds = Math.floor(msAgo / 1000);
    if (seconds < 60) return seconds === 1 ? "1 second" : `${seconds} seconds`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes === 1 ? "1 minute" : `${minutes} minutes`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours === 1 ? "1 hour" : `${hours} hours`;

    const days = Math.floor(hours / 24);
    if (days < 7) return days === 1 ? "1 day" : `${days} days`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return weeks === 1 ? "1 week" : `${weeks} weeks`;

    const months = Math.floor(days / 30);
    if (months < 12) return months === 1 ? "1 month" : `${months} months`;

    const years = Math.floor(months / 12);
    return years === 1 ? "1 year" : `${years} years`;
  };

  const durationAgo = getTimeAgo(String(Date.parse(updatedAt)));


  const router = useRouter();
  return (
    <Card className="w-full max-w-xl md:max-w-96 min-w-60 lg:min-w-72 flex-1 shrink shadow-none py-0 gap-0 rounded-md hover:opacity-65 hover:cursor-pointer transition-opacity duration-200" onClick={() => { router.push(`/home/${videoId}`) }}>

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
          <div className="absolute text-xs bg-muted p-0.5 px-1 bottom-1 right-1 rounded-xs font-semibold">{formatDuration(duration)}</div>
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
              <span className="text-muted-foreground">{views} views | {durationAgo} ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
