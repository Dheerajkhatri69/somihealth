'use client';

import React from 'react';
import {
    Home,
    LayoutGrid,
    LifeBuoy,
    Settings,
    LogOut,
    MessageSquare,
    Users,
    PlayCircle,
    Video,
    ExternalLink,
    ChevronRight,
    Bell
} from 'lucide-react';
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Mock Data matching the image
const ACTIVE_SERVICES = [
    {
        id: '1',
        treatment: 'Tirzepatide',
        dose: '2.5',
        unit: 'mg',
        status: 'approved',
        date: 'Aug 21',
    },
    {
        id: '2',
        treatment: 'Semaglutide',
        dose: '0.5',
        unit: 'mg',
        status: 'closed',
        date: 'Jul 23',
    },
];

export default function PatientDashboard() {
    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex font-sans text-slate-900">

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:flex flex-col">
                <div className="p-6">
                    {/* Logo Placeholder */}

                    <h1 className="font-tagesschrift text-4xl mb-2 text-secondary z-20 font-bold">somi</h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <Link href="/patientDashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
                        <Home className="h-4 w-4" />
                        Home
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        <LayoutGrid className="h-4 w-4" />
                        Services
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        <LifeBuoy className="h-4 w-4" />
                        Support
                    </Link>
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Profile</span>
                            <span className="text-xs text-slate-500">View Settings</span>
                        </div>
                    </div>

                    <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors">
                        <LogOut className="h-4 w-4" />
                        Cancel Subscription
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">

                {/* Top Header */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 md:px-8">
                    {/* Left side (Breadcrumb or specific visual spacer) */}
                    <div className="hidden md:block w-1/3"></div>

                    {/* Right side: User & Logout */}
                    <div className="flex items-center gap-4 ml-auto">
                        <span className="text-sm font-medium text-slate-700">Name</span>

                        <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold relative">
                            BB
                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white" />
                        </div>

                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </header>


                <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">

                    {/* Top Cards Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1: Services */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Card className="shadow-sm border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <CardContent className="p-6 flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <LayoutGrid className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">Services</h3>
                                            <p className="text-sm text-slate-500 mt-1">Discover our services</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[240px]">
                                <DropdownMenuItem asChild>
                                    <Link href="/getstarted/weightloss" target="_blank" className="cursor-pointer font-medium">
                                        Weight Loss
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/getstarted/erectile-dysfunction" target="_blank" className="cursor-pointer font-medium">
                                        Erectile Dysfunction
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/getstarted/longevity" target="_blank" className="cursor-pointer font-medium">
                                        Longevity
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/getstarted/skinhair" target="_blank" className="cursor-pointer font-medium">
                                        Skin & Hair
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Card 2: Refer a Friend */}
                        <Link href="/referrals" target="_blank">
                            <Card className="shadow-sm border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">Refer a friend</h3>
                                        <p className="text-sm text-slate-500 mt-1">Invite your colleagues</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Card 3: Support/Messages */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Card className="shadow-sm border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <CardContent className="p-6 flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">Messenger</h3>
                                            <p className="text-sm text-slate-500 mt-1">Send us a message</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Send us a message</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <Textarea placeholder="Type your message here..." className="min-h-[100px]" />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Send Message</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>


                    {/* Active Services Table */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">Active Services</h2>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        + Add services
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[240px]">
                                    <DropdownMenuItem asChild>
                                        <Link href="/getstarted/weightloss" target="_blank" className="cursor-pointer font-medium">
                                            Weight Loss
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/getstarted/erectile-dysfunction" target="_blank" className="cursor-pointer font-medium">
                                            Erectile Dysfunction
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/getstarted/longevity" target="_blank" className="cursor-pointer font-medium">
                                            Longevity
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/getstarted/skinhair" target="_blank" className="cursor-pointer font-medium">
                                            Skin & Hair
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <Card className="shadow-sm border-slate-200">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                        <TableHead className="w-[300px] text-slate-900 font-semibold">Treatment</TableHead>
                                        <TableHead className="text-slate-900 font-semibold">Dose</TableHead>
                                        <TableHead className="text-slate-900 font-semibold">Unit</TableHead>
                                        <TableHead className="text-slate-900 font-semibold">Next Refill</TableHead>
                                        <TableHead className="text-slate-900 font-semibold text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ACTIVE_SERVICES.map((service) => (
                                        <TableRow key={service.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{service.treatment}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{service.dose}</TableCell>
                                            <TableCell>{service.unit}</TableCell>
                                            <TableCell className="text-slate-500">{service.date}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    className={[
                                                        "px-3 py-1 text-sm rounded-md capitalize",
                                                        service.status === "pending"
                                                            ? "bg-yellow-200 text-yellow-900 hover:bg-yellow-200"
                                                            : service.status === "approved"
                                                                ? "bg-green-200 text-green-900 hover:bg-green-200"
                                                                : service.status === "" || service.status === "None"
                                                                    ? "bg-blue-200 text-black hover:bg-blue-200"
                                                                    : service.status === "disqualified"
                                                                        ? "bg-purple-200 text-purple-900 hover:bg-purple-200"
                                                                        : ["denied", "closed"].includes(service.status)
                                                                            ? "bg-red-200 text-red-900 hover:bg-red-200"
                                                                            : "bg-gray-200 text-gray-900 hover:bg-gray-200" // default case
                                                    ].join(" ")}
                                                >
                                                    {service.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>

                    {/* Explore Services Section */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900">Explore Our Services</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: 'Weight Loss', url: '/getstarted/weightloss', image: 'https://res.cloudinary.com/dvmbfolrm/image/upload/v1764288147/fileUploader/m8wiorldootbj1do2fd0.jpg' },
                                { title: 'Longevity', url: '/getstarted/longevity', image: 'https://res.cloudinary.com/dvmbfolrm/image/upload/v1764026233/fileUploader/pz4fiesttenycwmwzvwv.jpg' },
                                { title: 'Erectile Dysfunction', url: '/getstarted/erectile-dysfunction', image: 'https://res.cloudinary.com/dvmbfolrm/image/upload/v1764026405/fileUploader/b2cblfpp9vb4qwp3ac9g.jpg' },
                                { title: 'Skin & Hair', url: '/getstarted/skinhair', image: 'https://res.cloudinary.com/dvmbfolrm/image/upload/v1764026867/fileUploader/w1jmxvaiwra357qqag1k.jpg' }
                            ].map((item) => (
                                <Link href={item.url} key={item.title} target="_blank">
                                    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-slate-200 h-full">
                                        <div className="h-64 bg-slate-200 relative">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold text-slate-900">{item.title}</h3>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
