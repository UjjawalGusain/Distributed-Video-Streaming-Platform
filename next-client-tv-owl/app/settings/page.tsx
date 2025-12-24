'use client';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import ErrorPage from '../Error';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import { toast } from 'sonner';

const Settings = () => {
    const { data: session } = useSession();
    const [username, setUsername] = useState("");

    if (!session) {
        return (
            <ErrorPage
                title="Oops! Something went wrong"
                message="User is not logged in"
            />
        );
    }

    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim()) {
            toast("Invalid username", { description: "Username cannot be empty." });
            return;
        }

        // TODO: Username change here
        console.log("New username:", username);

        toast("Username updated");
    };

    const handleAvatarSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const file = formData.get("avatar") as File;

        if (!file || file.size === 0) {
            toast("No file selected");
            return;
        }

        // TODO: Upload profile picture
        console.log("New profile pictire:", file);

        toast("Profile picture updated");
    };

    return (
        <div className="flex w-full justify-center items-center h-full py-4">
            <div className="flex w-full md:max-w-2/3 md:min-w-[720px] h-full">
                <div className="flex flex-col gap-6 w-full">
                    <div className="text-xl underline underline-offset-3">Choose how you appear</div>

                    <div>
                        <div className="text-lg">Email account registered</div>
                        <div className="text-muted-foreground text-sm">
                            {session.user.email}
                        </div>
                    </div>

                    <div>
                        <div className="text-lg">Your username</div>
                        <div className="text-muted-foreground text-sm">
                            {session.user.username}
                        </div>
                    </div>

                    <div className="flex gap-3 items-center">
                        <div className="text-lg">Your profile picture</div>
                        <Image
                            src={session.user.image ?? ""}
                            alt="Profile picture"
                            width={42}
                            height={42}
                            className="rounded-full"
                        />
                    </div>

                    <hr className="bg-muted-foreground w-full" />

                    <div className="max-w-sm rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 p-3 text-sm text-muted-foreground">
                        ⚠️ These profile update features are not yet implemented. Changes will not be saved.
                    </div>

                    <form
                        onSubmit={handleUsernameSubmit}
                        className="grid w-full max-w-sm gap-3"
                    >
                        <Label htmlFor="username">New Username</Label>
                        <div className="flex gap-2">
                            <Input
                                id="username"
                                value={username}
                                placeholder={session.user.username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <Button type="submit" variant="outline">
                                Change
                            </Button>
                        </div>
                    </form>

                    <form
                        onSubmit={handleAvatarSubmit}
                        className="grid w-full max-w-sm gap-3"
                    >
                        <Label htmlFor="avatar">New Profile Picture</Label>
                        <Input
                            id="avatar"
                            name="avatar"
                            type="file"
                            accept="image/*"
                        />
                        <Button type="submit" variant="outline">
                            Upload
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
