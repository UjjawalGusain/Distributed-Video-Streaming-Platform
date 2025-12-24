'use client';

import { Home, Inbox, Settings, LogIn, LogOut } from "lucide-react";
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

interface MenuItem {
    title: string;
    icon: React.ElementType;
    action: () => void;
}

export function AppSidebar() {
    const router = useRouter();
    const { data: session } = useSession();

    const handleSignIn = async () => {
        try {
            await signIn("google");
        } catch (error) {
            toast("Authentication failed", {
                description: "Unable to sign in with Google.",
            });
            console.log(error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut({ callbackUrl: "/" });
        } catch (error) {
            toast("Sign out failed", {
                description: "Unable to log out. Please try again.",
            });
            console.log(error);
        }
    };

    const menuItems: MenuItem[] = [
        {
            title: "Home",
            icon: Home,
            action: () => router.push("/home"),
        },
        {
            title: "Inbox",
            icon: Inbox,
            action: () => router.push("/inbox"),
        },
        {
            title: "Settings",
            icon: Settings,
            action: () => router.push("/settings"),
        },
        session
            ? {
                title: "Logout",
                icon: LogOut,
                action: handleSignOut,
            }
            : {
                title: "Login",
                icon: LogIn,
                action: handleSignIn,
            },
    ];

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton onClick={item.action}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
