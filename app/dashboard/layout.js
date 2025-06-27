'use client'
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { LogOutIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';
import React from 'react';
import { usePathname } from 'next/navigation';

const DashboardLayout = ({ children }) => {
    const pathname = usePathname();
    // List of routes where you do NOT want the sidebar
    const noSidebarRoutes = ['/dashboard/somepage', '/dashboard/anotherpage'];

    const showSidebar = !noSidebarRoutes.includes(pathname);

    return (
        <SidebarProvider>
            {showSidebar && <AppSidebar />}
            <div className="flex flex-col w-full overflow-x-auto">
                <SidebarInset >
                    <header className="flex h-16 justify-between shrink-0 items-center text-white bg-secondary m-2 rounded-lg gap-2">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
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
};

export default DashboardLayout;