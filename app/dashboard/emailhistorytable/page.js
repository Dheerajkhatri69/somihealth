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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function EmailHistoryTable() {
  const [emailHistory, setEmailHistory] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [pidSearch, setPidSearch] = useState("");
  const [dateSearch, setDateSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

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
        (dateSearch ?
          item.date.split('T')[0] === dateSearch :
          true) &&
        (item.pname.toLowerCase().includes(nameSearch.toLowerCase()) ||
          item.cname.toLowerCase().includes(nameSearch.toLowerCase()))
    );
    setFilteredData(filtered);
  }, [pidSearch, dateSearch, nameSearch, emailHistory]);

  const truncateMessage = (message, maxLines = 2) => {
    if (!message) return "";
    const lines = message.split('\n');
    if (lines.length <= maxLines) return message;
    return lines.slice(0, maxLines).join('\n') + 'read more..';
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
  };


  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Email History</h2>

      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by PID"
          value={pidSearch}
          onChange={(e) => setPidSearch(e.target.value)}
          className="w-full md:w-1/4"
        />
        <Input
          placeholder="Search by Name (Patient or Clinician)"
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          className="w-full md:w-1/4"
        />
        <div className="w-full md:w-1/4">
          <Input
            type="date"
            id="dateFilter"
            name="dateFilter"
            value={dateSearch}
            onChange={(e) => setDateSearch(e.target.value)}
          />
        </div>
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
              currentRows.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.pid}</TableCell>
                  <TableCell>{item.pname}</TableCell>
                  <TableCell>{item.cid}</TableCell>
                  <TableCell>{item.cname}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell
                    className="cursor-pointer hover:bg-gray-50 whitespace-pre-line max-w-[300px] overflow-hidden"
                    onClick={() => handleMessageClick(item.message)}
                  >
                    {truncateMessage(item.message)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{item.date.split('T')[0]}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Add pagination controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredData.length)} of{" "}
          {filteredData.length} patients
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
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-[80vw] max-h-[80vh]">
          <AlertDialogHeader>
            <AlertDialogTitle>Email Message</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <AlertDialogDescription className="whitespace-pre-line break-words">
              {selectedMessage}
            </AlertDialogDescription>
          </div>
          <AlertDialogFooter>
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="outline"
            >
              Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}