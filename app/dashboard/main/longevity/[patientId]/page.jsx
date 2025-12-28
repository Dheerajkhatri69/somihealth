"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { X, Fullscreen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import UploadFile from "@/components/FileUpload";
import { upload } from "@imagekit/next";

export default function LongevityQuestionnaireForm({ params }) {
    const { data: session } = useSession();
    const router = useRouter();
    const isNew = params.patientId === "new";

    const [loading, setLoading] = useState(!isNew);
    const [formData, setFormData] = useState({
        // === Treatment Section ===
        treatmentChoose: "",
        treatmentGoal: "",
        previousTreatment: "",
        negativeReactions: "",
        lastSatisfiedStop: "",
        clinicianToKnowAboutYourHealth: "",
        disclinicianToKnowAboutYourHealth: "",
        cardiovascularHealth: "",

        // === Physical Measurements ===
        heightFeet: "",
        heightInches: "",
        currentWeight: "",
        bmi: "",
        strength: "",

        // === Personal Information ===
        firstName: "",
        lastName: "",
        phone: "",
        email: "",

        // === Age Verification ===
        isOver18: "",
        dateOfBirth: "",

        // === Address ===
        address: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        country: "",

        // === Sex ===
        sex: "",

        // === Allergies ===
        allergies: "",
        desAllergies: "",

        // === Diagnoses ===
        diagnoses: [],
        diagnosed: "",
        desDiagnosed: "",

        // === Medications ===
        currentlyTakingAnyMedications: "",
        desCurrentlyTakingAnyMedications: "",

        // === Surgeries ===
        surgeriesOrHospitalization: "",
        desSurgeriesOrHospitalization: "",

        // === Pregnancy ===
        pregnantOrBreastfeeding: "",

        // === Healthcare Provider ===
        healthcareProvider: "",

        // === Heard About ===
        heardAbout: "",
        heardAboutOther: "",

        // === Final Step Checkboxes ===
        consent: false,
        terms: false,
        treatment: false,

        // === Images and Files ===
        idPhoto: "",
        images: [],

        // === Provider Fields ===
        approvalStatus: "",
        providerNote: "",

        // === Follow-up ===
        followUp: "",
        refillReminder: "",

        // === Dose ===
        dose: "",
        unit: "",

        // === Patient Reference ===
        patientId: "",
        submissionData: false,
        submissionData: true,
    });

    // Temporary state for UI selections
    const [uiState, setUiState] = useState({
        followUpInterval: "",
        refillReminderInterval: ""
    });

    const [images, setImages] = useState([
        { file: null, preview: null },
        { file: null, preview: null },
        { file: null, preview: null },
    ]);
    const [idPhotoFile, setIdPhotoFile] = useState({ file: null, preview: null });
    const [selectedImage, setSelectedImage] = useState(null);

    // Fetch data if not new
    useEffect(() => {
        if (!isNew) {
            const fetchQuestionnaire = async () => {
                try {
                    const res = await fetch(`/api/longevity-questionnaire/${params.patientId}`);
                    const data = await res.json();

                    if (data.success) {
                        // Extract interval from followUp and refillReminder for UI
                        let followUpInterval = '';
                        let refillReminderInterval = '';

                        if (data.result.followUp && data.result.followUp.includes('_')) {
                            followUpInterval = data.result.followUp.split('_')[1];
                        } else if (data.result.followUp) {
                            // If it's stored as just "7d" (old format), use it directly
                            followUpInterval = data.result.followUp;
                        }

                        if (data.result.refillReminder && data.result.refillReminder.includes('_')) {
                            refillReminderInterval = data.result.refillReminder.split('_')[1];
                        } else if (data.result.refillReminder) {
                            // If it's stored as just "8w" (old format), use it directly
                            refillReminderInterval = data.result.refillReminder;
                        }

                        setFormData(data.result);
                        setUiState({
                            followUpInterval,
                            refillReminderInterval
                        });

                        // Initialize images
                        if (data.result.images) {
                            const initialImages = data.result.images.slice(0, 3).map(img => ({
                                preview: img,
                                file: null
                            }));
                            while (initialImages.length < 3) {
                                initialImages.push({ file: null, preview: null });
                            }
                            setImages(initialImages);
                        }
                        // Initialize ID photo
                        if (data.result.idPhoto) {
                            setIdPhotoFile({ file: null, preview: data.result.idPhoto });
                        }
                    }
                } catch (err) {
                    console.error("Fetch failed:", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchQuestionnaire();
        } else {
            setLoading(false);
        }
    }, [isNew, params.patientId]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUISelectChange = (name, value) => {
        setUiState(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name, checked) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleDiagnosesChange = (e) => {
        const value = e.target.value;
        const diagnosesArray = value.split(',').map(item => item.trim()).filter(item => item);
        setFormData(prev => ({ ...prev, diagnoses: diagnosesArray }));
    };

    // Helper to generate date string using current date
    function getFutureDateString(interval) {
        if (!interval || interval === 'None') return '';
        const now = new Date();
        return `${now.toISOString()}_${interval}`;
    }

    // Calculate BMI
    useEffect(() => {
        const calculateBMI = () => {
            const feet = parseFloat(formData.heightFeet) || 0;
            const inches = parseFloat(formData.heightInches) || 0;
            const weight = parseFloat(formData.currentWeight) || 0;

            if (feet > 0 && weight > 0) {
                const totalInches = (feet * 12) + inches;
                const heightMeters = totalInches * 0.0254;
                const weightKg = weight * 0.453592;

                if (heightMeters > 0) {
                    const bmi = (weightKg / (heightMeters * heightMeters)).toFixed(1);
                    setFormData(prev => ({ ...prev, bmi }));
                }
            }
        };

        calculateBMI();
    }, [formData.heightFeet, formData.heightInches, formData.currentWeight]);

    // Image upload functions
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

    const handleIdPhotoUpload = async (event) => {
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
            setIdPhotoFile({ file: null, preview: uploadedUrl });
            setFormData(prev => ({ ...prev, idPhoto: uploadedUrl }));
        } catch (error) {
            console.error("ImageKit upload error:", error);
        }
    };

    const removeImage = (index) => {
        setImages(prev =>
            prev.map((img, i) =>
                i === index ? { file: null, preview: null } : img
            )
        );
    };

    const removeIdPhoto = () => {
        setIdPhotoFile({ file: null, preview: null });
        setFormData(prev => ({ ...prev, idPhoto: "" }));
    };

    // Alert dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [messageHead, setMessageHead] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare data with formatted followUp and refillReminder
        const followUp = getFutureDateString(uiState.followUpInterval);
        const refillReminder = getFutureDateString(uiState.refillReminderInterval);

        // Create submission data, making sure authid is included
        const submissionData = {
            authid: formData.authid, // Explicitly include authid
            ...formData,
            followUp,
            refillReminder,
            images: images.filter(img => img.preview).map(img => img.preview),
            idPhoto: idPhotoFile.preview || formData.idPhoto,
        };

        // For new records, ensure authid is generated
        if (isNew && !submissionData.authid) {
            submissionData.authid = `P${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
        }

        // Remove system fields but keep authid
        delete submissionData.createTimeDate;
        delete submissionData.closetickets;
        delete submissionData.Reasonclosetickets;
        delete submissionData.status;

        // For new records, set questionnaire and seen fields
        if (isNew) {
            submissionData.questionnaire = false;
            submissionData.seen = true;
        }

        try {
            const endpoint = isNew
                ? "/api/longevity-questionnaire"
                : `/api/longevity-questionnaire/${params.patientId}`;

            const method = isNew ? "POST" : "PUT";

            console.log("Submitting data:", submissionData); // Debug log

            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submissionData),
            });

            const data = await res.json();

            if (data.success) {
                setMessageHead("Success");
                setMessage(isNew
                    ? "Questionnaire created successfully!"
                    : "Questionnaire updated successfully!"
                );
                setIsSuccess(true);
                setIsDialogOpen(true);

                // If new, update the URL with the new authid
                if (isNew && data.result?.authid) {
                    setTimeout(() => {
                        router.push("/dashboard/main/longevity");
                    }, 1000);
                }
            } else {
                setMessageHead("Error");
                setMessage(data.error || data.message || "Failed to save questionnaire");
                setIsSuccess(false);
                setIsDialogOpen(true);
            }
        } catch (err) {
            setMessageHead("Error");
            setMessage("Failed to save questionnaire. Please try again.");
            setIsSuccess(false);
            setIsDialogOpen(true);
            console.error("Request failed:", err);
        }
    };
    // Loading skeleton
    if (loading) {
        return (
            <div className="mb-4 p-4">
                <div className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-8 w-64" />
                        {!isNew && (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        )}
                    </div>
                    {/* Rest of skeleton similar to patient form */}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-4 p-4">
            <form onSubmit={handleSubmit} className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">
                        {isNew ? "New Longevity Questionnaire" : `Updating ${formData.firstName} ${formData.lastName}`}
                    </h2>
                    {!isNew && (
                        <div className="space-y-2">
                            <Label>Questionnaire ID</Label>
                            <Input value={formData.authid} readOnly className="font-mono w-32" />
                        </div>
                    )}
                </div>

                {/* Treatment Section */}
                <h3 className="text-sm font-semibold">Treatment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                    <div className="space-y-2">
                        <Label htmlFor="treatmentChoose">Treatment Selection</Label>
                        <Select
                            value={formData.treatmentChoose}
                            onValueChange={(value) => handleSelectChange('treatmentChoose', value)}
                        >
                            <SelectTrigger id="treatmentChoose" className="w-full">
                                <SelectValue placeholder="Select treatment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NAD+">NAD+</SelectItem>
                                <SelectItem value="Glutathione">Glutathione</SelectItem>
                                <SelectItem value="Sermorelin">Sermorelin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="treatmentGoal">Treatment Goal</Label>
                        <Input
                            id="treatmentGoal"
                            name="treatmentGoal"
                            value={formData.treatmentGoal}
                            onChange={handleInputChange}
                            placeholder="Describe treatment goal"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="previousTreatment">Previous Treatment?</Label>
                        <Select
                            value={formData.previousTreatment}
                            onValueChange={(value) => handleSelectChange('previousTreatment', value)}
                        >
                            <SelectTrigger id="previousTreatment" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="negativeReactions">Negative Reactions?</Label>
                        <Select
                            value={formData.negativeReactions}
                            onValueChange={(value) => handleSelectChange('negativeReactions', value)}
                        >
                            <SelectTrigger id="negativeReactions" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cardiovascularHealth">Cardiovascular Health (1-5)</Label>
                        <Select
                            value={formData.cardiovascularHealth}
                            onValueChange={(value) => handleSelectChange('cardiovascularHealth', value)}
                        >
                            <SelectTrigger id="cardiovascularHealth" className="w-full">
                                <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                                <SelectItem value="5">5</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="strength">Strength Level (1-5)</Label>
                        <Select
                            value={formData.strength}
                            onValueChange={(value) => handleSelectChange('strength', value)}
                        >
                            <SelectTrigger id="strength" className="w-full">
                                <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                                <SelectItem value="5">5</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Physical Measurements */}
                <h3 className="text-sm font-semibold">Physical Measurements</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border rounded-xl shadow-sm bg-[#e0f2fe]">
                    <div className="space-y-2">
                        <Label htmlFor="heightFeet">Height (Feet)</Label>
                        <Input
                            id="heightFeet"
                            name="heightFeet"
                            type="number"
                            value={formData.heightFeet}
                            onChange={handleInputChange}
                            placeholder="e.g., 5"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="heightInches">Height (Inches)</Label>
                        <Input
                            id="heightInches"
                            name="heightInches"
                            type="number"
                            value={formData.heightInches}
                            onChange={handleInputChange}
                            placeholder="e.g., 9"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currentWeight">Weight (lbs)</Label>
                        <Input
                            id="currentWeight"
                            name="currentWeight"
                            type="number"
                            value={formData.currentWeight}
                            onChange={handleInputChange}
                            placeholder="e.g., 180"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bmi">BMI (Auto-calculated)</Label>
                        <Input
                            id="bmi"
                            name="bmi"
                            value={formData.bmi || ""}
                            readOnly
                            className="bg-gray-100"
                            placeholder="Auto-calculated"
                        />
                    </div>
                </div>

                {/* Personal Information */}
                <h3 className="text-sm font-semibold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#dcfce7]">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="First name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Last name"
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
                        <Label htmlFor="isOver18">Are you over 18?</Label>
                        <Select
                            value={formData.isOver18}
                            onValueChange={(value) => handleSelectChange('isOver18', value)}
                        >
                            <SelectTrigger id="isOver18" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ""}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sex">Sex</Label>
                        <Select
                            value={formData.sex}
                            onValueChange={(value) => handleSelectChange('sex', value)}
                        >
                            <SelectTrigger id="sex" className="w-full">
                                <SelectValue placeholder="Select sex" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Address */}
                <h3 className="text-sm font-semibold">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#fef9c3]">
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Street address"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address2">Address Line 2</Label>
                        <Input
                            id="address2"
                            name="address2"
                            value={formData.address2}
                            onChange={handleInputChange}
                            placeholder="Apartment, suite, etc."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="City"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="State"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                            id="zip"
                            name="zip"
                            value={formData.zip}
                            onChange={handleInputChange}
                            placeholder="ZIP code"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            placeholder="Country"
                        />
                    </div>
                </div>

                {/* Medical History */}
                <h3 className="text-sm font-semibold">Medical History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#fce7f3]">
                    <div className="space-y-2">
                        <Label htmlFor="allergies">Any Allergies?</Label>
                        <Select
                            value={formData.allergies}
                            onValueChange={(value) => handleSelectChange('allergies', value)}
                        >
                            <SelectTrigger id="allergies" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.allergies === "yes" && (
                        <div className="space-y-2 col-span-full">
                            <Label htmlFor="desAllergies">Describe Allergies</Label>
                            <Textarea
                                id="desAllergies"
                                name="desAllergies"
                                value={formData.desAllergies}
                                onChange={handleInputChange}
                                placeholder="Describe allergies..."
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="diagnosed">Any Medical Diagnoses?</Label>
                        <Select
                            value={formData.diagnosed}
                            onValueChange={(value) => handleSelectChange('diagnosed', value)}
                        >
                            <SelectTrigger id="diagnosed" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.diagnosed === "yes" && (
                        <div className="space-y-2 col-span-full">
                            <Label htmlFor="desDiagnosed">Describe Diagnoses</Label>
                            <Textarea
                                id="desDiagnosed"
                                name="desDiagnosed"
                                value={formData.desDiagnosed}
                                onChange={handleInputChange}
                                placeholder="Describe diagnoses..."
                            />
                        </div>
                    )}

                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="diagnoses">Diagnoses List (comma separated)</Label>
                        <Input
                            id="diagnoses"
                            name="diagnoses"
                            value={Array.isArray(formData.diagnoses) ? formData.diagnoses.join(', ') : formData.diagnoses || ''}
                            onChange={handleDiagnosesChange}
                            placeholder="e.g., Hypertension, Diabetes, Asthma"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currentlyTakingAnyMedications">Currently Taking Medications?</Label>
                        <Select
                            value={formData.currentlyTakingAnyMedications}
                            onValueChange={(value) => handleSelectChange('currentlyTakingAnyMedications', value)}
                        >
                            <SelectTrigger id="currentlyTakingAnyMedications" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.currentlyTakingAnyMedications === "yes" && (
                        <div className="space-y-2 col-span-full">
                            <Label htmlFor="desCurrentlyTakingAnyMedications">Describe Medications</Label>
                            <Textarea
                                id="desCurrentlyTakingAnyMedications"
                                name="desCurrentlyTakingAnyMedications"
                                value={formData.desCurrentlyTakingAnyMedications}
                                onChange={handleInputChange}
                                placeholder="Describe medications..."
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="surgeriesOrHospitalization">Any Surgeries/Hospitalizations?</Label>
                        <Select
                            value={formData.surgeriesOrHospitalization}
                            onValueChange={(value) => handleSelectChange('surgeriesOrHospitalization', value)}
                        >
                            <SelectTrigger id="surgeriesOrHospitalization" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.surgeriesOrHospitalization === "yes" && (
                        <div className="space-y-2 col-span-full">
                            <Label htmlFor="desSurgeriesOrHospitalization">Describe Surgeries/Hospitalizations</Label>
                            <Textarea
                                id="desSurgeriesOrHospitalization"
                                name="desSurgeriesOrHospitalization"
                                value={formData.desSurgeriesOrHospitalization}
                                onChange={handleInputChange}
                                placeholder="Describe surgeries/hospitalizations..."
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="pregnantOrBreastfeeding">Pregnant or Breastfeeding?</Label>
                        <Select
                            value={formData.pregnantOrBreastfeeding}
                            onValueChange={(value) => handleSelectChange('pregnantOrBreastfeeding', value)}
                        >
                            <SelectTrigger id="pregnantOrBreastfeeding" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="healthcareProvider">Do you have a Healthcare Provider?</Label>
                        <Input
                            id="healthcareProvider"
                            name="healthcareProvider"
                            value={formData.healthcareProvider}
                            onChange={handleInputChange}
                            placeholder="Name of healthcare provider"
                        />
                    </div>
                </div>

                {/* ID Photo Upload */}
                <h3 className="text-sm font-semibold">ID Photo Upload</h3>
                <div className="p-6 border rounded-xl shadow-sm bg-[#f3e8ff]">
                    <div className="space-y-2">
                        <Label>Government ID Photo</Label>
                        <div className="w-full max-w-lg">
                            <UploadFile
                                onUploadComplete={(url) => {
                                    setIdPhotoFile({ file: null, preview: url });
                                    setFormData(prev => ({ ...prev, idPhoto: url }));
                                }}
                                onDelete={removeIdPhoto}
                                file={idPhotoFile.preview || ''}
                                showFullscreenButton={true}
                                onFullscreenClick={() => setSelectedImage(idPhotoFile.preview)}
                            />
                        </div>
                    </div>
                </div>
                {/* Additional Images Upload */}
                <h3 className="text-sm font-semibold">Additional Images (Max 3)</h3>
                <div className="flex justify-between flex-wrap items-center gap-4 p-6 border rounded-xl shadow-sm bg-[#f5f3ff]">
                    {images.map((image, index) => (
                        <div key={index} className="relative group w-[200px] h-48">
                            {image?.preview ? (
                                <>
                                    <Image
                                        src={image.preview}
                                        alt={`Preview ${index + 1}`}
                                        width={200}
                                        height={192}
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
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
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

                {/* Heard About Section */}
                <h3 className="text-sm font-semibold">How did you hear about us?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#ecfdf5]">
                    <div className="space-y-2">
                        <Label htmlFor="heardAbout">Source</Label>
                        <Select
                            value={formData.heardAbout}
                            onValueChange={(value) => handleSelectChange('heardAbout', value)}
                        >
                            <SelectTrigger id="heardAbout" className="w-full">
                                <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Instagram">Instagram</SelectItem>
                                <SelectItem value="Facebook">Facebook</SelectItem>
                                <SelectItem value="TikTok">TikTok</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.heardAbout === "Other" && (
                        <div className="space-y-2">
                            <Label htmlFor="heardAboutOther">Please specify</Label>
                            <Input
                                id="heardAboutOther"
                                name="heardAboutOther"
                                value={formData.heardAboutOther}
                                onChange={handleInputChange}
                                placeholder="How did you hear about us?"
                            />
                        </div>
                    )}
                </div>

                {/* Provider Section (Admin/Staff only) */}
                {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'C') && (
                    <>
                        <h3 className="text-sm font-semibold">Provider Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 p-6 border rounded-xl shadow-sm bg-[#fef3c7]">
                            <div className="space-y-2">
                                <Label htmlFor="approvalStatus">Approval Status</Label>
                                <Select
                                    value={formData.approvalStatus}
                                    onValueChange={(value) => handleSelectChange('approvalStatus', value)}
                                >
                                    <SelectTrigger id="approvalStatus" className="w-full">
                                        <SelectValue placeholder="Select status" />
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

                            <div className="flex gap-2">
                                <Select
                                    value={formData.dose}
                                    onValueChange={(value) => handleSelectChange('dose', value)}
                                >
                                    <SelectTrigger className="w-1/2">
                                        <SelectValue placeholder="Dose" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NAD+ 200mg/ml">NAD+ 200mg/ml</SelectItem>
                                        <SelectItem value="Sermorelin 1mg/ml">Sermorelin 1mg/ml</SelectItem>
                                        <SelectItem value="Glutathione 200mg/ml">Glutathione 200mg/ml</SelectItem>
                                        <SelectItem value="None">None</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    className="w-1/2"
                                    placeholder="Unit (e.g. 60 mg / 2 mL)"
                                    value={formData.unit}
                                    onChange={(e) =>
                                        handleSelectChange("unit", e.target.value)
                                    }
                                />
                            </div>


                        </div>
                    </>
                )}
                {/* Follow-up and Refill Reminder Section */}
                <div className="w-full mx-auto grid grid-cols-1 gap-6 p-6 border rounded-xl shadow-sm bg-[#e6ffea]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Follow Up</Label>
                            <div className="flex gap-2">
                                <Select
                                    value={uiState.followUpInterval}
                                    onValueChange={(value) => handleUISelectChange('followUpInterval', value)}
                                >
                                    <SelectTrigger className="w-full">
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
                                    value={uiState.refillReminderInterval}
                                    onValueChange={(value) => handleUISelectChange('refillReminderInterval', value)}
                                >
                                    <SelectTrigger className="w-full">
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
                {/* Patient Reference */}
                <div className="p-6 border rounded-xl shadow-sm bg-[#e6fffa]">
                    <div className="space-y-2">
                        <Label htmlFor="patientId">Patient ID Reference</Label>
                        <Input
                            id="patientId"
                            name="patientId"
                            value={formData.patientId}
                            onChange={handleInputChange}
                            placeholder="Link to existing patient record"
                        />
                        <p className="text-sm text-gray-500">Optional: Reference to an existing patient record</p>
                    </div>
                </div>

                {/* Consent Checkboxes */}
                <h3 className="text-sm font-semibold">Consent and Agreements</h3>
                <div className="space-y-4 p-6 border rounded-xl shadow-sm bg-[#f1f5f9]">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="consent"
                            checked={formData.consent}
                            onCheckedChange={(checked) => handleCheckboxChange('consent', checked)}
                        />
                        <Label htmlFor="consent" className="text-sm">
                            I consent to treatment and acknowledge the risks and benefits
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="terms"
                            checked={formData.terms}
                            onCheckedChange={(checked) => handleCheckboxChange('terms', checked)}
                        />
                        <Label htmlFor="terms" className="text-sm">
                            I agree to the terms and conditions
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="treatment"
                            checked={formData.treatment}
                            onCheckedChange={(checked) => handleCheckboxChange('treatment', checked)}
                        />
                        <Label htmlFor="treatment" className="text-sm">
                            I understand the treatment plan and agree to follow it
                        </Label>
                    </div>
                </div>
                <div className="space-y-4 p-6 border rounded-xl shadow-sm bg-[#f1f9f8]">
                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="providerNote">Provider Note</Label>
                        <Textarea
                            id="providerNote"
                            name="providerNote"
                            value={formData.providerNote || ""}
                            onChange={handleInputChange}
                            placeholder="Provider notes..."
                            rows="3"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full">
                    {isNew ? "Create Questionnaire" : "Update Questionnaire"}
                </Button>
            </form>

            {/* Success/Error Dialog */}
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
                                onClick={() => router.push("/dashboard/main/longevity")}
                                className="bg-primary hover:bg-primary-dark"
                            >
                                Return to Dashboard
                            </Button>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Image Preview Dialog */}
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
        </div>
    );
}