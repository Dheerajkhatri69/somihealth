'use client'
import React, { useEffect, useState } from 'react';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "@/components/ui/alert-dialog";
import { Button } from './ui/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import toast from "react-hot-toast";

export const FollowupClinicianDropdown = ({ selectedPatients }) => {
    const [clinicians, setClinicians] = useState([]);
    const [selectedClinician, setSelectedClinician] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alreadyAssigned, setAlreadyAssigned] = useState([]);
    const [operation, setOperation] = useState("assign");


    useEffect(() => {
        async function fetchData() {
            try {
                const userRes = await fetch("/api/users");
                const userData = await userRes.json();
                const clinicianList = userData.result?.filter(user => user.accounttype === "C") || [];
                setClinicians(clinicianList);

                const assignRes = await fetch("/api/followupassig");
                const assignData = await assignRes.json();
                const assignedPids = assignData.result?.map(item => item.pid) || [];
                setAlreadyAssigned(assignedPids);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load data");
            }
        }

        fetchData();
    }, []);

    const handleAssign = async () => {
        if (selectedPatients.length === 0 || (operation !== "delete" && !selectedClinician)) {
            toast.error("Please select patients and a clinician.");
            return;
        }

        setIsSubmitting(true);
        try {
            let results = [];

            if (operation === "assign" || operation === "update") {
                results = await Promise.all(
                    selectedPatients.map(pid =>
                        fetch("/api/followupassig", {
                            method: operation === "update" ? "PUT" : "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                cid: selectedClinician,
                                pid
                            }),
                        }).then(async res => {
                            const json = await res.json();
                            return { ok: res.ok, ...json };
                        })
                    )
                );
            } else if (operation === "delete") {
                results = await Promise.all(
                    selectedPatients.map(pid =>
                        fetch(`/api/followupassig?pid=${pid}`, {
                            method: "DELETE",
                        }).then(async res => {
                            const json = await res.json();
                            return { ok: res.ok, ...json };
                        })
                    )
                );
            }

            const successCount = results.filter(r => r.ok && r.success).length;
            const failCount = selectedPatients.length - successCount;

            if (successCount > 0) {
                toast.success(`${successCount} patient(s) ${operation}d successfully.`);
                // Refresh the assigned list after successful operation
                const assignRes = await fetch("/api/followupassig");
                const assignData = await assignRes.json();
                const assignedPids = assignData.result?.map(item => item.pid) || [];
                setAlreadyAssigned(assignedPids);
            }
            if (failCount > 0) {
                toast.error(`${failCount} operation(s) failed.`);
                console.error("Failures:", results.filter(r => !r.ok || !r.success));
            }
        } catch (error) {
            console.error(`Error during ${operation}:`, error);
            toast.error("An error occurred while processing.");
        } finally {
            setIsSubmitting(false);
        }
    };
    const isAssigned = (pid) => alreadyAssigned.includes(pid);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    className="text-white bg-secondary px-2 rounded-sm hover:bg-secondary-foreground duration-200 flex justify-center items-center gap-1"
                >
                    Manage Assignments
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[600px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Manage Assignments</AlertDialogTitle>
                </AlertDialogHeader>

                <div className="grid gap-4 py-4">
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
                            <Select value={selectedClinician} onValueChange={setSelectedClinician}>
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

                    {selectedPatients.some(isAssigned) && (
                        <p className="text-sm text-red-600 font-medium">
                            * Red items are already assigned
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                        {selectedPatients.map((id) => (
                            <span
                                key={id}
                                className={`inline-block px-3 py-1 rounded-full text-sm ${isAssigned(id)
                                    ? "bg-red-500 text-white"
                                    : "bg-blue-500 text-white"}`}
                            >
                                {id}
                            </span>
                        ))}
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleAssign} disabled={isSubmitting}>
                        {isSubmitting ? `${operation.charAt(0).toUpperCase() + operation.slice(1)}ing...` : "Confirm"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
