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
import { Textarea } from '@/components/ui/textarea';

const formSchema = z
    .object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        phone: z.string().min(1, "Phone number is required"),
        email: z.string().email("Invalid email address"),
        approved: z.enum(['yes', 'no'], {
            required_error: "Please select an option",
            invalid_type_error: "Please select an option",
        }),
        medicationChanges: z.enum(['yes', 'no'], {
            required_error: "Please select an option",
            invalid_type_error: "Please select an option",
        }),
        desmedicationChanges: z.string().optional(),
        preference: z.string({
            required_error: "Please select your current medication",
            invalid_type_error: "Please select your current medication"
        }).min(1, "Please select your current medication"),
        sideEffects: z.enum(['yes', 'no'], {
            required_error: "Please select an option",
            invalid_type_error: "Please select an option",
        }),
        sideEffectsDetail: z.string().optional(),
        happyWithMed: z.enum(['yes', 'no'], {
            required_error: "Please select an option",
            invalid_type_error: "Please select an option",
        }),
        deshappyWithMed: z.string().optional(),
        dosageNote: z.string().optional(),
    });

const segments = [
    { id: 'approvalCheck', name: 'Approval Check' },
    { id: 'personal', name: 'Personal Information' },
    { id: 'medicationChanges', name: 'Medication Changes' },
    { id: 'preference', name: 'Current Medication' },
    { id: 'sideEffects', name: 'Side Effects' },
    { id: 'happyWithMed', name: 'Satisfaction with Therapy' },
    { id: 'dosageNote', name: 'Provider Questions' }
];

