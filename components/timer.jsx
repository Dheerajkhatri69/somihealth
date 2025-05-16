import { useEffect, useState } from "react";
import { Bot, Timer } from "lucide-react";
import { TableCell } from "./ui/table";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Button } from "./ui/button";

function TimeSensitiveCell({ patient }) {
    const { data: session } = useSession();
    const [timeLeft, setTimeLeft] = useState("00:00:00");
    const [hoursPassed, setHoursPassed] = useState(0);
    const [clinicianAssignData, setClinicianAssignData] = useState([]);
    const [isDeleted, setIsDeleted] = useState(false); // Add this state

    const [creatorInfo, setCreatorInfo] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        }
    }, [isDialogOpen, patient.authid]);

    const handleDelete = async (authid, reason) => {
        if (isDeleted) return; // Prevent multiple calls

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
                setIsDeleted(true); // Mark as deleted
                toast.success("Patient moved to Closed Tickets");
            } else {
                toast.error(data.result.message || "Failed to close ticket");
            }
        } catch (err) {
            toast.error("Error: " + err.message);
        }
    };

    useEffect(() => {
        if (isDeleted) return; // Don't run timer if deleted

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

            if (diffHrs >= 120 && patient.approvalStatus === "" && !isDeleted) {
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

    const isOver24 = hoursPassed >= 24 && patient.approvalStatus === "";
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

                    {patient.approvalStatus === "" && !isOver120 && (
                        <div className="absolute -top-7 -right-1 group">
                            <Timer className="cursor-pointer text-secondary-foreground rounded-full text-sm" />
                            <div className="absolute -top-7 -right-5 hidden group-hover:block bg-black/50 text-white text-xs px-2 py-1 rounded z-50 whitespace-nowrap">
                                {timeLeft} left
                            </div>
                        </div>
                    )}
                    {/* Bot icon - modified */}
                    {session?.user?.accounttype === 'A' && (
                        <div
                            className="absolute -top-7 -left-1 group cursor-pointer"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            <Bot className={`rounded-full text-sm ${isClinicianAssigned ? "text-green-500" : "text-yellow-500"
                                }`} />
                        </div>
                    )}
                </div>
            </TableCell>

            {/* Alert Dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Patient Details</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-medium">Created By:</h4>
                                {creatorInfo ? (
                                    <div className="pl-4">
                                        <p>Technician ID: {creatorInfo.tid}</p>
                                        <p>Technician Name: {creatorInfo.tname}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No creator information found</p>
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
                        </AlertDialogDescription>
                    </AlertDialogHeader>
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
        </>
    );
}

export default TimeSensitiveCell;