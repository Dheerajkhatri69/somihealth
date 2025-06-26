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
export default function FollowUpForm() {
    const { data: session } = useSession();

    useEffect(() => {
        // console.log("Session user:", session?.user);
    }, [session]);
    const [formData, setFormData] = useState(() => {
        return {
            authid: '', // Ensures 5 digits after P
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
            medicine: '',
            approvalStatus: '',
            semaglutideDose: '',
            semaglutideUnit: '',
            tirzepatideDose: '',
            tirzepatideUnit: '',
            createTimeDate: '',
            file1: '',
            file2: '',
            providerComments: '',
            providerNote: '',

            followUpRefills: true,
            needLabafter3RxFills: false,
            initialAuthId: '',
            glp1ApprovalLast6Months: '',
            currentWeight: '',
            currentGlp1Medication: '',
            anySideEffects: '',
            listSideEffects: '',
            happyWithMedication: '',
            switchMedication: '',
            continueDosage: '',
            increaseDosage: '',
            closetickets: false,
            Reasonclosetickets: '',
        };
    });

    const [fileUrls, setFileUrls] = useState({
        file1: '',
        file2: ''
    });
    // Add this state
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    // Add this function
    const handleSearch = async () => {
        if (!formData.initialAuthId) return;

        setSearchLoading(true);
        setSearchError('');

        try {
            // 1. Get original patient data
            const patientResponse = await fetch(`/api/patient/${formData.initialAuthId}`);
            const patientData = await patientResponse.json();

            if (!patientData.success || !patientData.patient) {
                throw new Error(patientData.error || 'Patient not found');
            }

            // 2. Get follow-up count
            const countResponse = await fetch(`/api/followup/count/${formData.initialAuthId}`);
            const countData = await countResponse.json();

            if (!countData.success) {
                throw new Error('Failed to check existing follow-ups');
            }

            // 3. Calculate next follow-up number
            const followUpCount = countData.count;
            let newAuthId = 0;

            if (followUpCount > 0) {
                newAuthId = `${formData.initialAuthId}-${followUpCount}`;
            } else {
                newAuthId = formData.initialAuthId;
            }

            // 4. Update form data
            setFormData(prev => ({
                ...prev,
                initialAuthId: formData.initialAuthId,
                authid: newAuthId,
                firstName: patientData.patient.firstName || '',
                lastName: patientData.patient.lastName || '',
                dob: patientData.patient.dob || '',
                height: patientData.patient.height || '',
                email: patientData.patient.email || '',
                sex: patientData.patient.sex || '',
                weight: patientData.patient.weight || '',
                phone: patientData.patient.phone || '',
                glp1: patientData.patient.glp1 || '',
                bmi: patientData.patient.bmi || '',
                address1: patientData.patient.address1 || '',
                address2: patientData.patient.address2 || '',
                city: patientData.patient.city || '',
                state: patientData.patient.state || '',
                zip: patientData.patient.zip || '',
                medicine: patientData.patient.medicine || '',
                approvalStatus: patientData.patient.approvalStatus || '',
                semaglutideDose: patientData.patient.semaglutideDose || '',
                semaglutideUnit: patientData.patient.semaglutideUnit || '',
                tirzepatideDose: patientData.patient.tirzepatideDose || '',
                tirzepatideUnit: patientData.patient.tirzepatideUnit || '',
                providerComments: patientData.patient.providerComments || '',
                providerNote: patientData.patient.providerNote || ''
            }));

            // Handle images
            const dbImages = patientData.patient.images || [];
            setImages(prev => [
                ...dbImages.slice(0, 3),
                ...Array(3 - dbImages.length).fill('')
            ]);

            setFileUrls({
                file1: patientData.patient.file1 || '',
                file2: patientData.patient.file2 || ''
            });
        } catch (error) {
            setSearchError(error.message);
            console.error('Search error:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleImageUpload = (index, url) => {
        setImages(prev => prev.map((img, i) => i === index ? url : img));
    };


    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [messageHead, setMessageHead] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submissionData = {
            ...formData,
            createTimeDate: new Date().toISOString(),
            images: images.filter(url => url !== ''),
            file1: fileUrls.file1,
            file2: fileUrls.file2
        };
        // console.log(submissionData)
        try {
            setSearchLoading(true);
            setIsDialogOpen(false);

            // 1. First create the followup record
            const response = await fetch('/api/followup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit follow-up');
            }

            // 2. If user is technician, create creator relationship
            if (session?.user?.accounttype === 'T') {
                const creatorData = {
                    pid: submissionData.authid,
                    tid: session.user.id,
                    tname: session.user.fullname
                };

                const creatorResponse = await fetch('/api/followupcreatorofp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(creatorData),
                });

                if (!creatorResponse.ok) {
                    console.error('Failed to create creator relationship:', await creatorResponse.json());
                    // Note: We don't throw error here as the followup was created successfully
                }
            }

            // Success handling (keep your existing code)
            setMessageHead("Success 🎉");
            setMessage("Follow-up record created successfully!");
            setIsSuccess(true);
            setIsDialogOpen(true);

            // Reset form (keep your existing code)
            const randomNum = Math.floor(Math.random() * 100000);
            setFormData({
                authid: `P${randomNum.toString().padStart(5, '0')}`,
                // ... rest of your reset fields
            });

            setImages(Array(3).fill(''));

        } catch (error) {
            setMessageHead("Error ❌");
            setMessage(error.message || 'An error occurred while submitting the form.');
            setIsSuccess(false);
            setIsDialogOpen(true);
            console.error('Submission error:', error);
        } finally {
            setSearchLoading(false);
        }
    };
    const [selectedImage, setSelectedImage] = useState(null); // Add this line
    const [images, setImages] = useState([null]);
    const maxImages = 3;
    const paddedImages = [...images, ...Array(maxImages - images.length).fill(null)];

    const handleFileChange = async (e, index) => {
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
            updatedImages[index] = res.url;
            setImages(updatedImages);
        } catch (error) {
            console.error("ImageKit upload error:", error);
        }
    };

    const removeImage = (index) => {
        const updatedImages = [...images];
        updatedImages[index] = null;
        setImages(updatedImages);
    };
    return (
        <div className="mb-4 p-4">
            <form onSubmit={handleSubmit} className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Follow Up</h2>

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
                        <div className="space-y-2 flex-1">
                            <Label>Initial Intake Auth ID</Label>
                            <div className="flex gap-2">
                                <Input
                                    name="initialAuthId"
                                    value={formData.initialAuthId}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault(); // Prevent form submission
                                            handleSearch();     // Trigger search instead
                                        }
                                    }}
                                    placeholder="Enter initial Auth ID"
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
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
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
                </div>

                {/* Address Section */}
                <h3 className="text-sm font-semibold">Address</h3>
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#e0f2fe]">
                    {['address1', 'address2', 'city', 'state', 'zip'].map((field) => (
                        <div key={field} className="space-y-2">
                            <Label htmlFor={field}>
                                {field === 'address1' ? 'Address' :
                                    field === 'address2' ? 'Address line 2' :
                                        field === 'city' ? 'City/Town' :
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

                {/* Medication Selection */}
                <div className="space-y-2">
                    <Label htmlFor="medicine">Medication</Label>
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
                {/* Add these to the Basic Information grid */}
                <div className="space-y-2">
                    <Label htmlFor="currentWeight">Current Weight (lbs)</Label>
                    <Input
                        id="currentWeight"
                        name="currentWeight"
                        value={formData.currentWeight}
                        onChange={handleInputChange}
                        placeholder="Current weight"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="glp1ApprovalLast6Months">GLP-1 Approval (Last 6mo)</Label>
                    <Input
                        id="glp1ApprovalLast6Months"
                        name="glp1ApprovalLast6Months"
                        value={formData.glp1ApprovalLast6Months}
                        onChange={handleInputChange}
                        placeholder="Approval status"
                    />
                </div>


                {/* Current Medication Section */}
                <h3 className="text-sm font-semibold">Current Medication Details</h3>
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#e0e7ff]">
                    <div className="space-y-2">
                        <Label htmlFor="currentGlp1Medication">Current GLP-1 Medication</Label>
                        <Input
                            id="currentGlp1Medication"
                            name="currentGlp1Medication"
                            value={formData.currentGlp1Medication}
                            onChange={handleInputChange}
                            placeholder="Current medication"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="anySideEffects">Side Effects Experienced</Label>
                        <Input
                            id="anySideEffects"
                            name="anySideEffects"
                            value={formData.anySideEffects}
                            onChange={handleInputChange}
                            placeholder="Any side effects?"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="listSideEffects">List Side Effects</Label>
                        <Input
                            id="listSideEffects"
                            name="listSideEffects"
                            value={formData.listSideEffects}
                            onChange={handleInputChange}
                            placeholder="Any side effects?"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="happyWithMedication">Happy with Medication?</Label>
                        <Input
                            id="happyWithMedication"
                            name="happyWithMedication"
                            value={formData.happyWithMedication}
                            onChange={handleInputChange}
                            placeholder="Are you satisfied with the medication?"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="switchMedication">Switch Medication?</Label>
                        <Input
                            id="switchMedication"
                            name="switchMedication"
                            value={formData.switchMedication}
                            onChange={handleInputChange}
                            placeholder="Consider switching medication?"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="continueDosage">Continue Dosage?</Label>
                        <Input
                            id="continueDosage"
                            name="continueDosage"
                            value={formData.continueDosage}
                            onChange={handleInputChange}
                            placeholder="Continue current dose?"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="increaseDosage">Increase Dosage?</Label>
                        <Input
                            id="increaseDosage"
                            name="increaseDosage"
                            value={formData.increaseDosage}
                            onChange={handleInputChange}
                            placeholder="Increase dose?"
                        />
                    </div>
                </div>

                <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-[#f1f5f9]">
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
                {/* Image Upload Section */}
                <h3 className="text-sm font-semibold">Upload Images</h3>

                <div className="flex justify-between flex-wrap items-center gap-4">
                    {paddedImages.map((imageUrl, index) => (
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
                                        input.onchange = (e) => handleFileChange(e, index);
                                        input.click();
                                    }}
                                    className="w-full h-full text-sm px-4 py-3 font-bold bg-secondary border border-black text-white rounded-lg focus:outline-none focus:border-purple-400"
                                >
                                    Upload Image
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {/* File Upload Section */}
                <h3 className="text-sm font-semibold">Upload Documents</h3>
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-[#f5f3ff]">
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

                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 gap-6 p-6 border rounded-xl shadow-sm bg-[#f0fdf4]">

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
                            <Select
                                value={formData.semaglutideDose}
                                onValueChange={(value) => handleSelectChange('semaglutideDose', value)}
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
                            <Select
                                value={formData.semaglutideUnit}
                                onValueChange={(value) => handleSelectChange('semaglutideUnit', value)}
                            >
                                <SelectTrigger className="w-1/2">
                                    <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1.00 mg/2mL">1.00 mg/2mL</SelectItem>
                                    <SelectItem value="2.00 mg/2mL">2.00 mg/2mL</SelectItem>
                                    <SelectItem value="4.00 mg/2mL">4.00 mg/2mL</SelectItem>
                                    <SelectItem value="6.80 mg/2mL">6.80 mg/2mL</SelectItem>
                                    <SelectItem value="10.00 mg/2mL">10.00 mg/2mL</SelectItem>
                                    <SelectItem value="15.00 mg/3mL">15.00 mg/3mL</SelectItem>
                                    <SelectItem value="20.00 mg/4mL">20.00 mg/4mL</SelectItem>
                                    <SelectItem value="25.00 mg/5mL">25.00 mg/5mL</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tirzepatide Dose */}
                    <div className="space-y-2">
                        <Label>Tirzepatide Dose</Label>
                        <div className="flex gap-2">
                            <Select
                                value={formData.tirzepatideDose}
                                onValueChange={(value) => handleSelectChange('tirzepatideDose', value)}
                            >
                                <SelectTrigger className="w-1/2">
                                    <SelectValue placeholder="Dose" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2.50">2.50mg</SelectItem>
                                    <SelectItem value="5.00">5.00mg</SelectItem>
                                    <SelectItem value="7.50">7.50mg</SelectItem>
                                    <SelectItem value="10.00">10.00mg</SelectItem>
                                    <SelectItem value="12.50">12.50mg</SelectItem>
                                    <SelectItem value="15.00">15.00mg</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={formData.tirzepatideUnit}
                                onValueChange={(value) => handleSelectChange('tirzepatideUnit', value)}
                            >
                                <SelectTrigger className="w-1/2">
                                    <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10.00 mg/2mL">10.00 mg/2mL</SelectItem>
                                    <SelectItem value="20.00 mg/2mL">20.00 mg/2mL</SelectItem>
                                    <SelectItem value="30.00 mg/2mL">30.00 mg/2mL</SelectItem>
                                    <SelectItem value="40.00 mg/2mL">40.00 mg/2mL</SelectItem>
                                    <SelectItem value="50.00 mg/2mL">50.00 mg/2mL</SelectItem>
                                    <SelectItem value="60.00 mg/2mL">60.00 mg/2mL</SelectItem>
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
                <Button type="submit" className="w-full">
                    Submit
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
                            {isSuccess ? "Add another" : "Cancel"}
                        </AlertDialogCancel>

                        {/* Redirect button (only show for success) */}
                        {isSuccess && (
                            <Button
                                onClick={() => router.push("/dashboard/followup")}
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
                        <AlertDialogCancel onClick={() => setSelectedImage(null)}>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


        </div>
    );
}