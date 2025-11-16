'use client';
import { Card, CardContent } from "@/components/ui/card";
import { ItemMedia } from "@/components/ui/item";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Separator } from "../ui/separator";

interface LittleCardPostProps {
    title: string;
    thumbnail: string;
    views: number;
    duration: number;
    updatedAt: string;
    username: string;
    avatar: string;
    videoId: string;
    shortDescription: string;
}

const RelatedRecommendedVideoCard = ({
    title,
    thumbnail,
    views,
    duration,
    updatedAt,
    username,
    avatar,
    videoId,
    shortDescription,
}: LittleCardPostProps) => {
    const router = useRouter();
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

    return (
        <Card
            className="w-full shrink shadow-none py-0 rounded-md hover:opacity-65 hover:cursor-pointer transition-opacity duration-200 mt-5"
            onClick={() => router.push(`/home/${videoId}`)}
        >
            <CardContent className="md:p-0 px-10 flex flex-col md:flex-row items-start justify-between gap-3 w-full">

                <div className="relative md:w-40 w-full aspect-video md:rounded-lg overflow-hidden">
                    <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        className="object-fill"
                        sizes="(min-width: 1024px) 128px, 300px"
                        loading="eager"
                    />
                </div>

                <div className="flex gap-2 items-start flex-1 min-w-0 mx-4">
                    <ItemMedia className="lg:hidden">
                        <Image
                            src={avatar}
                            alt={`${username} avatar`}
                            width={32}
                            height={32}
                            className="h-9 w-9 rounded-full object-cover border bg-secondary"
                        />
                    </ItemMedia>

                    <div className="flex flex-col flex-1 min-w-0">
                        <h2 className="font-sans text-md wrap-break-word">{title}</h2>
                        <div className="mt-1 text-sm text-muted-foreground hidden lg:block">
                            {username} <br />
                            {views} views | {`${durationAgo} ago`}
                        </div>

                        <div className="mt-1 text-sm text-muted-foreground lg:hidden">
                            {username} <br />
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground lg:hidden">
                            {shortDescription} <br />
                            {views} views | {`${durationAgo} ago`}
                        </div>

                    </div>
                </div>

            </CardContent>
            <Separator/>

        </Card>

    );
};

export default RelatedRecommendedVideoCard;
