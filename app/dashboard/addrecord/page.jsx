"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PatientForm() {
    const [patientId] = useState(() => {
        const randomNum = Math.floor(Math.random() * 1000);
        return `P${randomNum.toString().padStart(3, '0')}`;
    });

    const [formData, setFormData] = useState({
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
        semaglutideUnit: 'mg',
        tirzepatideDose: '',
        tirzepatideUnit: 'mg',
        providerNote: ''
    });
    const [userType, setUserType] = useState('')

    useEffect(() => {
        const storedUserType = localStorage.getItem('userType')
        if (storedUserType) setUserType(storedUserType)
    }, [])
    const [images, setImages] = useState([
        { file: null, preview: null },
        { file: null, preview: null },
        { file: null, preview: null },
    ]);

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setImages(prev => prev.map((img, i) => i === index ? { file, preview } : img));
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.map((img, i) => i === index ? { file: null, preview: null } : img));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = {
            patientId,
            ...formData,
            images: images.map(img => ({
                preview: img.preview,
                file: img.file ? {
                    name: img.file.name,
                    type: img.file.type,
                    size: img.file.size
                } : null
            }))
        };
        console.log('Patient Data:', submissionData);
    };

    return (
        <div className="mb-4 p-4">
            <form onSubmit={handleSubmit} className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Patient Registration</h2>
                    <div className="space-y-2">
                        <Label>Patient ID</Label>
                        <Input value={patientId} readOnly className="font-mono w-32" />
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
                    </div>
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
                <div className="grid grid-cols-3 gap-4">
                    {images.map((image, index) => (
                        <div key={index} className="relative group">
                            <label className="block w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageChange(index, e)}
                                />
                                {image.preview ? (
                                    <img
                                        src={image.preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <span>Click to upload</span>
                                    </div>
                                )}
                            </label>
                            {image.preview && (
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove image"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 gap-6 p-6 border rounded-xl shadow-sm bg-white">

                    {(userType === 'admin' || userType === 'clinician') && (
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
                                    <SelectItem value="0.25">0.25</SelectItem>
                                    <SelectItem value="0.50">0.50</SelectItem>
                                    <SelectItem value="1.00">1.00</SelectItem>
                                    <SelectItem value="1.7">1.7</SelectItem>
                                    <SelectItem value="2.00">2.00</SelectItem>
                                    <SelectItem value="2.5">2.5</SelectItem>
                                    <SelectItem value="4.00">4.00</SelectItem>
                                    <SelectItem value="6.80">6.80</SelectItem>
                                    <SelectItem value="10.00">10.00</SelectItem>
                                    <SelectItem value="15.00">15.00</SelectItem>
                                    <SelectItem value="20.00">20.00</SelectItem>
                                    <SelectItem value="25.00">25.00</SelectItem>
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
                                    <SelectItem value="mg">mg</SelectItem>
                                    <SelectItem value="mg/ml">mg/mL</SelectItem>
                                    <SelectItem value="mg/2ml">mg/2mL</SelectItem>
                                    <SelectItem value="mg/3ml">mg/3mL</SelectItem>
                                    <SelectItem value="mg/4ml">mg/4mL</SelectItem>
                                    <SelectItem value="mg/5ml">mg/5mL</SelectItem>
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
                                    <SelectItem value="10.00">10.00</SelectItem>
                                    <SelectItem value="20.00">20.00</SelectItem>
                                    <SelectItem value="30.00">30.00</SelectItem>
                                    <SelectItem value="40.00">40.00</SelectItem>
                                    <SelectItem value="50.00">50.00</SelectItem>
                                    <SelectItem value="60.00">60.00</SelectItem>
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
                                    <SelectItem value="mg/2ml">mg/2mL</SelectItem>
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
        </div>
    );
}