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
import AbandonmentRefillButtonGroup from "@/components/AbandonmentRefillButtonGroup";

const DashboardStats = () => {
  const [chartData, setChartData] = useState([]);
  const [selectedState, setSelectedState] = useState(0);
  const [timeRange, setTimeRange] = useState("7d");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ⭐ NEW SEEN STATES
  const [newlySeenIds, setNewlySeenIds] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const [newStateCounts, setNewStateCounts] = useState({ 0: 0, 1: 0 });

  const recordsPerPage = 100;

  // ===========================
  // 1. FETCH DATA
  // ===========================
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const res = await fetch("/api/followup/abandoned");
      const { result } = await res.json();

      const transformed = result.map((item) => ({
        id: item._id,
        seen: item.seen,
        date: item.updatedAt,
        state: item.state,
        segment: item.lastSegmentReached,
        email: item.firstSegment?.email || "",
        name: `${item.firstSegment?.firstName || ""} ${item.firstSegment?.lastName || ""
          }`.trim(),
        phone: item.firstSegment?.phone || "",
      }));

      setChartData(transformed);

      // ⭐ NEW CALCULATIONS
      const newLeave = transformed.filter(
        (item) => item.seen === true && item.state === 0
      );
      const newKick = transformed.filter(
        (item) => item.seen === true && item.state === 1
      );

      const ids = [...newLeave, ...newKick].map((i) => i.id);

      setNewlySeenIds(ids);
      setNewCount(ids.length);
      setNewStateCounts({
        0: newLeave.length,
        1: newKick.length,
      });

      setLoading(false);
    }

    fetchData();
  }, []);

  // ===========================
  // 2. MARK ALL AS SEEN FALSE (same as your example)
  // ===========================
  useEffect(() => {
    (async () => {
      try {
        await fetch(
          "/api/followup/abandoned/mark-seen?states=0,1&seen=false",
          { method: "POST" }
        );
      } finally {
        window.dispatchEvent(new Event("refreshSidebarCounts"));
      }
    })();
  }, []);

  // ===========================
  // 3. FILTER LOGIC
  // ===========================
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

  // search
  const term = searchTerm.toLowerCase();
  const searchFilteredData = term
    ? dateFilteredData.filter((item) => {
      const n = item.name.toLowerCase();
      const e = item.email.toLowerCase();
      const p = item.phone.toLowerCase();
      return n.includes(term) || e.includes(term) || p.includes(term);
    })
    : dateFilteredData;

  // state
  const filtered = searchFilteredData.filter(
    (d) => d.state === selectedState
  );

  const pageCount = Math.ceil(filtered.length / recordsPerPage) || 1;
  const paginatedData = filtered.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const counts = {
    leaveBetween: dateFilteredData.filter((d) => d.state === 0).length,
    kickedOut: dateFilteredData.filter((d) => d.state === 1).length,
    filled: dateFilteredData.filter((d) => d.state === 2).length,
  };

  const currentStateNewCount =
    selectedState === 0 || selectedState === 1
      ? newStateCounts[selectedState] || 0
      : 0;

  return (
    <div>
      <div className="px-4">
        <AbandonmentRefillButtonGroup />
      </div>

      <Card className="m-4 p-4">
        {/* ================================
          TOP FILTERS + SEARCH
       ================================ */}
        <div className="flex items-center justify-between gap-3 mb-4">
          {!loading ? (
            <>
              <Input
                placeholder="Search by name, phone, or email…"
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
          ) : (
            <>
              <Skeleton className="w-[260px] h-10 rounded-md" />
              <Skeleton className="w-[160px] h-10 rounded-md" />
            </>
          )}
        </div>

        {/* ======================================
          GREEN BANNER for Total New
       ====================================== */}
        {!loading && newCount > 0 && (
          <div className="mb-4 text-center text-green-700 bg-green-100 p-2 rounded-md">
            You have {newCount} new abandonment records.
          </div>
        )}

        {/* ======================================
          STATE CARDS (with green badges)
       ====================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[100px] w-full rounded-xl" />
            ))
            : [0, 1, 2].map((state) => {
              const isSelected = selectedState === state;
              const newCountForState =
                state === 0 || state === 1
                  ? newStateCounts[state] || 0
                  : 0;

              return (
                <Card
                  key={state}
                  onClick={() => setSelectedState(state)}
                  className={`relative cursor-pointer shadow hover:shadow-md
                    ${state === 0 ? "bg-yellow-200" : ""}
                    ${state === 1 ? "bg-red-200" : ""}
                    ${state === 2 ? "bg-green-200" : ""}
                    ${isSelected ? "border-l-8 border-secondary" : ""}`}
                >
                  {(state === 0 || state === 1) &&
                    newCountForState > 0 && (
                      <span
                        className="
                          absolute -top-1 -right-1
                          h-6 w-6 rounded-full
                          bg-green-500 text-white text-xs font-bold
                          border-2 border-white
                          flex items-center justify-center
                          shadow-md
                        "
                      >
                        {newCountForState}
                      </span>
                    )}

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
              );
            })}
        </div>

        {/* ======================================
          TABLE
       ====================================== */}
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
                {!loading &&
                  paginatedData.map((user) => (
                    <tr
                      key={user.id}
                      className={
                        newlySeenIds.includes(user.id)
                          ? "bg-green-100 hover:bg-green-200"
                          : "hover:bg-muted/50"
                      }
                    >
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

                {loading &&
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="border-b">
                      <td colSpan={5} className="px-4 py-2">
                        <Skeleton className="h-10 w-full rounded-md" />
                      </td>
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

          {/* PAGINATION */}
          <div className="flex justify-between items-center pt-4">
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md bg-secondary text-white disabled:opacity-50"
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {pageCount}
            </span>

            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, pageCount))
              }
              disabled={currentPage === pageCount}
              className="px-4 py-2 border rounded-md bg-secondary text-white disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
