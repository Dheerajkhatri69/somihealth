"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const formSchema = z
    .object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        phone: z.string().min(1, "Phone number is required"),
        email: z.string().email("Invalid email address"),
        glp1Approved: z.enum(['yes', 'no'], { required_error: "Please select an option" }),
        currentWeight: z.string().min(1, "Current weight is required"),
        medicationChanges: z.string().min(1, "Please provide information about medication changes"),
        glp1Preference: z.string().min(1, "Please select your current medication"),
        sideEffects: z.enum(['yes', 'no'], { required_error: "Please select an option" }),
        sideEffectsDetail: z.string().optional(),
        happyWithMed: z.enum(['yes', 'no'], { required_error: "Please select an option" }),
        dosageDecision: z.string().optional(),
        dosageNote: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.sideEffects === 'yes' && (!data.sideEffectsDetail || data.sideEffectsDetail.trim() === '')) {
            ctx.addIssue({
                path: ['sideEffectsDetail'],
                code: z.ZodIssueCode.custom,
                message: 'Please describe your side effects',
            });
        }

        if (data.happyWithMed === 'yes' && data.dosageDecision && !['keep the same dosage', 'increase my dosage'].includes(data.dosageDecision)) {
            ctx.addIssue({
                path: ['dosageDecision'],
                code: z.ZodIssueCode.custom,
                message: 'Please select a valid option for your current medication satisfaction',
            });
        }

        if (data.happyWithMed === 'no' && data.dosageDecision && !['Change to Semaglutide', 'Change to Tirzepatide', 'Increase my current dose', 'Decrease my current dose'].includes(data.dosageDecision)) {
            ctx.addIssue({
                path: ['dosageDecision'],
                code: z.ZodIssueCode.custom,
                message: 'Please select a valid option for your current medication dissatisfaction',
            });
        }
    });

const segments = [
    'glp1ApprovalCheck',
    'personal',
    'weight',
    'medicationChanges',
    'glp1Preference',
    'sideEffects',
    'happyWithMed',
    'dosageDecision',
    'dosageNote'
];
// Add this after segments array
const segmentNames = {
    0: 'glp1ApprovalCheck',
    1: 'personal',
    2: 'weight',
    3: 'medicationChanges',
    4: 'glp1Preference',
    5: 'sideEffects',
    6: 'happyWithMed',
    7: 'dosageDecision',
    8: 'dosageNote'
};

