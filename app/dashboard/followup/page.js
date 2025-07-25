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
import { useRouter } from "next/navigation";
import { FollowupClinicianDropdown } from "@/components/followupClinicianDropdown";
import FollowupShowAssig from "@/components/followupshowassign";
import { Skeleton } from "@/components/ui/skeleton";
import { FollowupClinicianAction, FollowupClinicianStatusBadge } from "@/components/clinicianStatusBadge";

export default function FollowUp() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [Cloading, setCLoading] = useState(true);
    const [Tloading, setTLoading] = useState(true);
    const router = useRouter();
    const { data: session } = useSession();
    
    // Add localStorage states for faster loading
    const [userType, setUserType] = useState(null);
    const [userId, setUserId] = useState(null);
    
    const [viewMode, setViewMode] = useState('assigned'); // 'all' or 'assigned'

    const [openDialog, setOpenDialog] = useState(false)
    const [selectedPatientId, setSelectedPatientId] = useState(null)

    // Load user data from localStorage on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUserType = localStorage.getItem('usertype');
            const storedUserId = localStorage.getItem('userid');
            if (storedUserType) setUserType(storedUserType);
            if (storedUserId) setUserId(storedUserId);
        }
    }, []);

    // Add pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 100;

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                // Fetch all followup patients first
                const patientsRes = await fetch("/api/followup");
                const patientsData = await patientsRes.json();

                if (!patientsData.success) {
                    console.error("Error fetching patients:", patientsData.result.message);
                    return;
                }

                // Filter active patients (closetickets === false)
                let activePatients = patientsData.result.filter(patient => patient.closetickets === false);

                // If user is a clinician, filter based on view mode
                if (userType === 'C') {
                    if (viewMode === 'assigned') {
                        const assigningRes = await fetch("/api/followupassig");
                        const assigningData = await assigningRes.json();

                        if (assigningData.success) {
                            const clinicianAssignments = assigningData.result.filter(
                                assignment => assignment.cid === userId
                            );
                            const assignedPids = clinicianAssignments.map(item => item.pid);
                            activePatients = activePatients.filter(patient =>
                                assignedPids.includes(patient.authid)
                            );
                        } else {
                            console.error("Error fetching assignments:", assigningData.result.message);
                        }
                    }
                    setCLoading(false);
                }
                // If user is a technician, filter only patients they created
                else if (userType === 'T') {
                    const creatorRes = await fetch("/api/followupcreatorofp");
                    const creatorData = await creatorRes.json();

                    if (creatorData.success) {
                        // Filter creator records for this technician
                        const technicianCreations = creatorData.result.filter(
                            record => record.tid === userId
                        );
                        // Get list of patient IDs created by this technician
                        const createdPids = technicianCreations.map(item => item.pid);
                        // Filter patients to only those created by this technician
                        activePatients = activePatients.filter(patient =>
                            createdPids.includes(patient.authid)
                        );
                    } else {
                        console.error("Error fetching creator records:", creatorData.result.message);
                    }

                    setTLoading(false);
                }

                setPatients(activePatients);
            } catch (err) {
                console.error("Fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if we have userType
        if (userType) {
            fetchPatients();
        }
    }, [userType, userId, viewMode]); // Updated dependency array

    useEffect(() => {
        // console.log("dashboard localStorage user:", userType);
    }, [userType]);

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
            setSelectedEmail(selectedPatient?.email || '');
            setSelectedPatientData(selectedPatient); // store full patient info
        } else {
            setSelectedEmail('');
        }
    }, [selectedPatients]);
    const [deleteReason, setDeleteReason] = useState("");

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
        const emailMatch = patient.email?.toLowerCase().includes(emailFilter.toLowerCase());
        // const pIdMatch = patient.patientId.toLowerCase().includes(pIdFilter.toLowerCase());
        const pIdMatch = patient.authid?.toLowerCase().includes(pIdFilter.toLowerCase());
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

    const handleDelete = async (authid) => {
        try {
            const response = await fetch(`/api/followup`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ authids: [authid] }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.result || 'Failed to delete follow-up');
            }

            toast.success("Follow-up deleted successfully!", {
                description: "The follow-up record has been permanently removed.",
            });
            setPatients(prev =>
                prev.filter(patient => patient.authid !== authid)
            );
            // Redirect after deletion
            // setTimeout(() => router.push("/dashboard/followup"), 2000);

        } catch (error) {
            toast.error("Deletion failed", {
                description: error.message || 'Failed to delete follow-up record',
            });
        }
    };

    const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredPatients.slice(indexOfFirstRow, indexOfLastRow);
    if (userType === 'C' && Cloading) {
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
        )
    } else if (userType === 'T' && Tloading) {
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
        )
    }
    return (
        <div className="overflow-x-auto p-4">
            <div className="flex flex-wrap gap-2 mb-4">
                {userType === 'C' && (
                    <Select value={viewMode} onValueChange={setViewMode}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="View Mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="assigned">Assigned Patients</SelectItem>
                            <SelectItem value="all">All Patients</SelectItem>
                        </SelectContent>
                    </Select>
                )}
                <Input
                    placeholder="Filter Patient Id..."
                    className="max-w-sm"
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
                        className="w-full border rounded-xl bg-secondary text-white border-none white-calendar h-9 p-2"
                    />
                    <Button 
                        className="bg-secondary hover:bg-secondary-foreground h-full rounded-r-full rounded-l-full"
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

                {(userType === 'A' || userType === 'T') && (
                    <FollowupClinicianDropdown selectedPatients={selectedPatients} />
                )}
            </div>

            {(userType === 'A' || userType === 'C') && (
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

                                <TableHead className="sticky left-[217px] z-10 w-[100px] bg-secondary text-white whitespace-nowrap">
                                    First Name
                                </TableHead>

                                <TableHead className="sticky left-[305px] z-10 w-[100px] bg-secondary text-white whitespace-nowrap">
                                    Last Name
                                </TableHead>

                                {/* Updated table headers */}
                                <TableHead className="pl-5">DOB</TableHead>
                                <TableHead>Sex</TableHead>
                                {/* <TableHead>Height</TableHead>
                                <TableHead>Weight (lbs)</TableHead> */}
                                <TableHead>BMI</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>

                                {/* Address */}
                                {/* <TableHead>Address</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead>Zip</TableHead> */}

                                {/* Medical Information */}
                                <TableHead className="whitespace-nowrap">GLP-1 Preference</TableHead>

                                {/* Weight Management */}
                                {/* GLP-1 */}
                                <TableHead>Medicine</TableHead>
                                <TableHead className="w-[40px]">Images</TableHead>
                                {/* Semaglutide */}
                                <TableHead className="whitespace-nowrap">Semaglutide Dose</TableHead>

                                {/* Tirzepatide */}
                                <TableHead className="whitespace-nowrap">Tirzepatide Dose</TableHead>

                                <TableHead className="whitespace-nowrap">Follow-Up/Refills</TableHead>

                                {(userType === 'A' || userType === 'C') && (
                                    <>
                                        <TableHead className="sticky right-[155px] z-10 w-[80px] bg-secondary text-white whitespace-nowrap">Status</TableHead>
                                        <TableHead className="sticky right-[66px] z-10 w-[80px] bg-secondary text-white whitespace-nowrap">Outcome</TableHead>
                                    </>
                                )}
                                {userType === 'T' && (
                                    <TableHead className="sticky right-[66px] z-10 w-[80px] bg-secondary text-white whitespace-nowrap">Status</TableHead>
                                )}
                                {/* Add these new headers after existing ones */}
                                {/* <TableHead>GLP-1 Approval (6mo)</TableHead>
                                <TableHead>Current Weight</TableHead>
                                <TableHead>Current GLP-1 Med</TableHead>
                                <TableHead>Side Effects</TableHead> */}
                                {/* <TableHead>Side Effect List</TableHead> */}
                                {/* <TableHead>Med Satisfaction</TableHead>
                                <TableHead>Switch Med</TableHead>
                                <TableHead>Continue Dose</TableHead>
                                <TableHead>Increase Dose</TableHead>
                                <TableHead>Patient Statement</TableHead> */}

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

                                    <FollowupShowAssig patient={patient} />

                                    <TableCell className="sticky left-[217px] z-10 w-[100px] text-secondary bg-white font-bold">
                                        {patient.firstName}
                                    </TableCell>
                                    <TableCell className="sticky left-[305px] z-10 w-[100px] text-secondary bg-white font-bold">
                                        {patient.lastName}
                                    </TableCell>

                                    {/* Patient Data */}

                                    <TableCell className="whitespace-nowrap pl-5">
                                        {patient.dob?.split('T')[0]}
                                    </TableCell>
                                    <TableCell>{patient.sex}</TableCell>
                                    {/* <TableCell>{patient.height}</TableCell>
                                    <TableCell>{patient.weight}</TableCell> */}
                                    <TableCell>{patient.bmi}</TableCell>
                                    <TableCell>{patient.email}</TableCell>
                                    <TableCell className="whitespace-nowrap">{patient.phone}</TableCell>

                                    {/* <TableCell>{patient.address1}</TableCell>
                                    <TableCell>{patient.city}</TableCell>
                                    <TableCell>{patient.state}</TableCell>
                                    <TableCell>{patient.zip}</TableCell> */}

                                    <TableCell>{patient.glp1}</TableCell>

                                    <TableCell>{patient.medicine}</TableCell>
                                    <TableCell className="w-[200px] max-h-20">
                                        <div className="flex gap-1 overflow-x-auto">
                                            {patient.images
                                                ?.filter(image => typeof image === "string" && image.trim() !== "")
                                                .map((image, index) => (
                                                    <img
                                                        key={index}
                                                        src={image}
                                                        alt={`Preview ${index + 1}`}
                                                        className="h-12 w-12 object-cover cursor-pointer rounded border flex-shrink-0"
                                                        onClick={() =>
                                                            setSelectedImageInfo({
                                                                images: patient.images.filter(img => typeof img === "string" && img.trim() !== ""),
                                                                index: index,
                                                            })
                                                        }
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
                                    <TableCell>{patient.followUpRefills ? "Yes" : "No"}</TableCell>

                                    {(userType === 'A' || userType === 'C') && (
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
                                    {userType === 'T' && (
                                        <FollowupClinicianStatusBadge patient={patient} />
                                    )}
                                    {/* <TableCell>{patient.glp1ApprovalLast6Months}</TableCell>
                                    <TableCell>{patient.currentWeight}</TableCell>
                                    <TableCell>{patient.currentGlp1Medication}</TableCell>
                                    <TableCell>{patient.anySideEffects}</TableCell> */}
                                    {/* <TableCell className="max-w-[200px] truncate">{patient.listSideEffects}</TableCell> */}
                                    {/* <TableCell>{patient.happyWithMedication}</TableCell>
                                    <TableCell>{patient.switchMedication}</TableCell>
                                    <TableCell>{patient.continueDosage}</TableCell>
                                    <TableCell>{patient.increaseDosage}</TableCell>
                                    <TableCell className="max-w-[250px] truncate">{patient.patientStatement}</TableCell> */}


                                    <TableCell className="sticky right-0 bg-white">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Menu className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52">

                                                {userType === 'T' && (
                                                    <FollowupClinicianAction patient={patient} />
                                                )}

                                                {(userType === 'A' || userType === 'C') && (
                                                    <DropdownMenuItem
                                                        asChild
                                                        disabled={
                                                            userType === 'C' &&
                                                            ["approved", "denied", "closed", "disqualified"].includes(patient.approvalStatus)
                                                        }
                                                        className={`rounded-md ${userType === 'C' &&
                                                            ["approved", "denied", "closed", "disqualified"].includes(patient.approvalStatus)
                                                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                                                            : "bg-secondary text-white"
                                                            }`}
                                                    >
                                                        <Link href={`/dashboard/followup/${patient.authid}`}>Open</Link>
                                                    </DropdownMenuItem>
                                                )}
                                                {userType === 'A' && (
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedPatientId(patient.authid)
                                                            setOpenDialog(true)
                                                        }}
                                                        className="text-destructive"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        {/* Delete Confirmation Dialog */}
                                        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the selected patient from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>

                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => {
                                                            if (selectedPatientId) {
                                                                handleDelete(selectedPatientId)
                                                                setOpenDialog(false)
                                                                setSelectedPatientId(null)
                                                            }
                                                        }}
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
                )}
            </div>
            {/* Add pagination controls */}
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
                {(userType === 'A' || userType === 'T') && (
                    <Link href="/dashboard/addfollowup">
                        <Button className="bg-secondary hover:bg-secondary"><Plus /> Follow Up</Button>
                    </Link>
                )}
                {(userType === 'A' || userType === 'C') && (
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