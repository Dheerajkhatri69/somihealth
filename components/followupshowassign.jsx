import { useEffect, useState } from "react";
import { Bot, Timer } from "lucide-react";
import { TableCell } from "./ui/table";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

function FollowupShowAssig({ patient }) {
    const { data: session } = useSession();

    const [clinicianAssignData, setclinicianAssignData] = useState([]);

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

                setclinicianAssignData(filteredData); // <-- This line was missing
                // console.log("final data list", filteredData);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load data");
            }
        }

        fetchData();
    }, []);


    return (
        <TableCell
            className="sticky left-[35px] z-20 w-[80px] text-center text-wrap font-bold bg-white text-secondary"
        >
            <div className="relative">
                {patient.authid}
                {session?.user?.accounttype === 'A' &&
                    clinicianAssignData.find(c => c.pid === patient.authid) && (
                        <div className="absolute -top-7 -left-1 group">
                            <Bot className="cursor-pointer text-secondary-foreground rounded-full text-sm" />
                            <div className="absolute -top-10 -right-20 hidden group-hover:block bg-black/50 text-white text-xs px-2 py-1 rounded z-50 whitespace-nowrap">
                                {(() => {
                                    const matchedClinician = clinicianAssignData.find(c => c.pid === patient.authid);
                                    return (
                                        <>
                                            <span>Assigned Clinician</span><br />
                                            <span>ID: {matchedClinician.id}</span><br />
                                            <span>NAME: {matchedClinician.fullname}</span>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )
                }
            </div>
        </TableCell>
    );
}

export default FollowupShowAssig;
