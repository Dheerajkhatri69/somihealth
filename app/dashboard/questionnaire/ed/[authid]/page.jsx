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
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import UploadFile from "@/components/FileUpload";
import toast from "react-hot-toast";
import { X, Fullscreen } from "lucide-react";
import { upload } from "@imagekit/next";

// Medication options matching the refill form
const medicationOptions = {
    'Sildenafil (Generic of Viagra)': ['25mg', '50mg', '100mg'],
    'Tadalafil (Generic of Cialis)': ['5mg', '10mg', '20mg'],
    'Fusion Mini Troches (Tadalafil/Sildenafil)': ['5/35mg', '10/40mg']
};

export default function EDQuestionnaireForm({ params }) {
    const { data: session } = useSession();
    const router = useRouter();
    const isNew = params.authid === "new";

    const [loading, setLoading] = useState(!isNew);
    const [formData, setFormData] = useState({
        // Personal Information
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        isOver18: "",
        dateOfBirth: "",

        // Address
        address: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        country: "",

        // Medical Questions
        nitratesMedication: "",
        substanceUse: [],
        symptoms: [],
        cardiovascularConditions: [],
        urologicalConditions: [],
        bloodConditions: [],
        organConditions: [],
        neurologicalConditions: "",
        cancerConditions: "",
        eyeConditions: "",

        // Medications
        currentMedications: "",
        medicationsList: "",
        medicationAllergies: "",
        allergiesList: "",

        // Medical Conditions
        medicalConditions: "",
        medicalConditionsList: "",

        // ED Symptoms
        erectionChallenges: "",
        erectionSustaining: "",
        erectionChange: "",
        sexualEncounters: "",
        nonPrescriptionSupplements: "",

        // Previous ED Treatment
        previousEDMeds: "",

        // Uploads
        edMedicationPhoto: "",
        idPhoto: "",
        images: [],

        // Heard About
        heardAbout: "",
        heardAboutOther: "",
        comments: "",

        // Consent
        consent: false,
        terms: false,
        treatment: false,
        agreetopay: false,

        // Provider Fields
        approvalStatus: "",
        providerNote: "",
        followUp: "",
        refillReminder: "",
        dose: "",
        unit: "",
        currentMedication: "",
        currentDose: "",

        // System
        patientId: "",
    });

    // Temporary state for UI selections
    const [uiState, setUiState] = useState({
        followUpInterval: "",
        refillReminderInterval: ""
    });

    const [idPhotoFile, setIdPhotoFile] = useState({ file: null, preview: null });
    const [edMedPhotoFile, setEdMedPhotoFile] = useState({ file: null, preview: null });
    const [images, setImages] = useState([
        { file: null, preview: null },
        { file: null, preview: null },
        { file: null, preview: null },
    ]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [messageHead, setMessageHead] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isFirstSubmit, setIsFirstSubmit] = useState(true);

    // Fetch data if not new
    useEffect(() => {
        if (!isNew) {
            const fetchQuestionnaire = async () => {
                try {
                    const res = await fetch(`/api/ed-questionnaire/${params.authid}`);
                    const data = await res.json();

                    if (data.success) {
                        // Extract interval from followUp and refillReminder for UI
                        let followUpInterval = '';
                        let refillReminderInterval = '';

                        if (data.result.followUp && data.result.followUp.includes('_')) {
                            followUpInterval = data.result.followUp.split('_')[1];
                        } else if (data.result.followUp) {
                            followUpInterval = data.result.followUp;
                        }

                        if (data.result.refillReminder && data.result.refillReminder.includes('_')) {
                            refillReminderInterval = data.result.refillReminder.split('_')[1];
                        } else if (data.result.refillReminder) {
                            refillReminderInterval = data.result.refillReminder;
                        }

                        setFormData(data.result);
                        setIsFirstSubmit(data.result.questionnaire === true);
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
                        // Initialize ED medication photo
                        if (data.result.edMedicationPhoto) {
                            setEdMedPhotoFile({ file: null, preview: data.result.edMedicationPhoto });
                        }
                    }
                } catch (err) {
                    console.error("Fetch failed:", err);
                    toast.error("Error fetching questionnaire");
                } finally {
                    setLoading(false);
                }
            };

            fetchQuestionnaire();
        } else {
            setLoading(false);
        }
    }, [isNew, params.authid]);

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

    const handleArrayChange = (name, value, checked) => {
        const currentValues = formData[name] || [];
        if (checked) {
            setFormData(prev => ({
                ...prev,
                [name]: [...currentValues, value]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: currentValues.filter(item => item !== value)
            }));
        }
    };

    // Helper to generate date string using current date
    function getFutureDateString(interval) {
        if (!interval || interval === 'None') return '';
        const now = new Date();
        return `${now.toISOString()}_${interval}`;
    }

    const removeIdPhoto = () => {
        setIdPhotoFile({ file: null, preview: null });
        setFormData(prev => ({ ...prev, idPhoto: "" }));
    };

    const removeEdMedPhoto = () => {
        setEdMedPhotoFile({ file: null, preview: null });
        setFormData(prev => ({ ...prev, edMedicationPhoto: "" }));
    };

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
            toast.error("Failed to upload image. Please try again.");
        }
    };

    const removeImage = (index) => {
        setImages(prev =>
            prev.map((img, i) =>
                i === index ? { file: null, preview: null } : img
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Prepare data with formatted followUp and refillReminder
        const followUp = getFutureDateString(uiState.followUpInterval);
        const refillReminder = getFutureDateString(uiState.refillReminderInterval);

        // Create submission data
        const submissionData = {
            authid: formData.authid || params.authid,
            ...formData,
            followUp,
            refillReminder,
            images: images.filter(img => img.preview).map(img => img.preview),
            idPhoto: idPhotoFile.preview || formData.idPhoto,
            edMedicationPhoto: edMedPhotoFile.preview || formData.edMedicationPhoto,
            questionnaire: false, // Always set to false when submitting/updating
        };

        // For new records, ensure authid is generated
        if (isNew) {
            submissionData.authid = `ED${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
            submissionData.seen = true
        }

        // Remove system fields but keep authid
        delete submissionData.createTimeDate;
        delete submissionData.closetickets;
        delete submissionData.Reasonclosetickets;
        delete submissionData.status;

        try {
            const endpoint = isNew
                ? "/api/ed-questionnaire"
                : `/api/ed-questionnaire/${params.authid}`;

            const method = isNew ? "POST" : "PUT";

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
                setMessage(isFirstSubmit
                    ? "Questionnaire submitted successfully!"
                    : "Questionnaire updated successfully!"
                );
                setIsSuccess(true);
                setIsDialogOpen(true);
                setIsFirstSubmit(false);

                // If new, update the URL with the new authid
                if (isNew && data.result?.authid) {
                    setTimeout(() => {
                        router.push("/dashboard/questionnaire/ed");
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
        } finally {
            setIsSubmitting(false);
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
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>
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
                        {isNew ? "New ED Questionnaire" : `ED Questionnaire - ${formData.firstName} ${formData.lastName}`}
                    </h2>
                    {!isNew && (
                        <div className="space-y-2">
                            <Label>Questionnaire ID</Label>
                            <Input value={formData.authid} readOnly className="font-mono w-32" />
                        </div>
                    )}
                </div>

                {/* Personal Information */}
                <h3 className="text-sm font-semibold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName || ""}
                            onChange={handleInputChange}
                            placeholder="First name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName || ""}
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
                            value={formData.email || ""}
                            onChange={handleInputChange}
                            placeholder="example@mail.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            name="phone"
                            value={formData.phone || ""}
                            onChange={handleInputChange}
                            placeholder="+1 555 123 4567"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="isOver18">Are you over 18?</Label>
                        <Select
                            value={formData.isOver18 || ""}
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
                </div>

                {/* Address */}
                <h3 className="text-sm font-semibold">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#e0f2fe]">
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            name="address"
                            value={formData.address || ""}
                            onChange={handleInputChange}
                            placeholder="Street address"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address2">Address Line 2</Label>
                        <Input
                            id="address2"
                            name="address2"
                            value={formData.address2 || ""}
                            onChange={handleInputChange}
                            placeholder="Apartment, suite, etc."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            name="city"
                            value={formData.city || ""}
                            onChange={handleInputChange}
                            placeholder="City"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                            id="state"
                            name="state"
                            value={formData.state || ""}
                            onChange={handleInputChange}
                            placeholder="State"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                            id="zip"
                            name="zip"
                            value={formData.zip || ""}
                            onChange={handleInputChange}
                            placeholder="ZIP code"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            name="country"
                            value={formData.country || ""}
                            onChange={handleInputChange}
                            placeholder="Country"
                        />
                    </div>
                </div>

                {/* Medical Questions */}
                <h3 className="text-sm font-semibold">Medical Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#fce7f3]">
                    <div className="space-y-2">
                        <Label htmlFor="nitratesMedication">Nitrates Medication?</Label>
                        <Select
                            value={formData.nitratesMedication || ""}
                            onValueChange={(value) => handleSelectChange('nitratesMedication', value)}
                        >
                            <SelectTrigger id="nitratesMedication" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="neurologicalConditions">Neurological Conditions?</Label>
                        <Select
                            value={formData.neurologicalConditions || ""}
                            onValueChange={(value) => handleSelectChange('neurologicalConditions', value)}
                        >
                            <SelectTrigger id="neurologicalConditions" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cancerConditions">Cancer Conditions?</Label>
                        <Select
                            value={formData.cancerConditions || ""}
                            onValueChange={(value) => handleSelectChange('cancerConditions', value)}
                        >
                            <SelectTrigger id="cancerConditions" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="eyeConditions">Eye Conditions?</Label>
                        <Select
                            value={formData.eyeConditions || ""}
                            onValueChange={(value) => handleSelectChange('eyeConditions', value)}
                        >
                            <SelectTrigger id="eyeConditions" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Substance Use */}
                    <div className="space-y-2 col-span-full">
                        <Label>Substance Use</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                'Cocaine',
                                'Poppers',
                                'None of the above'
                            ].map((item) => (
                                <div key={item} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`substance-${item}`}
                                        checked={(formData.substanceUse || []).includes(item)}
                                        onCheckedChange={(checked) => handleArrayChange('substanceUse', item, checked)}
                                    />
                                    <Label htmlFor={`substance-${item}`} className="text-sm">{item}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Symptoms */}
                    <div className="space-y-2 col-span-full">
                        <Label>Symptoms</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                'Chest pain or Shortness of breath when going up the stairs, walking few miles or during sexual activities',
                                'Prolonged Leg cramps with exercise',
                                'Palpitations',
                                'Frequent urination, weak stream, or nocturia',
                                'None of the above'
                            ].map((item) => (
                                <div key={item} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`symptoms-${item}`}
                                        checked={(formData.symptoms || []).includes(item)}
                                        onCheckedChange={(checked) => handleArrayChange('symptoms', item, checked)}
                                    />
                                    <Label htmlFor={`symptoms-${item}`} className="text-sm">{item}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cardiovascular Conditions */}
                    <div className="space-y-2 col-span-full">
                        <Label>Cardiovascular / Heart Conditions</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                'History of heart attack, stroke, or narrowing of the arteries',
                                'Angina',
                                'Heart arrhythmia',
                                'Congestive heart failure (CHF)',
                                'Abnormal heart valve',
                                'History of QT prolongation',
                                'Uncontrolled high blood pressure (Hypertension)',
                                'Congenital heart issues (present from birth)',
                                'Peripheral vascular disease (PVD)',
                                'None of the above'
                            ].map((item) => (
                                <div key={item} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`cardiovascular-${item}`}
                                        checked={(formData.cardiovascularConditions || []).includes(item)}
                                        onCheckedChange={(checked) => handleArrayChange('cardiovascularConditions', item, checked)}
                                    />
                                    <Label htmlFor={`cardiovascular-${item}`} className="text-sm">{item}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Urological Conditions */}
                    <div className="space-y-2 col-span-full">
                        <Label>Urological / Reproductive Conditions</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                'Priapism (erection lasting longer than 4 hours)',
                                'Scarring or other physical issues related to the penis (e.g., Peyronie\'s disease)',
                                'Prostate cancer or enlarged prostate (BPH)',
                                'None of the above'
                            ].map((item) => (
                                <div key={item} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`urological-${item}`}
                                        checked={(formData.urologicalConditions || []).includes(item)}
                                        onCheckedChange={(checked) => handleArrayChange('urologicalConditions', item, checked)}
                                    />
                                    <Label htmlFor={`urological-${item}`} className="text-sm">{item}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Blood Conditions */}
                    <div className="space-y-2 col-span-full">
                        <Label>Hematologic / Blood Conditions</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                'Blood clotting or bleeding disorders',
                                'Sickle cell anemia',
                                'None of the above'
                            ].map((item) => (
                                <div key={item} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`blood-${item}`}
                                        checked={(formData.bloodConditions || []).includes(item)}
                                        onCheckedChange={(checked) => handleArrayChange('bloodConditions', item, checked)}
                                    />
                                    <Label htmlFor={`blood-${item}`} className="text-sm">{item}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Organ Conditions */}
                    <div className="space-y-2 col-span-full">
                        <Label>Liver, Kidney, and Gastrointestinal Conditions</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                'Liver disease',
                                'Kidney disease',
                                'Stomach or gastrointestinal cancer',
                                'Gastrointestinal ulcer',
                                'None of the above'
                            ].map((item) => (
                                <div key={item} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`organ-${item}`}
                                        checked={(formData.organConditions || []).includes(item)}
                                        onCheckedChange={(checked) => handleArrayChange('organConditions', item, checked)}
                                    />
                                    <Label htmlFor={`organ-${item}`} className="text-sm">{item}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Current Medications */}
                <h3 className="text-sm font-semibold">Current Medications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#fef3c7]">
                    <div className="space-y-2">
                        <Label htmlFor="currentMedications">Currently Taking Medications?</Label>
                        <Select
                            value={formData.currentMedications || ""}
                            onValueChange={(value) => handleSelectChange('currentMedications', value)}
                        >
                            <SelectTrigger id="currentMedications" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.currentMedications === "yes" && (
                        <div className="space-y-2 col-span-full">
                            <Label htmlFor="medicationsList">Medications List</Label>
                            <Textarea
                                id="medicationsList"
                                name="medicationsList"
                                value={formData.medicationsList || ""}
                                onChange={handleInputChange}
                                placeholder="List all medications..."
                                rows={3}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="medicationAllergies">Medication Allergies?</Label>
                        <Select
                            value={formData.medicationAllergies || ""}
                            onValueChange={(value) => handleSelectChange('medicationAllergies', value)}
                        >
                            <SelectTrigger id="medicationAllergies" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.medicationAllergies === "yes" && (
                        <div className="space-y-2 col-span-full">
                            <Label htmlFor="allergiesList">Allergies List</Label>
                            <Textarea
                                id="allergiesList"
                                name="allergiesList"
                                value={formData.allergiesList || ""}
                                onChange={handleInputChange}
                                placeholder="List all allergies..."
                                rows={3}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="medicalConditions">Additional Medical Conditions?</Label>
                        <Select
                            value={formData.medicalConditions || ""}
                            onValueChange={(value) => handleSelectChange('medicalConditions', value)}
                        >
                            <SelectTrigger id="medicalConditions" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.medicalConditions === "yes" && (
                        <div className="space-y-2 col-span-full">
                            <Label htmlFor="medicalConditionsList">Medical Conditions List</Label>
                            <Textarea
                                id="medicalConditionsList"
                                name="medicalConditionsList"
                                value={formData.medicalConditionsList || ""}
                                onChange={handleInputChange}
                                placeholder="List medical conditions..."
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                {/* ED Symptoms */}
                <h3 className="text-sm font-semibold">ED Symptoms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#ecfdf5]">
                    <div className="space-y-2">
                        <Label htmlFor="erectionChallenges">Erection Challenges  in the past 6 months?</Label>
                        <Select
                            value={formData.erectionChallenges || ""}
                            onValueChange={(value) => handleSelectChange('erectionChallenges', value)}
                        >
                            <SelectTrigger id="erectionChallenges" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="erectionSustaining">Erection Sustaining in the past 6 months?</Label>
                        <Select
                            value={formData.erectionSustaining || ""}
                            onValueChange={(value) => handleSelectChange('erectionSustaining', value)}
                        >
                            <SelectTrigger id="erectionSustaining" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="erectionChange">Erection Change?</Label>
                        <Select
                            value={formData.erectionChange || ""}
                            onValueChange={(value) => handleSelectChange('erectionChange', value)}
                        >
                            <SelectTrigger id="erectionChange" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Sudden Change">Sudden Change</SelectItem>
                                <SelectItem value="Gradually Worsen">Gradually Worsen</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sexualEncounters">Sexual Encounters?</Label>
                        <Select
                            value={formData.sexualEncounters || ""}
                            onValueChange={(value) => handleSelectChange('sexualEncounters', value)}
                        >
                            <SelectTrigger id="sexualEncounters" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1-5">1-5</SelectItem>
                                <SelectItem value="5+">5+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nonPrescriptionSupplements">Non-Prescription Supplements?</Label>
                        <Select
                            value={formData.nonPrescriptionSupplements || ""}
                            onValueChange={(value) => handleSelectChange('nonPrescriptionSupplements', value)}
                        >
                            <SelectTrigger id="nonPrescriptionSupplements" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="previousEDMeds">Previous ED Medications?</Label>
                        <Select
                            value={formData.previousEDMeds || ""}
                            onValueChange={(value) => handleSelectChange('previousEDMeds', value)}
                        >
                            <SelectTrigger id="previousEDMeds" className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Medication Interest (Patient Response) */}
                <h3 className="text-sm font-semibold">Medication Interest (Patient Selection)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#dcfce7]">
                    <div className="space-y-2">
                        <Label htmlFor="patientInterestedMedication">Interested Medication</Label>
                        <Select
                            value={formData.currentMedication || ""}
                            onValueChange={(value) => {
                                handleSelectChange('currentMedication', value);
                                handleSelectChange('currentDose', '');
                            }}
                        >
                            <SelectTrigger id="patientInterestedMedication" className="w-full bg-white/50">
                                <SelectValue placeholder="Select medication" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Sildenafil (Generic of Viagra)">Sildenafil (Generic of Viagra)</SelectItem>
                                <SelectItem value="Tadalafil (Generic of Cialis)">Tadalafil (Generic of Cialis)</SelectItem>
                                <SelectItem value="Fusion Mini Troches (Tadalafil/Sildenafil)">Fusion Mini Troches (Tadalafil/Sildenafil)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="patientInterestedDose">Interested Dose</Label>
                        <Select
                            value={formData.currentDose || ""}
                            onValueChange={(value) => handleSelectChange('currentDose', value)}
                        >
                            <SelectTrigger id="patientInterestedDose" className="w-full bg-white/50">
                                <SelectValue placeholder="Select dose" />
                            </SelectTrigger>
                            <SelectContent>
                                {formData.currentMedication && medicationOptions[formData.currentMedication]?.map((dose) => (
                                    <SelectItem key={dose} value={dose}>{dose}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Photo Uploads */}
                <h3 className="text-sm font-semibold">Photo Uploads</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#f3e8ff]">
                    <div className="space-y-2">
                        <Label>ID Photo</Label>
                        <UploadFile
                            onUploadComplete={(url) => {
                                setIdPhotoFile({ file: null, preview: url });
                                setFormData(prev => ({ ...prev, idPhoto: url }));
                            }}
                            onDelete={removeIdPhoto}
                            file={idPhotoFile.preview || formData.idPhoto || ''}
                            showFullscreenButton={true}
                            onFullscreenClick={() => setSelectedImage(idPhotoFile.preview || formData.idPhoto)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>ED Medication Photo</Label>
                        <UploadFile
                            onUploadComplete={(url) => {
                                setEdMedPhotoFile({ file: null, preview: url });
                                setFormData(prev => ({ ...prev, edMedicationPhoto: url }));
                            }}
                            onDelete={removeEdMedPhoto}
                            file={edMedPhotoFile.preview || formData.edMedicationPhoto || ''}
                            showFullscreenButton={true}
                            onFullscreenClick={() => setSelectedImage(edMedPhotoFile.preview || formData.edMedicationPhoto)}
                        />
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

                {/* Heard About */}
                <h3 className="text-sm font-semibold">How did you hear about us?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#ecfdf5]">
                    <div className="space-y-2">
                        <Label htmlFor="heardAbout">Source</Label>
                        <Select
                            value={formData.heardAbout || ""}
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
                                value={formData.heardAboutOther || ""}
                                onChange={handleInputChange}
                                placeholder="How did you hear about us?"
                            />
                        </div>
                    )}

                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="comments">Comments</Label>
                        <Textarea
                            id="comments"
                            name="comments"
                            value={formData.comments || ""}
                            onChange={handleInputChange}
                            placeholder="Additional comments..."
                            rows={3}
                        />
                    </div>
                </div>

                {/* Provider Section (Admin/Staff only) */}
                {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'C') && (
                    <>
                        <h3 className="text-sm font-semibold">Provider Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#fef3c7]">
                            <div className="space-y-2">
                                <Label htmlFor="approvalStatus">Approval Status</Label>
                                <Select
                                    value={formData.approvalStatus || "None"}
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

                            <div className="space-y-2">
                                <Label htmlFor="currentMedication">Current Medication</Label>
                                <Select
                                    value={formData.currentMedication || ""}
                                    onValueChange={(value) => {
                                        handleSelectChange('currentMedication', value);
                                        // Reset dose when changing medication
                                        handleSelectChange('dose', '');
                                    }}
                                >
                                    <SelectTrigger id="currentMedication" className="w-full">
                                        <SelectValue placeholder="Select medication" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sildenafil (Generic of Viagra)">Sildenafil (Generic of Viagra)</SelectItem>
                                        <SelectItem value="Tadalafil (Generic of Cialis)">Tadalafil (Generic of Cialis)</SelectItem>
                                        <SelectItem value="Fusion Mini Troches (Tadalafil/Sildenafil)">Fusion Mini Troches (Tadalafil/Sildenafil)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.currentMedication && (
                                <div className="space-y-2">
                                    <Label htmlFor="dose">Dose</Label>
                                    <Select
                                        value={formData.dose || ""}
                                        onValueChange={(value) => handleSelectChange('dose', value)}
                                    >
                                        <SelectTrigger id="dose" className="w-full">
                                            <SelectValue placeholder="Select dose" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {medicationOptions[formData.currentMedication]?.map((dose) => (
                                                <SelectItem key={dose} value={dose}>{dose}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit</Label>
                                <Input
                                    className="w-full"
                                    placeholder="Unit (e.g. 60 mg / 2 mL)"
                                    value={formData.unit}
                                    onChange={(e) =>
                                        handleSelectChange("unit", e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2 col-span-full">
                                <Label htmlFor="providerNote">Provider Note</Label>
                                <Textarea
                                    id="providerNote"
                                    name="providerNote"
                                    value={formData.providerNote || ""}
                                    onChange={handleInputChange}
                                    placeholder="Provider notes..."
                                    rows={3}
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
                            value={formData.patientId || ""}
                            onChange={handleInputChange}
                            placeholder="Link to existing patient record"
                        />
                        <p className="text-sm text-gray-500">Optional: Reference to an existing patient record</p>
                    </div>
                </div>

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

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="agreetopay"
                            checked={formData.agreetopay}
                            onCheckedChange={(checked) => handleCheckboxChange('agreetopay', checked)}
                        />
                        <Label htmlFor="agreetopay" className="text-sm">
                            I agree to pay for treatment
                        </Label>
                    </div>
                </div>


                {/* Submit Button */}
                <Button type="submit" className="w-full bg-secondary text-white" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : (isFirstSubmit ? 'Submit' : 'Update')}
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
                                onClick={() => router.push("/dashboard/main/ed")}
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

