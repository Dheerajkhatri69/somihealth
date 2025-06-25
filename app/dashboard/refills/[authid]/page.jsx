"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UploadFile from "@/components/FileUpload";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast';

export default function PatientUpdateForm({ params }) {
    const [submitting, setSubmitting] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [messageHead, setMessageHead] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [fileUrls, setFileUrls] = useState({
        file1: '',
        file2: ''
    });

    const [formData, setFormData] = useState({
        authid: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        glp1Approved: '',
        currentWeight: '',
        medicationChanges: '',
        glp1Preference: '',
        sideEffects: '',
        sideEffectsDetail: '',
        happyWithMed: '',
        dosageDecision: '',
        dosageNote: '',
    });

    useEffect(() => {
        const fetchRefill = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/refills/${params.authid}`);
                const data = await response.json();
                if (data.success) {
                    // Only update fields that exist in the refill data
                    setFormData(prev => ({ ...prev, ...data.result }));
                } else {
                    toast.error("Failed to fetch refill data");
                }
            } catch (error) {
                toast.error("Error fetching refill data");
            } finally {
                setLoading(false);
            }
        };
        fetchRefill();
    }, [params.authid]);

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setIsDialogOpen(false);
        setMessageHead("");
        setMessage("");
        setIsSuccess(false);
        try {
            // 1. Extract base authid (remove -N if present)
            const baseAuthId = formData.authid.split('-')[0];

            // 2. Get count from API
            const countRes = await fetch(`/api/followup/count/${baseAuthId}`);
            const countData = await countRes.json();
            if (!countData.success) throw new Error('Failed to get followup count');
            const newAuthId = `${baseAuthId}-${countData.count}`;

            // Only send fields that exist in the refill model
            const submissionData = {
                authid: newAuthId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                email: formData.email,
                approvalStatus: 'None',

                followUpRefills: true,
                initialAuthId: baseAuthId,
                glp1ApprovalLast6Months: formData.glp1Approved,
                currentWeight: formData.currentWeight,
                currentGlp1Medication: formData.glp1Preference,
                anySideEffects: formData.sideEffects,
                listSideEffects: formData.sideEffectsDetail,
                happyWithMedication: formData.happyWithMed,
                switchMedication:
                    (formData.dosageDecision === "Change to Semaglutide" ||
                        formData.dosageDecision === "Change to Tirzepatide")
                        ? formData.dosageDecision
                        : "",

                continueDosage:
                    formData.dosageDecision === "keep the same dosage"
                        ? formData.dosageDecision
                        : "",

                increaseDosage:
                    (formData.dosageDecision === "Increase my current dose" ||
                        formData.dosageDecision === "Decrease my current dose" ||
                        formData.dosageDecision === "increase my dosage")
                        ? formData.dosageDecision
                        : "",

                providerComments: formData.dosageNote,
            };

            // Submit to /api/followup
            const response = await fetch('/api/followup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.result?.message || 'Failed to submit followup');

            // Track technician if needed
            if (session?.user?.accounttype === 'T') {
                const creatorData = {
                    pid: submissionData.authid,
                    tid: session.user.id,
                    tname: session.user.fullname
                };
                const creatorResponse = await fetch('/api/followupcreatorofp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(creatorData),
                });
                if (!creatorResponse.ok) {
                    console.error('Failed to create creator relationship:', await creatorResponse.json());
                }
            }

            // Delete the refill
            const deleteResponse = await fetch('/api/refills', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [formData._id] }),
            });
            const deleteResult = await deleteResponse.json();
            if (!deleteResult.success) {
                throw new Error(deleteResult.message || 'Failed to delete refill');
            }

            setIsSuccess(true);
            setMessageHead('Success');
            setMessage('Refill submitted and tracked successfully.');
            setIsDialogOpen(true);
            // Optionally redirect or reset form here
        } catch (error) {
            setIsSuccess(false);
            setMessageHead('Error');
            setMessage(error.message || 'Submission failed');
            setIsDialogOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-4 text-yellow-500">Loading...</div>;
    }

    return (
        <div className="mb-4 p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Refills Details</h2>
                    <div className="space-y-2">
                        <Label>Patient ID</Label>
                        <Input value={formData.authid} readOnly className="font-mono w-32" />
                    </div>
                </div>

                {/* Basic Information */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                {/* glp1Approved */}
                <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-[#ecfdf5]">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="glp1Approved">Have you been approved for GLP-1 medication within the last 6 months by a Somi Health provider?</Label>
                            <Select
                                value={formData.glp1Approved ? 'yes' : 'no'}
                                onValueChange={(value) => handleSelectChange('glp1Approved', value === 'yes')}
                            >
                                <SelectTrigger id="glp1Approved">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Medical Information */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#dcfce7]">
                    <div className="space-y-2">
                        <Label htmlFor="currentWeight">Current Weight (lbs)</Label>
                        <Input
                            id="currentWeight"
                            name="currentWeight"
                            value={formData.currentWeight}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="medicationChanges">Medication Changes</Label>
                        <Input
                            id="medicationChanges"
                            name="medicationChanges"
                            value={formData.medicationChanges}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="glp1Preference">GLP-1 Preference</Label>
                        <Select
                            value={formData.glp1Preference}
                            onValueChange={(value) => handleSelectChange('glp1Preference', value)}
                        >
                            <SelectTrigger id="glp1Preference">
                                <SelectValue placeholder="Select preference" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
                                <SelectItem value="Semaglutide">Semaglutide</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Health Status */}
                <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-[#dbeafe]">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="sideEffects">Side Effects</Label>
                            <Select
                                value={formData.sideEffects}
                                onValueChange={(value) => handleSelectChange('sideEffects', value)}
                            >
                                <SelectTrigger id="sideEffects">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sideEffectsDetail">Side Effects Detail</Label>
                            <Input
                                id="sideEffectsDetail"
                                name="sideEffectsDetail"
                                value={formData.sideEffectsDetail}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Health Conditions */}
                <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-[#fee2e2]">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="happyWithMed">Happy With Med</Label>
                            <Select
                                value={formData.happyWithMed}
                                onValueChange={(value) => handleSelectChange('happyWithMed', value)}
                            >
                                <SelectTrigger id="happyWithMed">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dosageDecision">Dosage Decision</Label>
                            <Select
                                value={formData.dosageDecision}
                                onValueChange={(value) => handleSelectChange('dosageDecision', value)}
                            >
                                <SelectTrigger id="dosageDecision">
                                    <SelectValue placeholder="Select preference" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Change to Semaglutide">Change to Semaglutide</SelectItem>
                                    <SelectItem value="Change to Tirzepatide">Change to Tirzepatide</SelectItem>
                                    <SelectItem value="Increase my current dose">Increase my current dose</SelectItem>
                                    <SelectItem value="Decrease my current dose">Decrease my current dose</SelectItem>
                                    <SelectItem value="keep the same dosage">keep the same dosage</SelectItem>
                                    <SelectItem value="increase my dosage">increase my dosage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>


                {/* Comments */}
                <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-[#f3e8ff]">
                    <div className="space-y-2">
                        <Label htmlFor="dosageNote">Dosage Note</Label>
                        <Textarea
                            id="dosageNote"
                            name="dosageNote"
                            value={formData.dosageNote}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>


                <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-secondary hover:bg-secondary"
                >
                    {submitting ? 'Submitting...' : 'Submit'}
                </Button>

            </form>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent className="rounded-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{messageHead}</AlertDialogTitle>
                        <AlertDialogDescription>{message}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        {
                            isSuccess ? null :
                                <AlertDialogCancel>
                                    Cancel
                                </AlertDialogCancel>
                        }
                        {isSuccess && (
                            <Button
                                onClick={() => router.push("/dashboard/refills")}
                                className="bg-primary hover:bg-primary-dark"
                            >
                                Return to Refills
                            </Button>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}