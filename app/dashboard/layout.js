'use client'
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { LogOutIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
import React from 'react';

const DashboardLayout = ({ children }) => {
    // const router = useRouter();
    // const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    // const handleLogout = async () => {
    //     try {
    //         setIsLoggingOut(true);
    //         // Sign out using NextAuth
    //         await signOut({ redirect: false });
            
    //         // Redirect to login page
    //         router.push('/login');
    //     } catch (error) {
    //         console.error('Logout error:', error);
    //     } finally {
    //         setIsLoggingOut(false);
    //     }
    // };

    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-col w-full overflow-x-auto">
                <SidebarInset >
                    <header className="flex h-16 justify-between shrink-0 items-center text-white bg-secondary m-2 rounded-lg gap-2">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                        </div>
                        <Button
                            variant="destructive"
                            onClick={()=>{signOut()}}
                            className="m-2"
                            // disabled={isLoggingOut}
                        >
                            <LogOutIcon className="mr-2 h-4 w-4" />
                            Log out
                            {/* {isLoggingOut ? 'Logging out...' : 'Logout'} */}
                        </Button>
                    </header>
                    {children}
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default DashboardLayout;