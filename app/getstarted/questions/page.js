"use client";

import React, { useState } from "react";
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const segments = [
    'Let start with the Basic Information',
    'Address',
    'Vitals',
    'Medical History',
    'Diagnosis',
    'Weight Progress',
    'Weight Loss Medication',
    'GLP-1',
    'Semaglutide',
    'Tirzepatide',
    'Tirzepatide Details',
    'Comments',
    'Medication Selection'
];

const QuestionForm = () => {
    const [currentSegment, setCurrentSegment] = useState(0);

    const [formData, setFormData] = useState({
        authid: 'P00001',
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
        majorSurgeries: '',
        bariatricSurgery: '',
        thyroidCancerHistory: '',
        listAllMedication: '',
        allergyList: '',
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
        medicine: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextSegment = () => {
        if (currentSegment < segments.length - 1) {
            setCurrentSegment(currentSegment + 1);
        }
    };

    const prevSegment = () => {
        if (currentSegment > 0) {
            setCurrentSegment(currentSegment - 1);
        }
    };

    const progressValue = ((currentSegment + 1) / segments.length) * 100;

    const renderCurrentSegment = () => {
        switch (currentSegment) {
            case 0: // Basic Information
                return (
                    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Let&apos;s start with the Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="First Name"
                                    className="focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Last Name"
                                    className="focus-visible:ring-primary"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input
                                    type="date"
                                    id="dob"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    className="focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="sex">Gender</Label>
                                <Select
                                    value={formData.sex}
                                    onValueChange={(value) => handleSelectChange('sex', value)}
                                >
                                    <SelectTrigger id="sex" className="focus:ring-primary">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="height">Height</Label>
                                <Input
                                    id="height"
                                    name="height"
                                    value={formData.height}
                                    onChange={handleInputChange}
                                    placeholder="5'9"
                                    className="focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="weight">Weight (lbs)</Label>
                                <Input
                                    id="weight"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleInputChange}
                                    placeholder="214"
                                    className="focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="bmi">BMI</Label>
                                <Input
                                    id="bmi"
                                    name="bmi"
                                    value={formData.bmi}
                                    onChange={handleInputChange}
                                    placeholder="32"
                                    className="focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="glp1">GLP-1 Preference</Label>
                                <Select
                                    value={formData.glp1}
                                    onValueChange={(value) => handleSelectChange('glp1', value)}
                                >
                                    <SelectTrigger id="glp1" className="focus:ring-primary">
                                        <SelectValue placeholder="Select preference" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
                                        <SelectItem value="Semaglutide">Semaglutide</SelectItem>
                                        <SelectItem value="None">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="example@mail.com"
                                    className="focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="(555) 123-4567"
                                    className="focus-visible:ring-primary"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 1: // Address
                return (
                    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Address Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {['address1', 'address2', 'city', 'state', 'zip'].map((field) => (
                                <div
                                    key={field}
                                    className={`space-y-1.5 ${field === 'address1' ? 'md:col-span-2' :
                                            field === 'address2' ? 'md:col-span-2' : ''
                                        }`}
                                >
                                    <Label htmlFor={field}>
                                        {field === 'address1' ? 'Street Address' :
                                            field === 'address2' ? 'Address Line 2' :
                                                field === 'city' ? 'City' :
                                                    field === 'state' ? 'State/Province' : 'Postal Code'}
                                    </Label>
                                    <Input
                                        id={field}
                                        name={field}
                                        value={formData[field]}
                                        onChange={handleInputChange}
                                        placeholder={
                                            field === 'address1' ? '123 Main St' :
                                                field === 'address2' ? 'Apt, suite, or unit' :
                                                    field === 'city' ? 'e.g. New York' :
                                                        field === 'state' ? 'e.g. NY' : 'e.g. 10001'
                                        }
                                        className="focus-visible:ring-primary"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 2: // Vitals
                return (
                    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Vitals</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="bloodPressure">Blood Pressure</Label>
                                <Input
                                    id="bloodPressure"
                                    name="bloodPressure"
                                    value={formData.bloodPressure}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 120/80"
                                    className="focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="heartRate">Heart Rate</Label>
                                <Input
                                    id="heartRate"
                                    name="heartRate"
                                    value={formData.heartRate}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 72 bpm"
                                    className="focus-visible:ring-primary"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3: // Medical History
                return (
                    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Medical History</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {['takingMedication', 'medicineAllergy', 'majorSurgeries', 'bariatricSurgery', 'thyroidCancerHistory'].map((field) => (
                                <div key={field} className="space-y-1.5">
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
                                        <SelectTrigger id={field} className="focus:ring-primary">
                                            <SelectValue placeholder="Select option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                            <SelectItem value="None">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 gap-4 mt-4">
                            {['listAllMedication', 'allergyList', 'surgeryList', 'disqualifiers'].map((field) => (
                                <div key={field} className="space-y-1.5">
                                    <Label htmlFor={field}>
                                        {field === 'listAllMedication' ? 'List All Medication' :
                                            field === 'allergyList' ? 'Allergy List' :
                                                field === 'surgeryList' ? 'Surgery List' :
                                                    'Disqualifiers'}
                                    </Label>
                                    <Textarea
                                        id={field}
                                        name={field}
                                        value={formData[field]}
                                        onChange={handleInputChange}
                                        placeholder={
                                            field === 'listAllMedication' ? 'List known medication...' :
                                                field === 'allergyList' ? 'List known allergies...' :
                                                    field === 'surgeryList' ? 'List of major surgeries...' :
                                                        'Mention any disqualifiers...'
                                        }
                                        className="focus-visible:ring-primary"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 4: // Diagnosis
                return (
                    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Diagnosis</h3>
                        <div className="space-y-1.5">
                            <Label htmlFor="diagnosis">Diagnosis Notes</Label>
                            <Textarea
                                id="diagnosis"
                                name="diagnosis"
                                value={formData.diagnosis}
                                onChange={handleInputChange}
                                placeholder="Enter patient diagnosis, symptoms, or relevant notes..."
                                className="focus-visible:ring-primary"
                            />
                        </div>
                    </div>
                );

            case 5: // Weight Progress
                return (
                    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Weight Progress</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {['startingWeight', 'currentWeight', 'goalWeight', 'weightChange12m'].map((field) => (
                                <div key={field} className="space-y-1.5">
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
                                        className="focus-visible:ring-primary"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-1.5 mt-4">
                            <Label htmlFor="weightLossPrograms">Weight Loss Programs</Label>
                            <Textarea
                                id="weightLossPrograms"
                                name="weightLossPrograms"
                                value={formData.weightLossPrograms}
                                onChange={handleInputChange}
                                placeholder="List any previous or current weight loss programs..."
                                className="focus-visible:ring-primary"
                            />
                        </div>
                    </div>
                );

            case 6: // Weight Loss Medication
                return (
                    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Weight Loss Medication History</h3>
                        <div className="space-y-1.5">
                            <Label htmlFor="weightLossMeds12m">Weight Loss Medication (Last 12 Months)</Label>
                            <Textarea
                                id="weightLossMeds12m"
                                name="weightLossMeds12m"
                                value={formData.weightLossMeds12m}
                                onChange={handleInputChange}
                                placeholder="List any weight loss medications taken in the past 12 months..."
                                className="focus-visible:ring-primary"
                            />
                        </div>
                    </div>
                );

            case 7: // GLP-1
                return (
                    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">GLP-1 Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="glpTaken">GLP-1 Taken</Label>
                                <Input
                                    id="glpTaken"
                                    type="text"
                                    name="glpTaken"
                                    value={formData.glpTaken}
                                    onChange={handleInputChange}
                                    placeholder="Enter value"
                                    className="focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="glpRecentInjection">Date of last Injection</Label>
                                <Input
                                    type="date"
                                    id="glpRecentInjection"
                                    name="glpRecentInjection"
                                    value={formData.glpRecentInjection}
                                    onChange={handleInputChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="focus-visible:ring-primary w-full"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 8: // Semaglutide
                return (
                    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Semaglutide Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['semaglutideLastDose', 'semaglutideRequestedDose'].map((field) => (
                                <div key={field} className="space-y-1.5">
                                    <Label htmlFor={field}>
                                        {field === 'semaglutideLastDose' ? 'Last Dose' : 'Requested Dose'}
                                    </Label>
                                    <Input
                                        id={field}
                                        name={field}
                                        type="text"
                                        value={formData[field]}
                                        onChange={handleInputChange}
                                        placeholder="Enter dose"
                                        className="focus-visible:ring-primary"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 9: // Tirzepatide
                return (
                    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Tirzepatide Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['tirzepetideLastDose', 'tirzepetideRequestedDose'].map((field) => (
                                <div key={field} className="space-y-1.5">
                                    <Label htmlFor={field}>
                                        {field === 'tirzepetideLastDose' ? 'Last Dose' : 'Requested Dose'}
                                    </Label>
                                    <Input
                                        id={field}
                                        name={field}
                                        type="text"
                                        value={formData[field]}
                                        onChange={handleInputChange}
                                        placeholder="Enter dose"
                                        className="focus-visible:ring-primary"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 10: // Tirzepatide Details
                return (
                    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Tirzepatide Additional Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['tirzepetidePlanPurchased', 'tirzepetideVial'].map((field) => (
                                <div key={field} className="space-y-1.5">
                                    <Label htmlFor={field}>
                                        {field === 'tirzepetidePlanPurchased' ? 'Plan Purchased' : 'Vial'}
                                    </Label>
                                    <Input
                                        id={field}
                                        name={field}
                                        type="text"
                                        value={formData[field]}
                                        onChange={handleInputChange}
                                        placeholder={`Enter ${field === 'tirzepetidePlanPurchased' ? 'plan' : 'vial'}`}
                                        className="focus-visible:ring-primary"
                                    />
                                </div>
                            ))}
                            <div className="space-y-1.5">
                                <Label htmlFor="tirzepetideDosingSchedule">Dosing Schedule</Label>
                                <Select
                                    value={formData.tirzepetideDosingSchedule}
                                    onValueChange={(value) => handleSelectChange('tirzepetideDosingSchedule', value)}
                                >
                                    <SelectTrigger id="tirzepetideDosingSchedule" className="focus:ring-primary">
                                        <SelectValue placeholder="Select dosing schedule" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="biweekly">Biweekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="None">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );

            case 11: // Comments
                return (
                    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Additional Comments</h3>
                        <div className="space-y-1.5">
                            <Label htmlFor="providerComments">
                                Questions or Notes for Provider
                            </Label>
                            <Textarea
                                id="providerComments"
                                name="providerComments"
                                value={formData.providerComments}
                                onChange={handleInputChange}
                                placeholder="Enter any additional questions, notes, or special requests..."
                                className="focus-visible:ring-primary min-h-[120px]"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                This information will be shared directly with your healthcare provider.
                            </p>
                        </div>
                    </div>
                );

            case 12: // Medication Selection
                return (
                    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Medication Selection</h3>
                        <div className="space-y-1.5">
                            <Label htmlFor="medicine">Medication</Label>
                            <Select
                                value={formData.medicine}
                                onValueChange={(value) => handleSelectChange('medicine', value)}
                            >
                                <SelectTrigger id="medicine" className="focus:ring-primary">
                                    <SelectValue placeholder="Select medication" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Semaglutide">Semaglutide</SelectItem>
                                    <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl flex flex-col min-h-screen">
            <div className="flex-grow">
                <h1 className="font-tagesschrift text-center text-6xl mb-2 text-secondary font-bold">somi</h1>
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">
                            {currentSegment + 1} of {segments.length} segments
                        </span>
                        <span className="text-sm font-medium">
                            {Math.round(progressValue)}% complete
                        </span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                </div>

                <div className="mb-8">
                    {renderCurrentSegment()}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-4 shadow-sm">
                <div className="container mx-auto max-w-6xl px-6">
                    <div className="flex justify-between">
                        <button
                            onClick={prevSegment}
                            disabled={currentSegment === 0}
                            className={`px-4 py-2 rounded-2xl ${currentSegment === 0 ? 'bg-gray-200 cursor-not-allowed' : 'bg-secondary text-white hover:bg-secondary'}`}
                        >
                            Previous
                        </button>

                        {currentSegment < segments.length - 1 ? (
                            <button
                                onClick={nextSegment}
                                className="px-4 py-2 bg-secondary rounded-2xl text-white hover:bg-secondary"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                onClick={() => console.log('Form submitted', formData)}
                                className="px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600"
                            >
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionForm;