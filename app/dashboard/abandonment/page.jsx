"use client";

import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
    import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DashboardStats = () => {
    const [chartData, setChartData] = useState([]);
    const [selectedState, setSelectedState] = useState(0);
    const [timeRange, setTimeRange] = useState("7d");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const recordsPerPage = 100;

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const res = await fetch("/api/abandoned");
            const { result } = await res.json();

            const transformed = result.map((item) => ({
                date: item.updatedAt,
                state: item.state,
                segment: item.lastSegmentReached,
                email: item.firstSegment?.email || "",
                name: `${item.firstSegment?.firstName || ""} ${item.firstSegment?.lastName || ""}`,
                phone: item.firstSegment?.phone || "",
            }));

            setChartData(transformed);
            setLoading(false);
        }

        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedState, timeRange, searchTerm]);

    const getFilteredDataByDate = () => {
        if (timeRange === "all") return chartData;

        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return chartData.filter((item) => new Date(item.date) >= cutoff);
    };

    const dateFilteredData = getFilteredDataByDate();

    const searchFilteredData = dateFilteredData.filter((item) => {
        const term = searchTerm.toLowerCase();
        return (
            item.name.toLowerCase().includes(term) ||
            item.email.toLowerCase().includes(term) ||
            item.phone.toLowerCase().includes(term)
        );
    });

    const filtered = searchFilteredData.filter((d) => d.state === selectedState);
    const pageCount = Math.ceil(filtered.length / recordsPerPage);
    const paginatedData = filtered.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const counts = {
        leaveBetween: dateFilteredData.filter((d) => d.state === 0).length,
        kickedOut: dateFilteredData.filter((d) => d.state === 1).length,
        filled: dateFilteredData.filter((d) => d.state === 2).length,
    };

    return (
        <Card className="m-4 p-4">
            {/* Filter Dropdown */}
            <div className="flex justify-between mb-4">
                {loading ? (
                    <>
                        <Skeleton className="w-[160px] h-10 rounded-md" />
                        <Skeleton className="w-[260px] h-10 rounded-md" />
                    </>
                ) : (
                    <>
                        <Input
                            placeholder="Search by name, Phone number, or email..."
                            className="max-w-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Filter Days" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                                <SelectItem value="all">All Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </>
                )}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-[100px] w-full rounded-xl" />
                    ))
                    : [0, 1, 2].map((state) => (
                        <Card
                            key={state}
                            onClick={() => setSelectedState(state)}
                            className={`cursor-pointer shadow hover:shadow-md ${state === 0 ? "bg-yellow-200" : ""} ${state === 1 ? "bg-red-200" : ""} ${state === 2 ? "bg-green-200" : ""} ${selectedState === state ? "border-l-8 border-secondary" : ""
                                }`}
                        >
                            <CardHeader className="text-center">
                                <CardTitle>
                                    {state === 0
                                        ? "LEAVE BETWEEN"
                                        : state === 1
                                            ? "KICKED OUT"
                                            : "FILLED"}
                                </CardTitle>
                                <CardDescription className="text-3xl font-bold text-secondary">
                                    {state === 0
                                        ? counts.leaveBetween
                                        : state === 1
                                            ? counts.kickedOut
                                            : counts.filled}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
            </div>

            {/* Table */}
            <CardContent className="p-0">
                <div className="overflow-x-auto border border-secondary rounded-lg">
                    <table className="min-w-full table-auto text-sm text-left">
                        <thead className="bg-secondary border-b text-white">
                            <tr>
                                <th className="px-4 py-2">FULL NAME</th>
                                <th className="px-4 py-2">EMAIL</th>
                                <th className="px-4 py-2">NUMBER</th>
                                <th className="px-4 py-2">DATE AND TIME</th>
                                <th className="px-4 py-2">SEGMENT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? Array.from({ length: 3 }).map((_, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td colSpan={5} className="px-4 py-2">
                                            <Skeleton className="h-10 w-full rounded-md" />
                                        </td>
                                    </tr>
                                ))
                                : paginatedData.map((user, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td className="px-4 py-2">{user.name}</td>
                                        <td className="px-4 py-2">{user.email}</td>
                                        <td className="px-4 py-2">{user.phone}</td>
                                        <td className="px-4 py-2">
                                            {new Date(user.date).toLocaleString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </td>
                                        <td className="px-4 py-2">{user.segment}</td>
                                    </tr>
                                ))}
                            {!loading && paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-4">
                                        No data found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center pt-4">
                    {loading ? (
                        <>
                            <Skeleton className="h-10 w-[100px] rounded-md" />
                            <Skeleton className="h-5 w-[80px] rounded-md" />
                            <Skeleton className="h-10 w-[100px] rounded-md" />
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-md bg-secondary text-white disabled:opacity-50"
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {pageCount}
                            </span>
                            <Button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
                                disabled={currentPage === pageCount}
                                className="px-4 py-2 border rounded-md bg-secondary text-white disabled:opacity-50"
                            >
                                Next
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default DashboardStats;
