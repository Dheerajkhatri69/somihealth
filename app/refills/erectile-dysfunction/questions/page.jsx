"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const formSchema = z
    .object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        phone: z.string().min(1, "Phone number is required"),
        email: z.string().email("Invalid email address"),
        edApproved: z.enum(['yes', 'no'], { required_error: "Please select an option", invalid_type_error: "Please select an option" }),
        medicalChanges: z.enum(['yes', 'no'], { required_error: "Please select an option", invalid_type_error: "Please select an option" }),
        medicalChangesDetail: z.string().optional(),
        currentMedication: z.string().min(1, "Please select your current medication"),
        currentDose: z.string().min(1, "Please select your current dose"),
        sideEffects: z.enum(['yes', 'no'], { required_error: "Please select an option", invalid_type_error: "Please select an option" }),
        sideEffectsDetail: z.string().optional(),
        happyWithMed: z.enum(['yes', 'no'], { required_error: "Please select an option", invalid_type_error: "Please select an option" }),
        happyWithMedDetail: z.string().optional(),
        medicationDecision: z.string({ required_error: "Please select an option", invalid_type_error: "Please select an option" }).min(1, "Please select an option"),
        changeSelection: z.string().optional(),
        providerNotes: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        // Medical changes detail validation (only if yes is selected)
        if (data.medicalChanges === 'yes' && (!data.medicalChangesDetail || data.medicalChangesDetail.trim() === '')) {
            ctx.addIssue({
                path: ['medicalChangesDetail'],
                code: z.ZodIssueCode.custom,
                message: 'Please describe the changes in your medications or medical history',
            });
        }

        // Side effects detail validation (only if yes is selected)
        if (data.sideEffects === 'yes' && (!data.sideEffectsDetail || data.sideEffectsDetail.trim() === '')) {
            ctx.addIssue({
                path: ['sideEffectsDetail'],
                code: z.ZodIssueCode.custom,
                message: 'Please describe your side effects',
            });
        }

        // Happy with medication detail validation (only if no is selected)
        if (data.happyWithMed === 'no' && (!data.happyWithMedDetail || data.happyWithMedDetail.trim() === '')) {
            ctx.addIssue({
                path: ['happyWithMedDetail'],
                code: z.ZodIssueCode.custom,
                message: 'Please tell us why you are not happy with your current medication',
            });
        }

        // Change selection validation (only required if medicationDecision is not "continue")
        if (data.medicationDecision !== 'continue' && (!data.changeSelection || data.changeSelection.trim() === '')) {
            ctx.addIssue({
                path: ['changeSelection'],
                code: z.ZodIssueCode.custom,
                message: 'Please make a selection',
            });
        }
    });

const segments = [
    'edApprovalCheck',
    'personal',
    'medicalChanges',
    'currentMedication',
    'sideEffects',
    'happyWithMed',
    'medicationDecision',
    'changeSelection',
    'providerNotes'
];

