"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const formSchema = z
    .object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        phone: z.string().min(1, "Phone number is required"),
        email: z.string().email("Invalid email address"),
        skinhairApproved: z.enum(['yes', 'no'], { required_error: "Please select an option" ,invalid_type_error:"Please select an option" }),
        medicationChanges: z.enum(['yes', 'no'], { required_error: "Please select an option", invalid_type_error:"Please select an option" }),
        medicationChangesDetail: z.string().optional(),
        currentTreatment: z.enum(['Finasteride', 'Minoxidil', 'Rx Hair', 'Rx Skin'], { 
            required_error: "Please select your current treatment" ,
            invalid_type_error: "Please select your current treatment" 
        }),
        sideEffects: z.enum(['yes', 'no'], { required_error: "Please select an option",invalid_type_error:"Please select an option" }),
        sideEffectsDetail: z.string().optional(),
        happyWithTreatment: z.enum(['yes', 'no'], { required_error: "Please select an option",invalid_type_error:"Please select an option" }),
        happyWithTreatmentDetail: z.string().optional(),
        providerQuestions: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.medicationChanges === 'yes' && (!data.medicationChangesDetail || data.medicationChangesDetail.trim() === '')) {
            ctx.addIssue({
                path: ['medicationChangesDetail'],
                code: z.ZodIssueCode.custom,
                message: 'Please describe the changes with your medications or medical history',
            });
        }

        if (data.sideEffects === 'yes' && (!data.sideEffectsDetail || data.sideEffectsDetail.trim() === '')) {
            ctx.addIssue({
                path: ['sideEffectsDetail'],
                code: z.ZodIssueCode.custom,
                message: 'Please describe your side effects',
            });
        }

        if (data.happyWithTreatment === 'no' && (!data.happyWithTreatmentDetail || data.happyWithTreatmentDetail.trim() === '')) {
            ctx.addIssue({
                path: ['happyWithTreatmentDetail'],
                code: z.ZodIssueCode.custom,
                message: 'Please tell us why you are not happy with your current treatment',
            });
        }
    });

const segments = [
    'skinhairApprovalCheck',
    'personal',
    'medicationChanges',
    'currentTreatment',
    'sideEffects',
    'happyWithTreatment',
    'providerQuestions'
];

