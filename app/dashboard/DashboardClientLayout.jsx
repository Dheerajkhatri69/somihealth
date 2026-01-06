'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { LogOutIcon, UserRoundPen } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardClientLayout({ children }) {
    const [userType, setUserType] = useState(null);

    useEffect(() => {
        const storedType = localStorage.getItem('usertype');
        if (storedType) setUserType(storedType);
    }, []);

    return (
        <SidebarProvider>
            <AppSidebar />

            <div className="flex flex-col w-full overflow-x-auto">
                <SidebarInset>
                    <header className="flex h-16 justify-between items-center text-white bg-secondary m-2 rounded-lg">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger />
                            {userType === 'A' && (
                                <Link href="/dashboard/profile">
                                    <UserRoundPen />
                                </Link>
                            )}
                        </div>

                        <Button
                            variant="destructive"
                            onClick={() => {
                                localStorage.removeItem('usertype');
                                signOut();
                            }}
                            className="m-2"
                        >
                            <LogOutIcon className="mr-2 h-4 w-4" />
                            Log out
                        </Button>
                    </header>

                    {children}
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
