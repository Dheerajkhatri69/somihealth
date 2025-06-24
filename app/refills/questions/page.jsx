"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
    'personal',
    'glp1ApprovalCheck',
    'weight',
    'medicationChanges',
    'glp1Preference',
    'sideEffects',
    'happyWithMed',
    'dosageDecision',
    'dosageNote'
];

const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${progress}%` }} />
    </div>
);

export default function PatientRegistrationForm() {
    const [currentSegment, setCurrentSegment] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showIneligible, setShowIneligible] = useState(false);
    const [loadingExistsByEmailPhone, setLoadingExistsByEmailPhone] = useState(false);
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
        console.log('Submitted Data:', data);
        // Handle submission logic here
        setIsSubmitting(false);
    };

    const progress = Math.round(((currentSegment) / (segments.length -1)) * 100);

    const goToNextSegment = async () => {
        const segmentKey = segments[currentSegment];
        const fieldsToValidate = segmentFieldMap[segmentKey] || [];

        // Trigger validation for current segment fields
        const isValid = await trigger(fieldsToValidate);
        if (!isValid) return;

        // Ineligible logic
        if (segmentKey === 'glp1ApprovalCheck') {
            if (glp1Approved === 'no') {
                setShowIneligible(true);
                return;
            }
            if (glp1Approved === 'yes') {
                setLoadingExistsByEmailPhone(true);
                // Check patient exists by email or phone
                const email = watch('email');
                const phone = watch('phone');
                try {
                    const res = await fetch('/api/patients/exists', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, phone })
                    });
                    const data = await res.json();
                    if (data?.result?.exists) {
                        setLoadingExistsByEmailPhone(false);
                        setCurrentSegment((prev) => prev + 1);
                        return;
                    } else {
                        setShowIneligible(true);
                        return;
                    }
                } catch (err) {
                    setShowIneligible(true);
                    return;
                }
            }
        }

        if (currentSegment < segments.length - 1) {
            setCurrentSegment((prev) => prev + 1);
        }
    };

    const goToPreviousSegment = () => {
        if (currentSegment > 0) {
            setCurrentSegment((prev) => prev - 1);
        }
    };

    if (showIneligible) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
                <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
                    <div className="font-tagesschrift text-center text-6xl mb-2 text-secondary font-bold">somi</div>
                    <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">
                        It looks like you are a new patient based on the information provided. Please click &quot;Get Started&quot; to complete your new patient intake form.
                    </h2>
                    <Button
                        variant="outline"
                        className="bg-secondary text-white hover:text-white hover:bg-secondary rounded-2xl"
                    >
                        Get Started
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-[500px] flex flex-col min-h-screen">
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

                    {currentSegment === 1 && (
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
                            <Label>Which GLP-1 medication are you currently taking <span className="text-red-500">*</span></Label>
                            <div className="flex flex-col gap-2 items-center">
                                {['Semaglutide', 'Tirzepatide'].map(option => (
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
                                disabled={loadingExistsByEmailPhone}
                            >
                                {loadingExistsByEmailPhone ? <><Loader2 size={15} className="animate-spin" /> Continue</> : "Continue"}
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
                </form>
            </div>
        </div>
    );
}