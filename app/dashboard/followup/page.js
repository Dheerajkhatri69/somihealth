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
import { ArrowDownNarrowWide, Plus, StepBack, StepForward, Timer } from "lucide-react";
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

export default function FollowUp() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [Cloading, setCLoading] = useState(true);
    const [Tloading, setTLoading] = useState(true);
    const router = useRouter();
    const { data: session } = useSession();
    const [viewMode, setViewMode] = useState('all'); // 'all' or 'assigned'

    // Add pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

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
                if (session?.user?.accounttype === 'C') {
                    if (viewMode === 'assigned') {
                        const assigningRes = await fetch("/api/followupassig");
                        const assigningData = await assigningRes.json();

                        if (assigningData.success) {
                            const clinicianAssignments = assigningData.result.filter(
                                assignment => assignment.cid === session.user.id
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
                else if (session?.user?.accounttype === 'T') {
                    const creatorRes = await fetch("/api/followupcreatorofp");
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

        fetchPatients();
    }, [session, viewMode]); // Add session to dependency array

    useEffect(() => {
        // console.log("dashboard Session user:", session?.user?.accounttype);
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

    const [selectedImageInfo, setSelectedImageInfo] = useState(null);

    const [selectedStatus, setSelectedStatus] = useState('all');

    // Add this status counter function
    const getStatusCounts = (patients) => {
        return {
            all: patients.length,
            awaiting: patients.filter(p => !p.approvalStatus).length,
            approved: patients.filter(p => p.approvalStatus === 'approved').length,
            pending: patients.filter(p => p.approvalStatus === 'pending').length,
            denied: patients.filter(p => p.approvalStatus === 'denied').length,
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

        const approvalMatch = approvalFilter === 'all' || patient.approvalStatus === approvalFilter;

        const semaglutideMatch = (
            (semaglutideDoseOnly === 'all' || patient.semaglutideDose == semaglutideDoseOnly) &&
            (semaglutideUnitFilter === 'all' || patient.semaglutideUnit === semaglutideUnitFilter)
        );

        const tirzepatideMatch = (
            (tirzepatideDoseOnly === 'all' || patient.tirzepatideDose == tirzepatideDoseOnly) &&
            (tirzepatideUnitFilter === 'all' || patient.tirzepatideUnit === tirzepatideUnitFilter)
        );


        return emailMatch && pIdMatch && genderMatch && dobMatch && cityMatch &&
            medicineMatch && semaglutideMatch && tirzepatideMatch && approvalMatch;
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
        )
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
        )
    }
    return (
        <div className="overflow-x-auto p-4">
            <div className="flex flex-wrap gap-2 mb-4">
                {session?.user?.accounttype === 'C' && (
                    <Select value={viewMode} onValueChange={setViewMode}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="View Mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="assigned">My Tickets</SelectItem>
                            <SelectItem value="all">All Tickets</SelectItem>
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
                    </SelectContent>
                </Select>

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
                                        <SelectItem value="2.25">2.25mg</SelectItem>
                                        <SelectItem value="4.50">4.50mg</SelectItem>
                                        <SelectItem value="6.75">6.75mg</SelectItem>
                                        <SelectItem value="9.00">9.00mg</SelectItem>
                                        <SelectItem value="11.25">11.25mg</SelectItem>
                                        <SelectItem value="13.5">13.5mg</SelectItem>
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
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                    </DropdownMenuContent>
                </DropdownMenu>

                {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'T') && (
                    <FollowupClinicianDropdown selectedPatients={selectedPatients} />
                )}
            </div>

            {session?.user?.accounttype === 'A' && (
                <div className="flex flex-wrap gap-4 mb-4 p-2 ">
                    <div className="relative flex items-center gap-2 px-5 py-2 bg-secondary text-white rounded-full cursor-pointer">
                        <span className="text-sm font-medium">All Patients</span>
                        <Badge
                            variant="outline"
                            className="absolute -top-2 -right-2 py-1 bg-secondary-foreground text-white rounded-full text-sm"
                        >
                            {statusCounts.all}
                        </Badge>
                    </div>

                    <div className="relative flex items-center gap-2 px-5 py-2 bg-blue-300 text-blue-foreground rounded-full cursor-pointer">
                        <span className="text-sm font-medium">Awaiting</span>
                        <Badge
                            variant="outline"
                            className="absolute -top-2 -right-2 py-1 bg-blue-500 rounded-full text-sm"
                        >
                            {statusCounts.awaiting}
                        </Badge>
                    </div>

                    <div className="relative flex items-center gap-2 px-5 py-2 bg-yellow-200 text-yellow-900 rounded-full cursor-pointer">
                        <span className="text-sm font-medium">Pending</span>
                        <Badge
                            variant="outline"
                            className="absolute -top-2 -right-2 py-1 bg-yellow-500 rounded-full text-sm"
                        >
                            {statusCounts.pending}
                        </Badge>
                    </div>

                    <div className="relative flex items-center gap-2 px-5 py-2 bg-green-200 text-green-900 rounded-full cursor-pointer">
                        <span className="text-sm font-medium">Approved</span>
                        <Badge
                            variant="outline"
                            className="absolute -top-2 -right-2 py-1 bg-green-500 rounded-full text-sm"
                        >
                            {statusCounts.approved}
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

                                <TableHead className="sticky left-[35px] z-10 w-[80px] bg-secondary text-white whitespace-nowrap">
                                    AUTH ID
                                </TableHead>

                                <TableHead className="sticky left-[115px] z-10 w-[100px] bg-secondary text-white whitespace-nowrap">
                                    First Name
                                </TableHead>

                                <TableHead className="sticky left-[200px] z-10 w-[100px] bg-secondary text-white whitespace-nowrap">
                                    Last Name
                                </TableHead>

                                {/* Updated table headers */}
                                <TableHead>Date</TableHead>
                                <TableHead>DOB</TableHead>
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


                                {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'C') && (
                                    <>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="whitespace-nowrap">Out Come</TableHead>
                                    </>
                                )}
                                {/* Add these new headers after existing ones */}
                                <TableHead className="whitespace-nowrap">Follow-Up/Refills</TableHead>
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
                                    {/* <TimeSensitiveCell patient={patient} onDeletePatient={handleDelete} /> */}
                                    {/* <TableCell className="sticky left-[35px] z-20 w-[80px] text-center text-wrap text-secondary bg-white font-bold">
                                        {patient.authid}
                                    </TableCell> */}
                                    <FollowupShowAssig patient={patient} />

                                    <TableCell className="sticky left-[115px] z-10 w-[100px] text-secondary bg-white font-bold">
                                        {patient.firstName}
                                    </TableCell>
                                    <TableCell className="sticky left-[200px] z-10 w-[100px] text-secondary bg-white font-bold">
                                        {patient.lastName}
                                    </TableCell>

                                    {/* Patient Data */}
                                    <TableCell className="whitespace-nowrap">{patient.createTimeDate.split('T')[0]}</TableCell>
                                    <TableCell className="whitespace-nowrap">
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

                                    {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'C') && (
                                        <>
                                            <TableCell className="capitalize">{patient.approvalStatus}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        [
                                                            "px-3 py-1 text-sm rounded-md",
                                                            patient.approvalStatus === "approved" ||
                                                                patient.approvalStatus === "pending" ||
                                                                patient.approvalStatus === "request a call"
                                                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                                                : "bg-red-100 text-red-700 hover:bg-red-100"
                                                        ].join(" ")
                                                    }
                                                >
                                                    {["approved", "denied", "disqualified", "closed"].includes(patient.approvalStatus)
                                                        ? "Closed"
                                                        : "Open"}
                                                </Badge>
                                            </TableCell>

                                        </>
                                    )}

                                    <TableCell>{patient.followUpRefills ? "Yes" : "No"}</TableCell>
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

                                    <TableCell className={`sticky right-0 bg-white ${session?.user?.accounttype === 'A' ? 'flex flex-col gap-2' : ''}`}>
                                        <Link href={`/dashboard/followup/${patient.authid}`}>
                                            <Button variant="outline" size="sm">
                                                {session?.user?.accounttype === 'C' ? 'Submit' : 'Update'}
                                            </Button>
                                        </Link>
                                        {session?.user?.accounttype === 'A' && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the selected patients from our servers.
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
                                        )}
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
            <div className="flex justify-start items-center gap-4 mt-4">
                {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'T') && (
                    <Link href="/dashboard/addfollowup">
                        <Button ><Plus /> Follow Up</Button>
                    </Link>
                )}
                {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'C') && (
                    <EmailDialog selectedPatients={selectedPatients} selectedEmail={selectedEmail} selectedPatientData={selectedPatientData} />
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