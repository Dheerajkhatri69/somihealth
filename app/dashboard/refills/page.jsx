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
import { Delete, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function RefillsPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]);
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 100;
    const checkboxRef = useRef(null);

    // Filters state
    const [filters, setFilters] = useState({
        search: '',
        dateRange: 'all',
        glp1Preference: 'all',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/refills');
            const result = await response.json();
            if (result.success) {
                setData(result.result);
            } else {
                toast.error('Failed to fetch data');
            }
        } catch (error) {
            toast.error('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const filteredData = data.filter(item => {
        const searchMatch =
            item.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.authid?.toLowerCase().includes(filters.search.toLowerCase());

        const glp1Match = filters.glp1Preference === 'all' || item.glp1Preference === filters.glp1Preference;

        const createdAt = new Date(item.createdAt);
        const now = new Date();
        const diffInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

        const dateMatch =
            filters.dateRange === 'all' ||
            (filters.dateRange === 'today' && createdAt.toDateString() === now.toDateString()) ||
            (filters.dateRange === 'week' && diffInDays <= 7) ||
            (filters.dateRange === 'month' && diffInDays <= 30);

        return searchMatch && glp1Match && dateMatch;
    });


    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedItems(filteredData.map(item => item._id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch('/api/refills', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [id] }),
            });

            const result = await response.json();
            if (result.success) {
                setData(prev => prev.filter(item => item._id !== id));
                toast.success('Refill deleted successfully');
            } else {
                toast.error(result.message || 'Failed to delete refill');
            }
        } catch (error) {
            toast.error('Error deleting refill');
        }
    };

    const handleDeleteSelected = async () => {
        try {
            const response = await fetch('/api/refills', {
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
                    placeholder="Search by name, email, or ID..."
                    className="max-w-xs"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
                <Select value={filters.glp1Preference} onValueChange={(value) => setFilters(prev => ({ ...prev, glp1Preference: value }))}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="GLP-1 Preference" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Semaglutide">Semaglutide</SelectItem>
                        <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
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
                <Link href="/dashboard/followup/abandonment">
                    <Button
                        variant="outline"
                        className="bg-secondary text-white hover:text-white hover:bg-secondary"
                    >
                        Refills Abandoned
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-background/50">
                {loading ? (
                    <div className="rounded-md border bg-background/50">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[...Array(8)].map((_, i) => (
                                        <TableHead key={i}>
                                            <Skeleton className="h-8 w-full" />
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(8)].map((_, j) => (
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
                                <TableHead className="w-[50px] text-white sticky left-0 bg-secondary z-10">
                                    <Checkbox
                                        ref={checkboxRef}
                                        checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-white sticky left-[25px] bg-secondary z-10">Date</TableHead>
                                <TableHead className="text-white sticky left-[105px] bg-secondary whitespace-nowrap z-10">AUTH ID</TableHead>
                                <TableHead className="text-white whitespace-nowrap">First Name</TableHead>
                                <TableHead className="text-white whitespace-nowrap">Last Name</TableHead>
                                <TableHead className="text-white whitespace-nowrap">Email</TableHead>
                                <TableHead className="text-white whitespace-nowrap">Phone</TableHead>
                                <TableHead className="text-white whitespace-nowrap">GLP-1 Preference</TableHead>
                                <TableHead className="text-white sticky right-0 bg-secondary z-10">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentRows.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell className="sticky left-0 bg-background z-10">
                                        <Checkbox
                                            checked={selectedItems.includes(item._id)}
                                            onCheckedChange={() => handleSelectItem(item._id)}
                                        />
                                    </TableCell>
                                    <TableCell className="sticky left-[25px] bg-background z-10 whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="sticky left-[105px] bg-background z-10 whitespace-nowrap">{item.authid}</TableCell>
                                    <TableCell className="whitespace-nowrap">{item.firstName}</TableCell>
                                    <TableCell className="whitespace-nowrap">{item.lastName}</TableCell>
                                    <TableCell className="whitespace-nowrap">{item.email}</TableCell>
                                    <TableCell className="whitespace-nowrap">{item.phone}</TableCell>
                                    <TableCell className="whitespace-nowrap">{item.glp1Preference}</TableCell>
                                    <TableCell className="sticky right-0 bg-background z-10">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Menu className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/refills/${item.authid}`}>
                                                        Open
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm" className="w-full justify-start">
                                                                Delete
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete the refill request.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(item._id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
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

            {selectedItems.length > 0 && (
                <div className="fixed bottom-4 right-4 z-20">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" >
                                <Delete className="mr-2 h-4 w-4" />
                                Delete Selected ({selectedItems.length})
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the selected refill requests.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteSelected}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete Selected
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
        </div>
    );
} 