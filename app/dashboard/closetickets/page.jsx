"use client";
import { History, Trash, ArrowUpDown, Search, Delete } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import toast from 'react-hot-toast';
const Page = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [restoreMessage, setRestoreMessage] = useState(null);

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  // Fetch patients from the API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch('/api/patients');
        const data = await res.json();
        if (data.success) {
          setPatients(data.result.filter(p => p.closetickets)); // Only show closed tickets
        }
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      }
    };

    fetchPatients();
  }, []);

  // Search functionality
  const filteredPatients = patients.filter(patient =>
    patient.authid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting functionality
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (!sortColumn) return 0;
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleCheckboxChange = (authid) => {
    setSelectedPatients(prev =>
      prev.includes(authid)
        ? prev.filter(id => id !== authid)
        : [...prev, authid]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedPatients(checked ? patients.map(p => p.authid) : []);
  };

  const handleRestore = async (authid) => {
    try {
      const response = await fetch('/api/patients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authid, closetickets: false, Reasonclosetickets: '' }),
      });

      if (!response.ok) throw new Error('Failed to restore patient');

      // Show success message
      toast.success("Ticket Restored, Go to dashboard", {
        description: "The ticket has been successfully restored.",
      });
      // Update the UI by removing the restored patient
      setPatients(prev => prev.filter(p => p.authid !== authid));

      return true;
    } catch (err) {
      console.error("Restore error:", err);
      toast.error("Failed to restore ticket", {
        description: err.message || "An error occurred while restoring the ticket.",
      });
      return false;
    }
  };

  // For restoring multiple patients
  const handleRestoreSelected = async () => {
    if (selectedPatients.length === 0) return;

    try {
      const restorePromises = selectedPatients.map(authid => handleRestore(authid));
      const results = await Promise.all(restorePromises);
      const allSuccess = results.every(success => success);

      if (allSuccess) {
        toast.success(`${selectedPatients.length} Tickets Restored`, {
          description: "The selected tickets have been successfully restored. Go to dashboard",
        });
        setPatients(prev => prev.filter(p => !selectedPatients.includes(p.authid)));
        setSelectedPatients([]);
        setSelectAll(false);
      }
    } catch (error) {
      console.error("Error restoring multiple patients:", error);
      toast.error("Failed to restore tickets", {
        description: error.message || "An error occurred while restoring the tickets.",
      });
    }
  };
  const handleDelete = async (authid) => {
    try {
      const response = await fetch('/api/patients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authids: [authid] }),
      });

      const data = await response.json();

      if (data.success) {
        setPatients(prev => prev.filter(p => p.authid !== authid));
        return true;
      } else {
        throw new Error(data.result.message || 'Failed to delete patient');
      }
    } catch (err) {
      console.error("Delete error:", err);
      return false;
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPatients.length === 0) return;

    try {
      const response = await fetch('/api/patients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authids: selectedPatients }),
      });

      const data = await response.json();

      if (data.success) {
        setPatients(prev => prev.filter(p => !selectedPatients.includes(p.authid)));
        setSelectedPatients([]);
        setSelectAll(false);
      } else {
        throw new Error(data.result.message || 'Failed to delete selected patients');
      }
    } catch (error) {
      console.error("Error deleting multiple patients:", error);
    }
  };
  const totalPages = Math.ceil(sortedPatients.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedPatients.slice(indexOfFirstRow, indexOfLastRow);
  return (
    <div className="rounded-md border bg-background/50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className='text-lg flex gap-1'><Trash />Close tickets</h1>
        <div className="relative w-64">
          <Input
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="flex justify-start gap-2 items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestoreSelected}  // Changed to use the new function
        >
          <History className="mr-2 h-4 w-4" />
          Restore Selected
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Delete className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the selected patients from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSelected}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-secondary text-white">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                className="h-4 w-4 bg-white"
              />
            </TableHead>

            <TableHead className="bg-secondary text-white">
              <Button
                variant="ghost"
                className="p-0 text-white hover:text-white/80"
                onClick={() => handleSort('authid')}
              >
                AUTH ID
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>

            <TableHead className="bg-secondary text-white">
              Name
            </TableHead>

            <TableHead>
              <Button
                variant="ghost"
                className="p-0 text-current hover:text-current/80"
                onClick={() => handleSort('email')}
              >
                Email
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>

            <TableHead>Reason Close ticket</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="bg-secondary text-white">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {currentRows.map((patient) => (
            <TableRow key={patient.authid}>
              <TableCell className="bg-white">
                <Checkbox
                  checked={selectedPatients.includes(patient.authid)}
                  onCheckedChange={() => handleCheckboxChange(patient.authid)}
                  className="h-4 w-4"
                />
              </TableCell>

              <TableCell className="bg-white font-medium">
                {patient.authid}
              </TableCell>

              <TableCell className="bg-white">
                {`${patient.firstName} ${patient.lastName}`}
              </TableCell>

              <TableCell>{patient.email}</TableCell>

              <TableCell>{patient.Reasonclosetickets}</TableCell>

              <TableCell>
                <span className={`px-2 py-1 rounded ${patient.approvalStatus === 'approved'
                  ? 'bg-green-200 text-green-800'
                  : 'bg-yellow-200 text-yellow-800'
                  }`}>
                  {patient.approvalStatus}
                </span>
              </TableCell>

              <TableCell className="bg-white">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(patient.authid)}
                >
                  <History className="mr-2 h-4 w-4" />
                  Restore
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Delete className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the patient from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(patient.authid)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add pagination controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, sortedPatients.length)} of{" "}
          {sortedPatients.length} patients
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
};

export default Page;