const segmentFieldMap = {
    personal: ["firstName", "lastName", "phone", "email"],
    approvalCheck: ["approved"],
    medicationChanges: ["medicationChanges", "desmedicationChanges"],
    preference: ["preference"],
    sideEffects: ["sideEffects", "sideEffectsDetail"],
    happyWithMed: ["happyWithMed", "deshappyWithMed"],
    dosageNote: ["dosageNote"],
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

    const approved = watch('approved');
    const medicationChanges = watch('medicationChanges')
    const sideEffects = watch('sideEffects');
    const happyWithMed = watch('happyWithMed');
    const preference = watch('preference');
    const firstName = watch("firstName");
    const lastName = watch("lastName");
    const phone = watch("phone");
    const email = watch("email");

    // Generate session ID once
    useEffect(() => {
        let id = localStorage.getItem("longevityRefillSessionId");
        if (!id) {
            id = `LRF-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            localStorage.setItem("longevityRefillSessionId", id);
        }
        setUserSessionId(id);
    }, []);

    // Track abandonment on segment change
    useEffect(() => {
        if (!userSessionId) return;

        const currentData = {
            firstName,
            lastName,
            phone,
            email,
        };

        const question = segments[currentSegment]?.name || "";

        const payload = {
            userSessionId,
            firstSegment: currentData,
            lastSegmentReached: currentSegment,
            state: 0,
            question,
            timestamp: new Date().toISOString(),
        };

        fetch("/api/longevity-refill-abandonment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).catch(err => console.error("Abandonment update failed:", err));

    }, [currentSegment, firstName, lastName, phone, email, userSessionId]);

    // Track basic data changes in first segment
    useEffect(() => {
        if (currentSegment !== 0 || !userSessionId) return;

        const currentData = { firstName, lastName, phone, email };
        const changed = JSON.stringify(currentData) !== JSON.stringify(previousBasicData);

        if (changed) {
            setPreviousBasicData(currentData);

            fetch("/api/longevity-refill-abandonment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userSessionId,
                    firstSegment: currentData,
                    lastSegmentReached: currentSegment,
                    state: 0,
                    question: segments[currentSegment]?.name,
                    timestamp: new Date().toISOString(),
                }),
            }).catch((err) => console.error("Basic abandonment failed:", err));
        }
    }, [
        firstName,
        lastName,
        phone,
        email,
        currentSegment,
        previousBasicData,
        userSessionId
    ]);

    const generateAuthId = () => {
        return `P${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    };

    const onSubmit = async (data) => {
        const isValid = await trigger();
        if (!isValid) {
            // Find the first segment with an error and navigate to it
            for (let i = 0; i < segments.length; i++) {
                const segmentKey = segments[i].id;
                const fields = segmentFieldMap[segmentKey];
                const segmentHasError = fields?.some(field => errors[field]);
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
            authid: generateAuthId(),
        };

        try {
            const response = await fetch('/api/longevity-refill-questionnaire', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const result = await response.json();

            if (response.ok) {
                // Track form completion
                if (userSessionId) {
                    const currentData = {
                        firstName: watch("firstName"),
                        lastName: watch("lastName"),
                        phone: watch("phone"),
                        email: watch("email"),
                    };

                    fetch("/api/longevity-refill-abandonment", {
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

                    localStorage.removeItem("longevityRefillSessionId");
                    setUserSessionId("");
                }

                setSubmissionStatus('success');
            } else {
                console.error('Submission failed:', result);
                setSubmissionStatus('error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmissionStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const progress = Math.round(((currentSegment) / (segments.length - 1)) * 100);

    const goToNextSegment = async () => {
        const segmentKey = segments[currentSegment].id;
        const fieldsToValidate = segmentFieldMap[segmentKey] || [];

        // Trigger validation for current segment fields
        const isValid = await trigger(fieldsToValidate);
        if (!isValid) return;

        // Ineligible logic - track when user is ineligible
        if (segmentKey === 'approvalCheck') {
            if (approved === 'no') {
                setShowIneligible(true);

                // Track ineligible state
                if (userSessionId) {
                    const currentData = { firstName, lastName, phone, email };
                    fetch("/api/longevity-refill-abandonment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userSessionId,
                            firstSegment: currentData,
                            lastSegmentReached: currentSegment,
                            state: 1, // INELIGIBLE
                            question: segments[currentSegment]?.name,
                            timestamp: new Date().toISOString(),
                        }),
                    });
                }
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
                        <div className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 mx-auto mt-4 mb-6">
                            <Image
                                src="/longevityrefill.jpg"
                                alt="Longevityrefillsuccesspic"
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
                    <Link href="/getstarted/longevity">
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
                    {/* Form segments remain exactly the same as in your original code */}
                    {currentSegment === 0 && (
                        <>
                            <Label>Have you been approved for NAD+, Glutathione or Sermorelin within the last 6 months by a Somi Health Provider? <span className="text-red-500">*</span></Label>
                            <div className="flex gap-2 flex-col items-center">
                                {['yes', 'no'].map((option) => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('approved')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[100px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${approved === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option.toUpperCase()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.approved && <p className="text-sm text-red-500">{errors.approved.message}</p>}
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
                            <Label htmlFor="medicationChanges">Any changes with your medications or medical history since your last visit? <span className="text-red-500">*</span></Label>
                            <div className="flex gap-2 flex-col items-center">
                                {['yes', 'no'].map((option) => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('medicationChanges')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[100px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${medicationChanges === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option.toUpperCase()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.medicationChanges && <p className="text-sm text-red-500">{errors.medicationChanges.message}</p>}
                            {watch("medicationChanges") === "yes" && (
                                <div className="mt-4 space-y-2">
                                    <Label>Please provide additional information <span className="text-red-500">*</span></Label>
                                    <Textarea {...register("desmedicationChanges")} placeholder="Leave a Description" />
                                </div>
                            )}
                        </div>
                    )}

                    {currentSegment === 3 && (
                        <>
                            <Label>Which Peptide are you currently on? <span className="text-red-500">*</span></Label>
                            <div className="flex flex-col gap-2 items-center">
                                {['NAD+', 'Glutathione', 'Sermorelin'].map(option => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('preference')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[140px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${preference === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.preference && <p className="text-sm text-red-500">{errors.preference.message}</p>}
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
                                        <Textarea
                                            id="sideEffectsDetail"
                                            {...register('sideEffectsDetail')}
                                            placeholder="Leave a Description"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {currentSegment === 5 && (
                        <>
                            <Label>Are you happy with your current peptide therapy <span className="text-red-500">*</span></Label>
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
                            {happyWithMed === "no" && (
                                <div className="mt-4 space-y-2">
                                    <Label>Please provide additional information <span className="text-red-500">*</span></Label>
                                    <Textarea {...register("deshappyWithMed")} placeholder="Leave a Description" />
                                </div>
                            )}
                        </>
                    )}

                    {currentSegment === 6 && (
                        <>
                            <Label htmlFor="dosageNote">Any questions or concerns for your provider?</Label>
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