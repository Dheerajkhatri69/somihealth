"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCaption,
    TableHeader,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { ArrowDownNarrowWide, Menu, Plus, StepBack, StepForward, Timer } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
// import { patients } from "../../public/patientsdata";
import { Checkbox } from "@/components/ui/checkbox";
import { ClinicianDropdown } from "@/components/clinicianDropdown";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { EmailDialog } from "@/components/emailDialog";
import TimeSensitiveCell from "@/components/timer";
import { Skeleton } from "@/components/ui/skeleton";
import { DiagnosisCell } from "@/components/diagnosisCell";
import { ClinicianStatusBadge } from "@/components/clinicianStatusBadge";

export default function Dashboard() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [Cloading, setCLoading] = useState(true);
    const [Tloading, setTLoading] = useState(true);
    const [ticketFilter, setTicketFilter] = useState('assigned'); // 'all' or 'assigned'
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 100;


    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [deleteReason, setDeleteReason] = useState("");

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                // Fetch all patients first
                const patientsRes = await fetch("/api/patients");
                const patientsData = await patientsRes.json();

                if (!patientsData.success) {
                    console.error("Error fetching patients:", patientsData.result.message);
                    return;
                }

                // Filter active patients (closetickets === false)
                let activePatients = patientsData.result.filter(patient => patient.closetickets === false);

                // If user is a clinician, filter only their assigned patients
                // For clinicians, apply additional filtering based on ticketFilter state
                if (session?.user?.accounttype === 'C') {
                    const assigningRes = await fetch("/api/assigning");
                    const assigningData = await assigningRes.json();

                    if (assigningData.success) {
                        const clinicianAssignments = assigningData.result.filter(
                            assignment => assignment.cid === session.user.id
                        );
                        const assignedPids = clinicianAssignments.map(item => item.pid);

                        if (ticketFilter === 'assigned') {
                            activePatients = activePatients.filter(patient =>
                                assignedPids.includes(patient.authid)
                            );
                        }
                        setCLoading(false);
                    } else {
                        console.error("Error fetching assignments:", assigningData.result.message);
                    }
                }
                // If user is a technician, filter only patients they created
                else if (session?.user?.accounttype === 'T') {
                    const creatorRes = await fetch("/api/creatorofp");
                    const creatorData = await creatorRes.json();

                    if (creatorData.success) {
                        // Filter creator records for this technician
                        const technicianCreations = creatorData.result.filter(
                            record => record.tid === session.user.id
                        );
                        // Get list of patient IDs created by this technician
                        const createdPids = technicianCreations.map(item => item.pid);
                        // Filter patients to only those created by this technician
                        activePatients = activePatients.filter(patient =>
                            createdPids.includes(patient.authid)
                        );
                        setTLoading(false);
                    } else {
                        console.error("Error fetching creator records:", creatorData.result.message);
                    }
                }

                setPatients(activePatients);
            } catch (err) {
                console.error("Fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, [session, ticketFilter]); // Add session to dependency array

    useEffect(() => {
        console.log("dashboard Session user:", session?.user?.accounttype);
    }, [session]);

    const [selectedEmail, setSelectedEmail] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPatients, setSelectedPatients] = useState([]);

    // Add this state at the top
    const [selectAll, setSelectAll] = useState(false);
    const checkboxRef = useRef(null);

    const [selectedPatientData, setSelectedPatientData] = useState(null);

    useEffect(() => {
        if (selectedPatients.length > 0) {
            const selectedPatient = patients.find(p => p.authid === selectedPatients[0]);

            if (selectedPatient) {
                setSelectedEmail(selectedPatient.email || '');
                setSelectedPatientData(selectedPatient); // store full patient info
            }
        } else {
            setSelectedEmail('');
            setSelectedPatientData(null);
        }
    }, [selectedPatients, patients]);

    // const [deleteReason, setDeleteReason] = useState("");

    const [selectedImage, setSelectedImage] = useState(null);
    // State for filters
    const [emailFilter, setEmailFilter] = useState('');
    const [pIdFilter, setPIdFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('all');
    const [dobFilter, setDobFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [medicineFilter, setMedicineFilter] = useState('all');
    const [approvalFilter, setApprovalFilter] = useState('all');

    const [semaglutideDoseOnly, setSemaglutideDoseOnly] = useState('all');
    const [semaglutideUnitFilter, setSemaglutideUnitFilter] = useState('all');
    const [tirzepatideDoseOnly, setTirzepatideDoseOnly] = useState('all');
    const [tirzepatideUnitFilter, setTirzepatideUnitFilter] = useState('all');
    const [createDateFilter, setCreateDateFilter] = useState("");
    const [selectedImageInfo, setSelectedImageInfo] = useState(null);

    const [selectedStatus, setSelectedStatus] = useState('all');

    // Add this status counter function
    const getStatusCounts = (patients) => {
        return {
            all: patients.length,
            awaiting: patients.filter(p => !p.approvalStatus || p.approvalStatus === 'None').length,
            approved: patients.filter(p => p.approvalStatus === 'approved').length,
            pending: patients.filter(p => p.approvalStatus === 'pending').length,
            denied: patients.filter(p => p.approvalStatus === 'denied').length,
            disqualified: patients.filter(p => p.approvalStatus === 'disqualified').length,
        };
    };
    const filteredPatients = patients.filter(patient => {
        const emailMatch = patient.email.toLowerCase().includes(emailFilter.toLowerCase());
        // const pIdMatch = patient.patientId.toLowerCase().includes(pIdFilter.toLowerCase());
        const pIdMatch = patient.authid.toLowerCase().includes(pIdFilter.toLowerCase());
        const genderMatch = genderFilter === 'all' || patient.sex === genderFilter;
        const dobMatch = dobFilter ? patient.dob === dobFilter : true;
        const cityMatch = cityFilter ? patient.city.toLowerCase().includes(cityFilter.toLowerCase()) : true;
        const medicineMatch = medicineFilter === 'all' || patient.glp1 === medicineFilter;

        // const approvalMatch = approvalFilter === 'all' || patient.approvalStatus === approvalFilter;
        const approvalMatch =
            approvalFilter === 'all' ||
            (approvalFilter === '' && (patient.approvalStatus === '' || patient.approvalStatus === 'None')) ||
            patient.approvalStatus === approvalFilter;

        const semaglutideMatch = (
            (semaglutideDoseOnly === 'all' || patient.semaglutideDose == semaglutideDoseOnly) &&
            (semaglutideUnitFilter === 'all' || patient.semaglutideUnit === semaglutideUnitFilter)
        );

        const tirzepatideMatch = (
            (tirzepatideDoseOnly === 'all' || patient.tirzepatideDose == tirzepatideDoseOnly) &&
            (tirzepatideUnitFilter === 'all' || patient.tirzepatideUnit === tirzepatideUnitFilter)
        );

        const createDateMatch = createDateFilter ? patient.createTimeDate.split('T')[0] === createDateFilter : true;
        return emailMatch && pIdMatch && genderMatch && dobMatch && cityMatch &&
            medicineMatch && semaglutideMatch && tirzepatideMatch && approvalMatch && createDateMatch;
    });

    const statusCounts = getStatusCounts(filteredPatients);

    const handleCheckboxChange = (patientId) => {
        setSelectedPatients(prev =>
            prev.includes(patientId)
                ? prev.filter(id => id !== patientId)
                : [...prev, patientId]
        );
    };

    // Add this effect for indeterminate state
    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate =
                selectedPatients.length > 0 &&
                selectedPatients.length < filteredPatients.length;
        }
    }, [selectedPatients, filteredPatients]);
    // Add select all handler
    const handleSelectAll = (checked) => {
        if (checked) {
            const allFilteredIds = filteredPatients.map(p => p.authid);
            setSelectedPatients(allFilteredIds);
        } else {
            setSelectedPatients([]);
        }
        setSelectAll(checked);
    };

    const handleDelete = async (authid, reason) => {
        try {
            const res = await fetch("/api/patients", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    authid,
                    closetickets: true,
                    Reasonclosetickets: reason,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Patient moved to Closed Tickets");

                // Remove from table UI immediately
                setPatients(prev =>
                    prev.filter(patient => patient.authid !== authid)
                );
            } else {
                toast.error(data.result.message || "Failed to close ticket");
            }
        } catch (err) {
            toast.error("Error: " + err.message);
        }
    };

    const [selectedMessage, setSelectedMessage] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');

    // Add this array of predefined messages
    const preDefinedMessages = [
        {
            title: 'Appointment Reminder',
            content: 'Dear Patient,\n\nThis is a reminder about your upcoming appointment on...'
        },
        {
            title: 'Test Results',
            content: 'Dear Patient,\n\nYour recent test results are now available...'
        },
        {
            title: 'Prescription Refill',
            content: 'Dear Patient,\n\nYour prescription refill has been approved...'
        }
    ];
    const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredPatients.slice(indexOfFirstRow, indexOfLastRow);
    if (session?.user?.accounttype === 'C' && Cloading) {
        return (
            <div className="overflow-x-auto p-4 space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                    <Skeleton className="h-10 w-[200px]" />
                    <Skeleton className="h-10 w-[200px]" />
                    <Skeleton className="h-10 w-[180px]" />
                </div>
                <div className="rounded-md border bg-background/50">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[...Array(10)].map((_, i) => (
                                    <TableHead key={i}>
                                        <Skeleton className="h-6 w-full" />
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(10)].map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    } else if (session?.user?.accounttype === 'T' && Tloading) {
        return (
            <div className="overflow-x-auto p-4 space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                    <Skeleton className="h-10 w-[200px]" />
                    <Skeleton className="h-10 w-[200px]" />
                    <Skeleton className="h-10 w-[180px]" />
                </div>
                <div className="rounded-md border bg-background/50">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[...Array(10)].map((_, i) => (
                                    <TableHead key={i}>
                                        <Skeleton className="h-6 w-full" />
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(10)].map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }
    return (
        <div className="overflow-x-auto p-4">
            <div className="flex flex-wrap gap-2 mb-4">
                {session?.user?.accounttype === 'C' && (
                    <Select value={ticketFilter} onValueChange={setTicketFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter Tickets" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="assigned">My Assigned Tickets</SelectItem>
                            <SelectItem value="all">All Tickets</SelectItem>
                        </SelectContent>
                    </Select>
                )}
                <Input
                    placeholder="Filter Patient Id..."
                    className="max-w-xs"
                    value={pIdFilter}
                    onChange={(e) => setPIdFilter(e.target.value)}
                />
                <Input
                    placeholder="Filter emails..."
                    className="max-w-sm"
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                />
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Genders</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex flex-nowrap items-center gap-2 rounded-md justify-center">
                    {/* <label className="text-sm font-medium px-2 whitespace-nowrap">Created Date</label> */}
                    <input
                        type="date"
                        value={createDateFilter}
                        onChange={(e) => setCreateDateFilter(e.target.value)}
                        className="w-full border rounded bg-secondary text-white border-none  h-9"
                    />
                    <Button className="bg-secondary hover:bg-secondary-foreground h-full"
                        type="button"
                        onClick={() => setCreateDateFilter("")}
                    >
                        Clear
                    </Button>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="flex items-center justify-between gap-2 px-4 py-2 w-40 h-9 text-white bg-secondary border border-border rounded-md hover:bg-secondary-foreground transition"
                    >
                        <span>Filters</span>
                        <ArrowDownNarrowWide className="w-4 h-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-64 p-2 space-y-2 h-[300px]">
                        <DropdownMenuLabel>All Filters</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* Date of Birth Filter */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium px-2">Date of Birth</label>
                            <input
                                type="date"
                                value={dobFilter}
                                onChange={(e) => setDobFilter(e.target.value)}
                                className="w-full p-1 border rounded"
                            />
                        </div>
                        {/* status Filter */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium px-2">Status</label>
                            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="denied">Denied</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="disqualified">Disqualified</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* City Filter */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium px-2">City</label>
                            <input
                                type="text"
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                placeholder="Enter city"
                                className="w-full p-1 border rounded"
                            />
                        </div>

                        {/* Medicine Filter */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium px-2">Medicine</label>
                            <Select value={medicineFilter} onValueChange={setMedicineFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Medicine" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="Semaglutide">Semaglutide</SelectItem>
                                    <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Semaglutide Dose Filter */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium px-2">Semaglutide Dose</label>
                            <div className="flex gap-2">
                                <Select value={semaglutideDoseOnly} onValueChange={setSemaglutideDoseOnly}>
                                    <SelectTrigger className="w-1/2">
                                        <SelectValue placeholder="Dose" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="0.25">0.25 mg</SelectItem>
                                        <SelectItem value="0.50">0.50 mg</SelectItem>
                                        <SelectItem value="1.0">1 mg</SelectItem>
                                        <SelectItem value="1.7">1.7 mg</SelectItem>
                                        <SelectItem value="2.0">2.0 mg</SelectItem>
                                        <SelectItem value="2.5">2.5 mg</SelectItem>
                                        <SelectItem value="None">None</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={semaglutideUnitFilter} onValueChange={setSemaglutideUnitFilter}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="1.00 mg/2mL">1.00 mg/2mL</SelectItem>
                                        <SelectItem value="2.00 mg/2mL">2.00 mg/2mL</SelectItem>
                                        <SelectItem value="4.00 mg/2mL">4.00 mg/2mL</SelectItem>
                                        <SelectItem value="6.80 mg/2mL">6.80 mg/2mL</SelectItem>
                                        <SelectItem value="10.00 mg/2mL">10.00 mg/2mL</SelectItem>
                                        <SelectItem value="15.00 mg/3mL">15.00 mg/3mL</SelectItem>
                                        <SelectItem value="20.00 mg/4mL">20.00 mg/4mL</SelectItem>
                                        <SelectItem value="25.00 mg/5mL">25.00 mg/5mL</SelectItem>
                                        <SelectItem value="None">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Tirzepatide Dose Filter */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium px-2">Tirzepatide Dose</label>
                            <div className="flex gap-2">
                                <Select value={tirzepatideDoseOnly} onValueChange={setTirzepatideDoseOnly}>
                                    <SelectTrigger className="w-1/2">
                                        <SelectValue placeholder="Dose" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="2.50">2.50mg</SelectItem>
                                        <SelectItem value="5.00">5.00mg</SelectItem>
                                        <SelectItem value="7.50">7.50mg</SelectItem>
                                        <SelectItem value="10.00">10.00mg</SelectItem>
                                        <SelectItem value="12.50">12.50mg</SelectItem>
                                        <SelectItem value="15.00">15.00mg</SelectItem>
                                        <SelectItem value="None">None</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={tirzepatideUnitFilter} onValueChange={setTirzepatideUnitFilter}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="10.00 mg/2mL">10.00 mg/2mL</SelectItem>
                                        <SelectItem value="20.00 mg/2mL">20.00 mg/2mL</SelectItem>
                                        <SelectItem value="30.00 mg/2mL">30.00 mg/2mL</SelectItem>
                                        <SelectItem value="40.00 mg/2mL">40.00 mg/2mL</SelectItem>
                                        <SelectItem value="50.00 mg/2mL">50.00 mg/2mL</SelectItem>
                                        <SelectItem value="60.00 mg/2mL">60.00 mg/2mL</SelectItem>
                                        <SelectItem value="None">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                    </DropdownMenuContent>
                </DropdownMenu>

                {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'T') && (
                    <ClinicianDropdown selectedPatients={selectedPatients} />
                )}
            </div>

            {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'C') && (
                <div className="flex flex-wrap gap-4 mb-4 p-2 ">
                    <div
                        className="relative flex items-center gap-2 px-5 py-2 bg-secondary text-white rounded-full cursor-pointer"
                        onClick={() => setApprovalFilter('all')}
                    >
                        <span className="text-sm font-medium">All Patients</span>
                        <Badge
                            variant="outline"
                            className="absolute -top-2 -right-2 py-1 bg-secondary-foreground text-white rounded-full text-sm"
                        >
                            {statusCounts.all}
                        </Badge>
                    </div>

                    <div
                        className="relative flex items-center gap-2 px-5 py-2 bg-blue-300 text-blue-foreground rounded-full cursor-pointer"
                        onClick={() => setApprovalFilter('')}

                    >
                        <span className="text-sm font-medium">Awaiting</span>
                        <Badge
                            variant="outline"
                            className="absolute -top-2 -right-2 py-1 bg-blue-500 rounded-full text-sm"
                        >
                            {statusCounts.awaiting}
                        </Badge>
                    </div>

                    <div
                        className="relative flex items-center gap-2 px-5 py-2 bg-yellow-200 text-yellow-900 rounded-full cursor-pointer"
                        onClick={() => setApprovalFilter('pending')}
                    >
                        <span className="text-sm font-medium">Pending</span>
                        <Badge
                            variant="outline"
                            className="absolute -top-2 -right-2 py-1 bg-yellow-500 rounded-full text-sm"
                        >
                            {statusCounts.pending}
                        </Badge>
                    </div>

                    <div
                        className="relative flex items-center gap-2 px-5 py-2 bg-green-200 text-green-900 rounded-full cursor-pointer"
                        onClick={() => setApprovalFilter('approved')}
                    >
                        <span className="text-sm font-medium">Approved</span>
                        <Badge
                            variant="outline"
                            className="absolute -top-2 -right-2 py-1 bg-green-500 rounded-full text-sm"
                        >
                            {statusCounts.approved}
                        </Badge>
                    </div>

                    <div
                        className="relative flex items-center gap-2 px-5 py-2 bg-purple-200 text-purple-900 rounded-full cursor-pointer"
                        onClick={() => setApprovalFilter('disqualified')}
                    >
                        <span className="text-sm font-medium">Disqualified</span>
                        <Badge
                            variant="outline"
                            className="absolute -top-2 -right-2 py-1 bg-purple-500 rounded-full text-sm"
                        >
                            {statusCounts.disqualified}
                        </Badge>
                    </div>
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
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                {/* Keep existing sticky columns */}
                                <TableHead className="sticky left-0 z-10 bg-secondary text-white ">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            ref={checkboxRef}
                                            checked={selectedPatients.length === filteredPatients.length && filteredPatients.length > 0}
                                            onCheckedChange={handleSelectAll}
                                            className="h-4 w-4 mr-2 bg-white"
                                        />
                                    </div>
                                </TableHead>
                                <TableHead className="sticky left-[32px] z-10 w-[94px] bg-secondary text-white whitespace-nowrap">Date</TableHead>

                                <TableHead className="sticky left-[133px] z-10 w-[80px] bg-secondary text-white whitespace-nowrap">
                                    AUTH ID
                                </TableHead>

                                <TableHead className="sticky left-[206px] z-10 w-[100px] bg-secondary text-white whitespace-nowrap">
                                    First Name
                                </TableHead>

                                <TableHead className="sticky left-[294px] z-10 w-[100px] bg-secondary text-white whitespace-nowrap">
                                    Last Name
                                </TableHead>

                                {/* Updated table headers */}
                                <TableHead>DOB</TableHead>
                                <TableHead>Sex</TableHead>
                                {/* <TableHead>Height</TableHead> */}
                                {/* <TableHead>Weight (lbs)</TableHead> */}
                                <TableHead>BMI</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead >Phone</TableHead>

                                {/* Address */}
                                {/* <TableHead>Address</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead>Zip</TableHead> */}

                                {/* Medical Information */}
                                {/* <TableHead>Blood Pressure</TableHead>
                                <TableHead>Heart Rate</TableHead> */}
                                <TableHead className="whitespace-nowrap">GLP-1 Preference</TableHead>
                                {/* <TableHead>Taking Medication</TableHead> */}
                                {/* <TableHead>Medicine Allergy</TableHead>
                                <TableHead>Allergy List</TableHead>
                                <TableHead>Major Surgeries</TableHead>
                                <TableHead>Bariatric Surgery</TableHead>
                                <TableHead>Thyroid Cancer History</TableHead>
                                <TableHead>Surgery List</TableHead>
                                <TableHead>Disqualifiers</TableHead> */}
                                <TableHead>Diagnosis</TableHead>

                                {/* Weight Management */}
                                {/* <TableHead>Starting Weight</TableHead>
                                <TableHead>Current Weight</TableHead>
                                <TableHead>Goal Weight</TableHead>
                                <TableHead>12m Weight Change</TableHead>
                                <TableHead>Weight Loss Programs</TableHead>
                                <TableHead>Weight Loss Meds (12m)</TableHead> */}

                                {/* GLP-1 */}
                                {/* <TableHead>GLP-1 Taken</TableHead>
                                <TableHead>Date of last Injection</TableHead> */}

                                <TableHead>Medicine</TableHead>
                                <TableHead className="w-[40px]">Images</TableHead>
                                {/* Semaglutide */}
                                <TableHead>Semaglutide Dose</TableHead>

                                {/* Tirzepatide */}
                                <TableHead>Tirzepatide Dose</TableHead>
                                {/* <TableHead>Plan Purchased</TableHead>
                                <TableHead>Vial</TableHead>
                                <TableHead>Dosing Schedule</TableHead> */}

                                {/* Provider Info */}
                                {/* <TableHead>Provider Comments</TableHead> */}

                                {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'C') && (
                                    <>
                                        <TableHead className="sticky right-[155px] z-10 w-[80px] bg-secondary text-white whitespace-nowrap">Status</TableHead>
                                        <TableHead className="sticky right-[66px] z-10 w-[80px] bg-secondary text-white whitespace-nowrap">Outcome</TableHead>
                                    </>
                                )}
                                {/* <TableHead>Provider Note</TableHead> */}
                                {session?.user?.accounttype === 'T' && (
                                    <TableHead className="sticky right-[66px] z-10 w-[80px] bg-secondary text-white whitespace-nowrap">Status</TableHead>
                                )}
                                <TableHead className="sticky right-0 bg-secondary text-white">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentRows.map((patient) => (
                                <TableRow key={patient.authid} >
                                    {/* Sticky columns */}
                                    <TableCell className="sticky w-[55px] left-0 z-10 bg-white">

                                        <Checkbox
                                            id={`select-patient-${patient.authid}`}
                                            checked={selectedPatients.includes(patient.authid)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedPatients(prev => [...prev, patient.authid]);
                                                } else {
                                                    setSelectedPatients(prev => prev.filter(id => id !== patient.authid));
                                                }
                                            }}
                                            className="h-4 w-4"
                                        />
                                    </TableCell>

                                    <TableCell className="sticky left-[32px] z-10 w-[94px] text-secondary bg-white font-bold whitespace-nowrap">{patient.createTimeDate.split('T')[0]}</TableCell>

                                    <TimeSensitiveCell patient={patient} />


                                    <TableCell className="sticky left-[206px] z-10 w-[100px] text-secondary bg-white font-bold">
                                        {patient.firstName}
                                    </TableCell>
                                    <TableCell className="sticky left-[294px] z-10 w-[100px] text-secondary bg-white font-bold">
                                        {patient.lastName}
                                    </TableCell>

                                    {/* Patient Data */}
                                    <TableCell className="whitespace-nowrap">{patient.dob}</TableCell>
                                    <TableCell>{patient.sex}</TableCell>
                                    {/* <TableCell>{patient.height}</TableCell> */}
                                    {/* <TableCell>{patient.weight}</TableCell> */}
                                    <TableCell>{patient.bmi}</TableCell>
                                    <TableCell>{patient.email}</TableCell>
                                    <TableCell className="whitespace-nowrap">{patient.phone}</TableCell>

                                    {/* <TableCell>{patient.address1}</TableCell>
                                    <TableCell>{patient.city}</TableCell>
                                    <TableCell>{patient.state}</TableCell>
                                    <TableCell>{patient.zip}</TableCell> */}

                                    {/* <TableCell>{patient.bloodPressure}</TableCell>
                                    <TableCell>{patient.heartRate}</TableCell> */}
                                    <TableCell>{patient.glp1}</TableCell>
                                    {/* <TableCell>{patient.takingMedication}</TableCell> */}
                                    {/* <TableCell>{patient.medicineAllergy}</TableCell>
                                    <TableCell>{patient.allergyList}</TableCell>
                                    <TableCell>{patient.majorSurgeries}</TableCell>
                                    <TableCell>{patient.bariatricSurgery}</TableCell>
                                    <TableCell>{patient.thyroidCancerHistory}</TableCell>
                                    <TableCell>{patient.surgeryList}</TableCell>
                                    <TableCell>{patient.disqualifiers}</TableCell> */}
                                    {/* <TableCell>{patient.diagnosis}</TableCell> */}
                                    <TableCell className="relative overflow-visible">
                                        <DiagnosisCell diagnosis={patient.diagnosis} />
                                    </TableCell>


                                    {/* <TableCell>{patient.startingWeight}</TableCell>
                                    <TableCell>{patient.currentWeight}</TableCell>
                                    <TableCell>{patient.goalWeight}</TableCell>
                                    <TableCell>{patient.weightChange12m}</TableCell>
                                    <TableCell>{patient.weightLossPrograms}</TableCell>
                                    <TableCell>{patient.weightLossMeds12m}</TableCell> */}

                                    {/* <TableCell>{patient.glpTaken}</TableCell>
                                    <TableCell>{patient.glpRecentInjection}</TableCell> */}

                                    <TableCell>{patient.medicine}</TableCell>
                                    <TableCell className="w-[200px] max-h-20">
                                        <div className="flex gap-1 overflow-x-auto">
                                            {patient.images?.map((image, index) => (
                                                <img
                                                    key={index}
                                                    src={image} // <-- Use image directly
                                                    alt={`Preview ${index + 1}`}
                                                    className="h-12 w-12 object-cover cursor-pointer rounded border flex-shrink-0"
                                                    onClick={() => setSelectedImageInfo({
                                                        images: patient.images,
                                                        index: index
                                                    })}
                                                />
                                            ))}
                                        </div>
                                    </TableCell>

                                    <TableCell className="whitespace-nowrap">
                                        {patient.semaglutideDose}{" unit: "}{patient.semaglutideUnit}
                                    </TableCell>

                                    <TableCell className="whitespace-nowrap">
                                        {patient.tirzepatideDose}{" unit: "}{patient.tirzepatideUnit}
                                    </TableCell>
                                    {/* <TableCell>{patient.tirzepetidePlanPurchased}</TableCell>
                                    <TableCell>{patient.tirzepetideVial}</TableCell>
                                    <TableCell>{patient.tirzepetideDosingSchedule}</TableCell>

                                    <TableCell>{patient.providerComments}</TableCell> */}

                                    {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'C') && (
                                        <>
                                            <TableCell className="sticky right-[155px] z-10 w-[80px] bg-white">
                                                <Badge
                                                    className={[
                                                        "px-3 py-1 text-sm rounded-md capitalize",
                                                        patient.approvalStatus === "pending"
                                                            ? "bg-yellow-200 text-yellow-900 hover:bg-yellow-200"
                                                            : patient.approvalStatus === "approved"
                                                                ? "bg-green-200 text-green-900 hover:bg-green-200"
                                                                : patient.approvalStatus === "" || patient.approvalStatus === "None"
                                                                    ? "bg-blue-200 text-black hover:bg-blue-200"
                                                                    : patient.approvalStatus === "disqualified"
                                                                        ? "bg-purple-200 text-purple-900 hover:bg-purple-200"
                                                                        : ["denied", "closed"].includes(patient.approvalStatus)
                                                                            ? "bg-red-200 text-red-900 hover:bg-red-200"
                                                                            : "bg-gray-200 text-gray-900 hover:bg-gray-200" // default case
                                                    ].join(" ")}
                                                >
                                                    {patient.approvalStatus === "" || patient.approvalStatus === "None"
                                                        ? "Awaiting"
                                                        : patient.approvalStatus}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="sticky right-[66px] z-10 w-[80px] bg-white">
                                                <Badge
                                                    className={[
                                                        "px-3 py-1 text-sm rounded-md",
                                                        ["approved", "denied", "closed", "disqualified"].includes(patient.approvalStatus)
                                                            ? "bg-red-200 text-red-900 hover:bg-red-200"
                                                            : "bg-green-200 text-green-900 hover:bg-green-200"
                                                    ].join(" ")}
                                                >
                                                    {["approved", "denied", "closed", "disqualified"].includes(patient.approvalStatus)
                                                        ? "Closed"
                                                        : "Open"}
                                                </Badge>
                                            </TableCell>
                                        </>
                                    )}
                                    {session?.user?.accounttype === 'T' && (
                                        <ClinicianStatusBadge patient={patient} />
                                    )}

                                    {/* <TableCell>{patient.providerNote}</TableCell> */}

                                    <TableCell className="sticky right-0 bg-white">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Menu className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52">
                                                <DropdownMenuItem
                                                    asChild
                                                    disabled={
                                                        session?.user?.accounttype === 'C' &&
                                                        ["approved", "denied", "closed", "disqualified"].includes(patient.approvalStatus)
                                                    }
                                                    className={`rounded-md ${session?.user?.accounttype === 'C' &&
                                                        ["approved", "denied", "closed", "disqualified"].includes(patient.approvalStatus)
                                                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                                                        : "bg-secondary text-white"
                                                        }`}
                                                >
                                                    <Link href={`/dashboard/${patient.authid}`}>Open</Link>
                                                </DropdownMenuItem>


                                                {session?.user?.accounttype === 'A' && (
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => {
                                                            setSelectedPatientId(patient.authid);
                                                            setOpenDialog(true);
                                                        }}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        {/* AlertDialog for Delete Confirmation */}
                                        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This patient record will be moved to the <strong>Closed Tickets</strong> section.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>

                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium mb-1">Reason for Closing</label>
                                                    <Textarea
                                                        placeholder="Enter reason..."
                                                        value={deleteReason}
                                                        onChange={(e) => setDeleteReason(e.target.value)}
                                                    />
                                                </div>

                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => {
                                                            if (selectedPatientId) {
                                                                handleDelete(selectedPatientId, deleteReason);
                                                                setSelectedPatientId(null);
                                                                setDeleteReason("");
                                                                setOpenDialog(false);
                                                            }
                                                        }}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Move to Closed Tickets
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>


                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Showing {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredPatients.length)} of{" "}
                    {filteredPatients.length} patients
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

            {/* Add Patient Button */}
            <div className="fixed bottom-4 right-4 flex justify-start items-center gap-4 z-50">
                {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'T') && (
                    <Link href="/dashboard/addrecord">
                        <Button className="bg-secondary hover:bg-secondary"><Plus /> Add Patient</Button>
                    </Link>
                )}
                {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'C') && (
                    <EmailDialog
                        selectedPatients={selectedPatients}
                        selectedEmail={selectedEmail}
                        selectedPatientData={selectedPatientData}
                    />
                )}
            </div>

            <AlertDialog
                open={!!selectedImageInfo}
                onOpenChange={() => setSelectedImageInfo(null)}
            >
                <AlertDialogContent className="max-w-[80vw]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Image Preview</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="max-h-[80vh] flex items-center justify-between">
                        <Button
                            variant="ghost"
                            className="h-full"
                            disabled={selectedImageInfo?.index === 0}
                            onClick={() => setSelectedImageInfo(prev => ({
                                ...prev,
                                index: prev.index - 1
                            }))}
                        >
                            {/* ← */}
                            <StepBack />
                        </Button>

                        <div className="flex-1 max-h-[70vh] flex justify-center">
                            {selectedImageInfo && (
                                <img
                                    src={selectedImageInfo.images[selectedImageInfo.index]}
                                    alt="Full preview"
                                    className="max-h-full max-w-full object-contain"
                                />
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            className="h-full"
                            disabled={selectedImageInfo?.index === selectedImageInfo?.images?.length - 1}
                            onClick={() => setSelectedImageInfo(prev => ({
                                ...prev,
                                index: prev.index + 1
                            }))}
                        >
                            <StepForward />
                        </Button>
                    </div>
                    <div className="text-center mt-2">
                        Image {selectedImageInfo?.index + 1} of {selectedImageInfo?.images?.length}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogAction>Close</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* Email Dialog */}

        </div>
    );
}