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
import { patients } from "../../public/patientsdata";
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

export default function Dashboard() {
    const { data: session } = useSession();

    useEffect(() => {
        console.log("dashboard Session user:", session?.user);
    }, [session]);

    const [selectedEmail, setSelectedEmail] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPatients, setSelectedPatients] = useState([]);

    // Add this state at the top
    const [selectAll, setSelectAll] = useState(false);
    const checkboxRef = useRef(null);


    useEffect(() => {
        if (selectedPatients.length > 0) {
            const selectedPatient = patients.find(p => p.patientId === selectedPatients[0]);
            setSelectedEmail(selectedPatient?.email || '');
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
        const pIdMatch = patient.patientId.toLowerCase().includes(pIdFilter.toLowerCase());
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
            const allFilteredIds = filteredPatients.map(p => p.patientId);
            setSelectedPatients(allFilteredIds);
        } else {
            setSelectedPatients([]);
        }
        setSelectAll(checked);
    };
    const handleDelete = (patientId) => {
        // Implement your delete logic here
        console.log('Deleting patient:', patientId);
        // Example implementation:
        // const updatedPatients = patients.filter(p => p.patientId !== patientId);
        // setPatients(updatedPatients); // If you're using state for patients
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
    return (
        <div className="overflow-x-auto p-4">
            <div className="flex flex-wrap gap-2 mb-4">
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
                    <DropdownMenuTrigger className='text-white bg-secondary px-2 rounded-sm hover:bg-secondary-foreground duration-200 flex justify-center items-center gap-1'>
                        Filters
                        <ArrowDownNarrowWide />
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
                                        <SelectItem value="0.25">0.25</SelectItem>
                                        <SelectItem value="0.50">0.50</SelectItem>
                                        <SelectItem value="1.00">1.00</SelectItem>
                                        <SelectItem value="1.7">1.7</SelectItem>
                                        <SelectItem value="2.00">2.00</SelectItem>
                                        <SelectItem value="2.5">2.5</SelectItem>
                                        <SelectItem value="4.00">4.00</SelectItem>
                                        <SelectItem value="6.80">6.80</SelectItem>
                                        <SelectItem value="10.00">10.00</SelectItem>
                                        <SelectItem value="15.00">15.00</SelectItem>
                                        <SelectItem value="20.00">20.00</SelectItem>
                                        <SelectItem value="25.00">25.00</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={semaglutideUnitFilter} onValueChange={setSemaglutideUnitFilter}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="mg">mg</SelectItem>
                                        <SelectItem value="mg/ml">mg/mL</SelectItem>
                                        <SelectItem value="mg/2ml">mg/2mL</SelectItem>
                                        <SelectItem value="mg/3ml">mg/3mL</SelectItem>
                                        <SelectItem value="mg/4ml">mg/4mL</SelectItem>
                                        <SelectItem value="mg/5ml">mg/5mL</SelectItem>
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
                                        <SelectItem value="10.00">10.00</SelectItem>
                                        <SelectItem value="20.00">20.00</SelectItem>
                                        <SelectItem value="30.00">30.00</SelectItem>
                                        <SelectItem value="40.00">40.00</SelectItem>
                                        <SelectItem value="50.00">50.00</SelectItem>
                                        <SelectItem value="60.00">60.00</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={tirzepatideUnitFilter} onValueChange={setTirzepatideUnitFilter}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="mg/2ml">mg/2ml</SelectItem>
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
                                    {/* Select */}
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
                            <TableHead>DOB</TableHead>
                            <TableHead>Sex</TableHead>
                            <TableHead>Height</TableHead>
                            <TableHead>Weight (lbs)</TableHead>
                            <TableHead>BMI</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>

                            {/* Address */}
                            <TableHead>Address</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead>Zip</TableHead>

                            {/* Medical Information */}
                            <TableHead>Blood Pressure</TableHead>
                            <TableHead>Heart Rate</TableHead>
                            <TableHead>GLP-1 Preference</TableHead>
                            <TableHead>Taking Medication</TableHead>
                            <TableHead>Medicine Allergy</TableHead>
                            <TableHead>Allergy List</TableHead>
                            <TableHead>Major Surgeries</TableHead>
                            <TableHead>Bariatric Surgery</TableHead>
                            <TableHead>Thyroid Cancer History</TableHead>
                            <TableHead>Surgery List</TableHead>
                            <TableHead>Disqualifiers</TableHead>
                            <TableHead>Diagnosis</TableHead>

                            {/* Weight Management */}
                            <TableHead>Starting Weight</TableHead>
                            <TableHead>Current Weight</TableHead>
                            <TableHead>Goal Weight</TableHead>
                            <TableHead>12m Weight Change</TableHead>
                            <TableHead>Weight Loss Programs</TableHead>
                            <TableHead>Weight Loss Meds (12m)</TableHead>

                            {/* GLP-1 */}
                            <TableHead>GLP-1 Taken</TableHead>
                            <TableHead>Last Injection</TableHead>

                            <TableHead>Medicine</TableHead>
                            <TableHead className="w-[400px]">Images</TableHead>
                            {/* Semaglutide */}
                            <TableHead>Semaglutide Dose</TableHead>

                            {/* Tirzepatide */}
                            <TableHead>Tirzepatide Dose</TableHead>
                            <TableHead>Plan Purchased</TableHead>
                            <TableHead>Vial</TableHead>
                            <TableHead>Dosing Schedule</TableHead>

                            {/* Provider Info */}
                            <TableHead>Provider Comments</TableHead>

                            {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'C') && (
                                <TableHead>Status</TableHead>
                            )}
                            <TableHead>Out Come</TableHead>
                            <TableHead>Provider Note</TableHead>

                            <TableHead className="sticky right-0 bg-secondary text-white">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatients.map((patient) => (
                            <TableRow key={patient.patientId} >
                                {/* Sticky columns */}
                                <TableCell className="sticky w-[55px] left-0 z-10 bg-white">

                                    <Checkbox
                                        id={`select-patient-${patient.patientId}`}
                                        checked={selectedPatients.includes(patient.patientId)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedPatients(prev => [...prev, patient.patientId]);
                                            } else {
                                                setSelectedPatients(prev => prev.filter(id => id !== patient.patientId));
                                            }
                                        }}
                                        className="h-4 w-4"
                                    />
                                </TableCell>
                                <TableCell className="sticky left-[35px] z-20 w-[80px] text-center text-wrap text-secondary bg-white font-bold">
                                    <div className="relative">
                                        {patient.patientId}

                                        {patient.approvalStatus === "" && (
                                            <div className="absolute  -top-5 -right-1 group">
                                                <Timer className="cursor-pointer text-secondary-foreground rounded-full text-sm" />
                                                <div className="absolute -top-6 -right-5 hidden group-hover:block bg-black/50 text-white text-xs px-2 py-1 rounded z-50 whitespace-nowrap">
                                                    20:10:00
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell className="sticky left-[115px] z-10 w-[100px] text-secondary bg-white font-bold">
                                    {patient.firstName}
                                </TableCell>
                                <TableCell className="sticky left-[200px] z-10 w-[100px] text-secondary bg-white font-bold">
                                    {patient.lastName}
                                </TableCell>

                                {/* Patient Data */}
                                <TableCell>{patient.dob}</TableCell>
                                <TableCell>{patient.sex}</TableCell>
                                <TableCell>{patient.height}</TableCell>
                                <TableCell>{patient.weight}</TableCell>
                                <TableCell>{patient.bmi}</TableCell>
                                <TableCell>{patient.email}</TableCell>
                                <TableCell>{patient.phone}</TableCell>

                                <TableCell>{patient.address1}</TableCell>
                                <TableCell>{patient.city}</TableCell>
                                <TableCell>{patient.state}</TableCell>
                                <TableCell>{patient.zip}</TableCell>

                                <TableCell>{patient.bloodPressure}</TableCell>
                                <TableCell>{patient.heartRate}</TableCell>
                                <TableCell>{patient.glp1}</TableCell>
                                <TableCell>{patient.takingMedication}</TableCell>
                                <TableCell>{patient.medicineAllergy}</TableCell>
                                <TableCell>{patient.allergyList}</TableCell>
                                <TableCell>{patient.majorSurgeries}</TableCell>
                                <TableCell>{patient.bariatricSurgery}</TableCell>
                                <TableCell>{patient.thyroidCancerHistory}</TableCell>
                                <TableCell>{patient.surgeryList}</TableCell>
                                <TableCell>{patient.disqualifiers}</TableCell>
                                <TableCell>{patient.diagnosis}</TableCell>

                                <TableCell>{patient.startingWeight}</TableCell>
                                <TableCell>{patient.currentWeight}</TableCell>
                                <TableCell>{patient.goalWeight}</TableCell>
                                <TableCell>{patient.weightChange12m}</TableCell>
                                <TableCell>{patient.weightLossPrograms}</TableCell>
                                <TableCell>{patient.weightLossMeds12m}</TableCell>

                                <TableCell>{patient.glpTaken}</TableCell>
                                <TableCell>{patient.glpRecentInjection}</TableCell>

                                <TableCell>{patient.medicine}</TableCell>
                                <TableCell className="w-[200px] max-h-20">
                                    <div className="flex gap-1 overflow-x-auto">
                                        {patient.images?.map((image, index) => (
                                            <img
                                                key={index}
                                                src={image.preview}
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

                                <TableCell>
                                    {patient.semaglutideDose}{patient.semaglutideUnit}
                                </TableCell>

                                <TableCell>
                                    {patient.tirzepatideDose}{patient.tirzepatideUnit}
                                </TableCell>
                                <TableCell>{patient.tirzepetidePlanPurchased}</TableCell>
                                <TableCell>{patient.tirzepetideVial}</TableCell>
                                <TableCell>{patient.tirzepetideDosingSchedule}</TableCell>

                                <TableCell>{patient.providerComments}</TableCell>

                                {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'C') && (
                                    <TableCell className="capitalize">{patient.approvalStatus}</TableCell>
                                )}
                                <TableCell className={`${patient.approvalStatus === "approved" ||
                                    patient.approvalStatus === "denied"
                                    ? "text-red-500"
                                    : "text-green-500"
                                    }`}>
                                    {patient.approvalStatus === "approved" ||
                                        patient.approvalStatus === "denied"
                                        ? "Closed"
                                        : "Open"}
                                </TableCell>
                                <TableCell>{patient.providerNote}</TableCell>
                                <TableCell className={`sticky right-0 bg-white ${session?.user?.accounttype === 'A' ? 'flex flex-col gap-2' : ''}`}>
                                    <Link href={`/dashboard/${patient.patientId}`}>
                                        <Button variant="outline" size="sm">
                                            Update
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
                                                        This patient record will be moved to the <strong>Closed Tickets</strong> section. You can access it later from there.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>

                                                {/* Reason Input */}
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
                                                        onClick={() => handleDelete(patient.patientId, deleteReason)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Move to Closed Tickets
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
            </div>

            {/* Add Patient Button */}
            <div className="flex justify-start items-center gap-4 mt-4">
                <Link href="/dashboard/addrecord">
                    <Button ><Plus /> Add Patient</Button>
                </Link>
                {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'C') && (
                    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button disabled={!selectedPatients.length}>
                                Send Email
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Send Patient Email</AlertDialogTitle>
                                <AlertDialogDescription>
                                    <Input value={selectedEmail} readOnly className="my-2" />

                                    {/* Add this select dropdown for predefined messages */}
                                    <Select
                                        value={selectedTemplate}
                                        onValueChange={(value) => {
                                            const message = preDefinedMessages[value]?.content || '';
                                            setSelectedTemplate(value);
                                            setSelectedMessage(message);
                                        }}
                                    >
                                        <SelectTrigger id="template" className="w-full">
                                            <SelectValue placeholder="Select a template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {preDefinedMessages.map((message, index) => (
                                                <SelectItem key={index} value={String(index)}>
                                                    {message.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <textarea
                                        className="w-full mt-2 p-2 border rounded-md"
                                        placeholder="Compose message..."
                                        value={selectedMessage}
                                        onChange={(e) => setSelectedMessage(e.target.value)}
                                        rows={6}
                                    />
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleSendEmail(selectedMessage)}>
                                    Send
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
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
                                    src={selectedImageInfo.images[selectedImageInfo.index].preview}
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