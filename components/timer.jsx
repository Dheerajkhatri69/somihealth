import { useEffect, useState } from "react";
import { Bot, Timer } from "lucide-react";
import { TableCell } from "./ui/table";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

function TimeSensitiveCell({ patient }) {
    const { data: session } = useSession();
    const [timeLeft, setTimeLeft] = useState("00:00:00");
    const [hoursPassed, setHoursPassed] = useState(0);
    const [clinicianAssignData, setClinicianAssignData] = useState([]);
    const [isDeleted, setIsDeleted] = useState(false);
    const [creatorInfo, setCreatorInfo] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [clinicians, setClinicians] = useState([]);
    const [selectedClinician, setSelectedClinician] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [operation, setOperation] = useState("assign");

    useEffect(() => {
        if (isDialogOpen) {
            const fetchCreatorInfo = async () => {
                try {
                    const res = await fetch(`/api/creatorofp?pid=${patient.authid}`);
                    const data = await res.json();
                    if (data.success && data.result.length > 0) {
                        setCreatorInfo(data.result[0]);
                    } else {
                        setCreatorInfo(null);
                    }
                } catch (error) {
                    console.error("Error fetching creator info:", error);
                    setCreatorInfo(null);
                }
            };
            fetchCreatorInfo();

            // Fetch clinicians when dialog opens
            const fetchClinicians = async () => {
                try {
                    const userRes = await fetch("/api/users");
                    const userData = await userRes.json();
                    const clinicianList = userData.result?.filter(user => user.accounttype === "C") || [];
                    setClinicians(clinicianList);
                } catch (error) {
                    console.error("Error fetching clinicians:", error);
                    toast.error("Failed to load clinicians");
                }
            };
            fetchClinicians();
        }
    }, [isDialogOpen, patient.authid]);

    const handleDelete = async (authid, reason) => {
        if (isDeleted) return;

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
                setIsDeleted(true);
                toast.success("Patient moved to Closed Tickets");
            } else {
                toast.error(data.result.message || "Failed to close ticket");
            }
        } catch (err) {
            toast.error("Error: " + err.message);
        }
    };

    useEffect(() => {
        if (isDeleted) return;

        const createdAt = new Date(patient.createTimeDate);

        const updateCountdown = () => {
            const now = new Date();
            const diffMs = now - createdAt;
            const diffHrs = diffMs / (1000 * 60 * 60);
            setHoursPassed(diffHrs);

            let target = createdAt.getTime() + 24 * 60 * 60 * 1000;
            if (diffHrs >= 24) target = createdAt.getTime() + 120 * 60 * 60 * 1000;

            const remaining = Math.max(0, target - now.getTime());
            const hrs = Math.floor(remaining / (1000 * 60 * 60));
            const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((remaining % (1000 * 60)) / 1000);

            setTimeLeft(`${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);

            if (diffHrs >= 120 && patient.approvalStatus === "None" && !isDeleted) {
                handleDelete(patient.authid, "Automatically closed after 120 hours without approval");
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [patient.createTimeDate, patient.approvalStatus, patient.authid, isDeleted]);

    useEffect(() => {
        async function fetchData() {
            try {
                const assignRes = await fetch("/api/assigning");
                const assignData = await assignRes.json();
                const assignlist = assignData.result;

                const userRes = await fetch("/api/users");
                const userData = await userRes.json();
                const clinicianList = userData.result?.filter(user => user.accounttype === "C") || [];

                const filteredData = assignlist.map(assign => {
                    const clinician = clinicianList.find(user => user.id === assign.cid);
                    if (clinician) {
                        return {
                            id: clinician.id,
                            fullname: clinician.fullname,
                            pid: assign.pid
                        };
                    }
                    return null;
                }).filter(Boolean);

                setClinicianAssignData(filteredData);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load data");
            }
        }

        fetchData();
    }, []);

    const handleAssignment = async () => {
        if (!selectedClinician && operation !== "delete") {
            toast.error("Please select a clinician");
            return;
        }

        setIsSubmitting(true);
        try {
            let response;
            const pid = patient.authid;

            if (operation === "assign" || operation === "update") {
                response = await fetch("/api/assigning", {
                    method: operation === "update" ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cid: selectedClinician,
                        pid
                    }),
                });
            } else if (operation === "delete") {
                response = await fetch(`/api/assigning?pid=${pid}`, {
                    method: "DELETE",
                });
            }

            const data = await response.json();

            if (data.success) {
                toast.success(`Assignment ${operation}d successfully`);
                // Refresh assignment data
                const assignRes = await fetch("/api/assigning");
                const assignData = await assignRes.json();
                const assignlist = assignData.result;

                const userRes = await fetch("/api/users");
                const userData = await userRes.json();
                const clinicianList = userData.result?.filter(user => user.accounttype === "C") || [];

                const filteredData = assignlist.map(assign => {
                    const clinician = clinicianList.find(user => user.id === assign.cid);
                    if (clinician) {
                        return {
                            id: clinician.id,
                            fullname: clinician.fullname,
                            pid: assign.pid
                        };
                    }
                    return null;
                }).filter(Boolean);

                setClinicianAssignData(filteredData);
            } else {
                toast.error(data.result?.message || `Failed to ${operation} assignment`);
            }
        } catch (error) {
            console.error(`Error during ${operation}:`, error);
            toast.error("An error occurred while processing.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isOver24 = hoursPassed >= 24 && patient.approvalStatus === "None";
    const isOver120 = hoursPassed >= 120;

    const matchedClinician = clinicianAssignData.find(c => c.pid === patient.authid);
    const isClinicianAssigned = !!matchedClinician;

    return (
        <>
            <TableCell
                className={`sticky left-[126px] z-20 w-[80px] text-center text-wrap font-bold bg-white text-secondary ${isOver24 && !isOver120 ? "bg-red-100 text-red-700" : ""
                    }`}
            >
                <div className="relative">
                    {patient.authid}

                    {patient.approvalStatus === "None" && !isOver120 && (
                        <div className="absolute -top-5 -right-1 group">
                            <Timer className="cursor-pointer text-secondary-foreground rounded-full text-sm" />
                            <div className="absolute -top-7 -right-5 hidden group-hover:block bg-black/50 text-white text-xs px-2 py-1 rounded z-50 whitespace-nowrap">
                                {timeLeft} left
                            </div>
                        </div>
                    )}

                    {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'T') && (
                        <div
                            className="absolute -top-5 -left-1 group cursor-pointer"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            <Bot className={`rounded-full text-sm ${isClinicianAssigned ? "text-green-500" : "text-yellow-500"
                                }`} />
                        </div>
                    )}
                </div>
            </TableCell>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent className="sm:max-w-[600px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Patient Details</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-medium">Patient ID:</h4>
                                <p className="pl-4">{patient.authid}</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium">Created By:</h4>
                                {creatorInfo ? (
                                    <div className="pl-4">
                                        <p>Technician ID: {creatorInfo.tid}</p>
                                        <p>Technician Name: {creatorInfo.tname}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">System record created by Admin</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium">Assigned Clinician:</h4>
                                {isClinicianAssigned ? (
                                    <div className="pl-4">
                                        <p>Clinician ID: {matchedClinician.id}</p>
                                        <p>Clinician Name: {matchedClinician.fullname}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Not assigned yet</p>
                                )}
                            </div>

                            <div className="grid gap-4 pt-4">
                                <div className="grid gap-2">
                                    <label className="block text-sm font-medium mb-1">Operation</label>
                                    <Select value={operation} onValueChange={setOperation}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="assign">Assign Clinician</SelectItem>
                                            <SelectItem value="update">Update Assignment</SelectItem>
                                            <SelectItem value="delete">Remove Assignment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {operation !== "delete" && (
                                    <div className="grid gap-2">
                                        <label className="block text-sm font-medium mb-1">Select Clinician</label>
                                        <Select
                                            value={selectedClinician}
                                            onValueChange={setSelectedClinician}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Clinician" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clinicians.map((clinician) => (
                                                    <SelectItem key={clinician.id} value={clinician.id}>
                                                        {clinician.fullname}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button
                            onClick={() => setIsDialogOpen(false)}
                            variant="outline"
                            disabled={isSubmitting}
                        >
                            Close
                        </Button>
                        <Button
                            onClick={handleAssignment}
                            disabled={isSubmitting || (operation !== "delete" && !selectedClinician)}
                        >
                            {isSubmitting ? (
                                `${operation.charAt(0).toUpperCase() + operation.slice(1)}ing...`
                            ) : (
                                operation.charAt(0).toUpperCase() + operation.slice(1)
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default TimeSensitiveCell;