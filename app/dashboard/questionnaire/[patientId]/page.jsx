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
import { Skeleton } from "@/components/ui/skeleton";

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
        isOver18: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        phone: '',
        email: '',
        address: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        glp1Preference: '',
        sex: '',
        heightFeet: '',
        heightInches: '',
        currentWeight: '',
        goalWeight: '',
        glp1StartingWeight: '',
        bloodPressure: '',
        heartRate: '',
        bmi: '',
        goalBmi: '',
        allergies: '',
        conditions: [],
        familyConditions: [],
        diagnoses: [],
        weightLossSurgery: [],
        weightRelatedConditions: [],
        medications: [],
        kidneyDisease: '',
        pastWeightLossMeds: [],
        diets: [],
        glp1PastYear: '',
        lastInjectionDate: '',
        otherConditions: '',
        currentMedications: '',
        surgeries: '',
        pregnant: '',
        breastfeeding: '',
        healthcareProvider: '',
        eatingDisorders: '',
        labs: '',
        glp1Statement: '',
        glp1DoseInfo: '',
        agreeTerms: false,
        prescriptionPhoto: '',
        idPhoto: '',
        comments: '',
        consent: false,
        terms: false,
        treatment: false,
        agreetopay: false,
        status: '',
        PlanPurchased: '',
    });

    useEffect(() => {
        const fetchQuestionnaire = async () => {
            try {
                const response = await fetch(`/api/questionnaire/${params.patientId}`);
                const data = await response.json();

                if (data.success) {
                    setFormData(data.result);
                    // Set file URLs from the fetched data
                    setFileUrls({
                        file1: data.result.prescriptionPhoto || '',
                        file2: data.result.idPhoto || ''
                    });
                } else {
                    toast.error("Failed to fetch questionnaire data");
                }
            } catch (error) {
                console.error("Error fetching questionnaire:", error);
                toast.error("Error fetching questionnaire data");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestionnaire();
    }, [params.patientId]);

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true); // Start loading
        try {
            // Map questionnaire fields to patient fields
            const patientData = {
                authid: formData.authid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                dob: formData.dateOfBirth?.split('T')[0], // Convert to YYYY-MM-DD format
                height: `${formData.heightFeet}.${formData.heightInches}`,
                email: formData.email,
                sex: formData.sex,
                weight: formData.currentWeight,
                phone: formData.phone,
                glp1: formData.glp1Preference,
                bmi: formData.bmi,
                address1: formData.address,
                address2: formData.address2,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                bloodPressure: formData.bloodPressure,
                heartRate: formData.heartRate,
                medicine: formData.glp1Preference,
                glpTaken: formData.glp1PastYear,
                glpRecentInjection: formData.lastInjectionDate.split('/').map(p => p.trim()).map((v, i) => i < 2 ? v.padStart(2, '0') : v).reverse().join('/').replace(/^(\d{4})\/(\d{2})\/(\d{2})$/, '$3/$2/$1'),
                allergyList: formData.allergies,
                surgeryList: formData.surgeries,
                diagnosis: formData.diagnoses.join(', '),
                startingWeight: formData.glp1StartingWeight,
                currentWeight: formData.currentWeight,
                goalWeight: formData.goalWeight,
                weightLossMeds12m: formData.pastWeightLossMeds.join(', '),
                approvalStatus: '',
                semaglutideDose: '',
                semaglutideUnit: '',
                tirzepatideDose: '',
                tirzepatideUnit: '',
                createTimeDate: new Date().toISOString(),
                images: [],
                file1: formData.prescriptionPhoto,
                file2: formData.idPhoto,
                providerComments: formData.comments || '',
                providerNote: '',
                tirzepetidePlanPurchased: formData.PlanPurchased,
            };

            // Submit to /api/patients
            const response = await fetch('/api/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientData),
            });

            const result = await response.json();

            if (result.success) {
                // If user is a technician, create the creator-patient relationship
                if (session?.user?.accounttype === 'T') {
                    const creatorData = {
                        pid: formData.authid,           // Patient ID
                        tid: session.user.id,           // Technician ID
                        tname: session.user.fullname    // Technician Name
                    };

                    const creatorResponse = await fetch('/api/creatorofp', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(creatorData),
                    });

                    const creatorResult = await creatorResponse.json();

                    if (!creatorResult.success) {
                        console.error('Failed to create creator relationship:', creatorResult.message);
                        // Continue with questionnaire deletion even if creator record fails
                    }
                }

                // Delete questionnaire data after successful patient data submission
                const deleteResponse = await fetch('/api/questionnaire', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ authids: [formData.authid] }),
                });

                const deleteResult = await deleteResponse.json();

                if (deleteResult.success) {
                    toast.success('Patient data updated and questionnaire deleted successfully');
                    setIsSuccess(true);
                    setMessageHead('Success');
                    setMessage('Patient data has been updated and questionnaire deleted successfully.');
                    setIsDialogOpen(true);
                    setSubmitting(false); // Stop loading after everything
                    // Redirect to questionnaire list after successful submission
                    router.push('/dashboard/questionnaire');
                } else {
                    throw new Error(deleteResult.message || 'Failed to delete questionnaire data');
                }
            } else {
                throw new Error(result.message || 'Failed to update patient data');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error.message || 'Failed to update patient data');
            setIsSuccess(false);
            setMessageHead('Error');
            setMessage(error.message || 'Failed to update patient data');
            setIsDialogOpen(true);
        }
    };

    if (loading) {
        return (
            <div className="mb-4 p-4">
                <div className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">
                    {/* Header Skeleton */}
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-8 w-64" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>

                    {/* Basic Information Section Skeleton */}
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Address Section Skeleton */}
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#e0f2fe]">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Vitals Section Skeleton */}
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#fef9c3]">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Medical Information Section Skeleton */}
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#fce7f3]">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Weight Management Section Skeleton */}
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#ecfdf5]">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* GLP-1 Section Skeleton */}
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#fef3c7]">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#f3e8ff]">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Submit Button Skeleton */}
                    <div className="flex justify-end space-x-4 mt-6">
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-4 p-4">
            <form onSubmit={handleSubmit} className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">New Patient Details</h2>
                    <div className="space-y-2">
                        <Label>Patient ID</Label>
                        <Input value={formData.authid} readOnly className="font-mono w-32" />
                    </div>
                </div>

                {/* Basic Information */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                    <div className="space-y-2">
                        <Label htmlFor="PlanPurchased">Plan Purchased</Label>
                        <Input
                            id="PlanPurchased"
                            name="PlanPurchased"
                            value={formData.PlanPurchased}
                            onChange={handleInputChange}
                        />
                    </div>
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
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth?.split('T')[0]}
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
                    <div className="space-y-2">
                        <Label htmlFor="sex">Sex</Label>
                        <Select
                            value={formData.sex}
                            onValueChange={(value) => handleSelectChange('sex', value)}
                        >
                            <SelectTrigger id="sex">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Address Information */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#e0f2fe]">
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address2">Address Line 2</Label>
                        <Input
                            id="address2"
                            name="address2"
                            value={formData.address2}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                            id="zip"
                            name="zip"
                            value={formData.zip}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                {/* Medical Information */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#dcfce7]">
                    <div className="space-y-2">
                        <Label htmlFor="heightFeet">Height (Feet)</Label>
                        <Input
                            id="heightFeet"
                            name="heightFeet"
                            value={formData.heightFeet}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heightInches">Height (Inches)</Label>
                        <Input
                            id="heightInches"
                            name="heightInches"
                            value={formData.heightInches}
                            onChange={handleInputChange}
                        />
                    </div>
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
                        <Label htmlFor="bmi">BMI</Label>
                        <Input
                            id="bmi"
                            name="bmi"
                            value={formData.bmi}
                            readOnly
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="goalWeight">Goal Weight (lbs)</Label>
                        <Input
                            id="goalWeight"
                            name="goalWeight"
                            value={formData.goalWeight}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="goalBmi">Goal Bmi</Label>
                        <Input
                            id="goalBmi"
                            name="goalBmi"
                            value={formData.goalBmi}
                            readOnly
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
                                <SelectItem value="None">None</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#dcfbfc]">
                    <div className="space-y-2">
                        <Label htmlFor="glp1StartingWeight">GLP 1 Starting Weight</Label>
                        <Input
                            id="glp1StartingWeight"
                            name="glp1StartingWeight"
                            value={formData.glp1StartingWeight}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bloodPressure">Blood Pressure</Label>
                        <Input
                            id="bloodPressure"
                            name="bloodPressure"
                            value={formData.bloodPressure}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heartRate">Heart Rate</Label>
                        <Input
                            id="heartRate"
                            name="heartRate"
                            value={formData.heartRate}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                {/* Health Conditions */}
                <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-[#fee2e2]">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="allergies">Allergies</Label>
                            <Textarea
                                id="allergies"
                                name="allergies"
                                value={formData.allergies}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="conditions">Medical Conditions</Label>
                            <Textarea
                                id="conditions"
                                name="conditions"
                                value={formData.conditions.join(', ')}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="familyConditions">Family Conditions</Label>
                            <Textarea
                                id="familyConditions"
                                name="familyConditions"
                                value={formData.familyConditions.join(', ')}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="diagnoses">Diagnoses</Label>
                            <Textarea
                                id="diagnoses"
                                name="diagnoses"
                                value={formData.diagnoses.join(', ')}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weightLossSurgery">Weight Loss Surgery</Label>
                            <Textarea
                                id="weightLossSurgery"
                                name="weightLossSurgery"
                                value={formData.weightLossSurgery.join(', ')}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weightRelatedConditions">Weight Related Conditions</Label>
                            <Textarea
                                id="weightRelatedConditions"
                                name="weightRelatedConditions"
                                value={formData.weightRelatedConditions.join(', ')}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="medications">Medications</Label>
                            <Textarea
                                id="medications"
                                name="medications"
                                value={formData.medications.join(', ')}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kidneyDisease">Kidney Disease</Label>
                            <Select
                                value={formData.kidneyDisease}
                                onValueChange={(value) => handleSelectChange('kidneyDisease', value)}
                            >
                                <SelectTrigger id="kidneyDisease">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="otherConditions">Other Conditions</Label>
                            <Textarea
                                id="otherConditions"
                                name="otherConditions"
                                value={formData.otherConditions}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currentMedications">Current Medications</Label>
                            <Textarea
                                id="currentMedications"
                                name="currentMedications"
                                value={formData.currentMedications}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="surgeries">Surgeries</Label>
                            <Textarea
                                id="surgeries"
                                name="surgeries"
                                value={formData.surgeries}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Medical History */}
                <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-[#fef3c7]">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="pastWeightLossMeds">Past Weight Loss Medications</Label>
                            <Textarea
                                id="pastWeightLossMeds"
                                name="pastWeightLossMeds"
                                value={formData.pastWeightLossMeds.join(', ')}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="diets">Diets</Label>
                            <Textarea
                                id="diets"
                                name="diets"
                                value={formData.diets.join(', ')}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="glp1PastYear">GLP-1 Past Year</Label>
                            <Textarea
                                id="glp1PastYear"
                                name="glp1PastYear"
                                value={formData.glp1PastYear}
                                onChange={handleInputChange}
                                placeholder='e.g. "Wegovy (Semaglutide)"'
                            />
                        </div>
                    </div>
                </div>

                {/* Health Status */}
                <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-[#dbeafe]">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="pregnant">Pregnant</Label>
                            <Select
                                value={formData.pregnant}
                                onValueChange={(value) => handleSelectChange('pregnant', value)}
                            >
                                <SelectTrigger id="pregnant">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="breastfeeding">Breastfeeding</Label>
                            <Select
                                value={formData.breastfeeding}
                                onValueChange={(value) => handleSelectChange('breastfeeding', value)}
                            >
                                <SelectTrigger id="breastfeeding">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="healthcareProvider">Healthcare Provider</Label>
                            <Textarea
                                id="healthcareProvider"
                                name="healthcareProvider"
                                value={formData.healthcareProvider}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="eatingDisorders">Eating Disorders</Label>
                        <Input
                            id="heartRate"
                            name="heartRate"
                            value={formData.eatingDisorders}
                            onChange={handleInputChange}
                        />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="labs">Labs</Label>
                            <Select
                                value={formData.labs}
                                onValueChange={(value) => handleSelectChange('labs', value)}
                            >
                                <SelectTrigger id="labs">
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

                {/* GLP-1 Information */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#f3e8ff]">
                    <div className="space-y-2">
                        <Label htmlFor="glp1Statement">GLP-1 Statement</Label>
                        <Textarea
                            id="glp1Statement"
                            name="glp1Statement"
                            value={formData.glp1Statement}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="glp1DoseInfo">GLP-1 Dose Information</Label>
                        <Textarea
                            id="glp1DoseInfo"
                            name="glp1DoseInfo"
                            value={formData.glp1DoseInfo}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                {/* GLP-1 History Section */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#e0e7ff]">
                    <div className="space-y-2">
                        <Label htmlFor="glp1PastYear">GLP-1 Past Year</Label>
                        <Input
                            id="glp1PastYear"
                            name="glp1PastYear"
                            value={formData.glp1PastYear}
                            onChange={handleInputChange}
                            placeholder="Enter GLP-1 history"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastInjectionDate">Last Injection Date (MM / DD / YYYY)</Label>
                        <Input
                            id="lastInjectionDate"
                            name="lastInjectionDate"
                            value={formData.lastInjectionDate}
                            onChange={handleInputChange}
                            placeholder="MM / DD / YYYY"
                        />
                    </div>
                </div>

                {/* Terms and Consent */}
                <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-[#ecfdf5]">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="agreeTerms">Agree to Terms</Label>
                            <Select
                                value={formData.agreeTerms ? 'yes' : 'no'}
                                onValueChange={(value) => handleSelectChange('agreeTerms', value === 'yes')}
                            >
                                <SelectTrigger id="agreeTerms">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="consent">Consent</Label>
                            <Select
                                value={formData.consent ? 'yes' : 'no'}
                                onValueChange={(value) => handleSelectChange('consent', value === 'yes')}
                            >
                                <SelectTrigger id="consent">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="terms">Terms of Services</Label>
                            <Select
                                value={formData.terms ? 'yes' : 'no'}
                                onValueChange={(value) => handleSelectChange('terms', value === 'yes')}
                            >
                                <SelectTrigger id="terms">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="treatment">Consent to treatment</Label>
                            <Select
                                value={formData.treatment ? 'yes' : 'no'}
                                onValueChange={(value) => handleSelectChange('treatment', value === 'yes')}
                            >
                                <SelectTrigger id="treatment">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="agreetopay">I agree to pay the $25 </Label>
                            <Select
                                value={formData.agreetopay ? 'yes' : 'no'}
                                onValueChange={(value) => handleSelectChange('agreetopay', value === 'yes')}
                            >
                                <SelectTrigger id="agreetopay">
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

                {/* File Upload Section */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#f5f3ff]">
                    <div className="space-y-2">
                        <Label>Prescription Photo</Label>
                        <UploadFile
                            onUploadComplete={(url) => {
                                setFileUrls(prev => ({ ...prev, file1: url }));
                                setFormData(prev => ({ ...prev, prescriptionPhoto: url }));
                            }}
                            onDelete={() => {
                                setFileUrls(prev => ({ ...prev, file1: '' }));
                                setFormData(prev => ({ ...prev, prescriptionPhoto: '' }));
                            }}
                            file={fileUrls.file1}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>ID Photo</Label>
                        <UploadFile
                            onUploadComplete={(url) => {
                                setFileUrls(prev => ({ ...prev, file2: url }));
                                setFormData(prev => ({ ...prev, idPhoto: url }));
                            }}
                            onDelete={() => {
                                setFileUrls(prev => ({ ...prev, file2: '' }));
                                setFormData(prev => ({ ...prev, idPhoto: '' }));
                            }}
                            file={fileUrls.file2}
                        />
                    </div>
                </div>

                {/* Comments */}
                <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-[#f3e8ff]">
                    <div className="space-y-2">
                        <Label htmlFor="comments">Comments</Label>
                        <Textarea
                            id="comments"
                            name="comments"
                            value={formData.comments}
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
                        <AlertDialogCancel>
                            {isSuccess ? "Continue Editing" : "Cancel"}
                        </AlertDialogCancel>
                        {isSuccess && (
                            <Button
                                onClick={() => router.push("/dashboard/questionnaire")}
                                className="bg-primary hover:bg-primary-dark"
                            >
                                Return to Questionnaire
                            </Button>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}