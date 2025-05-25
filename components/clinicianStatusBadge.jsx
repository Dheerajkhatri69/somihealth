'use client'
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { TableCell } from "./ui/table";

export function ClinicianStatusBadge({ patient }) {
    const [isClinicianAssigned, setIsClinicianAssigned] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkAssignment() {
            try {
                const response = await fetch(`/api/assigning?pid=${patient.authid}`);
                const data = await response.json();

                // More precise check for assignment
                const hasAssignment = data.result?.some(
                    assignment => assignment.pid === patient.authid && assignment.cid
                );

                setIsClinicianAssigned(hasAssignment);
            } catch (error) {
                console.error("Error checking assignment:", error);
                setIsClinicianAssigned(false);
            } finally {
                setIsLoading(false);
            }
        }

        checkAssignment();
    }, [patient.authid]);

    if (isLoading) {
        return (
            <TableCell className="sticky right-[66px] z-10 w-[80px] bg-white">
                <Badge className="px-3 py-1 text-sm rounded-md bg-yellow-200 text-yellow-900 hover:bg-yellow-200">
                    Loading...
                </Badge>
            </TableCell>
        );
    }

    return (
        <TableCell className="sticky right-[66px] z-10 w-[80px] bg-white">
            <Badge
                className={`px-3 py-1 text-sm rounded-md ${isClinicianAssigned ? "bg-green-200 text-green-900 hover:bg-green-200" : "bg-red-200 text-red-900 hover:bg-red-200"}`}
            >
                {isClinicianAssigned ? "Assigned" : "Unassigned"}
            </Badge>
        </TableCell>
    );
}

export function FollowupClinicianStatusBadge({ patient }) {
    const [isClinicianAssigned, setIsClinicianAssigned] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkAssignment() {
            try {
                const response = await fetch(`/api/followupassig?pid=${patient.authid}`);
                const data = await response.json();

                // Check for followup assignment specifically
                const hasAssignment = data.result?.some(
                    assignment => assignment.pid === patient.authid && assignment.cid
                );

                setIsClinicianAssigned(hasAssignment);
            } catch (error) {
                console.error("Error checking followup assignment:", error);
                setIsClinicianAssigned(false);
            } finally {
                setIsLoading(false);
            }
        }

        checkAssignment();
    }, [patient.authid]);

    if (isLoading) {
        return (
            <TableCell className="sticky right-[66px] z-10 w-[80px] bg-white">
                <Badge className="px-3 py-1 text-sm rounded-md bg-yellow-200 text-yellow-900 hover:bg-yellow-200">
                    Loading...
                </Badge>
            </TableCell>
        );
    }

    return (
        <TableCell className="sticky right-[66px] z-10 w-[80px] bg-white">
            <Badge
                className={`px-3 py-1 text-sm rounded-md ${
                    isClinicianAssigned 
                        ? "bg-green-200 text-green-900 hover:bg-green-200" 
                        : "bg-red-200 text-red-900 hover:bg-red-200"
                }`}
            >
                {isClinicianAssigned ? "Assigned" : "Unassigned"}
            </Badge>
        </TableCell>
    );
}