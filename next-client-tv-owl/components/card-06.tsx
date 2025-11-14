'use client';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  HeartIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  ShareIcon,
} from "lucide-react";
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
      {/* <CardHeader className="flex flex-row items-center justify-between py-2.5 -mr-1">
        <Item className="w-full p-0 gap-2.5">
          <ItemMedia>
            <Image
              src="https://github.com/shadcn.png"
              className="h-8 w-8 rounded-full bg-secondary object-contain"
              alt=""
              height={32}
              width={32}
            />
          </ItemMedia>
          <ItemContent className="gap-0">
            <ItemTitle>shadcn</ItemTitle>
            <ItemDescription className="text-xs">@shadcn</ItemDescription>
          </ItemContent>
          <ItemActions className="-me-1">
            <Button variant="ghost" size="icon">
              <MoreHorizontalIcon />
            </Button>
          </ItemActions>
        </Item>
      </CardHeader> */}
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
      {/* <CardFooter className="border-t flex px-2 pb-0 py-2!">
        <Button variant="ghost" className="grow shrink-0 text-muted-foreground">
          <HeartIcon /> <span className="hidden sm:inline">Like</span>
        </Button>
        <Button variant="ghost" className="grow shrink-0 text-muted-foreground">
          <MessageCircleIcon />
          <span className="hidden sm:inline">Comment</span>
        </Button>
        <Button variant="ghost" className="grow shrink-0 text-muted-foreground">
          <ShareIcon /> <span className="hidden sm:inline">Share</span>
        </Button>
      </CardFooter> */}
    </Card>
  );
}
