"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { UploadButton } from "@/utils/uploadthing";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, Fullscreen, X, XCircleIcon } from "lucide-react";
export default function FollowUpForm() {
    const { data: session } = useSession();

    useEffect(() => {
        console.log("Session user:", session?.user);
    }, [session]);
    const [formData, setFormData] = useState(() => {
        const randomNum = Math.floor(Math.random() * 100000); // Generates number between 0-99999
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

            followUpRefills: false,
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
            patientStatement: '',

            closetickets: false,
            Reasonclosetickets: '',
        };
    });
    const [images, setImages] = useState(Array(3).fill(''));
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
            }));

            // Handle images
            const dbImages = patientData.patient.images || [];
            setImages(prev => [
                ...dbImages.slice(0, 3),
                ...Array(3 - dbImages.length).fill('')
            ]);

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

    const removeImage = (index) => {
        setImages(prev => prev.map((img, i) => i === index ? '' : img));
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
            images: images.filter(url => url !== '')
        };

        try {
            setSearchLoading(true); // Reuse loading state for submission
            setIsDialogOpen(false); // Close any existing dialogs

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

            // Success handling
            setMessageHead("Success 🎉");
            setMessage("Follow-up record created successfully!");
            setIsSuccess(true);
            setIsDialogOpen(true);

            // Reset form while preserving initial Auth ID
            const randomNum = Math.floor(Math.random() * 100000);
            setFormData({
                authid: `P${randomNum.toString().padStart(5, '0')}`,
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
                closetickets: false,
                Reasonclosetickets: '',
                // Preserve initial Auth ID for potential new follow-ups
                initialAuthId: formData.initialAuthId,
                // Reset follow-up specific fields
                followUpRefills: false,
                glp1ApprovalLast6Months: '',
                currentWeight: '',
                currentGlp1Medication: '',
                anySideEffects: '',
                listSideEffects: '',
                happyWithMedication: '',
                switchMedication: '',
                continueDosage: '',
                increaseDosage: '',
                patientStatement: ''
            });

            // Clear images
            setImages(Array(3).fill(''));

        } catch (error) {
            // Error handling
            setMessageHead("Error ❌");
            setMessage(error.message || 'An error occurred while submitting the form.');
            setIsSuccess(false);
            setIsDialogOpen(true);
            console.error('Submission error:', error);
        } finally {
            setSearchLoading(false);
        }
    };
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <div className="mb-4 p-4">
            <form onSubmit={handleSubmit} className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Follow Up</h2>
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
                    <div className="flex items-center gap-2">
                        <div className="space-y-2 flex-1">
                            <Label>Initial Intake Auth ID</Label>
                            <div className="flex gap-2">
                                <Input
                                    name="initialAuthId"
                                    value={formData.initialAuthId}
                                    onChange={handleInputChange}
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
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-white">
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
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-white">
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
                        </SelectContent>
                    </Select>
                </div>

                {/* Image Upload Section */}
                <h3 className="text-sm font-semibold">Upload Images</h3>
                <div className="flex justify-between flex-wrap items-center gap-4">
                    {images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                            {imageUrl ? (
                                <>
                                    <img
                                        src={imageUrl}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-48 object-cover rounded-lg"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setSelectedImage(imageUrl)}
                                        className="absolute top-2 left-2  bg-black/50 text-white p-1 rounded-full"
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
                                <UploadButton
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => {
                                        if (res && res.length > 0) {
                                            handleImageUpload(index, res[0].url);
                                        }
                                    }}
                                    className="w-[200px] text-sm px-4 py-3 font-bold bg-secondary border border-black rounded-lg focus:outline-none focus:border-purple-400"

                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 gap-6 p-6 border rounded-xl shadow-sm bg-white">

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
                                    <SelectItem value="2.5">2.5mg</SelectItem>
                                    <SelectItem value="4.5">4.5mg</SelectItem>
                                    <SelectItem value="6.5">6.5mg</SelectItem>
                                    <SelectItem value="9.0">9.0mg</SelectItem>
                                    <SelectItem value="11.5">11.5mg</SelectItem>
                                    <SelectItem value="13.5">13.5mg</SelectItem>
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
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
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
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-white">
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
                        <Label>Side Effects Experienced</Label>
                        <Select
                            value={formData.anySideEffects}
                            onValueChange={(value) => handleSelectChange('anySideEffects', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Any side effects?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.anySideEffects === 'Yes' && (
                        <div className="space-y-2">
                            <Label htmlFor="listSideEffects">List Side Effects</Label>
                            <Textarea
                                id="listSideEffects"
                                name="listSideEffects"
                                value={formData.listSideEffects}
                                onChange={handleInputChange}
                                placeholder="Describe side effects"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Happy with Medication?</Label>
                        <Select
                            value={formData.happyWithMedication}
                            onValueChange={(value) => handleSelectChange('happyWithMedication', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select satisfaction" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Switch Medication?</Label>
                        <Select
                            value={formData.switchMedication}
                            onValueChange={(value) => handleSelectChange('switchMedication', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Consider switching?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Continue Dosage?</Label>
                        <Select
                            value={formData.continueDosage}
                            onValueChange={(value) => handleSelectChange('continueDosage', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Continue current dose?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Increase Dosage?</Label>
                        <Select
                            value={formData.increaseDosage}
                            onValueChange={(value) => handleSelectChange('increaseDosage', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Increase dose?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="patientStatement">Patient Statement</Label>
                    <Textarea
                        id="patientStatement"
                        name="patientStatement"
                        value={formData.patientStatement}
                        onChange={handleInputChange}
                        placeholder="Patient's comments or statements"
                        className="min-h-[100px]"
                    />
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
                            <img src={selectedImage} alt="Preview"
                                className="max-h-full max-w-full object-contain rounded-lg"
                            />
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