"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableHeader,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ProviderField from "@/components/providerField";

export default function RefillsPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]);
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 100;
    const [newlySeenIds, setNewlySeenIds] = useState([]);
    const [newFormsCount, setNewFormsCount] = useState(0);
    const [unseenCount, setUnseenCount] = useState(0);

    useEffect(() => {
        fetchData();
        fetchUnseenCount();
        const interval = setInterval(fetchUnseenCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnseenCount = async () => {
        try {
            const response = await fetch('/api/referrals/unseen');
            const result = await response.json();
            if (result.success) {
                setUnseenCount(result.count);
            }
        } catch {}
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/referrals');
            const result = await response.json();
            if (result.success) {
                setData(result.referrals);
                const unseenItems = result.referrals.filter(item => !item.seen);
                if (unseenItems.length > 0) {
                    setNewFormsCount(unseenItems.length);
                    const unseenIds = unseenItems.map(item => item._id);
                    setNewlySeenIds(unseenIds);
                    await fetch('/api/referrals/mark-as-seen', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids: unseenIds }),
                    });
                }
            } else {
                toast.error('Failed to fetch referrals');
            }
        } catch (error) {
            toast.error('Error fetching referrals');
        } finally {
            setLoading(false);
        }
    };

    // Filters state
    const [filters, setFilters] = useState({
        search: '',
        dateRange: 'all',
        referralSource: 'all',
    });

    const filteredData = data.filter(item => {
        const searchMatch =
            item.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.refFirstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.refLastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.refEmail?.toLowerCase().includes(filters.search.toLowerCase());

        const referralSourceMatch = filters.referralSource === 'all' || item.referralSource === filters.referralSource;

        const createdAt = new Date(item.createdAt);
        const now = new Date();
        const diffInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

        const dateMatch =
            filters.dateRange === 'all' ||
            (filters.dateRange === 'today' && createdAt.toDateString() === now.toDateString()) ||
            (filters.dateRange === 'week' && diffInDays <= 7) ||
            (filters.dateRange === 'month' && diffInDays <= 30);

        return searchMatch && dateMatch && referralSourceMatch;
    });

    const handleDeleteSelected = async () => {
        try {
            const response = await fetch('/api/', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedItems }),
            });

            const result = await response.json();
            if (result.success) {
                setData(prev => prev.filter(item => !selectedItems.includes(item._id)));
                setSelectedItems([]);
                toast.success('Selected refills deleted successfully');
            } else {
                toast.error(result.message || 'Failed to delete selected refills');
            }
        } catch (error) {
            toast.error('Error deleting selected refills');
        }
    };

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

    return (
        <div className="overflow-x-auto p-4">
            <div className="flex flex-wrap gap-2 mb-4">
                <Input
                    placeholder="Search by name, or email..."
                    className="max-w-xs"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
                <Select value={filters.referralSource} onValueChange={(value) => setFilters(prev => ({ ...prev, referralSource: value }))}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Referral Source" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Friend/Family">Friend/Family</SelectItem>
                        <SelectItem value="Healthcare Provider">Healthcare Provider</SelectItem>
                        <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">Last 30 Days</SelectItem>
                    </SelectContent>
                </Select>

            </div>


            {newFormsCount > 0 && (
                <div className="mb-4 text-center text-green-700 bg-green-100 p-2 rounded-md">
                    You have {newFormsCount} new referral requests.
                </div>
            )}

            <div className="rounded-md border bg-background/50">
                {loading ? (
                    <div className="rounded-md border bg-background/50">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[...Array(10)].map((_, i) => (
                                        <TableHead key={i}>
                                            <Skeleton className="h-8 w-full" />
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(10)].map((_, j) => (
                                            <TableCell key={j}>
                                                <Skeleton className="h-6 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-secondary">
                            <TableRow className="hover:bg-secondary/80">
                                <TableHead className="text-white sticky left-0 bg-secondary z-10">Date</TableHead>
                                <TableHead className="bg-white whitespace-nowrap">First Name</TableHead>
                                <TableHead className="bg-white whitespace-nowrap">Last Name</TableHead>
                                <TableHead className="bg-white whitespace-nowrap">Email</TableHead>
                                <TableHead className="bg-white whitespace-nowrap">Phone</TableHead>
                                <TableHead className="bg-secondary text-white text-center whitespace-nowrap">Referraled By</TableHead>
                                <TableHead className="bg-white whitespace-nowrap">First Name</TableHead>
                                <TableHead className="bg-white whitespace-nowrap">Last Name</TableHead>
                                <TableHead className="bg-white whitespace-nowrap">Email</TableHead>
                                <TableHead className="bg-white whitespace-nowrap">Phone</TableHead>
                                <TableHead className="bg-white whitespace-nowrap">NPI</TableHead>
                                <TableHead className="text-white sticky right-0 bg-secondary z-10">Actions</TableHead>

                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentRows.map((item) => (
                                <TableRow key={item._id} className={newlySeenIds.includes(item._id) ? 'bg-green-100 hover:bg-green-200' : 'hover:bg-muted/50'}>
                                    <TableCell className="sticky left-0 bg-background z-10 whitespace-nowrap">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</TableCell>
                                    <TableCell>{item.firstName}</TableCell>
                                    <TableCell>{item.lastName}</TableCell>
                                    <TableCell>{item.email}</TableCell>
                                    <TableCell>{item.phone}</TableCell>
                                    <TableCell className="whitespace-nowrap text-center bg-gray-200">{item.referralSource}</TableCell>
                                    <TableCell>{item.refFirstName}</TableCell>
                                    <TableCell>{item.refLastName}</TableCell>
                                    <TableCell>{item.refEmail}</TableCell>
                                    <TableCell>{item.refPhone}</TableCell>
                                    <TableCell className="relative overflow-visible">
                                        <ProviderField provider={item.providerField || '-'} />
                                    </TableCell>
                                    <TableCell className="sticky right-0 bg-background z-10">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Menu className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/referrals/${item._id}`}>
                                                        Open
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Showing {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredData.length)} of{" "}
                    {filteredData.length} refills
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next
                    </Button>
                </div>
            </div>


        </div>
    );
} 