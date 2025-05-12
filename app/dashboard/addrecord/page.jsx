"use client";

import React, { useState, useEffect, useRef } from "react";
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


import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";
import Image from "next/image";

export default function PatientForm() {
    const { data: session } = useSession();

    useEffect(() => {
        console.log("Session user:", session?.user);
    }, [session]);
    const [formData, setFormData] = useState(() => {
        const randomNum = Math.floor(Math.random() * 100000); // Generates number between 0-99999
        return {
            authid: `P${randomNum.toString().padStart(5, '0')}`, // Ensures 5 digits after P
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
            providerNote: '',
            createTimeDate: '',
            closetickets: false,
            Reasonclosetickets: '',
        };
    });

    const fileInputRef = useRef(null);
    const uploadingIndexRef = useRef(null);

    // const authenticator = async () => {
    //     const res = await fetch("/api/upload-auth");
    //     const data = await res.json();
    //     return data;
    // };


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
            images: images.filter(url => url !== '')
        };

        try {
            const response = await fetch('/api/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const data = await response.json();

            if (data.success) {
                setMessageHead("Success");
                setMessage("Patient created successfully!");
                setIsSuccess(true);
                setIsDialogOpen(true);
                // Optional: Reset form here if needed
            } else {
                setMessageHead("Error");
                setMessage(data.result.message || "Failed to create patient");
                setIsSuccess(false);
                setIsDialogOpen(true);
            }
        } catch (error) {
            setMessageHead("Error");
            setMessage("An unexpected error occurred.");
            setIsSuccess(false);
            setIsDialogOpen(true);
            console.error('Failed to submit:', error);
        }
    };
    const [selectedImage, setSelectedImage] = useState(null); // Add this line
    const [images, setImages] = useState([null, null, null]);
    const fileInputRefs = useRef([]);

    const triggerFileInput = (index) => {
        fileInputRefs.current[index].click();
    };
    const authenticator = async () => {
        const res = await fetch('/api/imagekit-auth');
        const auth = await res.json();

        return {
            publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_HY7YY/rIWqQyH/VxGRhxOdOfE0g=', // fallback if needed
            signature: auth.signature,
            expire: auth.expire,
            token: auth.token,
        };
    };

    const handleFileChange = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Fetch fresh auth parameters for EACH upload
            const authRes = await fetch('/api/imagekit-auth');
            const authData = await authRes.json();

            const res = await upload({
                file,
                fileName: `${Date.now()}_${file.name}`, // Add timestamp for uniqueness
                publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_HY7YY/rIWqQyH/VxGRhxOdOfE0g=',
                signature: authData.signature,
                expire: authData.expire,
                token: authData.token,
                useUniqueFileName: true // Ensure unique filenames
            });

            const newImages = [...images];
            newImages[index] = res.url;
            setImages(newImages);
        } catch (error) {
            console.error("Upload error:", error);
            alert('Failed to upload image. Please try again.');
        }
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages[index] = null;
        setImages(newImages);
    };

    return (
        <div className="mb-4 p-4">
            <form onSubmit={handleSubmit} className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Patient Registration</h2>
                    <div className="space-y-2">
                        <Label>Auth ID</Label>
                        <Input
                            id="authId"
                            name="authid"
                            type="text"
                            value={formData.authid}
                            onChange={handleInputChange}
                            className="font-mono w-32"
                            readOnly
                        />
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

                {/* Vitals Section */}
                <h3 className="text-sm font-semibold">Vitals</h3>
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-white">
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
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-white">
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
                                </SelectContent>
                            </Select>
                        </div>
                    ))}

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
                <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-white">
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
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-white">
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
                <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-white">
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
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-white">
                    <div className="space-y-2">
                        <Label htmlFor="glpTaken">GLP-1 Taken</Label>
                        <Select
                            value={formData.glpTaken}
                            onValueChange={(value) => handleSelectChange('glpTaken', value)}
                        >
                            <SelectTrigger id="glpTaken" className="w-full">
                                <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
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
                    {/* <div className="space-y-2">
                        <Label htmlFor="glpRecentInjection">Last Injection &lt; 2 Weeks Ago</Label>
                        <Select
                            value={formData.glpRecentInjection}
                            onValueChange={(value) => handleSelectChange('glpRecentInjection', value)}
                        >
                            <SelectTrigger id="glpRecentInjection" className="w-full">
                                <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div> */}
                </div>

                {/* Semaglutide Section */}
                <h3 className="text-sm font-semibold">Semaglutide</h3>
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-white">
                    {['semaglutideLastDose', 'semaglutideRequestedDose'].map((field) => (
                        <div key={field} className="space-y-2">
                            <Label htmlFor={field}>
                                {field === 'semaglutideLastDose' ? 'Last Dose' : 'Requested Dose'}
                            </Label>
                            <Select
                                value={formData[field]}
                                onValueChange={(value) => handleSelectChange(field, value)}
                            >
                                <SelectTrigger id={field} className="w-full">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dose1">Dose 1</SelectItem>
                                    <SelectItem value="dose2">Dose 2</SelectItem>
                                    <SelectItem value="dose3">Dose 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </div>

                {/* Tirzepatide Section */}
                <h3 className="text-sm font-semibold">Tirzepetide</h3>
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-white">
                    {['tirzepetideLastDose', 'tirzepetideRequestedDose'].map((field) => (
                        <div key={field} className="space-y-2">
                            <Label htmlFor={field}>
                                {field === 'tirzepetideLastDose' ? 'Last Dose' : 'Requested Dose'}
                            </Label>
                            <Select
                                value={formData[field]}
                                onValueChange={(value) => handleSelectChange(field, value)}
                            >
                                <SelectTrigger id={field} className="w-full">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dose1">Dose 1</SelectItem>
                                    <SelectItem value="dose2">Dose 2</SelectItem>
                                    <SelectItem value="dose3">Dose 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </div>

                {/* Tirzepatide Details Section */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl shadow-sm bg-white">
                    {['tirzepetidePlanPurchased', 'tirzepetideVial', 'tirzepetideDosingSchedule'].map((field) => (
                        <div key={field} className="space-y-2">
                            <Label htmlFor={field}>
                                {field === 'tirzepetidePlanPurchased' ? 'Plan Purchased' :
                                    field === 'tirzepetideVial' ? 'Vial' : 'Dosing Schedule'}
                            </Label>
                            <Select
                                value={formData[field]}
                                onValueChange={(value) => handleSelectChange(field, value)}
                            >
                                <SelectTrigger id={field} className="w-full">
                                    <SelectValue placeholder={
                                        field === 'tirzepetideDosingSchedule' ?
                                            'Select dosing schedule' : 'Select option'
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    {field === 'tirzepetideDosingSchedule' ? (
                                        <>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="biweekly">Biweekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </>
                                    ) : field === 'tirzepetideVial' ? (
                                        <>
                                            <SelectItem value="vial1">Vial 1</SelectItem>
                                            <SelectItem value="vial2">Vial 2</SelectItem>
                                            <SelectItem value="vial3">Vial 3</SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value="plan1">Plan 1</SelectItem>
                                            <SelectItem value="plan2">Plan 2</SelectItem>
                                            <SelectItem value="plan3">Plan 3</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </div>

                {/* Comments Section */}
                <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-white">
                    <div className="space-y-2">
                        <Label htmlFor="providerComments">Enter your questions or comments</Label>
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
                    {/* In your image upload section */}

                    {images.map((imageUrl, index) => (
                        <div key={index} className="relative group w-[200px] h-48">
                            {imageUrl ? (
                                <>
                                    <Image
                                        src={imageUrl}
                                        alt={`Preview ${index + 1}`}
                                        width={200}
                                        height={192}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    {/* ... buttons ... */}

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
                                <div className="relative w-full h-full">
                                    <button
                                        type="button"
                                        onClick={() => triggerFileInput(index)}
                                        className="w-full h-full text-sm px-4 py-3 font-bold bg-secondary border border-black text-white rounded-lg focus:outline-none focus:border-purple-400"
                                    >
                                        Upload Image
                                    </button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={(el) => (fileInputRefs.current[index] = el)}
                                        onChange={(e) => handleFileChange(e, index)}
                                        className="hidden"
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                ref={(el) => (fileInputRefs.current[index] = el)}
                                onChange={(e) => handleFileChange(e, index)}
                                style={{ display: "none" }}
                            />
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

                {/* Provider Note Section */}
                <div className="w-full max-w-5xl mx-auto p-6 border rounded-xl shadow-sm bg-white">
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