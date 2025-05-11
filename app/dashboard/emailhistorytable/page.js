"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function EmailHistoryTable() {
  const [emailHistory, setEmailHistory] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [pidSearch, setPidSearch] = useState("");
  const [dateSearch, setDateSearch] = useState("");

  // Fetch API data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/emailhis");
        const json = await res.json();
        if (json.success) {
          setEmailHistory(json.result);
          setFilteredData(json.result);
        }
      } catch (err) {
        console.error("Error fetching email history:", err);
      }
    };
    fetchData();
  }, []);

  // Filter logic
  useEffect(() => {
    const filtered = emailHistory.filter(
      (item) =>
        item.pid.toLowerCase().includes(pidSearch.toLowerCase()) &&
        item.date.toLowerCase().includes(dateSearch.toLowerCase())
    );
    setFilteredData(filtered);
  }, [pidSearch, dateSearch, emailHistory]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Email History</h2>

      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by PID"
          value={pidSearch}
          onChange={(e) => setPidSearch(e.target.value)}
          className="w-full md:w-1/3"
        />
        <Input
          placeholder="Search by Date (YYYY-MM-DD)"
          value={dateSearch}
          onChange={(e) => setDateSearch(e.target.value)}
          className="w-full md:w-1/3"
        />
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-secondary text-white">
            <TableRow>
              <TableHead className="text-white">PID</TableHead>
              <TableHead className="text-white">PName</TableHead>
              <TableHead className="text-white">CID</TableHead>
              <TableHead className="text-white">CName</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Message</TableHead>
              <TableHead className="text-white">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.pid}</TableCell>
                  <TableCell>{item.pname}</TableCell>
                  <TableCell>{item.cid}</TableCell>
                  <TableCell>{item.cname}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.message}</TableCell>
                  <TableCell className="whitespace-nowrap">{item.date.split('T')[0]}</TableCell>
                  {/* <TableCell>{item.date}</TableCell> */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