const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${progress}%` }} />
    </div>
);

export default function SkinHairRefillForm() {
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
    } = useForm({
        resolver: zodResolver(formSchema),
        mode: 'onChange'
    });

    const skinhairApproved = watch('skinhairApproved');
    const medicationChanges = watch('medicationChanges');
    const sideEffects = watch('sideEffects');
    const happyWithTreatment = watch('happyWithTreatment');
    const currentTreatment = watch('currentTreatment');

    // Define segmentFieldMap inside the component where watch() is available
    const segmentFieldMap = {
        personal: ["firstName", "lastName", "phone", "email"],
        skinhairApprovalCheck: ["skinhairApproved"],
        medicationChanges: medicationChanges === 'yes' ? ["medicationChanges", "medicationChangesDetail"] : ["medicationChanges"],
        currentTreatment: ["currentTreatment"],
        sideEffects: sideEffects === 'yes' ? ["sideEffects", "sideEffectsDetail"] : ["sideEffects"],
        happyWithTreatment: happyWithTreatment === 'no' ? ["happyWithTreatment", "happyWithTreatmentDetail"] : ["happyWithTreatment"],
        providerQuestions: ["providerQuestions"],
    };

    // Generate session ID once
    useEffect(() => {
        let id = localStorage.getItem("skinhairRefillSessionId");
        if (!id) {
            id = `SH-REFILL-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            localStorage.setItem("skinhairRefillSessionId", id);
        }
        setUserSessionId(id);
    }, []);

    // Extract watched values OUTSIDE the useEffect
    const firstName = watch("firstName");
    const lastName = watch("lastName");
    const phone = watch("phone");
    const email = watch("email");

    useEffect(() => {
        if (!userSessionId) return;

        const currentData = { firstName, lastName, phone, email };

        const segmentNames = {
            'skinhairApprovalCheck': 'SkinHair Approval Check',
            'personal': 'Personal Information',
            'medicationChanges': 'Medication Changes',
            'currentTreatment': 'Current Treatment',
            'sideEffects': 'Side Effects',
            'happyWithTreatment': 'Happy with Treatment',
            'providerQuestions': 'Provider Questions'
        };

        const question = segmentNames[segments[currentSegment]] || "";

        fetch("/api/skinhair-refill-abandonment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userSessionId,
                firstSegment: currentData,
                lastSegmentReached: currentSegment,
                state: 0,
                question,
                timestamp: new Date().toISOString(),
            }),
        }).catch((err) => console.error("Failed to update abandoned:", err));

    }, [currentSegment, userSessionId, firstName, lastName, phone, email]);

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

        try {
            const submissionData = {
                ...data,
                authid: `SHREF${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
                treatmentType: 'SkinHair Refill',
                userSessionId,
            };

            const response = await fetch('/api/skinhair-refill-questionnaire', {
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

                fetch("/api/skinhair-refill-abandonment", {
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

                localStorage.removeItem("skinhairRefillSessionId");
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
        const fieldsToValidate = segmentFieldMap[segmentKey] || [];

        // Trigger validation for current segment fields
        const isValid = await trigger(fieldsToValidate);
        if (!isValid) return;

        // Ineligible logic
        if (segmentKey === 'skinhairApprovalCheck') {
            if (skinhairApproved === 'no') {
                // Track ineligible state
                const currentData = {
                    firstName: watch("firstName"),
                    lastName: watch("lastName"),
                    phone: watch("phone"),
                    email: watch("email"),
                };
                fetch("/api/skinhair-refill-abandonment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userSessionId,
                        firstSegment: currentData,
                        lastSegmentReached: currentSegment,
                        state: 1, // INELIGIBLE
                        question: "SkinHair Approval Check",
                        timestamp: new Date().toISOString(),
                    }),
                }).catch((err) => console.error("Ineligible abandonment failed:", err));

                setShowIneligible(true);
                return;
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

    if (submissionStatus === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 font-SofiaSans">
                <div className="w-full max-w-md mx-auto bg-white p-2 rounded-xl shadow-lg flex flex-col items-center">
                    <div className="font-tagesschrift text-center text-4xl -mb-4 md:text-6xl text-secondary font-bold">somi</div>
                    <div className="space-y-2 p-4">
                        <div className="relative w-[400px] h-[300px] mx-auto">
                            <Image
                                src="https://res.cloudinary.com/dvmbfolrm/image/upload/v1764026867/fileUploader/w1jmxvaiwra357qqag1k.jpg"
                                alt="Skin & Hair"
                                fill
                                className="rounded-xl object-cover"
                                priority
                            />
                        </div>
                        <h3 className="text-lg md:text-xl text-center text-black font-semibold">
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
                    <Link href="/getstarted/skinhair">
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
                            <Label>Within the last 6 months have you been approved for these medications by a Somi Health Provider? (Finasteride, Minoxidil, Rx Hair and Rx Skin) <span className="text-red-500">*</span></Label>
                            <div className="flex gap-2 flex-col items-center">
                                {['yes', 'no'].map((option) => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('skinhairApproved')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[100px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${skinhairApproved === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option.toUpperCase()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.skinhairApproved && <p className="text-sm text-red-500">{errors.skinhairApproved.message}</p>}
                        </>
                    )}

                    {currentSegment === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Please provide your information <span className="text-red-500">*</span></h2>
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
                        <>
                            <Label>Any changes with your medications or medical history since your last visit? <span className="text-red-500">*</span></Label>
                            <div className="flex gap-2 flex-col items-center">
                                {['yes', 'no'].map((option) => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('medicationChanges')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[100px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${medicationChanges === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option.toUpperCase()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.medicationChanges && <p className="text-sm text-red-500">{errors.medicationChanges.message}</p>}

                            {medicationChanges === 'yes' && (
                                <div className="mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="medicationChangesDetail">Please describe the changes with your medications or medical history. <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="medicationChangesDetail"
                                            {...register('medicationChangesDetail')}
                                            onKeyDown={(e) => {
                                                // Prevent form submission when Enter is pressed
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    return;
                                                }
                                            }}
                                        />
                                        {errors.medicationChangesDetail && <p className="text-sm text-red-500">{errors.medicationChangesDetail.message}</p>}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {currentSegment === 3 && (
                        <>
                            <Label>Choose your Current treatment? <span className="text-red-500">*</span></Label>
                            <div className="flex flex-col gap-3 items-center">
                                {['Finasteride', 'Minoxidil', 'Rx Hair', 'Rx Skin'].map(option => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('currentTreatment')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-full px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${currentTreatment === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option === "Rx Hair" ? "Rx Hair (Finasteride + Biotin)" :
                                                option === "Rx Skin" ? "Rx Skin (Azelaic acid, Niacinamide, Clindamycin, and Tretinoin)" :
                                                    option}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.currentTreatment && <p className="text-sm text-red-500">{errors.currentTreatment.message}</p>}
                        </>
                    )}

                    {currentSegment === 4 && (
                        <>
                            <Label>Are you currently experiencing any side effects? <span className="text-red-500">*</span></Label>
                            <div className="flex gap-2 flex-col items-center">
                                {['yes', 'no'].map((option) => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('sideEffects')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[100px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${sideEffects === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
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

                    {currentSegment === 5 && (
                        <>
                            <Label>Are you happy with your current treatment? <span className="text-red-500">*</span></Label>
                            <div className="flex gap-2 flex-col items-center">
                                {['yes', 'no'].map(option => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('happyWithTreatment')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[100px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${happyWithTreatment === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option.toUpperCase()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.happyWithTreatment && <p className="text-sm text-red-500">{errors.happyWithTreatment.message}</p>}

                            {happyWithTreatment === 'no' && (
                                <div className="mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="happyWithTreatmentDetail">Please tell us why you are not happy with your current treatment. <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="happyWithTreatmentDetail"
                                            {...register('happyWithTreatmentDetail')}
                                            onKeyDown={(e) => {
                                                // Prevent form submission when Enter is pressed
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    return;
                                                }
                                            }}
                                        />
                                        {errors.happyWithTreatmentDetail && <p className="text-sm text-red-500">{errors.happyWithTreatmentDetail.message}</p>}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {currentSegment === 6 && (
                        <>
                            <Label htmlFor="providerQuestions">Any questions or concerns for your provider?</Label>
                            <Input 
                                id="providerQuestions" 
                                {...register('providerQuestions')}
                                onKeyDown={(e) => {
                                    // Prevent form submission when Enter is pressed
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        return;
                                    }
                                }}
                            />
                        </>
                    )}

                    {/* Navigation */}
                    <div className={`flex pt-4 ${currentSegment === 0 ? 'justify-end' : 'justify-between'}`}>
                        {currentSegment > 0 && (
                            <Button
                                type="button"
                                onClick={goToPreviousSegment}
                                className="bg-secondary text-white hover:bg-secondary rounded-2xl"
                            >
                                Previous
                            </Button>
                        )}
                        {currentSegment < segments.length - 1 ? (
                            <Button
                                type="button"
                                onClick={goToNextSegment}
                                className="bg-secondary text-white hover:bg-secondary rounded-2xl"
                            >
                                Continue
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit(onSubmit)}
                                className="bg-secondary text-white hover:bg-secondary rounded-2xl"
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
