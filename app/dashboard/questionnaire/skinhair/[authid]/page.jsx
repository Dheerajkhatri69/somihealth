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

export default function SkinHairQuestionnaireForm({ params }) {
    const { data: session } = useSession();
    const router = useRouter();
    const isNew = params.authid === "new";

    const [loading, setLoading] = useState(!isNew);
    const [formData, setFormData] = useState({
        // Basic Information
        treatmentChoose: "",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        isOver18: "",
        dateOfBirth: "",
        address: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        country: "",

        // Skin-Specific Fields
        skinAllergies: [],
        acneSymptoms: {
            facialHairAcne: "",
            chestAcne: "",
            backAcne: "",
            painfulLesions: "",
            recurrentBreakouts: "",
        },
        triedAcneProductsNotWork: "",
        notWorkProductsDesc: "",
        triedAcneProductsWorked: "",
        workedProductsDesc: "",
        pregnantBreastfeeding: "",
        acnePhotos: "",

        // Hair-Specific Fields
        hairLossPattern: [],
        hairLossStart: "",
        scalpSymptoms: [],
        medicalDiagnoses: [],
        scalpPhotos: "",

        // Common Medical Fields
        currentlyUsingMedication: "",
        currentMedications: "",
        medicationAllergies: "",
        allergiesList: "",

        // ID Upload
        idPhoto: "",

        // System Fields
        treatmentType: "",
        approvalStatus: "",
        providerNote: "",
        followUp: "",
        refillReminder: "",
        dose: "",
        unit: "",
        images: [],
    });

    // Temporary state for UI selections
    const [uiState, setUiState] = useState({
        followUpInterval: "",
        refillReminderInterval: ""
    });

    const [idPhotoFile, setIdPhotoFile] = useState({ file: null, preview: null });
    const [acnePhotosFile, setAcnePhotosFile] = useState({ file: null, preview: null });
    const [scalpPhotosFile, setScalpPhotosFile] = useState({ file: null, preview: null });
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

    // Helper to generate date string using current date
    function getFutureDateString(interval) {
        if (!interval || interval === 'None') return '';
        const now = new Date();
        return `${now.toISOString()}_${interval}`;
    }

    // Fetch data if not new
    useEffect(() => {
        if (!isNew) {
            const fetchQuestionnaire = async () => {
                try {
                    const res = await fetch(`/api/skinhair-questionnaire/${params.authid}`);
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
                        // Initialize acne photos (for Rx Skin)
                        if (data.result.acnePhotos) {
                            setAcnePhotosFile({ file: null, preview: data.result.acnePhotos });
                        }
                        // Initialize scalp photos (for Hair treatments)
                        if (data.result.scalpPhotos) {
                            setScalpPhotosFile({ file: null, preview: data.result.scalpPhotos });
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

    const handleNestedChange = (parent, child, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [child]: value
            }
        }));
    };

    const removeIdPhoto = () => {
        setIdPhotoFile({ file: null, preview: null });
        setFormData(prev => ({ ...prev, idPhoto: "" }));
    };

    const removeAcnePhotos = () => {
        setAcnePhotosFile({ file: null, preview: null });
        setFormData(prev => ({ ...prev, acnePhotos: "" }));
    };

    const removeScalpPhotos = () => {
        setScalpPhotosFile({ file: null, preview: null });
        setFormData(prev => ({ ...prev, scalpPhotos: "" }));
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

    // Helper to remove empty optional/enum fields so Mongoose doesn't validate them
    const sanitizeSubmissionData = (data) => {
        const cleaned = { ...data };

        // Fields that are string enums and can be safely omitted if empty
        const optionalEnumFields = [
            "triedAcneProductsNotWork",
            "triedAcneProductsWorked",
            "pregnantBreastfeeding",
            "currentlyUsingMedication",
            "medicationAllergies",
            "hairLossStart",
        ];

        optionalEnumFields.forEach((field) => {
            if (cleaned[field] === "") {
                delete cleaned[field];
            }
        });

        // Handle nested acneSymptoms object
        if (cleaned.acneSymptoms) {
            const acne = { ...cleaned.acneSymptoms };
            const acneKeys = [
                "facialHairAcne",
                "chestAcne",
                "backAcne",
                "painfulLesions",
                "recurrentBreakouts",
            ];

            acneKeys.forEach((key) => {
                if (acne[key] === "") {
                    delete acne[key];
                }
            });

            if (Object.keys(acne).length === 0) {
                delete cleaned.acneSymptoms;
            } else {
                cleaned.acneSymptoms = acne;
            }
        }

        return cleaned;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Prepare data with formatted followUp and refillReminder
        const followUp = getFutureDateString(uiState.followUpInterval);
        const refillReminder = getFutureDateString(uiState.refillReminderInterval);

        // Create submission data
        let submissionData = {
            authid: formData.authid || params.authid,
            ...formData,
            followUp,
            refillReminder,
            images: images.filter(img => img.preview).map(img => img.preview),
            idPhoto: idPhotoFile.preview || formData.idPhoto,
            acnePhotos: acnePhotosFile.preview || formData.acnePhotos,
            scalpPhotos: scalpPhotosFile.preview || formData.scalpPhotos,
            questionnaire: false, // Always set to false when submitting/updating
        };

        // For new records, ensure authid is generated
        if (isNew) {
            submissionData.authid = `SH${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
            submissionData.seen = true;
        }

        // Remove system fields but keep authid
        delete submissionData.createTimeDate;
        delete submissionData.closetickets;
        delete submissionData.Reasonclosetickets;
        delete submissionData.status;

        // Remove empty optional/enum fields so Mongoose doesn't reject on enums
        submissionData = sanitizeSubmissionData(submissionData);


        try {
            const endpoint = isNew
                ? "/api/skinhair-questionnaire"
                : `/api/skinhair-questionnaire/${params.authid}`;

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
                        router.push("/dashboard/questionnaire/skinhair");
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

    // Determine if this is a skin treatment
    const isSkinTreatment = formData.treatmentChoose === "Rx Skin" || formData.treatmentType === "Rx Skin";
    const isHairTreatment = !isSkinTreatment && (formData.treatmentChoose === "Finasteride" || formData.treatmentChoose === "Minoxidil" || formData.treatmentChoose === "Rx Hair" || formData.treatmentType === "Finasteride" || formData.treatmentType === "Minoxidil" || formData.treatmentType === "Rx Hair");

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
                        {isNew ? "New Skin/Hair Questionnaire" : `Skin/Hair Questionnaire - ${formData.firstName} ${formData.lastName}`}
                    </h2>
                    {!isNew && (
                        <div className="space-y-2">
                            <Label>Questionnaire ID</Label>
                            <Input value={formData.authid} readOnly className="font-mono w-32" />
                        </div>
                    )}
                </div>

                {/* Treatment Selection */}
                <h3 className="text-sm font-semibold">Treatment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                    <div className="space-y-2">
                        <Label htmlFor="treatmentChoose">Treatment Selection</Label>
                        <Select
                            value={formData.treatmentChoose || ""}
                            onValueChange={(value) => handleSelectChange('treatmentChoose', value)}
                        >
                            <SelectTrigger id="treatmentChoose" className="w-full">
                                <SelectValue placeholder="Select treatment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Finasteride">Finasteride</SelectItem>
                                <SelectItem value="Minoxidil">Minoxidil</SelectItem>
                                <SelectItem value="Rx Hair">Rx Hair</SelectItem>
                                <SelectItem value="Rx Skin">Rx Skin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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

                {/* Address Information */}
                <h3 className="text-sm font-semibold">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#ecfdf5]">
                    <div className="space-y-2">
                        <Label htmlFor="address">Address Line 1</Label>
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
                        <Label htmlFor="zip">Zip Code</Label>
                        <Input
                            id="zip"
                            name="zip"
                            value={formData.zip || ""}
                            onChange={handleInputChange}
                            placeholder="Zip code"
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

                {/* Skin-Specific Fields (Rx Skin) */}
                {isSkinTreatment && (
                    <>
                        <h3 className="text-sm font-semibold">Skin-Specific Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#fef3c7]">
                            <div className="space-y-2 col-span-full">
                                <Label>Skin Medication Allergies (select all that apply)</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {['Azelaic acid', 'Niacinamide', 'Clindamycin', 'Tretinoin', 'None of the above'].map((item) => (
                                        <div key={item} className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={formData.skinAllergies?.includes(item) || false}
                                                onCheckedChange={(checked) => handleArrayChange('skinAllergies', item, checked)}
                                            />
                                            <Label>{item}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Facial Hair Acne</Label>
                                <Select
                                    value={formData.acneSymptoms?.facialHairAcne || ""}
                                    onValueChange={(value) => handleNestedChange('acneSymptoms', 'facialHairAcne', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Chest Acne</Label>
                                <Select
                                    value={formData.acneSymptoms?.chestAcne || ""}
                                    onValueChange={(value) => handleNestedChange('acneSymptoms', 'chestAcne', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Back Acne</Label>
                                <Select
                                    value={formData.acneSymptoms?.backAcne || ""}
                                    onValueChange={(value) => handleNestedChange('acneSymptoms', 'backAcne', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Painful Lesions</Label>
                                <Select
                                    value={formData.acneSymptoms?.painfulLesions || ""}
                                    onValueChange={(value) => handleNestedChange('acneSymptoms', 'painfulLesions', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Recurrent Breakouts</Label>
                                <Select
                                    value={formData.acneSymptoms?.recurrentBreakouts || ""}
                                    onValueChange={(value) => handleNestedChange('acneSymptoms', 'recurrentBreakouts', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Tried Acne Products Not Work?</Label>
                                <Select
                                    value={formData.triedAcneProductsNotWork || ""}
                                    onValueChange={(value) => handleSelectChange('triedAcneProductsNotWork', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.triedAcneProductsNotWork === 'yes' && (
                                <div className="space-y-2">
                                    <Label>Products That Did Not Work</Label>
                                    <Textarea
                                        name="notWorkProductsDesc"
                                        value={formData.notWorkProductsDesc || ""}
                                        onChange={handleInputChange}
                                        placeholder="Describe products that did not work"
                                        rows={3}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Tried Acne Products Worked?</Label>
                                <Select
                                    value={formData.triedAcneProductsWorked || ""}
                                    onValueChange={(value) => handleSelectChange('triedAcneProductsWorked', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.triedAcneProductsWorked === 'yes' && (
                                <div className="space-y-2">
                                    <Label>Products That Worked</Label>
                                    <Textarea
                                        name="workedProductsDesc"
                                        value={formData.workedProductsDesc || ""}
                                        onChange={handleInputChange}
                                        placeholder="Describe products that worked"
                                        rows={3}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Pregnant/Breastfeeding?</Label>
                                <Select
                                    value={formData.pregnantBreastfeeding || ""}
                                    onValueChange={(value) => handleSelectChange('pregnantBreastfeeding', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </>
                )}

                {/* Hair-Specific Fields */}
                {isHairTreatment && (
                    <>
                        <h3 className="text-sm font-semibold">Hair-Specific Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#fef3c7]">
                            <div className="space-y-2">
                                <Label>Hair Loss Pattern</Label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                    {[
                                        { value: 'thinning_crown', label: 'Noticeable thinning or bald patches at the crown' },
                                        { value: 'uneven_thinning', label: 'Uneven thinning throughout the scalp' },
                                        { value: 'receding_hairline', label: 'A receding or retreating hairline' },
                                        { value: 'excessive_shedding', label: 'Excessive shedding during washing or styling' },
                                        { value: 'none', label: 'None of the above' }
                                    ].map((option) => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={formData.hairLossPattern?.includes(option.value) || false}
                                                onCheckedChange={(checked) => {
                                                    // Handle "None" exclusivity logic
                                                    if (checked) {
                                                        if (option.value === 'none') {
                                                            // If "None" selected, clear others and set only "none"
                                                            setFormData(prev => ({ ...prev, hairLossPattern: ['none'] }));
                                                        } else {
                                                            // If other selected, add it but remove "none" if present
                                                            const current = formData.hairLossPattern || [];
                                                            const filtered = current.filter(xv => xv !== 'none');
                                                            setFormData(prev => ({ ...prev, hairLossPattern: [...filtered, option.value] }));
                                                        }
                                                    } else {
                                                        // Just remove the unchecked value
                                                        handleArrayChange('hairLossPattern', option.value, false);
                                                    }
                                                }}
                                            />
                                            <Label className="text-sm font-normal cursor-pointer" onClick={() => {
                                                const checked = !formData.hairLossPattern?.includes(option.value);
                                                // Replicate logic above for label click
                                                if (checked) {
                                                    if (option.value === 'none') {
                                                        setFormData(prev => ({ ...prev, hairLossPattern: ['none'] }));
                                                    } else {
                                                        const current = formData.hairLossPattern || [];
                                                        const filtered = current.filter(xv => xv !== 'none');
                                                        setFormData(prev => ({ ...prev, hairLossPattern: [...filtered, option.value] }));
                                                    }
                                                } else {
                                                    handleArrayChange('hairLossPattern', option.value, false);
                                                }
                                            }}>{option.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Hair Loss Start</Label>
                                <Select
                                    value={formData.hairLossStart || ""}
                                    onValueChange={(value) => handleSelectChange('hairLossStart', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rapid_onset">Rapid onset – within weeks</SelectItem>
                                        <SelectItem value="gradual_onset">Gradual onset – over months or years</SelectItem>
                                        <SelectItem value="preventive">None of the above – seeking preventive treatment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 col-span-full">
                                <Label>Scalp Symptoms (select all that apply)</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {['Flaky scalp (dandruff)', 'Itchy scalp', 'Sore or red bumps on your scalp', 'White flakes on your scalp or clothing', 'None of the above'].map((item) => (
                                        <div key={item} className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={formData.scalpSymptoms?.includes(item) || false}
                                                onCheckedChange={(checked) => handleArrayChange('scalpSymptoms', item, checked)}
                                            />
                                            <Label>{item}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 col-span-full">
                                <Label>Medical Diagnoses (select all that apply)</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {['Elevated prostate-specific antigen (PSA)', 'Prostate cancer', 'Thyroid disorders', 'Iron deficiency', 'Liver disease', 'Family history of hair loss', 'Family history of prostate cancer in biological parents, siblings, or children', 'Family history of early-onset prostate cancer (diagnosed at age 55 or younger)', 'None of the Above'].map((item) => (
                                        <div key={item} className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={formData.medicalDiagnoses?.includes(item) || false}
                                                onCheckedChange={(checked) => handleArrayChange('medicalDiagnoses', item, checked)}
                                            />
                                            <Label className="text-sm">{item}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Common Medical Fields */}
                <h3 className="text-sm font-semibold">Medical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#f3e8ff]">
                    <div className="space-y-2">
                        <Label>Currently Using Medication?</Label>
                        <Select
                            value={formData.currentlyUsingMedication || ""}
                            onValueChange={(value) => handleSelectChange('currentlyUsingMedication', value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.currentlyUsingMedication === 'yes' && (
                        <div className="space-y-2 col-span-full">
                            <Label>Current Medications</Label>
                            <Textarea
                                name="currentMedications"
                                value={formData.currentMedications || ""}
                                onChange={handleInputChange}
                                placeholder="List medications, doses, and directions"
                                rows={4}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Medication Allergies?</Label>
                        <Select
                            value={formData.medicationAllergies || ""}
                            onValueChange={(value) => handleSelectChange('medicationAllergies', value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.medicationAllergies === 'yes' && (
                        <div className="space-y-2 col-span-full">
                            <Label>Allergies List</Label>
                            <Textarea
                                name="allergiesList"
                                value={formData.allergiesList || ""}
                                onChange={handleInputChange}
                                placeholder="List medication allergies and reactions"
                                rows={4}
                            />
                        </div>
                    )}
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
                    {isSkinTreatment && (
                        <div className="space-y-2">
                            <Label>Acne Photos</Label>
                            <UploadFile
                                onUploadComplete={(url) => {
                                    setAcnePhotosFile({ file: null, preview: url });
                                    setFormData(prev => ({ ...prev, acnePhotos: url }));
                                }}
                                onDelete={removeAcnePhotos}
                                file={acnePhotosFile.preview || formData.acnePhotos || ''}
                                showFullscreenButton={true}
                                onFullscreenClick={() => setSelectedImage(acnePhotosFile.preview || formData.acnePhotos)}
                            />
                        </div>
                    )}
                    {isHairTreatment && (
                        <div className="space-y-2">
                            <Label>Scalp Photos</Label>
                            <UploadFile
                                onUploadComplete={(url) => {
                                    setScalpPhotosFile({ file: null, preview: url });
                                    setFormData(prev => ({ ...prev, scalpPhotos: url }));
                                }}
                                onDelete={removeScalpPhotos}
                                file={scalpPhotosFile.preview || formData.scalpPhotos || ''}
                                showFullscreenButton={true}
                                onFullscreenClick={() => setSelectedImage(scalpPhotosFile.preview || formData.scalpPhotos)}
                            />
                        </div>
                    )}
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

                {/* Provider Fields */}
                <h3 className="text-sm font-semibold">Provider Information</h3>
                <div className="grid grid-cols-1 gap-6 p-6 border rounded-xl shadow-sm bg-[#dcfce7]">
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

                    <div className="flex gap-2">
                        <div className="space-y-2 w-full">
                            <Label htmlFor="dose">Dose</Label>
                            <Select
                                value={formData.dose}
                                onValueChange={(value) => handleSelectChange('dose', value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Dose" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Finasteride 1mg">Finasteride 1mg</SelectItem>
                                    <SelectItem value="Minoxidil 2.5mg">Minoxidil 2.5mg</SelectItem>
                                    <SelectItem value="Rx Hair (Finasteride, Minoxidil & Biotin)">Rx Hair (Finasteride, Minoxidil & Biotin)</SelectItem>
                                    <SelectItem value="Rx Skin (Azelaic acid, Niacinamide, Clindamycin & Tretinoin)">Rx Skin (Azelaic acid, Niacinamide, Clindamycin & Tretinoin)</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 w-full">
                            <Label htmlFor="unit">Unit</Label>
                            <Input
                                id="unit"
                                name="unit"
                                className="w-full"
                                value={formData.unit || ""}
                                onChange={handleInputChange}
                                placeholder="Unit"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="space-y-2 w-full">
                            <Label htmlFor="followUpInterval">Follow Up Interval</Label>
                            <Select
                                value={uiState.followUpInterval || ""}
                                onValueChange={(value) => handleUISelectChange('followUpInterval', value)}
                            >
                                <SelectTrigger id="followUpInterval" className="w-full">
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

                        <div className="space-y-2 w-full">
                            <Label htmlFor="refillReminderInterval">Refill Reminder Interval</Label>
                            <Select
                                value={uiState.refillReminderInterval || ""}
                                onValueChange={(value) => handleUISelectChange('refillReminderInterval', value)}
                            >
                                <SelectTrigger id="refillReminderInterval" className="w-full">
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

                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="providerNote">Provider Note</Label>
                        <Textarea
                            id="providerNote"
                            name="providerNote"
                            value={formData.providerNote || ""}
                            onChange={handleInputChange}
                            placeholder="Provider notes..."
                            rows={4}
                        />
                    </div>
                </div>

                <h3 className="text-sm font-semibold mt-6">Consent and Agreements</h3>
                <div className="space-y-4 p-6 border rounded-xl shadow-sm bg-[#f1f5f9] mb-6">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="consent"
                            checked={formData.consent || false}
                            onCheckedChange={(checked) => handleCheckboxChange('consent', checked)}
                        />
                        <Label htmlFor="consent" className="text-sm">
                            I consent to treatment and acknowledge the risks and benefits
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="terms"
                            checked={formData.terms || false}
                            onCheckedChange={(checked) => handleCheckboxChange('terms', checked)}
                        />
                        <Label htmlFor="terms" className="text-sm">
                            I agree to the terms and conditions
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="treatment"
                            checked={formData.treatment || false}
                            onCheckedChange={(checked) => handleCheckboxChange('treatment', checked)}
                        />
                        <Label htmlFor="treatment" className="text-sm">
                            I understand the treatment plan and agree to follow it
                        </Label>
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-secondary w-full text-white hover:bg-secondary/90"
                >
                    {isSubmitting ? "Saving..." : isFirstSubmit ? "Submit" : "Update"}
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
                                onClick={() => router.push("/dashboard/main/skinhair")}
                                className="bg-primary hover:bg-primary-dark"
                            >
                                Return to Dashboard
                            </Button>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* Fullscreen Image Viewer */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-7xl max-h-full p-4">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 bg-white text-black rounded-full p-2 hover:bg-gray-200"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <Image
                            src={selectedImage}
                            alt="Fullscreen preview"
                            width={1200}
                            height={800}
                            className="max-w-full max-h-[90vh] object-contain"
                            unoptimized
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
