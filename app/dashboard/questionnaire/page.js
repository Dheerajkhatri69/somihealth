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
import { useEffect, useRef, useState, useMemo } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ButtonGroup from "@/components/ButtonGroup";

export default function Dashboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]);
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 100;
    const checkboxRef = useRef(null);
    const [newlySeenIds, setNewlySeenIds] = useState([]);
    const [newFormsCount, setNewFormsCount] = useState(0);

    // Filters state
    const [filters, setFilters] = useState({
        search: "",
        dateRange: "all",
        glp1Preference: "all",
        sex: "all",
        heardAbout: "all", // NEW filter
    });

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        try {
            const response = await fetch("/api/questionnaire");
            const result = await response.json();
            if (result.success) {
                setData(result.result);

                const unseenItems = result.result.filter((item) => !item.seen);
                if (unseenItems.length > 0) {
                    setNewFormsCount(unseenItems.length);
                    const unseenIds = unseenItems.map((item) => item._id);
                    setNewlySeenIds(unseenIds);

                    // Mark them as seen
                    const markAsSeenResponse = await fetch(
                        "/api/questionnaire/mark-as-seen",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ids: unseenIds }),
                        }
                    );
                    const markAsSeenResult = await markAsSeenResponse.json();
                    if (!markAsSeenResult.success) {
                        toast.error("Could not mark questionnaires as seen.");
                    }
                }
            } else {
                toast.error("Failed to fetch data");
            }
        } catch (error) {
            toast.error("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Build dynamic "Hear about us" options from data
    const heardAboutOptions = useMemo(() => {
        const set = new Set();

        data.forEach((item) => {
            if (!item) return;

            // If user chose "Other" and typed something → use typed value
            if (item.heardAbout === "Other" && item.heardAboutOther) {
                set.add(item.heardAboutOther.trim());
            }
            // Otherwise use the main field (Instagram, Facebook, TikTok, etc.)
            else if (item.heardAbout) {
                set.add(item.heardAbout.trim());
            }
        });

        return Array.from(set);
    }, [data]);

    const filteredData = data.filter((item) => {
        const searchMatch =
            item.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.authid?.toLowerCase().includes(filters.search.toLowerCase());

        const glp1Match =
            filters.glp1Preference === "all" ||
            item.glp1Preference === filters.glp1Preference;

        const sexMatch = filters.sex === "all" || item.sex === filters.sex;

        const createdAt = new Date(item.createTimeDate);
        const now = new Date();
        const diffInDays =
            (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

        const dateMatch =
            filters.dateRange === "all" ||
            (filters.dateRange === "today" &&
                createdAt.toDateString() === now.toDateString()) ||
            (filters.dateRange === "week" && diffInDays <= 7) ||
            (filters.dateRange === "month" && diffInDays <= 30);

        // 🔹 Normalize "hear about us" source:
        // - If "Other" → use heardAboutOther
        // - Else → use heardAbout (Instagram, Facebook, TikTok, etc.)
        const normalizedHeardAbout =
            item.heardAbout === "Other" && item.heardAboutOther
                ? item.heardAboutOther.trim()
                : (item.heardAbout || "").trim();

        const heardMatch =
            filters.heardAbout === "all" ||
            normalizedHeardAbout === filters.heardAbout;

        return searchMatch && glp1Match && sexMatch && dateMatch && heardMatch;
    });

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedItems(filteredData.map((item) => item._id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (id) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const handleDelete = async (id) => {
        try {
            const item = data.find((item) => item._id === id);
            if (!item) {
                toast.error("Questionnaire not found");
                return;
            }

            const response = await fetch("/api/questionnaire", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ authids: [item.authid] }),
            });

            const result = await response.json();
            if (result.success) {
                setData((prev) => prev.filter((item) => item._id !== id));
                toast.success("Questionnaire deleted successfully");
            } else {
                console.error("Delete failed:", result);
                toast.error(result.message || "Failed to delete questionnaire");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Error deleting questionnaire");
        }
    };

    const handleDeleteSelected = async () => {
        try {
            const selectedAuthIds = data
                .filter((item) => selectedItems.includes(item._id))
                .map((item) => item.authid);

            if (selectedAuthIds.length === 0) {
                toast.error("No questionnaires selected");
                return;
            }

            const response = await fetch("/api/questionnaire", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ authids: selectedAuthIds }),
            });

            const result = await response.json();
            if (result.success) {
                setData((prev) =>
                    prev.filter((item) => !selectedItems.includes(item._id))
                );
                setSelectedItems([]);
                toast.success("Selected questionnaires deleted successfully");
            } else {
                console.error("Bulk delete failed:", result);
                toast.error(result.message || "Failed to delete selected questionnaires");
            }
        } catch (error) {
            console.error("Bulk delete error:", error);
            toast.error("Error deleting selected questionnaires");
        }
    };

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

    return (
        <div className="overflow-x-auto px-4">
            {/* 🔹 Filters row */}
            <ButtonGroup />
            <div className="flex flex-wrap gap-2 mb-4">
                <Input
                    placeholder="Search by name, email, or ID..."
                    className="max-w-xs"
                    value={filters.search}
                    onChange={(e) =>
                        setFilters((prev) => ({ ...prev, search: e.target.value }))
                    }
                />

                {/* GLP-1 Preference filter */}
                <Select
                    value={filters.glp1Preference}
                    onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, glp1Preference: value }))
                    }
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="GLP-1 Preference" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Semaglutide">Semaglutide</SelectItem>
                        <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
                        <SelectItem value="Lipotropic MIC +B12">Lipotropic MIC +B12</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sex filter */}
                <Select
                    value={filters.sex}
                    onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, sex: value }))
                    }
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>

                {/* Date range filter */}
                <Select
                    value={filters.dateRange}
                    onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, dateRange: value }))
                    }
                >
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

                {/* 🔹 Hear About Us filter (dynamic) */}
                <Select
                    value={filters.heardAbout}
                    onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, heardAbout: value }))
                    }
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Hear about us" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Hear about us (All)</SelectItem>
                        {heardAboutOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                                {opt}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border bg-background/50">
                {loading ? (
                    <div className="rounded-md border bg-background/50">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[...Array(12)].map((_, i) => (
                                        <TableHead key={i}>
                                            <Skeleton className="h-8 w-full" />
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(12)].map((_, j) => (
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
                    <>
                        {newFormsCount > 0 && (
                            <div className="mb-4 text-center text-green-700 bg-green-100 p-2 rounded-md">
                                You have {newFormsCount} new patient forms.
                            </div>
                        )}
                        <Table>
                            <TableHeader className="bg-secondary">
                                <TableRow className="hover:bg-secondary/80">
                                    <TableHead className="w-[50px] text-white sticky left-0 bg-secondary z-10">
                                        <Checkbox
                                            ref={checkboxRef}
                                            checked={
                                                selectedItems.length === filteredData.length &&
                                                filteredData.length > 0
                                            }
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="text-white sticky left-[25px] bg-secondary z-10">
                                        Date
                                    </TableHead>
                                    <TableHead className="text-white sticky left-[105px] bg-secondary whitespace-nowrap z-10">
                                        AUTH ID
                                    </TableHead>
                                    <TableHead className="text-white whitespace-nowrap">
                                        First Name
                                    </TableHead>
                                    <TableHead className="text-white whitespace-nowrap">
                                        Last Name
                                    </TableHead>
                                    <TableHead className="text-white whitespace-nowrap">
                                        DOB
                                    </TableHead>
                                    <TableHead className="text-white whitespace-nowrap">
                                        Sex
                                    </TableHead>
                                    <TableHead className="text-white whitespace-nowrap">
                                        Email
                                    </TableHead>
                                    <TableHead className="text-white whitespace-nowrap">
                                        Phone
                                    </TableHead>
                                    <TableHead className="text-white whitespace-nowrap">
                                        GLP-1 Preference
                                    </TableHead>
                                    <TableHead className="text-white sticky right-0 bg-secondary z-10">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentRows.map((item) => (
                                    <TableRow
                                        key={item._id}
                                        className={
                                            newlySeenIds.includes(item._id)
                                                ? "bg-green-100 hover:bg-green-200"
                                                : "hover:bg-muted/50"
                                        }
                                    >
                                        <TableCell className="sticky left-0 bg-background z-10">
                                            <Checkbox
                                                checked={selectedItems.includes(item._id)}
                                                onCheckedChange={() => handleSelectItem(item._id)}
                                            />
                                        </TableCell>
                                        <TableCell className="sticky left-[25px] bg-background z-10 whitespace-nowrap">
                                            {new Date(item.createTimeDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="sticky left-[105px] bg-background z-10 whitespace-nowrap">
                                            {item.authid}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {item.firstName}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {item.lastName}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {item.dateOfBirth
                                                ? new Date(item.dateOfBirth).toLocaleDateString()
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {item.sex}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {item.email}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {item.phone}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {item.glp1Preference}
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
                                                        <Link href={`/dashboard/questionnaire/${item.authid}`}>
                                                            Open
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="w-full justify-start"
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        Are you absolutely sure?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will
                                                                        permanently delete the questionnaire.
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
                    </>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Showing {indexOfFirstRow + 1}-
                    {Math.min(indexOfLastRow, filteredData.length)} of{" "}
                    {filteredData.length} questionnaires
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Floating bulk delete button */}
            {selectedItems.length > 0 && (
                <div className="fixed bottom-4 right-4 z-20">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Delete className="mr-2 h-4 w-4" />
                                Delete Selected ({selectedItems.length})
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the
                                    selected questionnaires.
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
