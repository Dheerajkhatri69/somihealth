import { useEffect, useState } from "react";
import { Bot, Timer } from "lucide-react";
import { TableCell } from "./ui/table";
import { useSession } from "next-auth/react";

function TimeSensitiveCell({ patient, onDeletePatient }) {
    const { data: session } = useSession();
    const [timeLeft, setTimeLeft] = useState("00:00:00");
    const [hoursPassed, setHoursPassed] = useState(0);

    useEffect(() => {
        const createdAt = new Date(patient.createTimeDate);

        const updateCountdown = () => {
            const now = new Date();
            const diffMs = now - createdAt;
            const diffHrs = diffMs / (1000 * 60 * 60);
            setHoursPassed(diffHrs);

            let target = createdAt.getTime() + 24 * 60 * 60 * 1000; // 24-hour deadline
            if (diffHrs >= 24) target = createdAt.getTime() + 120 * 60 * 60 * 1000; // 120-hour deadline

            const remaining = Math.max(0, target - now.getTime());
            const hrs = Math.floor(remaining / (1000 * 60 * 60));
            const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((remaining % (1000 * 60)) / 1000);

            setTimeLeft(`${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);

            if (diffHrs >= 120 && patient.approvalStatus === "") {
                onDeletePatient(patient._id); // Trigger delete
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [patient.createTimeDate, patient.approvalStatus, onDeletePatient, patient._id]);

    const isOver24 = hoursPassed >= 24 && patient.approvalStatus === "";
    const isOver120 = hoursPassed >= 120;

    const [clinicianAssignData, setclinicianAssignData] = useState([]);

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
            className={`sticky left-[35px] z-20 w-[80px] text-center text-wrap font-bold bg-white text-secondary ${isOver24 && !isOver120 ? "bg-red-100 text-red-700" : ""
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

export default TimeSensitiveCell;
