"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadButton } from "@/utils/uploadthing";
import { useSession } from "next-auth/react";
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
import { Eye, Fullscreen, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";
import Image from "next/image";
import UploadFile from "@/components/FileUpload";

export default function PatientUpdateForm({ params }) {
    const { data: session } = useSession();
    // const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        // console.log("dashboard Session user:", session?.user);
    }, [session]);

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch("/api/patients");
                const data = await res.json();

                if (data.success) {
                    setPatients(data.result); // from your API response
                } else {
                    console.error("Error fetching patients:", data.result.message);
                }
            } catch (err) {
                console.error("Fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const [formData, setFormData] = useState({
        authid: '',
        firstName: '',
        lastName: '',
        dob: '',
        height: '',
        email: '',
        sex: '',
        weight: '',
        phone: '',
        glp1: '',
        bmi: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        bloodPressure: '',
        heartRate: '',
        takingMedication: '',
        medicineAllergy: '',
        listAllMedication: '',
        allergyList: '',
        majorSurgeries: '',
        bariatricSurgery: '',
        thyroidCancerHistory: '',
        surgeryList: '',
        disqualifiers: '',
        diagnosis: '',
        startingWeight: '',
        currentWeight: '',
        goalWeight: '',
        weightChange12m: '',
        weightLossPrograms: '',
        weightLossMeds12m: '',
        glpTaken: '',
        glpRecentInjection: '',
        semaglutideLastDose: '',
        semaglutideRequestedDose: '',
        tirzepetideLastDose: '',
        tirzepetideRequestedDose: '',
        tirzepetidePlanPurchased: '',
        tirzepetideVial: '',
        tirzepetideDosingSchedule: '',
        providerComments: '',
        medicine: '',
        approvalStatus: '',
        semaglutideDose: '',
        semaglutideUnit: '',
        tirzepatideDose: '',
        tirzepatideUnit: '',
        lipotropicDose: '',
        lipotropicUnit: '',
        providerNote: '',
        createTimeDate: '',
        closetickets: false,
        Reasonclosetickets: '',
        file1: '',
        file2: '',
        followUp: '', // new field
        refillReminder: '', // new field
        followUpInterval: '', // for select
        refillReminderInterval: '', // for select
        // Lipotropic Fields
        lipotropicAllergies: [],
        lipotropicAllergiesDrop: '',
        lipotropicGoals: [],
        lipotropicHistory: '',
        lipotropicLastTreatment: '',
        lipotropicSatisfaction: '',
        lipotropicStopReason: '',
        averageMood: '',
        lipotropicDiagnoses: [],
        lipotropicMedicalConditions: '',
        lipotropicMedicalConditionsDrop: '',
        lipotropicMeds: '',
        lipotropicMedsDrop: '',
        lipotropicPregnant: '',
        providerQuestions: '',
        providerQuestionsDrop: '',
        lipotropicConsent: false,
        lipotropicTerms: false,
        lipotropicTreatment: false,
        lipotropicElectronic: false,
        // GLP-1 Consent Fields
        bmiConsent: false,
        consent: false,
        terms: false,
        treatment: false,
        agreetopay: false,
        agreeTerms: false,
    });
    const [images, setImages] = useState([
        { file: null, preview: null },
        { file: null, preview: null },
        { file: null, preview: null },
    ]);
    const [fileUrls, setFileUrls] = useState({
        file1: '',
        file2: ''
    });

    const handleImageKitUpload = async (event, index) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const authRes = await fetch("/api/upload-auth");
            const { signature, expire, token, publicKey } = await authRes.json();

            const res = await upload({
                file,
                fileName: file.name,
                publicKey,
                signature,
                expire,
                token,
            });

            const uploadedUrl = res.url;

            const updatedImages = [...images];
            updatedImages[index] = {
                preview: uploadedUrl,
            };
            setImages(updatedImages);
        } catch (error) {
            console.error("ImageKit upload error:", error);
        }
    };

    useEffect(() => {
        const patient = patients.find(p => p.authid === params.patientId);
        if (patient) {
            // Extract interval from followUp and refillReminder
            let followUpInterval = '';
            if (patient.followUp && patient.followUp.includes('_')) {
                followUpInterval = patient.followUp.split('_')[1];
            }
            let refillReminderInterval = '';
            if (patient.refillReminder && patient.refillReminder.includes('_')) {
                refillReminderInterval = patient.refillReminder.split('_')[1];
            }
            setFormData(prev => ({
                ...prev,
                ...patient,
                followUpInterval,
                refillReminderInterval,
            }));
            // Set file URLs
            setFileUrls({
                file1: patient.file1 || '',
                file2: patient.file2 || ''
            });
            // Initialize images array with exactly 3 slots
            if (patient.images) {
                // Create array with existing images (up to 3)
                const initialImages = patient.images.slice(0, 3).map(img => ({
                    preview: img,
                    file: null
                }));
                // Fill remaining slots with empty objects
                while (initialImages.length < 3) {
                    initialImages.push({ file: null, preview: null });
                }
                setImages(initialImages);
            } else {
                // Reset to 3 empty slots if no images
                setImages(Array(3).fill({ file: null, preview: null }));
            }
        }
    }, [patients, params.patientId]);

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Helper to generate date string using current date (no future offset)
    function getFutureDateString(interval) {
        if (!interval || interval === 'None') return '';
        const now = new Date();
        return `${now.toISOString()}_${interval}`;
    }

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name, checked) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setImages(prev => prev.map((img, i) => i === index ? { file, preview } : img));
        }
    };

    const handleImageUpload = (index, url) => {
        setImages(prev =>
            prev.map((img, i) =>
                i === index ? { file: null, preview: url } : img
            )
        );
    };

    // const removeImage = (index) => {
    //     setImages(prev => prev.map((img, i) => i === index ? { file: null, preview: null } : img));
    // };
    const removeImage = (index) => {
        setImages(prev =>
            prev.map((img, i) =>
                i === index ? { file: null, preview: null } : img
            )
        );
    };

    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [messageHead, setMessageHead] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const imageUrls = images
            .filter(img => img.preview)
            .map(img => img.preview);

        // Calculate followUp and refillReminder values
        const followUp = getFutureDateString(formData.followUpInterval);
        const refillReminder = getFutureDateString(formData.refillReminderInterval);
        const submissionData = {
            ...formData,
            followUp,
            refillReminder,
            images: imageUrls,
            file1: fileUrls.file1,
            file2: fileUrls.file2,
            // Lipotropic Fields
            lipotropicAllergies: formData.lipotropicAllergies,
            lipotropicAllergiesDrop: formData.lipotropicAllergiesDrop,
            lipotropicGoals: formData.lipotropicGoals,
            lipotropicHistory: formData.lipotropicHistory,
            lipotropicLastTreatment: formData.lipotropicLastTreatment,
            lipotropicSatisfaction: formData.lipotropicSatisfaction,
            lipotropicStopReason: formData.lipotropicStopReason,
            averageMood: formData.averageMood,
            lipotropicDiagnoses: formData.lipotropicDiagnoses,
            lipotropicMedicalConditions: formData.lipotropicMedicalConditions,
            lipotropicMedicalConditionsDrop: formData.lipotropicMedicalConditionsDrop,
            lipotropicMeds: formData.lipotropicMeds,
            lipotropicMedsDrop: formData.lipotropicMedsDrop,
            lipotropicPregnant: formData.lipotropicPregnant,
            providerQuestions: formData.providerQuestions,
            providerQuestionsDrop: formData.providerQuestionsDrop,
            lipotropicConsent: formData.lipotropicConsent,
            lipotropicTerms: formData.lipotropicTerms,
            lipotropicTreatment: formData.lipotropicTreatment,
            lipotropicElectronic: formData.lipotropicElectronic,
            // GLP-1 Consent Fields
            bmiConsent: formData.bmiConsent,
            consent: formData.consent,
            terms: formData.terms,
            treatment: formData.treatment,
            agreetopay: formData.agreetopay,
            agreeTerms: formData.agreeTerms
        };

        try {
            const res = await fetch("/api/patients", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submissionData),
            });

            const data = await res.json();

            if (data.success) {
                setMessageHead("Success");
                setMessage("Patient updated successfully!");
                setIsSuccess(true);
                setIsDialogOpen(true);
            } else {
                setMessageHead("Error");
                setMessage(data.result?.message || data.message || "Failed to update patient");
                setIsSuccess(false);
                setIsDialogOpen(true);
            }
        } catch (err) {
            setMessageHead("Error");
            setMessage("Failed to update patient. Please try again.");
            setIsSuccess(false);
            setIsDialogOpen(true);
            console.error("Request failed:", err);
        }
    };
    const [isOpen, setIsOpen] = useState(false);
    const [sheetUrl, setSheetUrl] = useState("");

    const openDialog = async () => {
        try {
            const res = await fetch("https://script.google.com/macros/s/AKfycbzD_xjGHjBtlXldIUy7KMv5n6_2gZOIUdBy6l4D6cD5WqTPabPJKoPdxZcChwWa3ou4ag/exec"); // replace with your deployed URL
            const data = await res.json();
            setSheetUrl("https://docs.google.com/spreadsheets/d/1mwd2O4IyXiy7T2U39sE4tGBWE8x9B9zQLhNQuolgBgM/edit?gid=892870457#gid=892870457");
            setIsOpen(true);
        } catch (err) {
            console.error("Failed to load sheet copy:", err);
        }
    };
    // Before any early returns
    const [selectedImage, setSelectedImage] = useState(null);

    if (!formData.authid) {
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

                    {/* Name Fields Skeleton */}
                    <div className="flex space-x-4 mb-6">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>

                    {/* Basic Information Section Skeleton */}
                    <Skeleton className="h-5 w-32 mb-4" />
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Address Section Skeleton */}
                    <Skeleton className="h-5 w-16 mt-6 mb-4" />
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#e0f2fe]">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Vitals Section Skeleton */}
                    <Skeleton className="h-5 w-12 mt-6 mb-4" />
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#fef9c3]">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Medical Information Section Skeleton */}
                    <Skeleton className="h-5 w-40 mt-6 mb-4" />
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#fce7f3]">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Weight Management Section Skeleton */}
                    <Skeleton className="h-5 w-36 mt-6 mb-4" />
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#ecfdf5]">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* GLP-1 Section Skeleton */}
                    <Skeleton className="h-5 w-24 mt-6 mb-4" />
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#fef3c7]">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Provider Section Skeleton */}
                    <Skeleton className="h-5 w-32 mt-6 mb-4" />
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#f3e8ff]">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Submit Button Skeleton */}
                    <div className="flex justify-end space-x-4 mt-6">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-4 p-4">
            <form onSubmit={handleSubmit} className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Updating {formData.firstName} {formData.lastName}</h2>
                    <div className="space-y-2">
                        <Label>Patient ID</Label>
                        <Input value={formData.authid} readOnly className="font-mono w-32" />
                    </div>
                </div>

                <div className="flex space-x-4 mb-6">
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter First name"
                        />
                    </div>
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter Last name"
                        />
                    </div>
                </div>

                <h3 className="text-sm font-semibold">Basic information</h3>
                <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                    <div className="space-y-2">
                        <Label htmlFor="dob">DOB</Label>
                        <Input
                            type="date"
                            id="dob"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="height">Height</Label>
                        <Input
                            id="height"
                            name="height"
                            value={formData.height}
                            onChange={handleInputChange}
                            placeholder="e.g. 5'9&quot;"
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
                            placeholder="example@mail.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sex">Sex</Label>
                        <Select
                            value={formData.sex}
                            onValueChange={(value) => handleSelectChange('sex', value)}
                        >
                            <SelectTrigger id="sex" className="w-full">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                                <SelectItem value="None">None</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="weight">Weight (lbs)</Label>
                        <Input
                            id="weight"
                            name="weight"
                            value={formData.weight}
                            onChange={handleInputChange}
                            placeholder="e.g. 214"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+1 555 123 4567"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="glp1">GLP-1 Preference</Label>
                        <Select
                            value={formData.glp1}
                            onValueChange={(value) => handleSelectChange('glp1', value)}
                        >
                            <SelectTrigger id="glp1" className="w-full">
                                <SelectValue placeholder="Select preference" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
                                <SelectItem value="Semaglutide">Semaglutide</SelectItem>
                                <SelectItem value="Lipotropic MIC +B12">Lipotropic MIC +B12</SelectItem>
                                <SelectItem value="None">None</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bmi">BMI</Label>
                        <Input
                            id="bmi"
                            name="bmi"
                            value={formData.bmi}
                            onChange={handleInputChange}
                            placeholder="e.g. 32"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="goalBmi">Goal BMI</Label>
                        <Input
                            id="goalBmi"
                            name="goalBmi"
                            value={formData.goalBmi}
                            onChange={handleInputChange}
                            placeholder="e.g. 32"
                        />
                    </div>
                </div>

                {/* Address Section */}
                <h3 className="text-sm font-semibold">Address</h3>
                <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#e0f2fe]">
                    {['address1', 'address2', 'city', 'state', 'zip', 'country'].map((field) => (
                        <div key={field} className="space-y-2">
                            <Label htmlFor={field}>
                                {field === 'address1' ? 'Address' :
                                    field === 'address2' ? 'Address line 2' :
                                        field === 'city' ? 'City/Town' :
                                            field === 'country' ? 'Country' :
                                                field === 'state' ? 'State' : 'Zip code'}
                            </Label>
                            <Input
                                id={field}
                                name={field}
                                value={formData[field]}
                                onChange={handleInputChange}
                                placeholder={
                                    field === 'address1' ? 'Street address' :
                                        field === 'address2' ? 'Apartment, suite, etc.' :
                                            field === 'city' ? 'e.g. Springfield' :
                                                field === 'state' ? 'e.g. California' : 'e.g. 12345'
                                }
                            />
                        </div>
                    ))}
                </div>

                {/* Vitals Section */}
                <h3 className="text-sm font-semibold">Vitals</h3>
                <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#fef9c3]">
                    <div className="space-y-2">
                        <Label htmlFor="bloodPressure">Blood Pressure</Label>
                        <Input
                            id="bloodPressure"
                            name="bloodPressure"
                            value={formData.bloodPressure}
                            onChange={handleInputChange}
                            placeholder="e.g. 120/80"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heartRate">Heart Rate</Label>
                        <Input
                            id="heartRate"
                            name="heartRate"
                            value={formData.heartRate}
                            onChange={handleInputChange}
                            placeholder="e.g. 72 bpm"
                        />
                    </div>
                </div>

                {/* Medical History Section */}
                <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#dcfce7]">
                    {['takingMedication', 'medicineAllergy', 'majorSurgeries', 'bariatricSurgery', 'thyroidCancerHistory'].map((field) => (
                        <div key={field} className="space-y-2">
                            <Label htmlFor={field}>
                                {field === 'takingMedication' ? 'Taking Medication' :
                                    field === 'medicineAllergy' ? 'Medicine Allergy' :
                                        field === 'majorSurgeries' ? 'Major Surgeries' :
                                            field === 'bariatricSurgery' ? 'Bariatric Surgery (last 18 months)' :
                                                'Family History of Thyroid Cancer'}
                            </Label>
                            <Select
                                value={formData[field]}
                                onValueChange={(value) => handleSelectChange(field, value)}
                            >
                                <SelectTrigger id={field} className="w-full">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ))}

                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="listAllMedication">List All Medication</Label>
                        <Textarea
                            id="listAllMedication"
                            name="listAllMedication"
                            value={formData.listAllMedication}
                            onChange={handleInputChange}
                            placeholder="List known medication..."
                        />
                    </div>
                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="allergyList">Allergy List</Label>
                        <Textarea
                            id="allergyList"
                            name="allergyList"
                            value={formData.allergyList}
                            onChange={handleInputChange}
                            placeholder="List known allergies..."
                        />
                    </div>

                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="surgeryList">Surgery List</Label>
                        <Textarea
                            id="surgeryList"
                            name="surgeryList"
                            value={formData.surgeryList}
                            onChange={handleInputChange}
                            placeholder="List of major surgeries..."
                        />
                    </div>

                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="disqualifiers">Disqualifiers</Label>
                        <Textarea
                            id="disqualifiers"
                            name="disqualifiers"
                            value={formData.disqualifiers}
                            onChange={handleInputChange}
                            placeholder="Mention any disqualifiers..."
                        />
                    </div>
                </div>

                {/* Diagnosis Section */}
                <div className="w-full mx-auto p-6 border rounded-xl shadow-sm bg-[#fee2e2]">
                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="diagnosis">Diagnosis</Label>
                        <Textarea
                            id="diagnosis"
                            name="diagnosis"
                            value={formData.diagnosis}
                            onChange={handleInputChange}
                            placeholder="Enter patient diagnosis, symptoms, or relevant notes..."
                        />
                    </div>
                </div>

                {/* Weight Progress Section */}
                <h3 className="text-sm font-semibold">Weight Progress</h3>
                <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#f0fdf4]">
                    {['startingWeight', 'currentWeight', 'goalWeight', 'weightChange12m'].map((field) => (
                        <div key={field} className="space-y-2">
                            <Label htmlFor={field}>
                                {field === 'startingWeight' ? 'Starting Weight (lbs)' :
                                    field === 'currentWeight' ? 'Current Weight (lbs)' :
                                        field === 'goalWeight' ? 'Goal Weight (lbs)' :
                                            '12-Month Weight Change (lbs)'}
                            </Label>
                            <Input
                                id={field}
                                name={field}
                                value={formData[field]}
                                onChange={handleInputChange}
                                placeholder={
                                    field === 'startingWeight' ? 'e.g. 240' :
                                        field === 'currentWeight' ? 'e.g. 214' :
                                            field === 'goalWeight' ? 'e.g. 180' : 'e.g. -26, +10, etc.'
                                }
                            />
                        </div>
                    ))}

                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="weightLossPrograms">Weight Loss Programs</Label>
                        <Textarea
                            id="weightLossPrograms"
                            name="weightLossPrograms"
                            value={formData.weightLossPrograms}
                            onChange={handleInputChange}
                            placeholder="List any previous or current weight loss programs..."
                        />
                    </div>
                </div>

                {/* Weight Loss Medication Section */}
                <div className="w-full mx-auto p-6 border rounded-xl shadow-sm bg-[#fff7ed]">
                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="weightLossMeds12m">Weight Loss Medication (Last 12 Months)</Label>
                        <Textarea
                            id="weightLossMeds12m"
                            name="weightLossMeds12m"
                            value={formData.weightLossMeds12m}
                            onChange={handleInputChange}
                            placeholder="List any weight loss medications taken in the past 12 months..."
                        />
                    </div>
                </div>

                {/* GLP-1 Section */}
                <h3 className="text-sm font-semibold">GLP-1</h3>
                <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#e0e7ff]">
                    <div className="space-y-2">
                        <Label htmlFor="glpTaken">GLP-1 Taken</Label>
                        <Input
                            id="glpTaken"
                            type="text"
                            value={formData.glpTaken}
                            onChange={(e) => handleSelectChange('glpTaken', e.target.value)}
                            placeholder="Enter value"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="glpRecentInjection">Date of last Injection</Label>
                        <Input
                            type="date"
                            id="glpRecentInjection"
                            name="glpRecentInjection"
                            value={formData.glpRecentInjection}
                            onChange={handleInputChange}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Semaglutide Section */}
                {/* Lipotropic Information */}
                <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#e0f7fa]">
                    <div className="space-y-4 col-span-full">
                        <h3 className="text-lg font-semibold">Lipotropic Information</h3>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lipotropicGoals">Weight Loss Goals</Label>
                        <Textarea
                            id="lipotropicGoals"
                            value={Array.isArray(formData.lipotropicGoals) ? formData.lipotropicGoals.join(', ') : formData.lipotropicGoals}
                            readOnly
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lipotropicAllergies">Allergies</Label>
                        <Textarea
                            id="lipotropicAllergies"
                            value={Array.isArray(formData.lipotropicAllergies) ? formData.lipotropicAllergies.join(', ') : formData.lipotropicAllergies}
                            readOnly
                        />
                    </div>
                    {formData.lipotropicAllergiesDrop && (
                        <div className="space-y-2">
                            <Label htmlFor="lipotropicAllergiesDrop">Allergy Details</Label>
                            <Textarea
                                id="lipotropicAllergiesDrop"
                                value={formData.lipotropicAllergiesDrop}
                                readOnly
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="lipotropicDiagnoses">Diagnosed Conditions</Label>
                        <Textarea
                            id="lipotropicDiagnoses"
                            value={Array.isArray(formData.lipotropicDiagnoses) ? formData.lipotropicDiagnoses.join(', ') : formData.lipotropicDiagnoses}
                            readOnly
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lipotropicHistory">Medical History</Label>
                        <Textarea
                            id="lipotropicHistory"
                            name="lipotropicHistory"
                            value={formData.lipotropicHistory}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lipotropicLastTreatment">Last Treatment</Label>
                        <Input
                            id="lipotropicLastTreatment"
                            name="lipotropicLastTreatment"
                            value={formData.lipotropicLastTreatment}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lipotropicSatisfaction">Satisfaction with Last Treatment</Label>
                        <Input
                            id="lipotropicSatisfaction"
                            name="lipotropicSatisfaction"
                            value={formData.lipotropicSatisfaction}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lipotropicStopReason">Reason for Stopping</Label>
                        <Textarea
                            id="lipotropicStopReason"
                            name="lipotropicStopReason"
                            value={formData.lipotropicStopReason}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="averageMood">Average Mood</Label>
                        <Input
                            id="averageMood"
                            name="averageMood"
                            value={formData.averageMood}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lipotropicMedicalConditions">Other Medical Conditions?</Label>
                        <Input
                            id="lipotropicMedicalConditions"
                            name="lipotropicMedicalConditions"
                            value={formData.lipotropicMedicalConditions}
                            onChange={handleInputChange}
                        />
                    </div>
                    {formData.lipotropicMedicalConditionsDrop && (
                        <div className="space-y-2">
                            <Label htmlFor="lipotropicMedicalConditionsDrop">Condition Details</Label>
                            <Textarea
                                id="lipotropicMedicalConditionsDrop"
                                name="lipotropicMedicalConditionsDrop"
                                value={formData.lipotropicMedicalConditionsDrop}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="lipotropicMeds">Taking Medications?</Label>
                        <Input
                            id="lipotropicMeds"
                            name="lipotropicMeds"
                            value={formData.lipotropicMeds}
                            onChange={handleInputChange}
                        />
                    </div>
                    {formData.lipotropicMedsDrop && (
                        <div className="space-y-2">
                            <Label htmlFor="lipotropicMedsDrop">Medication Details</Label>
                            <Textarea
                                id="lipotropicMedsDrop"
                                name="lipotropicMedsDrop"
                                value={formData.lipotropicMedsDrop}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="lipotropicPregnant">Pregnant/Breastfeeding/Planning?</Label>
                        <Input
                            id="lipotropicPregnant"
                            name="lipotropicPregnant"
                            value={formData.lipotropicPregnant}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="providerQuestions">Questions for Provider?</Label>
                        <Input
                            id="providerQuestions"
                            value={formData.providerQuestions}
                            readOnly
                        />
                    </div>
                    {formData.providerQuestionsDrop && (
                        <div className="space-y-2">
                            <Label htmlFor="providerQuestionsDrop">Question Details</Label>
                            <Textarea
                                id="providerQuestionsDrop"
                                value={formData.providerQuestionsDrop}
                                readOnly
                            />
                        </div>
                    )}
                </div>

                <h3 className="text-sm font-semibold">Semaglutide</h3>
                <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#ffe4e6]">
                    {['semaglutideLastDose', 'semaglutideRequestedDose'].map((field) => (
                        <div key={field} className="space-y-2">
                            <Label htmlFor={field}>
                                {field === 'semaglutideLastDose' ? 'Last Dose' : 'Requested Dose'}
                            </Label>
                            <Input
                                id={field}
                                type="text"
                                value={formData[field]}
                                onChange={(e) => handleSelectChange(field, e.target.value)}
                                placeholder="Enter dose"
                            />
                        </div>
                    ))}
                </div>

                {/* Tirzepatide Section */}
                <h3 className="text-sm font-semibold">Tirzepetide</h3>
                <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#f3e8ff]">
                    {['tirzepetideLastDose', 'tirzepetideRequestedDose'].map((field) => (
                        <div key={field} className="space-y-2">
                            <Label htmlFor={field}>
                                {field === 'tirzepetideLastDose' ? 'Last Dose' : 'Requested Dose'}
                            </Label>
                            <Input
                                id={field}
                                type="text"
                                value={formData[field]}
                                onChange={(e) => handleSelectChange(field, e.target.value)}
                                placeholder="Enter dose"
                            />
                        </div>
                    ))}
                </div>

                {/* Tirzepatide Details Section */}
                <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#fef3c7]">
                    {['tirzepetidePlanPurchased', 'tirzepetideVial', 'tirzepetideDosingSchedule'].map((field) => (
                        <div key={field} className="space-y-2">
                            <Label htmlFor={field}>
                                {field === 'tirzepetidePlanPurchased' ? 'Plan Purchased' :
                                    field === 'tirzepetideVial' ? 'Vial' : 'Dosing Schedule'}
                            </Label>

                            {(field === 'tirzepetidePlanPurchased' || field === 'tirzepetideVial') ? (
                                <Input
                                    id={field}
                                    type="text"
                                    value={formData[field]}
                                    onChange={(e) => handleSelectChange(field, e.target.value)}
                                    placeholder={`Enter ${field === 'tirzepetidePlanPurchased' ? 'plan' : 'vial'}`}
                                />
                            ) : (
                                <Select
                                    value={formData[field]}
                                    onValueChange={(value) => handleSelectChange(field, value)}
                                >
                                    <SelectTrigger id={field} className="w-full">
                                        <SelectValue placeholder="Select dosing schedule" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="biweekly">Biweekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="None">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    ))}
                </div>

                {/* Comments Section */}
                <div className="w-full mx-auto p-6 border rounded-xl shadow-sm bg-[#f1f5f9]">
                    <div className="space-y-2">
                        <Label htmlFor="providerComments">Enter your questions and comments</Label>
                        <textarea
                            id="providerComments"
                            name="providerComments"
                            className="w-full p-4 border rounded-md shadow-sm"
                            rows="4"
                            value={formData.providerComments}
                            onChange={handleInputChange}
                            placeholder="Write your questions or comments here..."
                        />
                    </div>
                </div>
                {/* new field Selection */}
                <div className="w-full mx-auto p-6 border rounded-xl shadow-sm bg-[#eefee2]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="kidneyDisease">Kidney Disease</Label>
                            <Select value={formData.kidneyDisease || ''} onValueChange={value => handleSelectChange('kidneyDisease', value)}>
                                <SelectTrigger id="kidneyDisease" className="w-full">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pregnant">Pregnant</Label>
                            <Select value={formData.pregnant || ''} onValueChange={value => handleSelectChange('pregnant', value)}>
                                <SelectTrigger id="pregnant" className="w-full">
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
                            <Select value={formData.breastfeeding || ''} onValueChange={value => handleSelectChange('breastfeeding', value)}>
                                <SelectTrigger id="breastfeeding" className="w-full">
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
                            <Input id="healthcareProvider" name="healthcareProvider" value={formData.healthcareProvider || ''} onChange={handleInputChange} placeholder="Healthcare provider" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="eatingDisorders">Eating Disorders</Label>
                            <Input id="eatingDisorders" name="eatingDisorders" value={formData.eatingDisorders || ''} onChange={handleInputChange} placeholder="Eating disorders" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="labs">Labs</Label>
                            <Input id="labs" name="labs" value={formData.labs || ''} onChange={handleInputChange} placeholder="Labs" />
                        </div>
                    </div>
                </div>
                {/* new field Selection */}
                <div className="w-full mx-auto p-6 border rounded-xl shadow-sm bg-[#e2f7fe]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="conditions">Conditions</Label>
                            <Textarea id="conditions" name="conditions" value={Array.isArray(formData.conditions) ? formData.conditions.join(', ') : formData.conditions || ''} onChange={handleInputChange} placeholder="Comma separated conditions" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="familyConditions">Family Conditions</Label>
                            <Textarea id="familyConditions" name="familyConditions" value={Array.isArray(formData.familyConditions) ? formData.familyConditions.join(', ') : formData.familyConditions || ''} onChange={handleInputChange} placeholder="Comma separated family conditions" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weightLossSurgery">Weight Loss Surgery</Label>
                            <Textarea id="weightLossSurgery" name="weightLossSurgery" value={Array.isArray(formData.weightLossSurgery) ? formData.weightLossSurgery.join(', ') : formData.weightLossSurgery || ''} onChange={handleInputChange} placeholder="Comma separated surgeries" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weightRelatedConditions">Weight Related Conditions</Label>
                            <Textarea id="weightRelatedConditions" name="weightRelatedConditions" value={Array.isArray(formData.weightRelatedConditions) ? formData.weightRelatedConditions.join(', ') : formData.weightRelatedConditions || ''} onChange={handleInputChange} placeholder="Comma separated weight related conditions" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="medications">Medications</Label>
                            <Textarea id="medications" name="medications" value={Array.isArray(formData.medications) ? formData.medications.join(', ') : formData.medications || ''} onChange={handleInputChange} placeholder="Comma separated medications" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="diets">Diets</Label>
                            <Textarea id="diets" name="diets" value={Array.isArray(formData.diets) ? formData.diets.join(', ') : formData.diets || ''} onChange={handleInputChange} placeholder="Comma separated diets" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="otherConditions">Other Conditions</Label>
                            <Textarea id="otherConditions" name="otherConditions" value={formData.otherConditions || ''} onChange={handleInputChange} placeholder="Other conditions" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currentMedications">Current Medications</Label>
                            <Textarea id="currentMedications" name="currentMedications" value={formData.currentMedications || ''} onChange={handleInputChange} placeholder="Current medications" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="glp1Statement">GLP-1 Statement</Label>
                            <Textarea id="glp1Statement" name="glp1Statement" value={formData.glp1Statement || ''} onChange={handleInputChange} placeholder="GLP-1 statement" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="glp1DoseInfo">GLP-1 Dose Info</Label>
                            <Textarea id="glp1DoseInfo" name="glp1DoseInfo" value={formData.glp1DoseInfo || ''} onChange={handleInputChange} placeholder="GLP-1 dose info" />
                        </div>
                    </div>
                </div>
                {/* Medication Selection */}
                <div className="space-y-2">
                    <Label htmlFor="medicine">Preferred GLP-1 Medication</Label>
                    <Select
                        value={formData.medicine}
                        onValueChange={(value) => handleSelectChange('medicine', value)}
                    >
                        <SelectTrigger id="medicine" className="w-full">
                            <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Semaglutide">Semaglutide</SelectItem>
                            <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
                            <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Image Upload Section */}
                <h3 className="text-sm font-semibold">Upload Images (Max 3)</h3>
                <div className="flex justify-between flex-wrap items-center gap-4">
                    {images.map((image, index) => (
                        <div key={index} className="relative group w-[200px] h-48">
                            {image?.preview ? (
                                <>
                                    <Image
                                        src={image.preview}
                                        alt={`Preview ${index + 1}`}
                                        width={200}
                                        height={192} // h-48 is 192px
                                        unoptimized={true}
                                        className="object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSelectedImage(image.preview)}
                                        className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded-full"
                                    >
                                        <Fullscreen className="h-5 w-5" />
                                    </button>
                                    {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'T') && (
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="relative w-full h-full">
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById(`file-input-${index}`).click()}
                                        className="w-full h-full text-sm px-4 py-3 font-bold bg-secondary border border-black text-white rounded-lg focus:outline-none focus:border-purple-400"
                                    >
                                        Upload Image
                                    </button>
                                    <input
                                        id={`file-input-${index}`}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageKitUpload(e, index)}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* File Upload Section */}
                <h3 className="text-sm font-semibold">Upload Documents</h3>
                <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#f5f3ff]">
                    <div className="space-y-2">
                        <Label>Document 1</Label>
                        <UploadFile
                            onUploadComplete={(url) => setFileUrls(prev => ({ ...prev, file1: url }))}
                            onDelete={() => setFileUrls(prev => ({ ...prev, file1: '' }))}
                            file={fileUrls.file1}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Document 2</Label>
                        <UploadFile
                            onUploadComplete={(url) => setFileUrls(prev => ({ ...prev, file2: url }))}
                            onDelete={() => setFileUrls(prev => ({ ...prev, file2: '' }))}
                            file={fileUrls.file2}
                        />
                    </div>
                </div>

                <div className="w-full mx-auto grid grid-cols-1 gap-6 p-6 border rounded-xl shadow-sm bg-[#e6fffa]">
                    {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'C') && (
                        <div className="space-y-2">
                            <Label htmlFor="approvalStatus">Approval Status</Label>
                            <Select
                                value={formData.approvalStatus}
                                onValueChange={(value) => handleSelectChange('approvalStatus', value)}
                            >
                                <SelectTrigger id="approvalStatus" className="w-full">
                                    <SelectValue placeholder="Select approval status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="denied">Denied</SelectItem>
                                    <SelectItem value="pending">Pending / Request a call</SelectItem>
                                    <SelectItem value="disqualified">Disqualified / Close</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {/* Semaglutide Dose */}
                    <div className="space-y-2">
                        <Label>Semaglutide Dose</Label>
                        <div className="flex gap-2">
                            {/* Dose Dropdown */}
                            <Select
                                value={formData.semaglutideDose}
                                onValueChange={(value) =>
                                    handleSelectChange("semaglutideDose", value)
                                }
                            >
                                <SelectTrigger className="w-1/2">
                                    <SelectValue placeholder="Dose" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0.25">0.25 mg</SelectItem>
                                    <SelectItem value="0.50">0.50 mg</SelectItem>
                                    <SelectItem value="1.0">1 mg</SelectItem>
                                    <SelectItem value="1.7">1.7 mg</SelectItem>
                                    <SelectItem value="2.0">2.0 mg</SelectItem>
                                    <SelectItem value="2.5">2.5 mg</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Unit FREE TEXT */}
                            <Input
                                className="w-1/2"
                                placeholder="Unit (e.g. 1 mg / 2 mL)"
                                value={formData.semaglutideUnit}
                                onChange={(e) =>
                                    handleSelectChange("semaglutideUnit", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tirzepatide Dose</Label>
                        <div className="flex gap-2">
                            {/* Dose Dropdown */}
                            <Select
                                value={formData.tirzepatideDose}
                                onValueChange={(value) =>
                                    handleSelectChange("tirzepatideDose", value)
                                }
                            >
                                <SelectTrigger className="w-1/2">
                                    <SelectValue placeholder="Dose" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2.50">2.50 mg</SelectItem>
                                    <SelectItem value="5.00">5.00 mg</SelectItem>
                                    <SelectItem value="7.50">7.50 mg</SelectItem>
                                    <SelectItem value="10.00">10.00 mg</SelectItem>
                                    <SelectItem value="12.50">12.50 mg</SelectItem>
                                    <SelectItem value="15.00">15.00 mg</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Unit FREE TEXT */}
                            <Input
                                className="w-1/2"
                                placeholder="Unit (e.g. 60 mg / 2 mL)"
                                value={formData.tirzepatideUnit}
                                onChange={(e) =>
                                    handleSelectChange("tirzepatideUnit", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Lipotropic MIC+B12 Dose</Label>
                        <div className="flex gap-2">
                            {/* Dose Dropdown */}
                            <Select
                                value={formData.lipotropicDose}
                                onValueChange={(value) =>
                                    handleSelectChange("lipotropicDose", value)
                                }
                            >
                                <SelectTrigger className="w-1/2">
                                    <SelectValue placeholder="Dose" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2.50">2.50 mg</SelectItem>
                                    <SelectItem value="5.00">5.00 mg</SelectItem>
                                    <SelectItem value="7.50">7.50 mg</SelectItem>
                                    <SelectItem value="10.00">10.00 mg</SelectItem>
                                    <SelectItem value="12.50">12.50 mg</SelectItem>
                                    <SelectItem value="15.00">15.00 mg</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Unit FREE TEXT */}
                            <Input
                                className="w-1/2"
                                placeholder="Unit (e.g. 60 mg / 2 mL)"
                                value={formData.lipotropicUnit}
                                onChange={(e) =>
                                    handleSelectChange("lipotropicUnit", e.target.value)
                                }
                            />
                        </div>
                    </div>

                </div>

                <div className="w-full mx-auto grid grid-cols-1 gap-6 p-6 border rounded-xl shadow-sm bg-[#e6ffea]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-2 ">
                            <Label>Follow Up</Label>
                            <div className="flex gap-2">
                                <Select
                                    value={formData.followUpInterval}
                                    onValueChange={(value) => handleSelectChange('followUpInterval', value)}
                                >
                                    <SelectTrigger className="w-1/2">
                                        <SelectValue placeholder="Select interval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7d">7 Days</SelectItem>
                                        <SelectItem value="14d">14 Days</SelectItem>
                                        <SelectItem value="30d">30 Days</SelectItem>
                                        <SelectItem value="None">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Refill Reminder</Label>
                            <div className="flex gap-2">
                                <Select
                                    value={formData.refillReminderInterval}
                                    onValueChange={(value) => handleSelectChange('refillReminderInterval', value)}
                                >
                                    <SelectTrigger className="w-1/2">
                                        <SelectValue placeholder="Select interval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="4w">4 weeks</SelectItem>
                                        <SelectItem value="5w">5 weeks</SelectItem>
                                        <SelectItem value="6w">6 weeks</SelectItem>
                                        <SelectItem value="8w">8 weeks</SelectItem>
                                        <SelectItem value="10w">10 weeks</SelectItem>
                                        <SelectItem value="12w">12 weeks</SelectItem>
                                        <SelectItem value="13w">13 weeks</SelectItem>
                                        <SelectItem value="None">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                </div>
                {/* Open sheet */}
                {(session?.user?.accounttype === 'C') && (
                    <div className="w-full mx-auto flex justify-center">
                        <Button
                            type="button"
                            onClick={openDialog}
                            className="max-w-sm bg-[#FFE4C9] text-black hover:bg-[#FFE4CC] hover:font-bold duration-150 shadow-xl"
                        >
                            Dosing Calculator
                        </Button>
                    </div>
                )}
                {/* Provider Note Section */}
                <div className="w-full mx-auto p-6 border rounded-xl shadow-sm bg-[#f1f5f9]">
                    <div className="space-y-2">
                        <Label htmlFor="providerNote">Provider Note</Label>
                        <textarea
                            id="providerNote"
                            name="providerNote"
                            className="w-full p-4 border rounded-md shadow-sm"
                            rows="4"
                            value={formData.providerNote}
                            onChange={handleInputChange}
                            placeholder="Enter any notes or comments here..."
                        />
                    </div>
                </div>

                {/* Consent and Agreements Section */}
                <h3 className="text-sm font-semibold">Consent and Agreements</h3>

                {/* GLP-1 Consent & Terms */}
                <div className="space-y-4 p-6 border rounded-xl shadow-sm bg-[#f1f5f9]">
                    <h4 className="text-sm font-medium text-gray-700">GLP-1 Consent & Terms</h4>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="bmiConsent"
                            checked={formData.bmiConsent}
                            onCheckedChange={(checked) => handleCheckboxChange('bmiConsent', checked)}
                        />
                        <Label htmlFor="bmiConsent" className="text-sm">
                            BMI Consent
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="consent"
                            checked={formData.consent}
                            onCheckedChange={(checked) => handleCheckboxChange('consent', checked)}
                        />
                        <Label htmlFor="consent" className="text-sm">
                            Telehealth Consent - I consent to treatment and acknowledge the risks and benefits
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="terms"
                            checked={formData.terms}
                            onCheckedChange={(checked) => handleCheckboxChange('terms', checked)}
                        />
                        <Label htmlFor="terms" className="text-sm">
                            Terms of Service - I agree to the terms and conditions
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="treatment"
                            checked={formData.treatment}
                            onCheckedChange={(checked) => handleCheckboxChange('treatment', checked)}
                        />
                        <Label htmlFor="treatment" className="text-sm">
                            Treatment Consent - I understand the treatment plan and agree to follow it
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="agreetopay"
                            checked={formData.agreetopay}
                            onCheckedChange={(checked) => handleCheckboxChange('agreetopay', checked)}
                        />
                        <Label htmlFor="agreetopay" className="text-sm">
                            Payment Agreement - I agree to pay the $25 clinician review fee
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="agreeTerms"
                            checked={formData.agreeTerms}
                            onCheckedChange={(checked) => handleCheckboxChange('agreeTerms', checked)}
                        />
                        <Label htmlFor="agreeTerms" className="text-sm">
                            General Agreement - I agree to all terms
                        </Label>
                    </div>
                </div>

                {/* Lipotropic Consent & Terms */}
                <div className="space-y-4 p-6 border rounded-xl shadow-sm bg-[#f1f9f8]">
                    <h4 className="text-sm font-medium text-gray-700">Lipotropic Consent & Terms</h4>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="lipotropicConsent"
                            checked={formData.lipotropicConsent}
                            onCheckedChange={(checked) => handleCheckboxChange('lipotropicConsent', checked)}
                        />
                        <Label htmlFor="lipotropicConsent" className="text-sm">
                            Telehealth Consent & HIPAA Notice - I acknowledge and agree
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="lipotropicTerms"
                            checked={formData.lipotropicTerms}
                            onCheckedChange={(checked) => handleCheckboxChange('lipotropicTerms', checked)}
                        />
                        <Label htmlFor="lipotropicTerms" className="text-sm">
                            Terms of Service - I agree to the terms and conditions
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="lipotropicTreatment"
                            checked={formData.lipotropicTreatment}
                            onCheckedChange={(checked) => handleCheckboxChange('lipotropicTreatment', checked)}
                        />
                        <Label htmlFor="lipotropicTreatment" className="text-sm">
                            Treatment Consent - I consent to the treatment
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="lipotropicElectronic"
                            checked={formData.lipotropicElectronic}
                            onCheckedChange={(checked) => handleCheckboxChange('lipotropicElectronic', checked)}
                        />
                        <Label htmlFor="lipotropicElectronic" className="text-sm">
                            Electronic Records Agreement - I agree to electronic records usage
                        </Label>
                    </div>
                </div>

                <Button type="submit" className="w-full">
                    {session?.user?.accounttype === 'C' ? 'Submit Patient' : 'Update Patient'}
                </Button>
            </form>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent className="rounded-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{messageHead}</AlertDialogTitle>
                        <AlertDialogDescription>{message}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        {/* Stay on page button */}
                        <AlertDialogCancel>
                            {isSuccess ? "Continue Editing" : "Cancel"}
                        </AlertDialogCancel>

                        {/* Redirect button (only show for success) */}
                        {isSuccess && (
                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="bg-primary hover:bg-primary-dark"
                            >
                                Return to Dashboard
                            </Button>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
                <AlertDialogContent className="max-w-[80vw]">
                    <AlertDialogHeader>
                        <div className="flex-1 max-h-[70vh] flex justify-center">
                            {selectedImage && (
                                <Image
                                    src={selectedImage}
                                    alt="Preview"
                                    width={1200}
                                    height={800}
                                    className="max-h-full max-w-full object-contain rounded-lg"
                                    unoptimized
                                />
                            )}
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedImage(null)}>
                            Close
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogContent className="max-w-[90vw] h-[90vh] p-0 flex flex-col">
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-50"
                        >
                            <X className="h-6 w-6 bg-background/80 backdrop-blur-sm p-1 rounded-md border" />
                            <span className="sr-only">Close</span>
                        </button>
                        <div className="px-6 pt-6 pb-2">
                            <h2 className="text-lg font-semibold">Dosing Calculator</h2>
                            <p className="text-sm text-muted-foreground">
                                You are working on a temporary copy. Changes will not affect the original.
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0">
                        {sheetUrl && (
                            <iframe
                                src={sheetUrl}
                                className="w-full h-full border-0"
                                allowFullScreen
                            />
                        )}
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}