const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${progress}%` }} />
    </div>
);

// Medication options
const medicationOptions = {
    'Sildenafil (Generic of Viagra)': ['25mg', '50mg', '100mg'],
    'Tadalafil (Generic of Cialis)': ['5mg', '10mg', '20mg'],
    'Mini Troches (Tadalafil/Sildenafil)': ['5/35mg', '10/40mg']
};

// All change options as specified
const allChangeOptions = [
    'Switch to Tadalafil 5mg',
    'Switch to Tadalafil 10mg',
    'Switch to Tadalafil 20mg',
    'Switch to Sildenafil 25mg',
    'Switch to Sildenafil 50mg',
    'Switch to Sildenafil 100mg',
    'Switch to Mini Troches 5/35mg',
    'Switch to Mini Troches 10/40mg',
    'Decrease dose Tadalafil 5mg',
    'Decrease dose Tadalafil 10mg',
    'Decrease dose Tadalafil 20mg',
    'Increase dose Tadalafil 5mg',
    'Increase dose Tadalafil 10mg',
    'Increase dose Tadalafil 20mg',
    'Decrease dose Sildenafil 25mg',
    'Decrease dose Sildenafil 50mg',
    'Decrease dose Sildenafil 100mg',
    'Increase dose Sildenafil 25mg',
    'Increase dose Sildenafil 50mg',
    'Increase dose Sildenafil 100mg',
    'Decrease dose Mini Troches 5/35mg',
    'Decrease dose Mini Troches 10/40mg',
    'Increase dose Mini Troches 5/35mg',
    'Increase dose Mini Troches 10/40mg'
];

// Filter change options based on decision
const getChangeOptions = (medicationDecision, currentMedication, currentDose) => {
    if (medicationDecision === 'change') {
        return allChangeOptions.filter(option => option.startsWith('Switch to'));
    } else if (medicationDecision === 'increase') {
        return allChangeOptions.filter(option => option.startsWith('Increase dose'));
    } else if (medicationDecision === 'decrease') {
        return allChangeOptions.filter(option => option.startsWith('Decrease dose'));
    }
    return [];
};

export default function EDRefillForm() {
    const [currentSegment, setCurrentSegment] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showIneligible, setShowIneligible] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const [userSessionId, setUserSessionId] = useState("");
    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: zodResolver(formSchema),
        mode: 'onChange'
    });

    const edApproved = watch('edApproved');
    const medicalChanges = watch('medicalChanges');
    const currentMedication = watch('currentMedication');
    const currentDose = watch('currentDose');
    const sideEffects = watch('sideEffects');
    const happyWithMed = watch('happyWithMed');
    const medicationDecision = watch('medicationDecision');

    // Get change options based on current selections
    const changeOptions = getChangeOptions(medicationDecision, currentMedication, currentDose);

    // Define segmentFieldMap inside the component where watch() is available
    const segmentFieldMap = {
        personal: ["firstName", "lastName", "phone", "email"],
        edApprovalCheck: ["edApproved"],
        medicalChanges: ["medicalChanges"],
        currentMedication: ["currentMedication", "currentDose"],
        sideEffects: ["sideEffects"],
        happyWithMed: ["happyWithMed"],
        medicationDecision: ["medicationDecision"],
        changeSelection: medicationDecision !== 'continue' ? ["changeSelection"] : [],
        providerNotes: ["providerNotes"],
    };

    // Validate conditional textarea fields separately
    const validateConditionalFields = async (segmentKey) => {
        const fields = segmentFieldMap[segmentKey] || [];
        let isValid = true;

        // Check each field for errors
        for (const field of fields) {
            const result = await trigger(field);
            if (!result) isValid = false;
        }

        // Check conditional textarea fields
        if (segmentKey === 'medicalChanges' && medicalChanges === 'yes') {
            const result = await trigger('medicalChangesDetail');
            if (!result) isValid = false;
        }

        if (segmentKey === 'sideEffects' && sideEffects === 'yes') {
            const result = await trigger('sideEffectsDetail');
            if (!result) isValid = false;
        }

        if (segmentKey === 'happyWithMed' && happyWithMed === 'no') {
            const result = await trigger('happyWithMedDetail');
            if (!result) isValid = false;
        }

        return isValid;
    };

    // Generate session ID once
    useEffect(() => {
        let id = localStorage.getItem("edRefillsUserSessionId");
        if (!id) {
            id = `EDREFILL-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            localStorage.setItem("edRefillsUserSessionId", id);
        }
        setUserSessionId(id);
    }, []);

    // Extract watched values OUTSIDE the useEffect
    const firstName = watch("firstName");
    const lastName = watch("lastName");
    const phone = watch("phone");
    const email = watch("email");

    // Track abandonment on segment change
    useEffect(() => {
        if (!userSessionId) return;

        const currentData = {
            firstName,
            lastName,
            phone,
            email,
        };

        const segmentNames = {
            'edApprovalCheck': 'ED Approval Check',
            'personal': 'Personal Information',
            'medicalChanges': 'Medical Changes',
            'currentMedication': 'Current Medication',
            'sideEffects': 'Side Effects',
            'happyWithMed': 'Happy with Medication',
            'medicationDecision': 'Medication Decision',
            'changeSelection': 'Change Selection',
            'providerNotes': 'Provider Notes'
        };

        const question = segmentNames[segments[currentSegment]] || "";

        const payload = {
            userSessionId,
            firstSegment: currentData,
            lastSegmentReached: currentSegment,
            state: 0,
            question,
            timestamp: new Date().toISOString(),
        };

        fetch("/api/ed-refill-abandonment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).catch(err => console.error("Abandonment update failed:", err));

    }, [currentSegment, firstName, lastName, phone, email, userSessionId]);

    const onSubmit = async (data) => {
        const isValid = await trigger();
        if (!isValid) {
            // Find the first segment with an error and navigate to it
            for (let i = 0; i < segments.length; i++) {
                const segmentKey = segments[i];
                const fields = segmentFieldMap[segmentKey];
                let segmentHasError = false; // Changed from const to let

                // Check fields errors
                if (fields) {
                    segmentHasError = fields.some(field => errors[field]);
                }

                // Also check conditional textarea errors
                if (segmentKey === 'medicalChanges' && medicalChanges === 'yes' && errors.medicalChangesDetail) {
                    segmentHasError = true;
                }
                if (segmentKey === 'sideEffects' && sideEffects === 'yes' && errors.sideEffectsDetail) {
                    segmentHasError = true;
                }
                if (segmentKey === 'happyWithMed' && happyWithMed === 'no' && errors.happyWithMedDetail) {
                    segmentHasError = true;
                }

                if (segmentHasError) {
                    setCurrentSegment(i);
                    break;
                }
            }
            return;
        }

        setIsSubmitting(true);
        setSubmissionStatus(null);

        try {
            const submissionData = {
                ...data,
                authid: `EDREF${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
                userSessionId,
            };

            const response = await fetch('/api/ed-refill-questionnaire', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to submit form');
            }

            // Track form completion
            if (userSessionId) {
                const currentData = {
                    firstName: watch("firstName"),
                    lastName: watch("lastName"),
                    phone: watch("phone"),
                    email: watch("email"),
                };

                fetch("/api/ed-refill-abandonment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userSessionId,
                        firstSegment: currentData,
                        lastSegmentReached: currentSegment,
                        state: 2,            // FORM COMPLETED
                        question: "Form Submitted",
                        timestamp: new Date().toISOString(),
                    }),
                });

                localStorage.removeItem("edRefillsUserSessionId");
                setUserSessionId("");
            }

            setSubmissionStatus('success');
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmissionStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const progress = Math.round(((currentSegment) / (segments.length - 1)) * 100);

    const goToNextSegment = async () => {
        const segmentKey = segments[currentSegment];

        // Validate current segment
        const isValid = await validateConditionalFields(segmentKey);
        if (!isValid) return;

        // Ineligible logic
        if (segmentKey === 'edApprovalCheck' && edApproved === 'no') {
            // Track ineligible state
            const currentData = { firstName, lastName, phone, email };
            fetch("/api/ed-refill-abandonment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userSessionId,
                    firstSegment: currentData,
                    lastSegmentReached: currentSegment,
                    state: 1, // INELIGIBLE
                    question: "ED Approval Check",
                    timestamp: new Date().toISOString(),
                }),
            }).catch((err) => console.error("Ineligible abandonment failed:", err));

            setShowIneligible(true);
            return;
        }

        // Skip changeSelection segment if decision is "continue"
        if (segmentKey === 'medicationDecision' && medicationDecision === 'continue') {
            setCurrentSegment(currentSegment + 2); // Skip changeSelection segment
            return;
        }

        if (currentSegment < segments.length - 1) {
            setCurrentSegment((prev) => prev + 1);
        }
    };

    const goToPreviousSegment = () => {
        // Handle going back from providerNotes when decision was "continue"
        if (currentSegment === segments.length - 1 && medicationDecision === 'continue') {
            setCurrentSegment(currentSegment - 2); // Go back to medicationDecision
            return;
        }

        if (currentSegment > 0) {
            setCurrentSegment((prev) => prev - 1);
        }
    };

    if (submissionStatus === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 font-SofiaSans">
                <div className="w-full max-w-md mx-auto bg-white p-2 rounded-xl shadow-lg flex flex-col items-center">
                    <div className="font-tagesschrift text-center text-4xl -mb-4 md:text-6xl text-secondary font-bold">somi</div>
                    <div className="space-y-2 p-4">

                        <div className="relative w-[420px] h-[300px] mx-auto">
                            <Image
                                src="https://res.cloudinary.com/dvmbfolrm/image/upload/v1764026405/fileUploader/b2cblfpp9vb4qwp3ac9g.jpg"
                                alt="Longevity"
                                fill
                                className="rounded-xl object-cover"
                                priority
                            />
                        </div>
                        <h3 className="text-lg md:text-x text-center text-black font-semibold">
                            Thank you for refilling your ED prescription with Somi
                        </h3>
                        <p className="text-gray-600 text-center">
                            We truly appreciate your trust and look forward to continuing to support your health.
                        </p>
                    </div>
                    <Button
                        onClick={() => { window.location.href = 'https://joinsomi.com/'; }}
                        className="bg-secondary text-white hover:bg-secondary rounded-2xl font-bold text-lg mb-4 px-8 w-[120px]"
                    >
                        End
                    </Button>
                </div>
            </div>
        );
    }

    if (showIneligible) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] font-SofiaSans">
                <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
                    <div className="font-tagesschrift text-center text-6xl mb-2 text-secondary font-bold">somi</div>
                    <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">
                        It looks like you are a new patient based on the information provided. Please click &quot;Get Started&quot; to complete your ED intake form.
                    </h2>
                    <Link href="/getstarted/erectile-dysfunction">
                        <Button
                            variant="outline"
                            className="bg-secondary text-white hover:text-white hover:bg-secondary rounded-2xl"
                        >
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-[500px] flex flex-col min-h-screen font-SofiaSans">
            <div className="fixed top-0 left-0 w-full bg-white z-40">
                <div className="max-w-[500px] mx-auto flex flex-col items-center">
                    <div className="font-tagesschrift text-center text-6xl mt-2 mb-2 text-secondary font-bold">somi</div>
                    <div className="w-full px-6">
                        <ProgressBar progress={progress} />
                        <div className="text-right text-sm text-gray-600 mb-2">{progress}% Complete</div>
                    </div>
                </div>
            </div>
            <div style={{ paddingTop: '120px' }}>
                {isSubmitting && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
                            <p className="text-lg font-medium text-gray-700">Submitting your information...</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6 bg-white rounded-xl border border-gray-200 shadow-secondary shadow-2xl">
                    {/* Question 1: ED Approval Check */}
                    {currentSegment === 0 && (
                        <>
                            <Label>
                                Have you been approved for Sildenafil, Tadalafil or Mini Troches within the last 6 months by a Somi Health Provider? <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2 flex-col items-center">
                                {['yes', 'no'].map((option) => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('edApproved')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[100px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${edApproved === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option.toUpperCase()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.edApproved && <p className="text-sm text-red-500">{errors.edApproved.message}</p>}
                        </>
                    )}

                    {/* Question 2: Personal Information */}
                    {currentSegment === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-l font-semibold">Please provide your information <span className="text-red-500">*</span></h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">
                                        First name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="firstName" {...register('firstName')} />
                                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">
                                        Last name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="lastName" {...register('lastName')} />
                                    {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    Phone number <span className="text-red-500">*</span>
                                </Label>
                                <Input id="phone" type="tel" {...register('phone')} />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <Input id="email" type="email" {...register('email')} />
                                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                            </div>
                        </div>
                    )}

                    {/* Question 3: Medical Changes */}
                    {currentSegment === 2 && (
                        <>
                            <Label>
                                Any changes with your medications or medical history since your last visit? <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2 flex-col items-center">
                                {['yes', 'no'].map((option) => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('medicalChanges')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[100px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${medicalChanges === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option.toUpperCase()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.medicalChanges && <p className="text-sm text-red-500">{errors.medicalChanges.message}</p>}

                            {medicalChanges === 'yes' && (
                                <div className="mt-4 space-y-2">
                                    <Label htmlFor="medicalChangesDetail">Please describe the changes: <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        id="medicalChangesDetail"
                                        {...register('medicalChangesDetail')}
                                        placeholder="Type your answer here..."
                                        rows={3}
                                    />
                                    {errors.medicalChangesDetail && <p className="text-sm text-red-500">{errors.medicalChangesDetail.message}</p>}
                                </div>
                            )}
                        </>
                    )}

                    {/* Question 4: Current Medication (Updated to use button-style design) */}
                    {currentSegment === 3 && (
                        <div className="space-y-4">
                            <Label>
                                Which ED medication are you currently taking? <span className="text-red-500">*</span>
                            </Label>

                            {/* Medication selection - using button-style design */}
                            <div className="space-y-4">
                                {Object.entries(medicationOptions).map(([medication, doses]) => (
                                    <div key={medication} className="space-y-3">
                                        {/* Medication option as button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setValue('currentMedication', medication);
                                                setValue('currentDose', ''); // Reset dose when changing medication
                                            }}
                                            className={`w-full flex items-center max-w-[240px] justify-start px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${currentMedication === medication ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <span className="text-sm font-medium">{medication}</span>
                                        </button>

                                        {/* Show doses only if this medication is selected */}
                                        {currentMedication === medication && (
                                            <div className="ml-4 space-y-2">
                                                <Label className="text-sm text-gray-600">Select your current dose:</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {doses.map((dose) => (
                                                        <button
                                                            key={dose}
                                                            type="button"
                                                            onClick={() => setValue('currentDose', dose)}
                                                            className={`flex items-center text-sm justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${currentDose === dose ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                                        >
                                                            {dose}
                                                        </button>
                                                    ))}
                                                </div>
                                                {errors.currentDose && <p className="text-sm text-red-500">{errors.currentDose.message}</p>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {errors.currentMedication && <p className="text-sm text-red-500">{errors.currentMedication.message}</p>}
                        </div>
                    )}

                    {/* Question 5: Side Effects */}
                    {currentSegment === 4 && (
                        <>
                            <Label>
                                Are you currently experiencing any side effects? <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2 flex-col items-center">
                                {['yes', 'no'].map((option) => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('sideEffects')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[100px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${sideEffects === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option.toUpperCase()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.sideEffects && <p className="text-sm text-red-500">{errors.sideEffects.message}</p>}

                            {sideEffects === 'yes' && (
                                <div className="mt-4 space-y-2">
                                    <Label htmlFor="sideEffectsDetail">Please describe your side effects: <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        id="sideEffectsDetail"
                                        {...register('sideEffectsDetail')}
                                        placeholder="Type your answer here..."
                                        rows={3}
                                    />
                                    {errors.sideEffectsDetail && <p className="text-sm text-red-500">{errors.sideEffectsDetail.message}</p>}
                                </div>
                            )}
                        </>
                    )}

                    {/* Question 6: Happy with Medication */}
                    {currentSegment === 5 && (
                        <>
                            <Label>
                                Are you happy with your current ED medication? <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2 flex-col items-center">
                                {['yes', 'no'].map((option) => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('happyWithMed')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[100px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${happyWithMed === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option.toUpperCase()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.happyWithMed && <p className="text-sm text-red-500">{errors.happyWithMed.message}</p>}

                            {happyWithMed === 'no' && (
                                <div className="mt-4 space-y-2">
                                    <Label htmlFor="happyWithMedDetail">Please tell us why: <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        id="happyWithMedDetail"
                                        {...register('happyWithMedDetail')}
                                        placeholder="Type your answer here..."
                                        rows={3}
                                    />
                                    {errors.happyWithMedDetail && <p className="text-sm text-red-500">{errors.happyWithMedDetail.message}</p>}
                                </div>
                            )}
                        </>
                    )}

                    {/* Question 7: Medication Decision */}
                    {currentSegment === 6 && (
                        <>
                            <Label>
                                Do you want to: <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex flex-col gap-2">
                                {['continue', 'change', 'increase', 'decrease'].map((option) => {
                                    const labels = {
                                        continue: 'Continue current ED medication and dose',
                                        change: 'Change ED medication',
                                        increase: 'Increase dose',
                                        decrease: 'Decrease dose'
                                    };

                                    return (
                                        <label key={option} className="radio-style">
                                            <input
                                                type="radio"
                                                value={option}
                                                {...register('medicationDecision')}
                                                className="hidden"
                                            />
                                            <span className={`flex items-center text-sm justify-start max-w-[300px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${medicationDecision === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                                {labels[option]}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.medicationDecision && <p className="text-sm text-red-500">{errors.medicationDecision.message}</p>}
                        </>
                    )}

                    {/* Question 8: Change Selection (only shown if decision is not "continue") */}
                    {currentSegment === 7 && medicationDecision !== 'continue' && (
                        <>
                            <Label>
                                Please select: <span className="text-red-500">*</span>
                            </Label>
                            <div className="space-y-2 max-h-[400px] pr-2">
                                {changeOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setValue('changeSelection', option)}
                                        className={`w-full flex items-center max-w-[270px] justify-start px-4 py-3 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('changeSelection') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                    >
                                        <span className="text-sm">{option}</span>
                                    </button>
                                ))}
                            </div>
                            {errors.changeSelection && <p className="text-sm text-red-500">{errors.changeSelection.message}</p>}
                        </>
                    )}

                    {/* Question 9: Provider Notes */}
                    {currentSegment === 8 || (currentSegment === 7 && medicationDecision === 'continue') ? (
                        <div className="space-y-2">
                            <Label htmlFor="providerNotes">
                                {medicationDecision === 'continue' ? '8.' : '9.'} Any questions or concerns for your provider?
                            </Label>
                            <Textarea
                                id="providerNotes"
                                {...register('providerNotes')}
                                placeholder="Type your questions or concerns here..."
                                rows={4}
                            />
                        </div>
                    ) : null}

                    {/* Navigation */}
                    <div className={`flex pt-4 ${currentSegment === 0 ? 'justify-end' : 'justify-between'}`}>
                        {currentSegment > 0 && (
                            <Button
                                type="button"
                                onClick={goToPreviousSegment}
                                className="bg-secondary text-white rounded-2xl"
                            >
                                Previous
                            </Button>
                        )}
                        {currentSegment < segments.length - 1 || (currentSegment === 7 && medicationDecision === 'continue') ? (
                            <Button
                                type="button"
                                onClick={goToNextSegment}
                                className="bg-secondary text-white rounded-2xl"
                            >
                                Continue
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit(onSubmit)}
                                className="bg-secondary text-white rounded-2xl"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        )}
                    </div>
                    {submissionStatus === 'error' && (
                        <p className="text-sm text-red-500 text-center mt-4">
                            There was an error submitting your form. Please try again.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}