import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { TableCell } from "./ui/table";

function TimeSensitiveCell({ patient, onDeletePatient }) {
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

    return (
        <TableCell
            className={`sticky left-[35px] z-20 w-[80px] text-center text-wrap font-bold bg-white text-secondary ${isOver24 && !isOver120 ? "bg-red-100 text-red-700" : ""
                }`}
        >
            <div className="relative">
                {patient.authid}

                {patient.approvalStatus === "" && !isOver120 && (
                    <div className="absolute -top-5 -right-1 group">
                        <Timer className="cursor-pointer text-secondary-foreground rounded-full text-sm" />
                        <div className="absolute -top-6 -right-5 hidden group-hover:block bg-black/50 text-white text-xs px-2 py-1 rounded z-50 whitespace-nowrap">
                            {timeLeft} left
                        </div>
                    </div>
                )}
            </div>
        </TableCell>
    );
}

export default TimeSensitiveCell;
