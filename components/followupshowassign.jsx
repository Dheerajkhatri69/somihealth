import { useEffect, useState } from "react";
import { Bot, Timer } from "lucide-react";
import { TableCell } from "./ui/table";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

function FollowupShowAssig({ patient }) {
    const { data: session } = useSession();
    const [clinicianAssignData, setClinicianAssignData] = useState([]);
    const [creatorInfo, setCreatorInfo] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const assignRes = await fetch("/api/followupassig");
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

    // Fetch creator info when dialog opens
    useEffect(() => {
        if (isDialogOpen) {
            const fetchCreatorInfo = async () => {
                try {
                    const res = await fetch(`/api/followupcreatorofp?pid=${patient.authid}`);
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

    const matchedClinician = clinicianAssignData.find(c => c.pid === patient.authid);
    const isClinicianAssigned = !!matchedClinician;

    return (
        <>
            <TableCell className="sticky left-[126px] z-20 w-[80px] text-center text-wrap font-bold bg-white text-secondary">
                <div className="relative">
                    {patient.authid}
                    {session?.user?.accounttype === 'A' && (
                        <div 
                            className="absolute -top-7 -left-1 group cursor-pointer"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            <Bot className={`rounded-full text-sm ${
                                isClinicianAssigned ? "text-green-500" : "text-yellow-500"
                            }`} />
                        </div>
                    )}
                </div>
            </TableCell>

            {/* Alert Dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Followup Patient Details</AlertDialogTitle>
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

export default FollowupShowAssig;