"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Fullscreen, X } from "lucide-react";
import { upload } from "@imagekit/next";
import Image from "next/image";
import UploadFile from "@/components/FileUpload";
import toast from "react-hot-toast";

export default function LongevityRefillAdminEditForm({ params }) {
    const { data: session } = useSession();
    const router = useRouter();

    // Add uiState for followUp and refillReminder intervals
    const [uiState, setUiState] = useState({
        followUpInterval: "",
        refillReminderInterval: ""
    });

    const [formData, setFormData] = useState({
        authid: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        approved: '',
        medicationChanges: '',
        desmedicationChanges: '',
        preference: '',
        sideEffects: '',
        sideEffectsDetail: '',
        happyWithMed: '',
        deshappyWithMed: '',
        dosageNote: '',

        // Address fields
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        country: '',

        // Medical info
        dob: '',
        sex: '',
        height: '',
        weight: '',
        bmi: '',

        // Dosage info
        dose: '',
        unit: '',
        frequency: '',

        // System fields
        questionnaire: false, // Always false for refills
        seen: false,
        approvalStatus: 'Pending',
        providerNote: '',
        followUp: '',
        refillReminder: '',
        idPhoto: '',

        // Administrative
        closetickets: false,
        Reasonclosetickets: '',
        initialAuthId: '',
        needLabafter3RxFills: false,
        followUpRefills: true,

        // File uploads
        images: [],
        file1: '',
        file2: ''
    });

    const [fileUrls, setFileUrls] = useState({
        file1: '',
        file2: ''
    });

    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [messageHead, setMessageHead] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [originalPatientData, setOriginalPatientData] = useState(null);

    // Fetch refill data on component mount
    useEffect(() => {
        const fetchRefillData = async () => {
            if (!params.authid) return;

            setIsLoading(true);
            try {
                // Fetch the specific refill
                const response = await fetch(`/api/longevity-refill-questionnaire?authid=${params.authid}`);
                const data = await response.json();

                if (data.success && data.result && data.result.length > 0) {
                    const refill = data.result[0];

                    // Extract interval from followUp and refillReminder for UI
                    let followUpInterval = '';
                    let refillReminderInterval = '';

                    if (refill.followUp && refill.followUp.includes('_')) {
                        followUpInterval = refill.followUp.split('_')[1];
                    } else if (refill.followUp) {
                        // If it's stored as just "7d" (old format), use it directly
                        followUpInterval = refill.followUp;
                    }

                    if (refill.refillReminder && refill.refillReminder.includes('_')) {
                        refillReminderInterval = refill.refillReminder.split('_')[1];
                    } else if (refill.refillReminder) {
                        // If it's stored as just "8w" (old format), use it directly
                        refillReminderInterval = refill.refillReminder;
                    }

                    setFormData({
                        authid: refill.authid || '',
                        firstName: refill.firstName || '',
                        lastName: refill.lastName || '',
                        phone: refill.phone || '',
                        email: refill.email || '',
                        approved: refill.approved || '',
                        medicationChanges: refill.medicationChanges || '',
                        desmedicationChanges: refill.desmedicationChanges || '',
                        preference: refill.preference || '',
                        sideEffects: refill.sideEffects || '',
                        sideEffectsDetail: refill.sideEffectsDetail || '',
                        happyWithMed: refill.happyWithMed || '',
                        deshappyWithMed: refill.deshappyWithMed || '',
                        dosageNote: refill.dosageNote || '',

                        // Address fields
                        address1: refill.address1 || '',
                        address2: refill.address2 || '',
                        city: refill.city || '',
                        state: refill.state || '',
                        zip: refill.zip || '',
                        country: refill.country || 'US',

                        // Medical info
                        dob: refill.dob ? new Date(refill.dob).toISOString().split('T')[0] : '',
                        sex: refill.sex || '',
                        height: refill.height || '',
                        weight: refill.weight || '',
                        bmi: refill.bmi || '',

                        // Dosage info
                        dose: refill.dose || '',
                        unit: refill.unit || '',
                        frequency: refill.frequency || '',

                        // System fields
                        questionnaire: false,
                        seen: refill.seen || false,
                        approvalStatus: refill.approvalStatus || 'Pending',
                        providerNote: refill.providerNote || '',
                        followUp: refill.followUp || '',
                        refillReminder: refill.refillReminder || '',
                        idPhoto: refill.idPhoto || '',

                        // Administrative
                        closetickets: refill.closetickets || false,
                        Reasonclosetickets: refill.Reasonclosetickets || '',
                        initialAuthId: refill.initialAuthId || '',
                        needLabafter3RxFills: refill.needLabafter3RxFills || false,
                        followUpRefills: refill.followUpRefills !== undefined ? refill.followUpRefills : true,

                        // File uploads
                        images: refill.images || [],
                        file1: refill.file1 || '',
                        file2: refill.file2 || '',
                        _id: refill._id,
                    });

                    setUiState({
                        followUpInterval,
                        refillReminderInterval
                    });

                    setImages(refill.images || []);
                    setFileUrls({
                        file1: refill.file1 || '',
                        file2: refill.file2 || ''
                    });

                    // If we have initialAuthId, try to fetch original patient data
                    if (refill.initialAuthId) {
                        fetchOriginalPatientData(refill.initialAuthId);
                    }
                } else {
                    toast.error("Refill record not found");
                }
            } catch (error) {
                console.error("Error fetching refill data:", error);
                toast.error("Failed to load refill data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRefillData();
    }, [params.authid]);

    // Helper to generate date string using current date
    function getFutureDateString(interval) {
        if (!interval || interval === 'None') return '';
        const now = new Date();
        return `${now.toISOString()}_${interval}`;
    }

    // Fetch original patient data
    const fetchOriginalPatientData = async (authId) => {
        try {
            const response = await fetch(`/api/longevity-questionnaire?authid=${authId}`);
            const data = await response.json();

            if (data.success && data.result && data.result.length > 0) {
                setOriginalPatientData(data.result[0]);
            }
        } catch (error) {
            console.error("Error fetching original patient data:", error);
        }
    };

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Add this function for UI state changes
    const handleUISelectChange = (name, value) => {
        setUiState(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name, checked) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleImageUpload = async (e, index) => {
        const file = e.target.files?.[0];
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

            const updatedImages = [...images];
            if (index >= updatedImages.length) {
                updatedImages.push(res.url);
            } else {
                updatedImages[index] = res.url;
            }
            setImages(updatedImages);
            setFormData(prev => ({ ...prev, images: updatedImages }));
        } catch (error) {
            console.error("ImageKit upload error:", error);
            toast.error("Failed to upload image");
        }
    };

    const removeImage = (index) => {
        const updatedImages = [...images];
        updatedImages.splice(index, 1);
        setImages(updatedImages);
        setFormData(prev => ({ ...prev, images: updatedImages }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Prepare followUp and refillReminder with formatted dates
            const followUp = getFutureDateString(uiState.followUpInterval);
            const refillReminder = getFutureDateString(uiState.refillReminderInterval);

            // Prepare update data
            const updateData = {
                ...formData,
                questionnaire: false, // Ensure it stays as refill
                images: images,
                file1: fileUrls.file1,
                file2: fileUrls.file2,
                idPhoto: fileUrls.file2 || formData.idPhoto,
                followUp: followUp, // Add formatted followUp
                refillReminder: refillReminder, // Add formatted refillReminder
                updatedAt: new Date().toISOString()
            };

            // Remove _id if present (should not be sent in update)
            delete updateData._id;
            delete updateData.__v;

            // Then in handleSubmit, use the _id:
            const response = await fetch('/api/longevity-refill-questionnaire', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: formData._id, // Use the stored _id
                    updates: updateData
                }),
            });
            const result = await response.json();

            if (response.ok && result.success) {
                setMessageHead("Success 🎉");
                setMessage("Refill record updated successfully!");
                setIsSuccess(true);

                // Update abandonment record for admin edit
                try {
                    await fetch("/api/longevity-refill-abandonment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userSessionId: `ADMIN-${session?.user?.id || 'admin'}`,
                            firstSegment: {
                                firstName: formData.firstName,
                                lastName: formData.lastName,
                                phone: formData.phone,
                                email: formData.email,
                            },
                            lastSegmentReached: 0,
                            state: 4, // Admin updated
                            question: "Admin Updated Refill",
                            timestamp: new Date().toISOString(),
                        }),
                    });
                } catch (abandonmentError) {
                    console.error("Failed to update abandonment record:", abandonmentError);
                }

            } else {
                throw new Error(result.message || 'Failed to update refill');
            }
        } catch (error) {
            setMessageHead("Error ❌");
            setMessage(error.message || 'An error occurred while updating the refill.');
            setIsSuccess(false);
            console.error('Update error:', error);
        } finally {
            setIsSubmitting(false);
            setIsDialogOpen(true);
        }
    };

    // Copy data from original patient if available
    const copyOriginalPatientData = () => {
        if (!originalPatientData) {
            toast.error("No original patient data found");
            return;
        }

        setFormData(prev => ({
            ...prev,
            dob: originalPatientData.dob ? new Date(originalPatientData.dob).toISOString().split('T')[0] : prev.dob,
            sex: originalPatientData.sex || prev.sex,
            height: originalPatientData.height || prev.height,
            weight: originalPatientData.weight || prev.weight,
            bmi: originalPatientData.bmi || prev.bmi,
            address1: originalPatientData.address1 || prev.address1,
            address2: originalPatientData.address2 || prev.address2,
            city: originalPatientData.city || prev.city,
            state: originalPatientData.state || prev.state,
            zip: originalPatientData.zip || prev.zip,
            country: originalPatientData.country || prev.country,
        }));

        toast.success("Copied original patient data");
    };

    // Add image upload slot
    const addImageSlot = () => {
        if (images.length < 3) {
            setImages([...images, '']);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading refill data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-4 p-4">
            <form onSubmit={handleSubmit} className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Longevity Follow Up</h2>

                    <div className="flex items-center space-x-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <input
                                type="checkbox"
                                id="followUpRefills"
                                checked={formData.followUpRefills}
                                onChange={(e) => setFormData(prev => ({ ...prev, followUpRefills: e.target.checked }))}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="followUpRefills">Follow up/Refills</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-4">
                            <input
                                type="checkbox"
                                id="needLabafter3RxFills"
                                checked={formData.needLabafter3RxFills}
                                onChange={(e) => setFormData(prev => ({ ...prev, needLabafter3RxFills: e.target.checked }))}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="needLabafter3RxFills">Need Lab After 3 Rx Fills</Label>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="space-y-2">
                            <Label>New Auth ID</Label>
                            <Input
                                name="authid"
                                value={formData.authid}
                                className="font-mono w-32"
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                {/* Personal Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#e0f2fe]">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Medical Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Medical Information</h3>
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input
                                type="date"
                                id="dob"
                                name="dob"
                                value={formData.dob}
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
                                    <SelectValue placeholder="Select sex" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height">Height</Label>
                            <Input
                                id="height"
                                name="height"
                                value={formData.height}
                                onChange={handleInputChange}
                                placeholder="e.g., 5'9&quot;"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weight">Weight (lbs)</Label>
                            <Input
                                id="weight"
                                name="weight"
                                value={formData.weight}
                                onChange={handleInputChange}
                                placeholder="Weight"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bmi">BMI</Label>
                            <Input
                                id="bmi"
                                name="bmi"
                                value={formData.bmi}
                                onChange={handleInputChange}
                                placeholder="BMI"
                            />
                        </div>
                    </div>
                </div>

                {/* Address Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Address Information</h3>
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#e0f2fe]">
                        <div className="space-y-2">
                            <Label htmlFor="address1">Address Line 1</Label>
                            <Input
                                id="address1"
                                name="address1"
                                value={formData.address1}
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
                                placeholder="Country"
                            />
                        </div>
                    </div>
                </div>

                {/* Refill Questionnaire Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Refill Questionnaire</h3>
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 gap-6 p-6 border rounded-xl shadow-sm bg-[#f0fdf4]">
                        {/* Approval Check */}
                        <div className="space-y-2">
                            <Label>Approved within last 6 months? *</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="approved"
                                        value="yes"
                                        checked={formData.approved === 'yes'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    <span>Yes</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="approved"
                                        value="no"
                                        checked={formData.approved === 'no'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    <span>No</span>
                                </label>
                            </div>
                        </div>

                        {/* Medication Preference */}
                        <div className="space-y-2">
                            <Label>Current Peptide *</Label>
                            <Select
                                value={formData.preference}
                                onValueChange={(value) => handleSelectChange('preference', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select peptide" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NAD+">NAD+</SelectItem>
                                    <SelectItem value="Glutathione">Glutathione</SelectItem>
                                    <SelectItem value="Sermorelin">Sermorelin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Medication Changes */}
                        <div className="space-y-2">
                            <Label>Medication changes? *</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="medicationChanges"
                                        value="yes"
                                        checked={formData.medicationChanges === 'yes'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    <span>Yes</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="medicationChanges"
                                        value="no"
                                        checked={formData.medicationChanges === 'no'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    <span>No</span>
                                </label>
                            </div>
                            {formData.medicationChanges === 'yes' && (
                                <div className="mt-2">
                                    <Label htmlFor="desmedicationChanges">Description</Label>
                                    <textarea
                                        id="desmedicationChanges"
                                        name="desmedicationChanges"
                                        value={formData.desmedicationChanges}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        rows="3"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Side Effects */}
                        <div className="space-y-2">
                            <Label>Experiencing side effects? *</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="sideEffects"
                                        value="yes"
                                        checked={formData.sideEffects === 'yes'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    <span>Yes</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="sideEffects"
                                        value="no"
                                        checked={formData.sideEffects === 'no'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    <span>No</span>
                                </label>
                            </div>
                            {formData.sideEffects === 'yes' && (
                                <div className="mt-2">
                                    <Label htmlFor="sideEffectsDetail">Side effects detail</Label>
                                    <textarea
                                        id="sideEffectsDetail"
                                        name="sideEffectsDetail"
                                        value={formData.sideEffectsDetail}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        rows="3"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Satisfaction */}
                        <div className="space-y-2">
                            <Label>Happy with medication? *</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="happyWithMed"
                                        value="yes"
                                        checked={formData.happyWithMed === 'yes'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    <span>Yes</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="happyWithMed"
                                        value="no"
                                        checked={formData.happyWithMed === 'no'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    <span>No</span>
                                </label>
                            </div>
                            {formData.happyWithMed === 'no' && (
                                <div className="mt-2">
                                    <Label htmlFor="deshappyWithMed">Reason</Label>
                                    <textarea
                                        id="deshappyWithMed"
                                        name="deshappyWithMed"
                                        value={formData.deshappyWithMed}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        rows="3"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Dosage Note */}
                        <div className="space-y-2">
                            <Label htmlFor="dosageNote">Questions/Concerns for Provider</Label>
                            <textarea
                                id="dosageNote"
                                name="dosageNote"
                                value={formData.dosageNote}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                            />
                        </div>
                    </div>
                </div>


                {/* Image Upload Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Images</h3>
                    <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-white">
                        <div className="flex justify-between flex-wrap items-center gap-4">
                            {images.map((imageUrl, index) => (
                                <div key={index} className="relative group w-[200px] h-48">
                                    {imageUrl ? (
                                        <>
                                            <Image
                                                src={imageUrl}
                                                alt={`Preview ${index + 1}`}
                                                width={200}
                                                height={192}
                                                unoptimized={true}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setSelectedImage(imageUrl)}
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
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.onchange = (e) => handleImageUpload(e, index);
                                                input.click();
                                            }}
                                            className="w-full h-full text-sm px-4 py-3 font-bold bg-secondary border border-black text-white rounded-lg focus:outline-none focus:border-purple-400"
                                        >
                                            Upload Image
                                        </button>
                                    )}
                                </div>
                            ))}

                            {images.length < 3 && (
                                <div
                                    className="w-[200px] h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400"
                                    onClick={addImageSlot}
                                >
                                    <div className="text-center">
                                        <div className="text-gray-400 mb-2">Add Image</div>
                                        <Button type="button" size="sm" variant="outline">
                                            + Add Slot
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* File Upload Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Documents</h3>
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#f5f3ff]">
                        <div className="space-y-2">
                            <Label>Document 1</Label>
                            <UploadFile
                                onUploadComplete={(url) => {
                                    setFileUrls(prev => ({ ...prev, file1: url }));
                                    setFormData(prev => ({ ...prev, file1: url }));
                                }}
                                onDelete={() => {
                                    setFileUrls(prev => ({ ...prev, file1: '' }));
                                    setFormData(prev => ({ ...prev, file1: '' }));
                                }}
                                file={fileUrls.file1}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Document 2 (ID Photo)</Label>
                            <UploadFile
                                onUploadComplete={(url) => {
                                    setFileUrls(prev => ({ ...prev, file2: url }));
                                    setFormData(prev => ({ ...prev, file2: url, idPhoto: url }));
                                }}
                                onDelete={() => {
                                    setFileUrls(prev => ({ ...prev, file2: '' }));
                                    setFormData(prev => ({ ...prev, file2: '', idPhoto: '' }));
                                }}
                                file={fileUrls.file2}
                            />
                        </div>
                    </div>
                </div>
                {/* Administrative Section */}
                <div className="space-y-4">
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 gap-6 p-6 border rounded-xl shadow-sm bg-[#f1f5f9]">

                        <div className="space-y-2">
                            <Label htmlFor="approvalStatus">Approval Status</Label>
                            <Select
                                value={formData.approvalStatus}
                                onValueChange={(value) => handleSelectChange('approvalStatus', value)}
                            >
                                <SelectTrigger>
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
                    {/* ADD THIS SECTION FOR FOLLOW-UP AND REFILL REMINDER */}
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 gap-6 p-6 border rounded-xl shadow-sm bg-[#e6ffea]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Follow Up</Label>
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
                            <div className="space-y-2">
                                <Label>Refill Reminder</Label>
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
                    <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-[#f1f5f9]">
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
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Updating..." : "Submit Refill"}
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
                        {isSuccess ? (
                            <>
                                <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                                    Stay on Page
                                </AlertDialogCancel>
                                <Button onClick={() => router.back()}>
                                    Go Back
                                </Button>
                            </>
                        ) : (
                            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                                Close
                            </AlertDialogCancel>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Image Preview Dialog */}
            <AlertDialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
                <AlertDialogContent className="max-w-[80vw] max-h-[80vh]">
                    <AlertDialogHeader>
                        <div className="flex-1 max-h-[60vh] flex justify-center">
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
                        <AlertDialogCancel onClick={() => setSelectedImage(null)}>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}