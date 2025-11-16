import { useEffect, useMemo, useState } from "react";
import { Bot, Timer } from "lucide-react";
import { TableCell } from "./ui/table";
import toast from "react-hot-toast";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

/**
 * Props:
 * - patient
 * - now (Date)          // global ticking time from parent
 * - session             // from useSession in parent
 * - clinicians          // array from parent
 * - assignedInfo        // { id, fullname, createTimeDate } | undefined
 * - onAssignmentsChanged()  // callback → parent refetch /api/assigning
 * - onAutoClose(patient)    // optional, called when >= 120h & still None
 */
function TimeSensitiveCell({
    patient,
    now,
    session,
    clinicians,
    assignedInfo,
    onAssignmentsChanged,
    onAutoClose,
}) {
    const [isDeleted, setIsDeleted] = useState(false);
    const [creatorInfo, setCreatorInfo] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedClinician, setSelectedClinician] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [operation, setOperation] = useState("assign");

    // ----- Time calculations (pure, cheap) -----
    const createdAt = useMemo(
        () => new Date(patient.createTimeDate),
        [patient.createTimeDate]
    );

    const diffMs = now.getTime() - createdAt.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);

    const isOver24 =
        diffHrs >= 24 &&
        (patient.approvalStatus === "None" || !patient.approvalStatus);
    const isOver120 = diffHrs >= 120;

    let target = createdAt.getTime() + 24 * 60 * 60 * 1000;
    if (diffHrs >= 24) {
        // after 24h, show countdown to 120h
        target = createdAt.getTime() + 120 * 60 * 60 * 1000;
    }

    const remaining = Math.max(0, target - now.getTime());
    const hrs = Math.floor(remaining / (1000 * 60 * 60));
    const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((remaining % (1000 * 60)) / 1000);

    const timeLeft = `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

    // ----- Auto-close after 120 hours -----
    useEffect(() => {
        if (
            !isDeleted &&
            isOver120 &&
            (patient.approvalStatus === "None" || !patient.approvalStatus) &&
            onAutoClose
        ) {
            onAutoClose(patient); // parent will call handleDelete
            setIsDeleted(true);
        }
    }, [isDeleted, isOver120, patient, onAutoClose]);

    // ----- Fetch creator info only when dialog opens -----
    useEffect(() => {
        if (!isDialogOpen) return;

        let cancelled = false;

        const fetchCreatorInfo = async () => {
            try {
                const res = await fetch(`/api/creatorofp?pid=${patient.authid}`);
                const data = await res.json();
                if (cancelled) return;

                if (data.success && data.result.length > 0) {
                    setCreatorInfo(data.result[0]);
                } else {
                    setCreatorInfo(null);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Error fetching creator info:", error);
                    setCreatorInfo(null);
                }
            }
        };

        fetchCreatorInfo();
        return () => {
            cancelled = true;
        };
    }, [isDialogOpen, patient.authid]);

    // ----- Assignment operations -----
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
                        pid,
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

                // Ask parent to refresh assignedPatients + clinicians map
                if (onAssignmentsChanged) {
                    onAssignmentsChanged();
                }

                setIsDialogOpen(false);
                setSelectedClinician("");
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

    const canSeeBot =
        session?.user?.accounttype === "A" || session?.user?.accounttype === "T";

    const isClinicianAssigned = !!assignedInfo;

    return (
        <>
            <TableCell
                className={`sticky left-[133px] z-20 w-[80px] text-center text-wrap font-bold bg-white text-secondary ${isOver24 && !isOver120 ? "bg-red-100 text-red-700" : ""
                    }`}
            >
                <div className="relative">
                    {patient.authid}

                    {/* Countdown tooltip */}
                    {(patient.approvalStatus === "None" || !patient.approvalStatus) &&
                        !isOver120 && (
                            <div className="absolute -top-5 -right-1 group">
                                <Timer className="cursor-pointer text-secondary-foreground rounded-full text-sm" />
                                <div className="absolute -top-7 -right-5 hidden group-hover:block bg-black/50 text-white text-xs px-2 py-1 rounded z-50 whitespace-nowrap">
                                    {timeLeft} left
                                </div>
                            </div>
                        )}

                    {/* Bot icon for assignment */}
                    {canSeeBot && (
                        <div
                            className="absolute -top-5 -left-1 group cursor-pointer"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            <Bot
                                className={`rounded-full text-sm ${isClinicianAssigned ? "text-green-500" : "text-yellow-500"
                                    }`}
                            />
                        </div>
                    )}
                </div>
            </TableCell>

            {/* Assignment / details dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent className="sm:max-w-[600px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-secondary text-xl">
                            Patient Details
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4 text-black">
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
                                    <p className="text-sm">System record created by Admin</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium">Assigned Clinician:</h4>
                                {isClinicianAssigned && assignedInfo ? (
                                    <div className="pl-4">
                                        <p>Clinician ID: {assignedInfo.id}</p>
                                        <p>Clinician Name: {assignedInfo.fullname}</p>
                                        {assignedInfo.createTimeDate && (
                                            <p>
                                                Date:{" "}
                                                {(() => {
                                                    const d = new Date(assignedInfo.createTimeDate);
                                                    return `${String(d.getMonth() + 1).padStart(
                                                        2,
                                                        "0"
                                                    )}-${String(d.getDate()).padStart(
                                                        2,
                                                        "0"
                                                    )}-${d.getFullYear()}`;
                                                })()}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm">Not assigned yet</p>
                                )}
                            </div>

                            <div className="grid gap-4 pt-4">
                                <div className="grid gap-2">
                                    <label className="block text-sm font-medium mb-1">
                                        Operation
                                    </label>
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
                                        <label className="block text-sm font-medium mb-1">
                                            Select Clinician
                                        </label>
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
                            disabled={
                                isSubmitting ||
                                (operation !== "delete" && !selectedClinician)
                            }
                        >
                            {isSubmitting
                                ? `${operation.charAt(0).toUpperCase() + operation.slice(1)}ing...`
                                : operation.charAt(0).toUpperCase() + operation.slice(1)}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default TimeSensitiveCell;
