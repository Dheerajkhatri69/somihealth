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

export default function LongevityRefillForm() {
    const { data: session } = useSession();
    const router = useRouter();

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
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [messageHead, setMessageHead] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add image upload slot
    const addImageSlot = () => {
        if (images.length < 3) {
            setImages([...images, '']);
        }
    };

    const handleSearch = async () => {
        if (!formData.initialAuthId) {
            setSearchError('Please enter Initial Auth ID');
            return;
        }

        setSearchLoading(true);
        setSearchError('');

        try {
            // 1. Get original patient data from longevity questionnaire
            const patientResponse = await fetch(`/api/longevity-questionnaire?authid=${formData.initialAuthId}`);
            const patientData = await patientResponse.json();

            if (!patientData.success || !patientData.result || patientData.result.length === 0) {
                throw new Error(patientData.message || 'Patient not found in longevity records');
            }

            const originalPatient = patientData.result[0];

            // 2. Get refill count
            const countResponse = await fetch(`/api/longevity-refill-questionnaire/count?initialAuthId=${formData.initialAuthId}`);
            const countData = await countResponse.json();

            if (!countData.success) {
                throw new Error('Failed to check existing refills');
            }

            // 3. Calculate next refill number
            const refillCount = countData.count || 0;
            let newAuthId = '';

            if (refillCount > 0) {
                newAuthId = `${formData.initialAuthId}-R${refillCount + 1}`;
            } else {
                newAuthId = `${formData.initialAuthId}-R1`;
            }

            // 4. Update form data with original patient info
            setFormData(prev => ({
                ...prev,
                initialAuthId: formData.initialAuthId,
                authid: newAuthId,
                firstName: originalPatient.firstName || '',
                lastName: originalPatient.lastName || '',
                phone: originalPatient.phone || '',
                email: originalPatient.email || '',
                address1: originalPatient.address1 || '',
                address2: originalPatient.address2 || '',
                city: originalPatient.city || '',
                state: originalPatient.state || '',
                zip: originalPatient.zip || '',
                country: originalPatient.country || 'US',
                dob: originalPatient.dob ? new Date(originalPatient.dob).toISOString().split('T')[0] : '',
                sex: originalPatient.sex || '',
                height: originalPatient.height || '',
                weight: originalPatient.weight || '',
                bmi: originalPatient.bmi || '',
                preference: originalPatient.preference || '',
                dose: originalPatient.dose || '',
                unit: originalPatient.unit || '',
                frequency: originalPatient.frequency || '',
                idPhoto: originalPatient.idPhoto || '',
                // Set questionnaire to false (this is a refill)
                questionnaire: false
            }));

            // Handle images from original patient
            const originalImages = originalPatient.images || [];
            setImages([...originalImages]);

            // Handle files
            setFileUrls({
                file1: originalPatient.file1 || '',
                file2: originalPatient.file2 || ''
            });

            toast.success('Patient data loaded successfully');

        } catch (error) {
            setSearchError(error.message);
            toast.error(error.message);
            console.error('Search error:', error);
        } finally {
            setSearchLoading(false);
        }
    };

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
        } catch (error) {
            console.error("ImageKit upload error:", error);
            toast.error("Failed to upload image");
        }
    };

    const removeImage = (index) => {
        const updatedImages = [...images];
        updatedImages.splice(index, 1);
        setImages(updatedImages);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Prepare submission data
            const submissionData = {
                ...formData,
                images: images.filter(url => url !== ''),
                file1: fileUrls.file1,
                file2: fileUrls.file2,
                idPhoto: fileUrls.file2 || formData.idPhoto, // Use file2 as ID photo if available
                createTimeDate: new Date().toISOString(),
                questionnaire: false, // Ensure it's a refill
                seen: false,
                approvalStatus: 'Pending' // Default status
            };

            // 1. Create the refill record
            const response = await fetch('/api/longevity-refill-questionnaire', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit refill questionnaire');
            }

            // 2. If user is technician, create creator relationship
            if (session?.user?.accounttype === 'T') {
                const creatorData = {
                    pid: submissionData.authid,
                    tid: session.user.id,
                    tname: session.user.fullname,
                    type: 'longevity-refill' // Add type to distinguish
                };

                const creatorResponse = await fetch('/api/longevity-refill-creator', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(creatorData),
                });

                if (!creatorResponse.ok) {
                    console.error('Failed to create creator relationship:', await creatorResponse.json());
                    // Don't throw error here as the main record was created
                }
            }

            // 3. Create abandonment record for analytics
            try {
                await fetch("/api/longevity-refill-abandonment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userSessionId: session?.user?.id || 'unknown',
                        firstSegment: {
                            firstName: formData.firstName,
                            lastName: formData.lastName,
                            phone: formData.phone,
                            email: formData.email,
                        },
                        lastSegmentReached: 6, // Complete form
                        state: 3, // Submitted
                        question: "Refill Form Submitted",
                        timestamp: new Date().toISOString(),
                    }),
                });
            } catch (abandonmentError) {
                console.error("Failed to create abandonment record:", abandonmentError);
            }

            // Success handling
            setMessageHead("Success 🎉");
            setMessage("Refill questionnaire submitted successfully!");
            setIsSuccess(true);
            setIsDialogOpen(true);

            // Reset form
            setFormData({
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
                address1: '',
                address2: '',
                city: '',
                state: '',
                zip: '',
                country: '',
                dob: '',
                sex: '',
                height: '',
                weight: '',
                bmi: '',
                dose: '',
                unit: '',
                frequency: '',
                questionnaire: false,
                seen: false,
                approvalStatus: 'Pending',
                providerNote: '',
                followUp: '',
                refillReminder: '',
                idPhoto: '',
                closetickets: false,
                Reasonclosetickets: '',
                initialAuthId: '',
                needLabafter3RxFills: false,
                followUpRefills: true,
                images: [],
                file1: '',
                file2: ''
            });

            setImages([]);
            setFileUrls({ file1: '', file2: '' });

        } catch (error) {
            setMessageHead("Error ❌");
            setMessage(error.message || 'An error occurred while submitting the form.');
            setIsSuccess(false);
            setIsDialogOpen(true);
            console.error('Submission error:', error);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mb-4 p-4">
            <form onSubmit={handleSubmit} className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Longevity Refill Questionnaire</h2>

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

                    <div className="flex items-center gap-2 mb-4">
                        <div className="space-y-2 flex-1">
                            <Label>Initial Longevity Auth ID</Label>
                            <div className="flex gap-2">
                                <Input
                                    name="initialAuthId"
                                    value={formData.initialAuthId}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSearch();
                                        }
                                    }}
                                    placeholder="Enter initial Auth ID (e.g., L12345)"
                                />
                                <Button
                                    type="button"
                                    onClick={handleSearch}
                                    disabled={searchLoading}
                                >
                                    {searchLoading ? 'Searching...' : 'Search'}
                                </Button>
                            </div>
                            {searchError && (
                                <p className="text-red-500 text-sm">{searchError}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>New Refill Auth ID</Label>
                            <Input
                                name="authid"
                                value={formData.authid}
                                className="font-mono w-40"
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
                                    <SelectItem value="None">None</SelectItem>
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
                            <Select
                                value={formData.country}
                                onValueChange={(value) => handleSelectChange('country', value)}
                            >
                                <SelectTrigger id="country">
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="US">United States</SelectItem>
                                    <SelectItem value="CA">Canada</SelectItem>
                                    <SelectItem value="UK">United Kingdom</SelectItem>
                                    <SelectItem value="AU">Australia</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
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
                                        required
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
                                        required
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
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select peptide" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NAD+">NAD+</SelectItem>
                                    <SelectItem value="Glutathione">Glutathione</SelectItem>
                                    <SelectItem value="Sermorelin">Sermorelin</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
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
                                        required
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
                                        required
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
                                        placeholder="Describe medication changes..."
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
                                        required
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
                                        required
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
                                        placeholder="Describe side effects..."
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
                                        required
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
                                        required
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
                                        placeholder="Why are you not happy with the medication?"
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
                                placeholder="Enter any questions or concerns..."
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
                    <h3 className="text-lg font-semibold">Administrative</h3>
                    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 gap-6 p-6 border rounded-xl shadow-sm bg-[#f1f5f9]">
                        {session?.user?.accounttype === 'A' || session?.user?.accounttype === 'C' ? (
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
                        ) : null}

                        <div className="grid grid-cols-3 gap-4">
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
                            <div className="space-y-2">
                                <Label htmlFor="frequency">Frequency</Label>
                                <Select
                                    value={formData.frequency}
                                    onValueChange={(value) => handleSelectChange('frequency', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="None">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="providerNote">Provider Note</Label>
                            <textarea
                                id="providerNote"
                                name="providerNote"
                                value={formData.providerNote}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                rows="4"
                                placeholder="Enter provider notes..."
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="closetickets"
                                checked={formData.closetickets}
                                onChange={(e) => setFormData(prev => ({ ...prev, closetickets: e.target.checked }))}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="closetickets">Close Tickets</Label>
                        </div>

                        {formData.closetickets && (
                            <div className="space-y-2">
                                <Label htmlFor="Reasonclosetickets">Reason for Closing</Label>
                                <Input
                                    id="Reasonclosetickets"
                                    name="Reasonclosetickets"
                                    value={formData.Reasonclosetickets}
                                    onChange={handleInputChange}
                                    placeholder="Enter reason for closing tickets..."
                                />
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Submit Refill Questionnaire"}
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
                            {isSuccess ? "Add Another" : "Close"}
                        </AlertDialogCancel>
                        {isSuccess && (
                            <Button
                                onClick={() => router.push("/dashboard/longevity-refills")}
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