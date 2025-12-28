"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Fullscreen, X } from "lucide-react";
import { upload } from "@imagekit/next";
import Image from "next/image";
import UploadFile from "@/components/FileUpload";
import toast from "react-hot-toast";

// Medication options matching the client form
const medicationOptions = {
    'Sildenafil (Generic of Viagra)': ['25mg', '50mg', '100mg'],
    'Tadalafil (Generic of Cialis)': ['5mg', '10mg', '20mg'],
    'Fusion Mini Troches (Tadalafil/Sildenafil)': ['5/35mg', '10/40mg']
};

export default function EDRefillAdminEditForm({ params }) {
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
        edApproved: '',
        medicalChanges: '',
        medicalChangesDetail: '',
        currentMedication: '',
        currentDose: '',
        sideEffects: '',
        sideEffectsDetail: '',
        happyWithMed: '',
        happyWithMedDetail: '',
        medicationDecision: '',
        changeSelection: '',
        providerNotes: '',

        // System fields
        questionnaire: false, // Always false for refills after first update
        seen: false,
        approvalStatus: 'Pending',
        providerNote: '',
        followUp: '',
        refillReminder: '',
        dose: '',
        unit: '',

        // Administrative
        closetickets: false,
        Reasonclosetickets: '',
        initialAuthId: '',

        // File uploads
        images: [],
    });

    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [messageHead, setMessageHead] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isFirstSubmit, setIsFirstSubmit] = useState(true);

    // Fetch refill data on component mount
    useEffect(() => {
        const fetchRefillData = async () => {
            if (!params.authid) return;

            setIsLoading(true);
            try {
                // Fetch the specific refill
                const response = await fetch(`/api/ed-refill-questionnaire/${params.authid}`);
                const data = await response.json();

                if (data.success && data.result) {
                    const refill = data.result;

                    // Extract interval from followUp and refillReminder for UI
                    let followUpInterval = '';
                    let refillReminderInterval = '';

                    if (refill.followUp && refill.followUp.includes('_')) {
                        followUpInterval = refill.followUp.split('_')[1];
                    } else if (refill.followUp) {
                        followUpInterval = refill.followUp;
                    }

                    if (refill.refillReminder && refill.refillReminder.includes('_')) {
                        refillReminderInterval = refill.refillReminder.split('_')[1];
                    } else if (refill.refillReminder) {
                        refillReminderInterval = refill.refillReminder;
                    }

                    setFormData({
                        authid: refill.authid || '',
                        firstName: refill.firstName || '',
                        lastName: refill.lastName || '',
                        phone: refill.phone || '',
                        email: refill.email || '',
                        edApproved: refill.edApproved || '',
                        medicalChanges: refill.medicalChanges || '',
                        medicalChangesDetail: refill.medicalChangesDetail || '',
                        currentMedication: refill.currentMedication || '',
                        currentDose: refill.currentDose || '',
                        sideEffects: refill.sideEffects || '',
                        sideEffectsDetail: refill.sideEffectsDetail || '',
                        happyWithMed: refill.happyWithMed || '',
                        happyWithMedDetail: refill.happyWithMedDetail || '',
                        medicationDecision: refill.medicationDecision || '',
                        changeSelection: refill.changeSelection || '',
                        providerNotes: refill.providerNotes || '',

                        // System fields
                        questionnaire: refill.questionnaire !== undefined ? refill.questionnaire : true,
                        seen: refill.seen || false,
                        approvalStatus: refill.approvalStatus || 'Pending',
                        providerNote: refill.providerNote || '',
                        followUp: refill.followUp || '',
                        refillReminder: refill.refillReminder || '',
                        dose: refill.dose || '',
                        unit: refill.unit || '',

                        // Administrative
                        closetickets: refill.closetickets || false,
                        Reasonclosetickets: refill.Reasonclosetickets || '',
                        initialAuthId: refill.initialAuthId || '',

                        // File uploads
                        images: refill.images || [],
                        _id: refill._id,
                    });

                    setIsFirstSubmit(refill.questionnaire === true);

                    setUiState({
                        followUpInterval,
                        refillReminderInterval
                    });

                    setImages(refill.images || []);
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
                questionnaire: false, // Ensure it stays as refill (set to false after first update)
                images: images,
                followUp: followUp,
                refillReminder: refillReminder,
                updatedAt: new Date().toISOString()
            };

            // Remove _id if present (should not be sent in update)
            delete updateData._id;
            delete updateData.__v;

            // Use PUT with authid
            const response = await fetch('/api/ed-refill-questionnaire', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    authid: formData.authid,
                    updates: updateData
                }),
            });
            const result = await response.json();

            if (response.ok && result.success) {
                setMessageHead("Success 🎉");
                setMessage(isFirstSubmit
                    ? "Refill record submitted successfully!"
                    : "Refill record updated successfully!"
                );
                setIsSuccess(true);
                setIsFirstSubmit(false);

                // Update abandonment record for admin edit
                try {
                    await fetch("/api/ed-refill-abandonment", {
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
                    <h2 className="text-2xl font-semibold mb-4">ED Refill Follow Up</h2>
                    <div className="flex items-center gap-2">
                        <div className="space-y-2">
                            <Label>Auth ID</Label>
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

                {/* Refill Questionnaire Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Refill Questionnaire</h3>
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 gap-6 p-6 border rounded-xl shadow-sm bg-[#f0fdf4]">
                        {/* ED Approval Check */}
                        <div className="space-y-2">
                            <Label>Approved within last 6 months? *</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="edApproved"
                                        value="yes"
                                        checked={formData.edApproved === 'yes'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    <span>Yes</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="edApproved"
                                        value="no"
                                        checked={formData.edApproved === 'no'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    <span>No</span>
                                </label>
                            </div>
                        </div>

                        {/* Medical Changes */}
                        <div className="space-y-2">
                            <Label>Medication changes? *</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="medicalChanges"
                                        value="yes"
                                        checked={formData.medicalChanges === 'yes'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    <span>Yes</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="medicalChanges"
                                        value="no"
                                        checked={formData.medicalChanges === 'no'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4"
                                    />
                                    <span>No</span>
                                </label>
                            </div>
                            {formData.medicalChanges === 'yes' && (
                                <div className="mt-2">
                                    <Label htmlFor="medicalChangesDetail">Description</Label>
                                    <Textarea
                                        id="medicalChangesDetail"
                                        name="medicalChangesDetail"
                                        value={formData.medicalChangesDetail}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        rows="3"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Current Medication */}
                        <div className="space-y-2">
                            <Label>Current ED Medication *</Label>
                            <Select
                                value={formData.currentMedication}
                                onValueChange={(value) => {
                                    handleSelectChange('currentMedication', value);
                                    handleSelectChange('currentDose', ''); // Reset dose when changing medication
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select medication" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(medicationOptions).map((med) => (
                                        <SelectItem key={med} value={med}>{med}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Current Dose */}
                        {formData.currentMedication && (
                            <div className="space-y-2">
                                <Label>Current Dose *</Label>
                                <Select
                                    value={formData.currentDose}
                                    onValueChange={(value) => handleSelectChange('currentDose', value)}
                                >
                                    <SelectTrigger>
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
                                    <Textarea
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
                                    <Label htmlFor="happyWithMedDetail">Reason</Label>
                                    <Textarea
                                        id="happyWithMedDetail"
                                        name="happyWithMedDetail"
                                        value={formData.happyWithMedDetail}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        rows="3"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Medication Decision */}
                        <div className="space-y-2">
                            <Label>Medication Decision *</Label>
                            <Select
                                value={formData.medicationDecision}
                                onValueChange={(value) => handleSelectChange('medicationDecision', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select decision" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="continue">Continue current ED medication and dose</SelectItem>
                                    <SelectItem value="change">Change ED medication</SelectItem>
                                    <SelectItem value="increase">Increase dose</SelectItem>
                                    <SelectItem value="decrease">Decrease dose</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Change Selection (only shown if decision is not "continue") */}
                        {formData.medicationDecision && formData.medicationDecision !== 'continue' && (
                            <div className="space-y-2">
                                <Label>Change Selection</Label>
                                <Select
                                    value={formData.changeSelection}
                                    onValueChange={(value) => handleSelectChange('changeSelection', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {formData.medicationDecision === 'change' && (
                                            <>
                                                <SelectItem value="Switch to Tadalafil 5mg">Switch to Tadalafil 5mg</SelectItem>
                                                <SelectItem value="Switch to Tadalafil 10mg">Switch to Tadalafil 10mg</SelectItem>
                                                <SelectItem value="Switch to Tadalafil 20mg">Switch to Tadalafil 20mg</SelectItem>
                                                <SelectItem value="Switch to Sildenafil 25mg">Switch to Sildenafil 25mg</SelectItem>
                                                <SelectItem value="Switch to Sildenafil 50mg">Switch to Sildenafil 50mg</SelectItem>
                                                <SelectItem value="Switch to Sildenafil 100mg">Switch to Sildenafil 100mg</SelectItem>
                                                <SelectItem value="Switch to Fusion Mini Troches 5/35mg">Switch to Fusion Mini Troches 5/35mg</SelectItem>
                                                <SelectItem value="Switch to Fusion Mini Troches 10/40mg">Switch to Fusion Mini Troches 10/40mg</SelectItem>
                                            </>
                                        )}
                                        {formData.medicationDecision === 'increase' && (
                                            <>
                                                <SelectItem value="Increase dose Tadalafil 5mg">Increase dose Tadalafil 5mg</SelectItem>
                                                <SelectItem value="Increase dose Tadalafil 10mg">Increase dose Tadalafil 10mg</SelectItem>
                                                <SelectItem value="Increase dose Tadalafil 20mg">Increase dose Tadalafil 20mg</SelectItem>
                                                <SelectItem value="Increase dose Sildenafil 25mg">Increase dose Sildenafil 25mg</SelectItem>
                                                <SelectItem value="Increase dose Sildenafil 50mg">Increase dose Sildenafil 50mg</SelectItem>
                                                <SelectItem value="Increase dose Sildenafil 100mg">Increase dose Sildenafil 100mg</SelectItem>
                                                <SelectItem value="Increase dose Fusion Mini Troches 5/35mg">Increase dose Fusion Mini Troches 5/35mg</SelectItem>
                                                <SelectItem value="Increase dose Fusion Mini Troches 10/40mg">Increase dose Fusion Mini Troches 10/40mg</SelectItem>
                                            </>
                                        )}
                                        {formData.medicationDecision === 'decrease' && (
                                            <>
                                                <SelectItem value="Decrease dose Tadalafil 5mg">Decrease dose Tadalafil 5mg</SelectItem>
                                                <SelectItem value="Decrease dose Tadalafil 10mg">Decrease dose Tadalafil 10mg</SelectItem>
                                                <SelectItem value="Decrease dose Tadalafil 20mg">Decrease dose Tadalafil 20mg</SelectItem>
                                                <SelectItem value="Decrease dose Sildenafil 25mg">Decrease dose Sildenafil 25mg</SelectItem>
                                                <SelectItem value="Decrease dose Sildenafil 50mg">Decrease dose Sildenafil 50mg</SelectItem>
                                                <SelectItem value="Decrease dose Sildenafil 100mg">Decrease dose Sildenafil 100mg</SelectItem>
                                                <SelectItem value="Decrease dose Fusion Mini Troches 5/35mg">Decrease dose Fusion Mini Troches 5/35mg</SelectItem>
                                                <SelectItem value="Decrease dose Fusion Mini Troches 10/40mg">Decrease dose Fusion Mini Troches 10/40mg</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Provider Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="providerNotes">Questions/Concerns for Provider</Label>
                            <Textarea
                                id="providerNotes"
                                name="providerNotes"
                                value={formData.providerNotes}
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
                                    <SelectItem value="25mg">25mg</SelectItem>
                                    <SelectItem value="50mg">50mg</SelectItem>
                                    <SelectItem value="100mg">100mg</SelectItem>
                                    <SelectItem value="5mg">5mg</SelectItem>
                                    <SelectItem value="10mg">10mg</SelectItem>
                                    <SelectItem value="20mg">20mg</SelectItem>
                                    <SelectItem value="5/35mg">5/35mg</SelectItem>
                                    <SelectItem value="10/40mg">10/40mg</SelectItem>
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
                    {/* Follow-up and Refill Reminder */}
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
                            <Textarea
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
