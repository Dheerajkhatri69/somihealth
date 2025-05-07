"use client";
import { History, Trash, ArrowUpDown, Search, Delete } from 'lucide-react';
import React, { useState } from 'react';
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

// Sample data
const patients = [
  {
    patientId: "P001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    status: "Active",
    lastActivity: "2024-03-15",
    approvalStatus: "pending"
  },
  {
    patientId: "P002",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    status: "Inactive",
    lastActivity: "2024-03-14",
    approvalStatus: "approved"
  }
];

const Page = () => {
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Search functionality
  const filteredPatients = patients.filter(patient =>
    patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const handleCheckboxChange = (patientId) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedPatients(checked ? patients.map(p => p.patientId) : []);
    setSelectAll(checked);
  };

  const handleRestore = (patientId) => {
    console.log('Restoring patient:', patientId);
    // Add your restore logic here
  };

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
          onClick={() => handleRestore(patient.patientId)}
        >
          <History className="mr-2 h-4 w-4" />
          Restore Selected
        </Button>
        <Button
          variant="destructive"
          size="sm"
        // onClick={() => handleRestore(patient.patientId)}
        >
          <Delete className="mr-2 h-4 w-4" />
          Delete Selected
        </Button>
      </div>

      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-10 bg-secondary text-white">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                className="h-4 w-4 bg-white"
              />
            </TableHead>

            <TableHead className="sticky left-[40px] z-10 bg-secondary text-white">
              <Button
                variant="ghost"
                className="p-0 text-white hover:text-white/80"
                onClick={() => handleSort('patientId')}
              >
                AUTH ID
                <ArrowUpDown className="ml-2 h-4 w-4" />
                {sortColumn === 'patientId' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </Button>
            </TableHead>

            <TableHead className="sticky left-[160px] z-10 bg-secondary text-white">
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
                {sortColumn === 'email' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </Button>
            </TableHead>

            <TableHead>Status</TableHead>
            <TableHead className="sticky right-0 bg-secondary text-white">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedPatients.map((patient) => (
            <TableRow key={patient.patientId}>
              <TableCell className="sticky left-0 z-10 bg-white">
                <Checkbox
                  checked={selectedPatients.includes(patient.patientId)}
                  onCheckedChange={() => handleCheckboxChange(patient.patientId)}
                  className="h-4 w-4"
                />
              </TableCell>

              <TableCell className="sticky left-[40px] z-10 bg-white font-medium">
                {patient.patientId}
              </TableCell>

              <TableCell className="sticky left-[160px] z-10 bg-white">
                {`${patient.firstName} ${patient.lastName}`}
              </TableCell>

              <TableCell>{patient.email}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded ${patient.approvalStatus === 'approved'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-yellow-200 text-yellow-800'
                  }`}>
                  {patient.approvalStatus}
                </span>
              </TableCell>

              <TableCell className="sticky right-0 bg-white">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(patient.patientId)}
                >
                  <History className="mr-2 h-4 w-4" />
                  Restore
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                // onClick={() => handleRestore(patient.patientId)}
                >
                  <Delete className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Page;