const segmentDisplayNames = {
    0: 'GLP-1 Approval Check',
    1: 'Personal Information',
    2: 'Current Weight',
    3: 'Medication Changes',
    4: 'GLP-1 Preference',
    5: 'Side Effects',
    6: 'Medication Satisfaction',
    7: 'Dosage Decision',
    8: 'Provider Notes'
};
const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${progress}%` }} />
    </div>
);

export default function PatientRegistrationForm() {
    const [currentSegment, setCurrentSegment] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showIneligible, setShowIneligible] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const [userSessionId, setUserSessionId] = useState("");
    const [previousBasicData, setPreviousBasicData] = useState(null);
    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
        mode: 'onChange'
    });

    const glp1Approved = watch('glp1Approved');
    const sideEffects = watch('sideEffects');
    const happyWithMed = watch('happyWithMed');
    const dosageDecision = watch('dosageDecision');
    const glp1Preference = watch('glp1Preference');

    // Define segmentFieldMap inside the component where watch() is available
    const segmentFieldMap = {
        personal: ["firstName", "lastName", "phone", "email"],
        glp1ApprovalCheck: ["glp1Approved"],
        weight: ["currentWeight"],
        medicationChanges: ["medicationChanges"],
        glp1Preference: ["glp1Preference"],
        sideEffects: sideEffects === 'yes' ? ["sideEffects", "sideEffectsDetail"] : ["sideEffects"],
        happyWithMed: ["happyWithMed"],
        dosageDecision: ["dosageDecision"],
        dosageNote: ["dosageNote"],
    };

    // Generate session ID once
    useEffect(() => {
        let id = localStorage.getItem("refillsUserSessionId");
        if (!id) {
            id = `REFILL-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            localStorage.setItem("refillsUserSessionId", id);
        }
        setUserSessionId(id);
    }, []);
    // Extract watched values OUTSIDE the useEffect
    const firstName = watch("firstName");
    const lastName = watch("lastName");
    const phone = watch("phone");
    const email = watch("email");
    const currentQuestion = segments[currentSegment] || "";


    // Fix the useEffect that tracks abandonment
    useEffect(() => {
        if (!userSessionId) return;

        // Get current form values
        const formValues = watch();

        // Create currentData with proper field names matching your schema
        const currentData = {
            firstName: formValues.firstName || "",
            lastName: formValues.lastName || "",
            phone: formValues.phone || "",
            email: formValues.email || "",
        };

        // Get the segment name based on currentSegment
        const segmentName = segmentNames[currentSegment] || "unknown";
        const segmentDisplayName = segmentDisplayNames[currentSegment] || "Unknown Segment";

        fetch("/api/followup/abandoned", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userSessionId,
                firstSegment: currentData,
                lastSegmentReached: currentSegment,
                state: 0, // Default state for abandonment
                question: segmentDisplayName, // Use display name
                timestamp: new Date().toISOString(),
            }),
        }).catch((err) => console.error("Failed to update abandoned:", err));

    }, [currentSegment, userSessionId]); // Remove the individual watch dependencies

    const onSubmit = async (data) => {
        const isValid = await trigger();
        if (!isValid) {
            // Find the first segment with an error and navigate to it
            for (let i = 0; i < segments.length; i++) {
                const segmentKey = segments[i];
                const fields = segmentFieldMap[segmentKey];
                const segmentHasError = fields.some(field => errors[field]);
                if (segmentHasError) {
                    setCurrentSegment(i);
                    break;
                }
            }
            return;
        }

        setIsSubmitting(true);
        setSubmissionStatus(null);

        const submissionData = {
            ...data,
            authid: `P${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
        };

        try {
            const res = await fetch('/api/refills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            // Create currentData from submitted data
            const currentData = {
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                phone: data.phone || "",
                email: data.email || "",
            };

            if (res.ok) {
                setSubmissionStatus('success');

                // Update abandonment tracking with state 2 (filled/completed)
                fetch("/api/followup/abandoned", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userSessionId,
                        firstSegment: currentData,
                        lastSegmentReached: segments.length - 1, // Last segment
                        state: 2, // Completed state
                        question: "Form Submitted Successfully",
                        timestamp: new Date().toISOString(),
                    }),
                });

                localStorage.removeItem("refillsUserSessionId");
                setUserSessionId("");
            } else {
                setSubmissionStatus('error');
            }
        } catch (error) {
            setSubmissionStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };
    const progress = Math.round(((currentSegment) / (segments.length - 1)) * 100);

    const goToNextSegment = async () => {
        const segmentKey = segments[currentSegment];
        const fieldsToValidate = segmentFieldMap[segmentKey] || [];

        // Trigger validation for current segment fields
        const isValid = await trigger(fieldsToValidate);
        if (!isValid) return;

        // Ineligible logic
        const currentData = {
            firstName: watch("firstName"),
            lastName: watch("lastName"),
            phone: watch("phone"),
            email: watch("email"),
        };
        if (segmentKey === 'glp1ApprovalCheck') {
            if (glp1Approved === 'no') {
                setShowIneligible(true);
                fetch("/api/followup/abandoned", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userSessionId,
                        firstSegment: currentData,
                        lastSegmentReached: currentSegment,
                        state: 1,
                        question: currentQuestion,
                        timestamp: new Date().toISOString(),
                    }),
                });
                return;
            }
        }

        if (currentSegment < segments.length - 1) {
            setCurrentSegment((prev) => prev + 1);
        }
    };

    const goToPreviousSegment = () => {
        if (currentSegment > 0) {
            // Get form values before navigating
            const formValues = watch();
            const currentData = {
                firstName: formValues.firstName || "",
                lastName: formValues.lastName || "",
                phone: formValues.phone || "",
                email: formValues.email || "",
            };

            setCurrentSegment((prev) => prev - 1);

            // Update abandonment tracking
            fetch("/api/followup/abandoned", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userSessionId,
                    firstSegment: currentData,
                    lastSegmentReached: currentSegment - 1, // Previous segment
                    state: 0,
                    question: segmentDisplayNames[currentSegment - 1] || "Unknown Segment",
                    timestamp: new Date().toISOString(),
                }),
            }).catch((err) => console.error("Failed to update abandoned:", err));
        }
    };
    // Update the useEffect that generates session ID
    useEffect(() => {
        let id = localStorage.getItem("refillsUserSessionId");
        if (!id) {
            id = `REFILL-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            localStorage.setItem("refillsUserSessionId", id);

            // Send initial abandonment tracking
            fetch("/api/followup/abandoned", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userSessionId: id,
                    firstSegment: {
                        firstName: "",
                        lastName: "",
                        phone: "",
                        email: "",
                    },
                    lastSegmentReached: 0,
                    state: 0,
                    question: "Form Started",
                    timestamp: new Date().toISOString(),
                }),
            }).catch((err) => console.error("Failed to create abandonment record:", err));
        }
        setUserSessionId(id);
    }, []);
    if (submissionStatus === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 font-SofiaSans">
                <div className="w-full max-w-md mx-auto bg-white p-2 rounded-xl shadow-lg flex flex-col items-center">
                    <div className="font-tagesschrift text-center text-4xl -mb-4 md:text-6xl text-secondary font-bold">somi</div>
                    <div className="space-y-2 p-4">
                        <div className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 mx-auto mt-4 mb-6">
                            <Image
                                src="/getstarted.jpg"
                                alt="weighlossrefillsuccesspic"
                                fill
                                className="rounded-xl object-cover"
                                priority
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 800px"
                            />
                        </div>
                        <h3 className="text-lg md:text-x text-center text-black font-semibold">
                            Thank you for refilling your prescription with Somi
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
                        It looks like you are a new patient based on the information provided. Please click &quot;Get Started&quot; to complete your new patient intake form.
                    </h2>
                    <Link href="/getstarted">
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
                    {currentSegment === 0 && (
                        <>
                            <Label>Have you been approved for GLP-1 medication within the last 6 months by a Somi Health provider? <span className="text-red-500">*</span></Label>
                            <div className="flex gap-2 flex-col items-center">
                                {['yes', 'no'].map((option) => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('glp1Approved')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[100px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${glp1Approved === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option.toUpperCase()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.glp1Approved && <p className="text-sm text-red-500">{errors.glp1Approved.message}</p>}
                        </>
                    )}

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


                    {currentSegment === 2 && (
                        <div className="space-y-2">
                            <Label htmlFor="currentWeight">What&apos;s your current weight? <span className="text-red-500">*</span></Label>
                            <Input
                                id="currentWeight"
                                {...register('currentWeight')}
                                onKeyDown={(e) => {
                                    // Prevent form submission when Enter is pressed
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        return;
                                    }
                                }}
                            />
                            {errors.currentWeight && <p className="text-sm text-red-500">{errors.currentWeight.message}</p>}
                        </div>
                    )}

                    {currentSegment === 3 && (
                        <div className="space-y-2">
                            <Label htmlFor="medicationChanges">Any changes with your medications or medical history since your last visit? <span className="text-red-500">*</span></Label>
                            <Input
                                id="medicationChanges"
                                {...register('medicationChanges')}
                                onKeyDown={(e) => {
                                    // Prevent form submission when Enter is pressed
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        return;
                                    }
                                }}
                            />
                            {errors.medicationChanges && <p className="text-sm text-red-500">{errors.medicationChanges.message}</p>}
                        </div>
                    )}

                    {currentSegment === 4 && (
                        <>
                            <Label>Which medication are you currently taking <span className="text-red-500">*</span></Label>
                            <div className="flex flex-col gap-2 items-center">
                                {['Semaglutide', 'Tirzepatide', 'Lipotropic MIC +B12'].map(option => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('glp1Preference')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[140px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${glp1Preference === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.glp1Preference && <p className="text-sm text-red-500">{errors.glp1Preference.message}</p>}
                        </>
                    )}

                    {currentSegment === 5 && (
                        <>
                            <Label>Are you currently experiencing any side effects from your weight loss medication? <span className="text-red-500">*</span></Label>
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
                                <div className="mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sideEffectsDetail">Please tell us more about the side effects you are experiencing. <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="sideEffectsDetail"
                                            {...register('sideEffectsDetail')}
                                            onKeyDown={(e) => {
                                                // Prevent form submission when Enter is pressed
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    return;
                                                }
                                            }}
                                        />
                                        {errors.sideEffectsDetail && <p className="text-sm text-red-500">{errors.sideEffectsDetail.message}</p>}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {currentSegment === 6 && (
                        <>
                            <Label>Are you happy with your current medication? <span className="text-red-500">*</span></Label>
                            <div className="flex gap-2 flex-col items-center">
                                {['yes', 'no'].map(option => (
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
                        </>
                    )}

                    {currentSegment === 7 && (
                        <>
                            <Label>
                                {happyWithMed === 'yes'
                                    ? 'Would you like to continue on your current dosage or increase your dosage? '
                                    : 'Would you like to change to another GLP-1 medication, increase your current dose or decrease your current dose? '
                                }<span className="text-red-500">*</span>
                            </Label>
                            <div className="flex flex-col gap-2 justify-center">
                                {(happyWithMed === 'yes'
                                    ? ['keep the same dosage', 'increase my dosage']
                                    : ['Change to Semaglutide', 'Change to Tirzepatide', 'Increase my current dose', 'Decrease my current dose']
                                ).map((option) => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('dosageDecision')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[220px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${dosageDecision === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option}
                                        </span>
                                    </label>
                                ))}
                                {errors.dosageDecision && (
                                    <p className="text-sm text-red-500">
                                        {errors.dosageDecision.message}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {currentSegment === 8 && (
                        <>
                            <Label htmlFor="dosageNote">Any notes for your provider?</Label>
                            <Input id="dosageNote" {...register('dosageNote')} />
                        </>
                    )}

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
                        {currentSegment < segments.length - 1 ? (
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