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
import { ArrowDownNarrowWide, Menu, Plus, StepBack, StepForward, Timer } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { EmailDialog } from "@/components/emailDialog";
import TimeSensitiveCell from "@/components/timer";
import { Skeleton } from "@/components/ui/skeleton";
import { DiagnosisCell } from "@/components/diagnosisCell";
import { ClinicianAction, ClinicianStatusBadge } from "@/components/clinicianStatusBadge";
import PillSelect from "@/components/follow_refills";
import Image from "next/image";
import MainButtonGroup from "@/components/MainButtonGroup";

const MDY_REGEX = /^(0[1-9]|1[0-2])\s\/\s(0[1-9]|[12][0-9]|3[01])\s\/\s(19|20)\d{2}$/;

export default function Dashboard() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [Cloading, setCLoading] = useState(true);
    const [Tloading, setTLoading] = useState(true);
    const [ticketFilter, setTicketFilter] = useState('assigned'); // 'all' or 'assigned'
    const { data: session } = useSession();

    // Add localStorage states for faster loading
    const [userType, setUserType] = useState(null);
    const [userId, setUserId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 100;
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    // Load user data from localStorage on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUserType = localStorage.getItem('usertype');
            const storedUserId = localStorage.getItem('userid');
            if (storedUserType) setUserType(storedUserType);
            if (storedUserId) setUserId(storedUserId);
        }
    }, []);
    const [clinicians, setClinicians] = useState([]);
    const [assignedPatients, setAssignedPatients] = useState([]);
    // replace your current assigning fetch useEffect with this pattern:

    useEffect(() => {
        fetchAssigningAndClinicians();
    }, []);

    async function fetchAssigningAndClinicians() {
        try {
            const userRes = await fetch("/api/users");
            const userData = await userRes.json();
            const clinicianList =
                userData.result?.filter((user) => user.accounttype === "C") || [];
            setClinicians(clinicianList);

            const assignRes = await fetch("/api/assigning");
            const assignData = await assignRes.json();
            setAssignedPatients(assignData.result);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        }
    }
    const handleAssignmentsChanged = () => {
        fetchAssigningAndClinicians(); // or fetchData()
    };

    const assignmentByPid = useMemo(() => {
        const map = new Map();
        assignedPatients.forEach((assign) => {
            const clinician = clinicians.find((c) => c.id === assign.cid);
            if (clinician) {
                map.set(assign.pid, {
                    id: clinician.id,
                    fullname: clinician.fullname,
                    createTimeDate: assign.createTimeDate,
                });
            }
        });
        return map;
    }, [assignedPatients, clinicians]);


    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [deleteReason, setDeleteReason] = useState("");

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                // Fetch all patients first
                const patientsRes = await fetch("/api/ed-questionnaire");
                const patientsData = await patientsRes.json();

                if (!patientsData.success) {
                    console.error("Error fetching patients:", patientsData.result.message);
                    return;
                }

                let activePatients = patientsData.result.filter(patient =>
                    patient.closetickets === false && patient.questionnaire === false
                );

                // If user is a clinician, filter only their assigned patients
                // For clinicians, apply additional filtering based on ticketFilter state
                if (userType === 'C') {
                    const assigningRes = await fetch("/api/assigning");
                    const assigningData = await assigningRes.json();

                    if (assigningData.success) {
                        const clinicianAssignments = assigningData.result.filter(
                            assignment => assignment.cid === userId
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
                else if (userType === 'T') {
                    const creatorRes = await fetch("/api/creatorofp");
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

        // Only fetch if we have userType
        if (userType) {
            fetchPatients();
        }
    }, [userType, userId, ticketFilter]); // Updated dependency array

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

    const [doseOnly, setDoseOnly] = useState('all');
    const [unitFilter, setUnitFilter] = useState('all');
    const [createDateFilter, setCreateDateFilter] = useState("");
    const [selectedImageInfo, setSelectedImageInfo] = useState(null);
    const [clinicianFilter, setClinicianFilter] = useState("all");

    // Add state for new filters
    const [followUpFilter, setFollowUpFilter] = useState('all');
    const [refillReminderFilter, setRefillReminderFilter] = useState('all');

    const [heardAboutFilters, setHeardAboutFilters] = useState('all');
    // Helper to extract interval
    function extractInterval(val) {
        if (!val) return '';
        const parts = val.split('_');
        return parts.length > 1 ? parts[1] : '';
    }

    const extractDate = useCallback((val) => {
        if (!val) return null;
        const parts = val.split('_');
        return parts.length > 1 ? new Date(parts[0]) : null;
    }, []);
    const isFollowUpExpired = useCallback((val) => {
        const date = extractDate(val);
        if (!date) return false;
        return date < new Date();
    }, [extractDate]);

    const isRefillReminderDue = useCallback((val) => {
        const date = extractDate(val);
        if (!date) return false;
        const now = new Date();
        return now >= date; // Due on or after the set date
    }, [extractDate]);


    // Count patients for each interval
    const followUpCounts = patients.reduce((acc, patient) => {
        if (isFollowUpExpired(patient.followUp)) {
            const interval = extractInterval(patient.followUp);
            if (interval) acc[interval] = (acc[interval] || 0) + 1;
        }
        return acc;
    }, {});
    const refillReminderCounts = patients.reduce((acc, patient) => {
        if (isRefillReminderDue(patient.refillReminder)) {
            const interval = extractInterval(patient.refillReminder);
            if (interval) acc[interval] = (acc[interval] || 0) + 1;
        }
        return acc;
    }, {});

    // Map clinician id → Set(patient ids)
    const cidToPidSet = useMemo(() => {
        const map = new Map();
        assignedPatients.forEach(a => {
            if (!a?.cid || !a?.pid) return;
            if (!map.has(a.cid)) map.set(a.cid, new Set());
            map.get(a.cid).add(String(a.pid).toLowerCase());
        });
        return map;
    }, [assignedPatients]);

    // Set of all assigned patient IDs
    const allAssignedPids = useMemo(() => {
        const set = new Set();
        assignedPatients.forEach(a => {
            if (a?.pid) set.add(String(a.pid).toLowerCase());
        });
        return set;
    }, [assignedPatients]);

    const getPatientPid = p => String(p.authid).toLowerCase();

    const [selectedStatus, setSelectedStatus] = useState('all');
    const [fromDateStr, setFromDateStr] = useState(""); // "MM / DD / YYYY"
    const [toDateStr, setToDateStr] = useState("");     // "MM / DD / YYYY"

    const parseMDYToUTC = useCallback((dateStr, endOfDay = false) => {
        if (!dateStr || !MDY_REGEX.test(dateStr)) return null;

        const [mm, dd, yyyy] = dateStr
            .split("/")
            .map((s) => parseInt(s.trim(), 10));

        return new Date(
            Date.UTC(
                yyyy,
                mm - 1,
                dd,
                endOfDay ? 23 : 0,
                endOfDay ? 59 : 0,
                endOfDay ? 59 : 0,
                endOfDay ? 999 : 0
            )
        );
    }, []);


    function isWithinRange(isoZ, fromUtc, toUtc) {
        const t = new Date(isoZ).getTime(); // ISO with Z is UTC
        if (Number.isNaN(t)) return false;
        const lo = fromUtc ? fromUtc.getTime() : -Infinity;
        const hi = toUtc ? toUtc.getTime() : +Infinity;
        return t >= lo && t <= hi; // inclusive
    }
    const fromUtc = useMemo(() => parseMDYToUTC(fromDateStr, false), [fromDateStr, parseMDYToUTC]);
    const toUtc = useMemo(() => parseMDYToUTC(toDateStr, true), [parseMDYToUTC, toDateStr]);

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
    const heardAboutOptions = useMemo(() => {
        const set = new Set();

        patients.forEach((item) => {
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
    }, [patients]);
    const filteredPatients = useMemo(() => {
        return patients.filter(patient => {
            const emailMatch = patient.email.toLowerCase().includes(emailFilter.toLowerCase());
            const nameMatch = emailFilter === '' ||
                patient.firstName.toLowerCase().includes(emailFilter.toLowerCase()) ||
                patient.lastName.toLowerCase().includes(emailFilter.toLowerCase()) ||
                `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(emailFilter.toLowerCase());
            const emailOrNameMatch = emailMatch || nameMatch;

            const pIdMatch = patient.authid.toLowerCase().includes(pIdFilter.toLowerCase());
            const genderMatch = genderFilter === 'all' || patient.sex === genderFilter;
            const dobMatch = dobFilter
                ? patient.dateOfBirth.split('T')[0] === dobFilter
                : true;

            const cityMatch = cityFilter ? patient.city.toLowerCase().includes(cityFilter.toLowerCase()) : true;
            const medicineMatch = medicineFilter === 'all' || patient.currentMedication === medicineFilter;

            const approvalMatch =
                approvalFilter === 'all' ||
                (approvalFilter === '' &&
                    (patient.approvalStatus === '' || patient.approvalStatus === 'None')) ||
                patient.approvalStatus === approvalFilter;

            const doseMatch =
                (doseOnly === 'all' || patient.dose == doseOnly) &&
                (unitFilter === 'all' || patient.unit === unitFilter);

            const clinicianMatch =
                clinicianFilter === "all"
                    ? true
                    : clinicianFilter === "unassigned"
                        ? !allAssignedPids.has(getPatientPid(patient))
                        : cidToPidSet.get(clinicianFilter)?.has(getPatientPid(patient)) ?? false;

            const createDateRangeMatch = isWithinRange(patient.createTimeDate, fromUtc, toUtc);
            const createDateMatch = createDateFilter
                ? patient.createTimeDate.split('T')[0] === createDateFilter
                : true;

            const followUpExpired = isFollowUpExpired(patient.followUp);
            const followUpMatch =
                followUpFilter === 'all' ||
                (followUpExpired && extractInterval(patient.followUp) === followUpFilter);

            const refillDue = isRefillReminderDue(patient.refillReminder);
            const refillReminderMatch =
                refillReminderFilter === 'all' ||
                (refillDue && extractInterval(patient.refillReminder) === refillReminderFilter);
            const normalizedHeardAbout =
                patient.heardAbout === "Other" && patient.heardAboutOther
                    ? patient.heardAboutOther.trim()
                    : (patient.heardAbout || "").trim();

            const heardMatch =
                heardAboutFilters === "all" ||
                normalizedHeardAbout === heardAboutFilters;
            return (
                emailOrNameMatch &&
                pIdMatch &&
                genderMatch &&
                dobMatch &&
                cityMatch &&
                medicineMatch &&
                doseMatch &&
                approvalMatch &&
                createDateMatch &&
                clinicianMatch &&
                createDateRangeMatch &&
                followUpMatch &&
                refillReminderMatch &&
                heardMatch
            );
        });
    }, [patients, emailFilter, pIdFilter, genderFilter, dobFilter, cityFilter, medicineFilter, approvalFilter, doseOnly, unitFilter, clinicianFilter, allAssignedPids, cidToPidSet, fromUtc, toUtc, createDateFilter, isFollowUpExpired, followUpFilter, isRefillReminderDue, refillReminderFilter, heardAboutFilters]);

    const statusCounts = useMemo(() => getStatusCounts(filteredPatients), [filteredPatients]);

    const handleCheckboxChange = (patientId) => {
        setSelectedPatients(prev =>
            prev.includes(patientId)
                ? prev.filter(id => id !== patientId)
                : [...prev, patientId]
        );
    };

    // Add loading state for resolve actions
    const [resolveLoading, setResolveLoading] = useState({});

    // Handler for resolving follow up
    async function handleResolveFollowUp(patient) {
        const key = patient.authid + "_followup";

        setResolveLoading(prev => ({ ...prev, [key]: true }));

        try {
            const response = await fetch('/api/ed-questionnaire', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    authid: patient.authid,
                    followUp: ""
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Follow up cleared for ${patient.firstName} ${patient.lastName}`);
                // refresh list
                setPatients(prev =>
                    prev.map(p =>
                        p.authid === patient.authid ? { ...p, followUp: "" } : p
                    )
                );
            } else {
                toast.error("Failed to clear follow up");
            }
        } catch (err) {
            toast.error("Error clearing follow up");
            console.error(err);
        } finally {
            setResolveLoading(prev => ({ ...prev, [key]: false }));
        }
    }
    // Handler for resolving refill reminder
    async function handleResolveRefillReminder(patient) {
        setResolveLoading(prev => ({ ...prev, [patient.authid + '_refill']: true }));
        try {
            const response = await fetch('/api/ed-questionnaire', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...patient, refillReminder: "" }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success(`Refill reminder cleared for ${patient.firstName} ${patient.lastName}`);
                // Update the patient in the local state
                setPatients(prev => prev.map(p =>
                    p.authid === patient.authid
                        ? { ...p, refillReminder: "" }
                        : p
                ));
            } else {
                toast.error(data.result?.message || 'Failed to clear refill reminder');
            }
        } catch (error) {
            toast.error('Error clearing refill reminder: ' + error.message);
        } finally {
            setResolveLoading(prev => ({ ...prev, [patient.authid + '_refill']: false }));
        }
    }
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
            const res = await fetch(`/api/ed-questionnaire/${authid}`, {
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
        );
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
        );
    }
    return (
        <div className="overflow-x-auto px-4">
            <MainButtonGroup />
            <div className="flex flex-wrap gap-2 mb-4">
                {userType === 'C' && (
                    <Select value={ticketFilter} onValueChange={setTicketFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter Tickets" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="assigned">Assigned Patients</SelectItem>
                            <SelectItem value="all">All Patients</SelectItem>
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
                    placeholder="Filter by email or name..."
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
                                    <SelectItem value="Sildenafil (Generic of Viagra)">Sildenafil (Generic of Viagra)</SelectItem>
                                    <SelectItem value="Tadalafil (Generic of Cialis)">Tadalafil (Generic of Cialis)</SelectItem>
                                    <SelectItem value="Fusion Mini Troches (Tadalafil/Sildenafil)">Fusion Mini Troches (Tadalafil/Sildenafil)</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Dose Filter */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium px-2">Dose</label>
                            <div className="flex gap-2">
                                <Select value={doseOnly} onValueChange={setDoseOnly}>
                                    <SelectTrigger className="w-1/2">
                                        <SelectValue placeholder="Dose" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="25mg">25mg</SelectItem>
                                        <SelectItem value="50mg">50mg</SelectItem>
                                        <SelectItem value="100mg">100mg</SelectItem>
                                        <SelectItem value="5mg">5mg</SelectItem>
                                        <SelectItem value="10mg">10mg</SelectItem>
                                        <SelectItem value="20mg">20mg</SelectItem>
                                        <SelectItem value="5/35mg">5/35mg</SelectItem>
                                        <SelectItem value="10/40mg">10/40mg</SelectItem>
                                        <SelectItem value="None">None</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Input
                                    className="w-full"
                                    placeholder="Unit (free text)"
                                    value={unitFilter}
                                    onChange={(e) => setUnitFilter(e.target.value)}
                                />
                            </div>
                        </div>

                    </DropdownMenuContent>
                </DropdownMenu>

                {(userType === 'A' || userType === 'T') && (
                    <ClinicianDropdown selectedPatients={selectedPatients} />
                )}

                {(userType === 'A') && (
                    <Select value={clinicianFilter} onValueChange={setClinicianFilter}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Clinician" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {clinicians.map(c => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.fullname} ({c.id})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                <div className="flex items-center">
                    {/* From date */}
                    <input
                        id="fromDate"
                        type="text"
                        inputMode="numeric"
                        placeholder="MM / DD / YYYY"
                        className="bg-gray-50 border-secondary border-l-2 border-0 focus:outline-none focus:border-l-4 duration-150 ease-in-out text-gray-900 text-sm rounded-l-md block w-32 p-1.5"
                        value={fromDateStr}
                        onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');

                            if (e.nativeEvent.inputType === 'deleteContentBackward') {
                                e.target.value = value;
                                setFromDateStr(e.target.value);
                                return;
                            }

                            if (value.length <= 8) {
                                let formatted = value;
                                if (value.length > 4) {
                                    formatted = `${value.slice(0, 2)} / ${value.slice(2, 4)} / ${value.slice(4)}`;
                                } else if (value.length > 2) {
                                    formatted = `${value.slice(0, 2)} / ${value.slice(2)}`;
                                }
                                e.target.value = formatted;
                            }

                            if (value.length >= 2) {
                                const month = parseInt(value.slice(0, 2));
                                if (month > 12) {
                                    e.target.value = `12 / ${value.slice(2)}`;
                                }
                            }

                            if (value.length >= 4) {
                                const month = parseInt(value.slice(0, 2));
                                const day = parseInt(value.slice(2, 4));
                                const maxDay = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
                                if (day > maxDay) {
                                    e.target.value = `${value.slice(0, 2)} / ${maxDay} / ${value.slice(4)}`;
                                }
                            }
                            setFromDateStr(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') e.preventDefault();
                            if ([8, 46, 9, 27, 13].includes(e.keyCode)) return;
                            if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) return;
                            if ([35, 36, 37, 39].includes(e.keyCode)) return;
                            if (!/^\d$/.test(e.key)) e.preventDefault();
                        }}
                    />

                    {/* TO divider */}
                    <div className="bg-secondary text-white text-xs px-2 py-1 border-t border-b border-gray-300">
                        TO
                    </div>
                    {/* To date */}
                    <input
                        id="toDate"
                        type="text"
                        inputMode="numeric"
                        placeholder="MM / DD / YYYY"
                        className="bg-gray-50 border-secondary border-r-2 border-0 focus:outline-none focus:border-r-4 duration-150 ease-in-out text-gray-900 text-sm rounded-r-md block w-32 p-1.5"
                        value={toDateStr}
                        onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');

                            if (e.nativeEvent.inputType === 'deleteContentBackward') {
                                e.target.value = value;
                                setToDateStr(e.target.value);
                                return;
                            }

                            if (value.length <= 8) {
                                let formatted = value;
                                if (value.length > 4) {
                                    formatted = `${value.slice(0, 2)} / ${value.slice(2, 4)} / ${value.slice(4)}`;
                                } else if (value.length > 2) {
                                    formatted = `${value.slice(0, 2)} / ${value.slice(2)}`;
                                }
                                e.target.value = formatted;
                            }

                            if (value.length >= 2) {
                                const month = parseInt(value.slice(0, 2));
                                if (month > 12) {
                                    e.target.value = `12 / ${value.slice(2)}`;
                                }
                            }

                            if (value.length >= 4) {
                                const month = parseInt(value.slice(0, 2));
                                const day = parseInt(value.slice(2, 4));
                                const maxDay = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
                                if (day > maxDay) {
                                    e.target.value = `${value.slice(0, 2)} / ${maxDay} / ${value.slice(4)}`;
                                }
                            }
                            setToDateStr(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') e.preventDefault();
                            if ([8, 46, 9, 27, 13].includes(e.keyCode)) return;
                            if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) return;
                            if ([35, 36, 37, 39].includes(e.keyCode)) return;
                            if (!/^\d$/.test(e.key)) e.preventDefault();
                        }}
                    />

                </div>
                <Select
                    value={filteredPatients.heardAbout}
                    onValueChange={setHeardAboutFilters}

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
            {
                (userType === 'A' || userType === 'C') && (
                    <div className="flex flex-wrap gap-4 mb-1 px-2 ">
                        <PillSelect
                            value={followUpFilter}
                            onChange={setFollowUpFilter}
                            options={["7d", "14d", "30d", "None", "all"]}
                            counts={followUpCounts}
                            labelPrefix="Follow Up"
                            formatUnit="d"
                            tone={{
                                bg: "bg-cyan-200 text-cyan-900",
                                text: "text-cyan-900",
                                badge: "bg-cyan-600 text-white",
                            }}
                            placeholder="Follow Up"
                            showTotal   // ✅ this makes it show total count instead of per-option
                        />

                        <PillSelect
                            value={refillReminderFilter}
                            onChange={setRefillReminderFilter}
                            options={["4w", "5w", "6w", "8w", "10w", "12w", "13w", "None", "all"]}
                            counts={refillReminderCounts}
                            labelPrefix="Refill"
                            formatUnit="w"
                            tone={{
                                bg: "bg-slate-200 text-slate-900",
                                text: "text-slate-900",
                                badge: "bg-slate-700 text-white",
                            }}
                            placeholder="Refill Reminder"
                            showTotal   // ✅ this makes it show total count instead of per-option
                        />
                    </div>
                )
            }
            {
                (userType === 'A' || userType === 'C') && (
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
                )
            }

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
                                {/* <TableHead>BMI</TableHead> */}
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
                                <TableHead >Treatment</TableHead>
                                {/* <TableHead>Taking Medication</TableHead> */}
                                {/* <TableHead>Medicine Allergy</TableHead>
                                <TableHead>Allergy List</TableHead>
                                <TableHead>Major Surgeries</TableHead>
                                <TableHead>Bariatric Surgery</TableHead>
                                <TableHead>Thyroid Cancer History</TableHead>
                                <TableHead>Surgery List</TableHead>
                                <TableHead>Disqualifiers</TableHead> */}
                                {/* <TableHead>Diagnosis</TableHead> */}

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

                                {/* <TableHead>Medicine</TableHead> */}
                                <TableHead className="w-[40px]">Images</TableHead>
                                {/* dose */}
                                <TableHead>Dose</TableHead>

                                {/* <TableHead>Plan Purchased</TableHead>
                                <TableHead>Vial</TableHead>
                                <TableHead>Dosing Schedule</TableHead> */}

                                {/* Provider Info */}
                                {/* <TableHead>Provider Comments</TableHead> */}

                                {(userType === 'A' || userType === 'C') && (
                                    <>
                                        <TableHead className="sticky right-[155px] z-10 w-[80px] bg-secondary text-white whitespace-nowrap">Status</TableHead>
                                        <TableHead className="sticky right-[66px] z-10 w-[80px] bg-secondary text-white whitespace-nowrap">Outcome</TableHead>
                                    </>
                                )}
                                {/* <TableHead>Provider Note</TableHead> */}
                                {userType === 'T' && (
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

                                    <TimeSensitiveCell
                                        patient={patient}
                                        now={now}
                                        session={session}
                                        clinicians={clinicians}
                                        assignedInfo={assignmentByPid.get(patient.authid)}
                                        onAssignmentsChanged={handleAssignmentsChanged}
                                        onAutoClose={(p) =>
                                            handleDelete(
                                                p.authid,
                                                "Automatically closed after 120 hours without approval"
                                            )
                                        }
                                    />

                                    <TableCell className="sticky left-[206px] z-10 w-[100px] text-secondary bg-white font-bold">
                                        {patient.firstName}
                                    </TableCell>
                                    <TableCell className="sticky left-[294px] z-10 w-[100px] text-secondary bg-white font-bold">
                                        {patient.lastName}
                                    </TableCell>

                                    {/* Patient Data */}
                                    <TableCell className="whitespace-nowrap">
                                        {patient.dateOfBirth?.split("T")[0]}
                                    </TableCell>

                                    <TableCell>{patient.sex}</TableCell>
                                    {/* <TableCell>{patient.height}</TableCell> */}
                                    {/* <TableCell>{patient.weight}</TableCell> */}
                                    {/* <TableCell>{patient.bmi}</TableCell> */}
                                    <TableCell>{patient.email}</TableCell>
                                    <TableCell className="whitespace-nowrap">{patient.phone}</TableCell>

                                    {/* <TableCell>{patient.address1}</TableCell>
                                    <TableCell>{patient.city}</TableCell>
                                    <TableCell>{patient.state}</TableCell>
                                    <TableCell>{patient.zip}</TableCell> */}

                                    {/* <TableCell>{patient.bloodPressure}</TableCell>
                                    <TableCell>{patient.heartRate}</TableCell> */}
                                    <TableCell className="whitespace-nowrap">{patient.currentMedication}</TableCell>
                                    {/* <TableCell>{patient.takingMedication}</TableCell> */}
                                    {/* <TableCell>{patient.medicineAllergy}</TableCell>
                                    <TableCell>{patient.allergyList}</TableCell>
                                    <TableCell>{patient.majorSurgeries}</TableCell>
                                    <TableCell>{patient.bariatricSurgery}</TableCell>
                                    <TableCell>{patient.thyroidCancerHistory}</TableCell>
                                    <TableCell>{patient.surgeryList}</TableCell>
                                    <TableCell>{patient.disqualifiers}</TableCell> */}
                                    {/* <TableCell>{patient.diagnosis}</TableCell> */}
                                    {/* <TableCell className="relative overflow-visible">
                                        <DiagnosisCell diagnosis={patient.desDiagnosed} />
                                    </TableCell> */}


                                    {/* <TableCell>{patient.startingWeight}</TableCell>
                                    <TableCell>{patient.currentWeight}</TableCell>
                                    <TableCell>{patient.goalWeight}</TableCell>
                                    <TableCell>{patient.weightChange12m}</TableCell>
                                    <TableCell>{patient.weightLossPrograms}</TableCell>
                                    <TableCell>{patient.weightLossMeds12m}</TableCell> */}

                                    {/* <TableCell>{patient.glpTaken}</TableCell>
                                    <TableCell>{patient.glpRecentInjection}</TableCell> */}

                                    {/* <TableCell>{patient.desCurrentlyTakingAnyMedications}</TableCell> */}

                                    <TableCell className="w-[200px] max-h-20">
                                        <div className="flex gap-1 overflow-x-auto">
                                            {patient.images?.map((image, index) => (
                                                <Image
                                                    key={index}
                                                    src={image}
                                                    alt={`Preview ${index + 1}`}
                                                    width={48}      // h-12 = 48px
                                                    height={48}     // w-12 = 48px
                                                    className="h-12 w-12 object-cover cursor-pointer rounded border flex-shrink-0"
                                                    onClick={() =>
                                                        setSelectedImageInfo({
                                                            images: patient.images,
                                                            index: index,
                                                        })
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </TableCell>


                                    <TableCell className="whitespace-nowrap">
                                        {patient.dose}
                                    </TableCell>

                                    {/* <TableCell>{patient.tirzepetidePlanPurchased}</TableCell>
                                    <TableCell>{patient.tirzepetideVial}</TableCell>
                                    <TableCell>{patient.tirzepetideDosingSchedule}</TableCell>

                                    <TableCell>{patient.providerComments}</TableCell> */}

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
                                                {userType === 'T' && (
                                                    <ClinicianAction patient={patient} />
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
                                                        <Link href={`/dashboard/questionnaire/ed/${patient.authid}`}>Open</Link>
                                                    </DropdownMenuItem>
                                                )}

                                                {followUpFilter !== 'all' && (
                                                    <Button
                                                        className="bg-green-200 text-black mt-2 text-sm flex justify-start w-full pl-2 hover:bg-green-300"
                                                        disabled={resolveLoading[patient.authid + '_followup']}
                                                        onClick={() => handleResolveFollowUp(patient)}
                                                    >
                                                        {resolveLoading[patient.authid + '_followup'] ? 'Resolving...' : 'Follow Up Resolve'}
                                                    </Button>
                                                )}

                                                {refillReminderFilter !== 'all' && (
                                                    <Button
                                                        className="bg-green-200 text-black mt-2 text-sm flex justify-start w-full pl-2 hover:bg-green-300"
                                                        disabled={resolveLoading[patient.authid + '_refill']}
                                                        onClick={() => handleResolveRefillReminder(patient)}
                                                    >
                                                        {resolveLoading[patient.authid + '_refill'] ? 'Resolving...' : 'Refill Reminder Resolve'}
                                                    </Button>
                                                )}

                                                {userType === 'A' && (
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => {
                                                            setSelectedPatientId(patient.authid);
                                                            setDeleteReason("");      // reset reason each time
                                                            setOpenDialog(true);
                                                        }}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
                {(userType === 'A' || userType === 'T') && (
                    <Link href="/dashboard/questionnaire/ed/new">
                        <Button className="bg-secondary hover:bg-secondary"><Plus /> Add Patient</Button>
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

                        <div className="flex-1 max-h-[70vh] flex justify-center relative">
                            {selectedImageInfo && (
                                <div className="relative max-h-full max-w-full w-full h-full flex items-center justify-center">
                                    <Image
                                        src={selectedImageInfo.images[selectedImageInfo.index]}
                                        alt="Full preview"
                                        fill                // <-- dynamically fills container
                                        className="object-contain"
                                        sizes="100vw"       // <-- improves performance
                                    />
                                </div>
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
                                }
                                setSelectedPatientId(null);
                                setDeleteReason("");
                                setOpenDialog(false);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Move to Closed Tickets
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div >
    );
}