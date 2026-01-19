'use client';

import React, { useState, useEffect } from 'react';
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
    Bell,
    User,
    Menu
} from 'lucide-react';
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [updating, setUpdating] = useState(false);

    // New state for treatments
    const [treatments, setTreatments] = useState([]);
    const [loadingTreatments, setLoadingTreatments] = useState(true);

    useEffect(() => {
        const fetchTreatments = async () => {
            if (session?.user?.email) {
                try {
                    setLoadingTreatments(true);
                    const res = await fetch(`/api/patient/treatments/${session.user.email}`);
                    const data = await res.json();
                    if (data.success) {
                        setTreatments(data.treatments);
                    }
                } catch (error) {
                    console.error("Error fetching treatments:", error);
                } finally {
                    setLoadingTreatments(false);
                }
            }
        };

        if (status === "authenticated") {
            fetchTreatments();
        } else if (status === "unauthenticated") {
            setLoadingTreatments(false);
        }
    }, [session, status]);

    // Message State
    const [messageDialogOpen, setMessageDialogOpen] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const [messageStatus, setMessageStatus] = useState(null);

    const handleSendMessage = async () => {
        if (!messageText.trim()) {
            setMessageStatus({ success: false, message: "Please enter a message" });
            return;
        }

        setSendingMessage(true);
        setMessageStatus(null);

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: "Patient Dashboard", // Default required field
                    email: session?.user?.email || "",
                    phone: "000-000-0000", // Default required field
                    interestedIn: "Support", // Default required field
                    comments: messageText
                }),
            });

            const data = await res.json();

            if (data.success) {
                setMessageStatus({ success: true, message: "Message sent successfully!" });
                setMessageText("");
                setTimeout(() => {
                    setMessageDialogOpen(false);
                    setMessageStatus(null);
                }, 2000);
            } else {
                setMessageStatus({ success: false, message: data.message || "Failed to send message" });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessageStatus({ success: false, message: "Error sending message" });
        } finally {
            setSendingMessage(false);
        }
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    const handlePasswordChange = async () => {
        setPasswordError("");
        setPasswordSuccess(false);

        // Validation
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordError("All fields are required");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters");
            return;
        }

        setUpdating(true);

        try {
            const res = await fetch("/api/patient/update-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setPasswordSuccess(true);
                setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
                setTimeout(() => {
                    setProfileDialogOpen(false);
                    setPasswordSuccess(false);
                }, 2000);
            } else {
                setPasswordError(data.error || "Failed to update password");
            }
        } catch (error) {
            setPasswordError("Error updating password");
        } finally {
            setUpdating(false);
        }
    };

    // Get initials for avatar
    const getInitials = (email) => {
        if (!email) return "PA";
        return email.substring(0, 2).toUpperCase();
    };

    if (status === "loading") {
        return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!session) {
        router.push("/login");
        return null;
    }

    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex font-sans text-slate-900">

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="font-tagesschrift text-4xl mb-2 text-secondary z-20 font-bold">somi</h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <Link href="/patientDashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
                        <Home className="h-4 w-4" />
                        Home
                    </Link>
                    <button
                        onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                        <LayoutGrid className="h-4 w-4" />
                        Services
                    </button>
                    <button
                        onClick={() => setMessageDialogOpen(true)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                        <LifeBuoy className="h-4 w-4" />
                        Support
                    </button>
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={() => setProfileDialogOpen(true)}
                        className="flex w-full items-center gap-3 px-3 py-2 mb-2 hover:bg-slate-50 rounded-md transition-colors"
                    >
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Profile</span>
                            <span className="text-xs text-slate-500">View Settings</span>
                        </div>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">

                {/* Top Header */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 md:px-8">
                    <div className="hidden md:block w-1/3"></div>

                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6 text-slate-700" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                                <div className="p-4 sm:p-6">
                                    <h1 className="font-tagesschrift text-4xl mb-6 text-secondary font-bold">somi</h1>

                                    <nav className="flex flex-col space-y-4">
                                        <SheetClose asChild>
                                            <Link href="/patientDashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
                                                <Home className="h-4 w-4" />
                                                Home
                                            </Link>
                                        </SheetClose>

                                        <SheetClose asChild>
                                            <button
                                                onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
                                                className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                <LayoutGrid className="h-4 w-4" />
                                                Services
                                            </button>
                                        </SheetClose>

                                        <SheetClose asChild>
                                            <button
                                                onClick={() => setMessageDialogOpen(true)}
                                                className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                <LifeBuoy className="h-4 w-4" />
                                                Support
                                            </button>
                                        </SheetClose>

                                        <div className="pt-4 border-t mt-4">
                                            <SheetClose asChild>
                                                <button
                                                    onClick={() => setProfileDialogOpen(true)}
                                                    className="flex w-full items-center gap-3 px-3 py-2 mb-2 hover:bg-slate-50 rounded-md transition-colors text-left"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">Profile</span>
                                                        <span className="text-xs text-slate-500">View Settings</span>
                                                    </div>
                                                </button>
                                            </SheetClose>

                                            <SheetClose asChild>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Logout
                                                </button>
                                            </SheetClose>
                                        </div>
                                    </nav>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Right side: User & Logout */}
                    <div className="flex items-center gap-4 ml-auto">
                        <span className="text-sm font-medium text-slate-700">{session.user.email}</span>

                        <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold relative">
                            {getInitials(session.user.email)}
                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white" />
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-slate-900"
                            onClick={handleLogout}
                        >
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
                        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
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
                                <div className="py-4 space-y-4">
                                    <Textarea
                                        placeholder="Type your message here..."
                                        className="min-h-[100px]"
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                    />
                                    {messageStatus && (
                                        <p className={`text-sm ${messageStatus.success ? "text-green-600" : "text-red-600"}`}>
                                            {messageStatus.message}
                                        </p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        onClick={handleSendMessage}
                                        disabled={sendingMessage}
                                    >
                                        {sendingMessage ? "Sending..." : "Send Message"}
                                    </Button>
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


                        {/* Desktop View: Table */}
                        <Card className="shadow-sm border-slate-200 hidden md:block">
                            <div className="overflow-x-auto">
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
                                        {loadingTreatments ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                                                    Loading treatments...
                                                </TableCell>
                                            </TableRow>
                                        ) : treatments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <p>No active treatments found.</p>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href="/getstarted/weightloss" target="_blank">Start a consultation</Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            treatments.map((service, index) => (
                                                <TableRow key={service.id || index}>
                                                    <TableCell className="font-medium whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span>{service.treatment}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">{service.dose || '-'}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{service.unit || '-'}</TableCell>
                                                    <TableCell className="text-slate-500 whitespace-nowrap">{service.refillDate || '-'}</TableCell>
                                                    <TableCell className="text-right whitespace-nowrap">
                                                        <Badge
                                                            className={[
                                                                "px-3 py-1 text-sm rounded-md capitalize",
                                                                (service.status || "").toLowerCase().includes("pending")
                                                                    ? "bg-yellow-200 text-yellow-900 hover:bg-yellow-200"
                                                                    : (service.status || "").toLowerCase().includes("approved")
                                                                        ? "bg-green-200 text-green-900 hover:bg-green-200"
                                                                        : (service.status || "").toLowerCase().includes("disqualified")
                                                                            ? "bg-purple-200 text-purple-900 hover:bg-purple-200"
                                                                            : (service.status || "").toLowerCase().includes("denied") || (service.status || "").toLowerCase().includes("closed")
                                                                                ? "bg-red-200 text-red-900 hover:bg-red-200"
                                                                                : "bg-blue-200 text-black hover:bg-blue-200" // default/none
                                                            ].join(" ")}
                                                        >
                                                            {service.status || "None"}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>

                        {/* Mobile View: Cards */}
                        <div className="md:hidden space-y-4">
                            {loadingTreatments ? (
                                <Card className="shadow-sm border-slate-200 p-6 text-center text-slate-500">
                                    Loading treatments...
                                </Card>
                            ) : treatments.length === 0 ? (
                                <Card className="shadow-sm border-slate-200 p-6">
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <p className="text-slate-500">No active treatments found.</p>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/getstarted/weightloss" target="_blank">Start a consultation</Link>
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                treatments.map((service, index) => (
                                    <Card key={service.id || index} className="shadow-sm border-slate-200">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-base font-semibold text-slate-900">
                                                    {service.treatment}
                                                </CardTitle>
                                                <Badge
                                                    className={[
                                                        "px-2 py-0.5 text-xs rounded-md capitalize",
                                                        (service.status || "").toLowerCase().includes("pending")
                                                            ? "bg-yellow-200 text-yellow-900"
                                                            : (service.status || "").toLowerCase().includes("approved")
                                                                ? "bg-green-200 text-green-900"
                                                                : (service.status || "").toLowerCase().includes("disqualified")
                                                                    ? "bg-purple-200 text-purple-900"
                                                                    : (service.status || "").toLowerCase().includes("denied") || (service.status || "").toLowerCase().includes("closed")
                                                                        ? "bg-red-200 text-red-900"
                                                                        : "bg-blue-200 text-black"
                                                    ].join(" ")}
                                                >
                                                    {service.status || "None"}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-500 text-xs">Dose</p>
                                                <p className="font-medium text-slate-900">{service.dose || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 text-xs">Unit</p>
                                                <p className="font-medium text-slate-900">{service.unit || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 text-xs">Next Refill</p>
                                                <p className="font-medium text-slate-900">{service.refillDate || '-'}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Explore Services Section */}
                    <div id="services-section" className="space-y-4">
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

            {/* Profile Settings Dialog */}
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Profile Settings</DialogTitle>
                        <DialogDescription>
                            Update your password here
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={session.user.email} disabled className="bg-gray-50" />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                placeholder="Enter new password"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                placeholder="Confirm new password"
                            />
                        </div>

                        {passwordError && (
                            <p className="text-sm text-red-600">{passwordError}</p>
                        )}

                        {passwordSuccess && (
                            <p className="text-sm text-green-600">✅ Password updated successfully!</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProfileDialogOpen(false)} disabled={updating}>
                            Cancel
                        </Button>
                        <Button onClick={handlePasswordChange} disabled={updating}>
                            {updating ? "Updating..." : "Update Password"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
