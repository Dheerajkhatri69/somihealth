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
import toast from 'react-hot-toast';

const formSchema = z
    .object({
        referralSource: z
            .string()
            .refine(val => ["Friend/Family", "Healthcare Provider", "Pharmacy"].includes(val), {
                message: "This question is required",
            }),

        // referralSource: z.enum(["Friend/Family", "Healthcare Provider", "Pharmacy"], { required_error: "This question is required" }),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        phone: z.string().min(1, "Phone number is required"),
        email: z.string().email("Invalid email address"),
        refFirstName: z.string().min(1, "First name is required"),
        refLastName: z.string().min(1, "Last name is required"),
        refPhone: z.string().min(1, "Phone number is required"),
        refEmail: z.string().email("Invalid email address"),
        providerField: z.string().optional(), // will be required conditionally
    })
    .refine((data) => {
        if (data.referralSource === "Healthcare Provider") {
            return !!data.providerField && data.providerField.trim() !== '';
        }
        return true;
    }, {
        message: "NPI is required",
        path: ["providerField"]
    });

const segments = [
    'referralSource',
    'personal',
    'referral',
    'provider', // Only if Healthcare Provider
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
    const [authID, setAuthId] = useState(null);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const [userSessionId, setUserSessionId] = useState("");
    const [previousBasicData, setPreviousBasicData] = useState(null);


    const {
        register,
        handleSubmit,
        watch,
        trigger,
        getValues,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",         // ✅ validate on each change
        reValidateMode: "onChange", // ✅ revalidate when input changes
        defaultValues: {
            referralSource: "",
        },
    });


    // Define segmentFieldMap inside the component where watch() is available
    const segmentFieldMap = {
        referralSource: ["referralSource"],
        personal: ["firstName", "lastName", "phone", "email"],
        referral: ["refFirstName", "refLastName", "refPhone", "refEmail"],
        provider: ["providerField"], // Example, define as needed
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        // Build a list of all fields that need to be validated for the user's path.
        const fieldsToValidate = [
            ...segmentFieldMap.referralSource,
            ...segmentFieldMap.personal,
            ...segmentFieldMap.referral,
        ];
        if (watch('referralSource') === 'Healthcare Provider') {
            fieldsToValidate.push(...segmentFieldMap.provider);
        }

        const isValid = await trigger(fieldsToValidate);

        if (isValid) {
            const data = getValues();
            const submissionData = {
                ...data,
            };
            try {
                const response = await fetch('/api/referrals', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(submissionData),
                });

                const result = await response.json();

                if (response.ok) {
                    // toast.success('Referral submitted successfully!');
                    setSubmissionStatus('success');
                } else {
                    toast.error(result.message || 'There was an error submitting your form.');
                    setSubmissionStatus('error');
                }
            } catch (error) {
                toast.error('An unexpected error occurred. Please try again.');
                setSubmissionStatus('error');
            }
        }
        setIsSubmitting(false);
    };

    // const progress = Math.round(((currentSegment) / (segments.length - 1)) * 100);
    const referralSourceValue = watch("referralSource");
    const dynamicSegments = referralSourceValue === "Healthcare Provider"
        ? segments
        : segments.filter(seg => seg !== "provider");

    const progress = Math.round((currentSegment / (dynamicSegments.length - 1)) * 100);

    const goToNextSegment = async () => {
        const segmentKey = segments[currentSegment];
        const fieldsToValidate = segmentFieldMap[segmentKey] || [];
        // Trigger validation for current segment fields
        const isValid = await trigger(fieldsToValidate);
        if (!isValid) return;

        // If on segment 2 and not Healthcare Provider, skip to submit
        if (currentSegment === 2 && (watch('referralSource') === 'Friend/Family' || watch('referralSource') === 'Pharmacy')) {
            // Do nothing, let the submit button show
            return;
        }
        // If on segment 2 and Healthcare Provider, go to provider segment
        if (currentSegment === 2 && watch('referralSource') === 'Healthcare Provider') {
            setCurrentSegment(3);
            return;
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

    // Navigation button rendering
    const showSubmitButton = (
        (currentSegment === 2 && (watch('referralSource') === 'Friend/Family' || watch('referralSource') === 'Pharmacy')) ||
        (currentSegment === 3 && watch('referralSource') === 'Healthcare Provider')
    );

    if (submissionStatus === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4">
                <div className="w-full max-w-md mx-auto bg-white p-2 rounded-xl shadow-lg flex flex-col items-center">
                    <div className="font-tagesschrift text-center text-4xl -mb-4 md:text-6xl text-secondary font-bold">somi</div>
                    <div className="space-y-2 p-4">
                        <div className="relative w-full aspect-square max-w-[300px] mx-auto">
                            <Image
                                src="/getstartedend.jpg"
                                alt="Weight Loss"
                                fill
                                className="rounded-xl object-contain"
                                priority
                                sizes="(max-width: 768px) 100vw, 300px"
                            />
                        </div>
                        <h3 className="text-lg md:text-x text-center text-black font-semibold">
                            Thank you for your referral.
                        </h3>
                        <p className="text-gray-600 text-center">
                            A Somi team member will contact you if we have any questions.
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

    // if (showIneligible) {
    //     return (
    //         <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
    //             <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
    //                 <div className="font-tagesschrift text-center text-6xl mb-2 text-secondary font-bold">somi</div>
    //                 <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">
    //                     It looks like you are a new patient based on the information provided. Please click &quot;Get Started&quot; to complete your new patient intake form.
    //                 </h2>
    //                 <Link href="/getstarted">
    //                     <Button
    //                         variant="outline"
    //                         className="bg-secondary text-white hover:text-white hover:bg-secondary rounded-2xl"
    //                     >
    //                         Get Started
    //                     </Button>
    //                 </Link>
    //             </div>
    //         </div>
    //     );
    // }

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

                <form className="space-y-8 p-6 bg-white rounded-xl border border-gray-200 shadow-secondary shadow-2xl">
                    {currentSegment === 0 && (
                        <div className="space-y-4">
                            <h2 className="text-l font-semibold">Please specify who is making the referral. <span className="text-red-500">*</span></h2>
                            <div className="flex flex-col gap-2">
                                {["Friend/Family", "Healthcare Provider", "Pharmacy"].map(option => (
                                    <label key={option} className="radio-style">
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register('referralSource')}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center text-sm justify-center w-[220px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('referralSource') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            {option}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.referralSource && <p className="text-sm text-red-500">{errors.referralSource.message}</p>}
                        </div>
                    )}

                    {currentSegment === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-l font-semibold">Please provide your Information <span className="text-red-500">*</span></h2>
                            {watch('referralSource') === "Friend/Family" && (
                                <p className="text-sm text-gray-600">Receive a $25 gift card when your referral makes a purchase.</p>
                            )}
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
                        <div className="space-y-4">
                            <h2 className="text-l font-semibold">Please provide the information of the person you are referring to, Somi. <span className="text-red-500">*</span></h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="refFirstName">
                                        First name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="refFirstName" {...register('refFirstName')} />
                                    {errors.refFirstName && <p className="text-sm text-red-500">{errors.refFirstName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="refLastName">
                                        Last name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="refLastName" {...register('refLastName')} />
                                    {errors.refLastName && <p className="text-sm text-red-500">{errors.refLastName.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="refPhone">
                                    Phone number <span className="text-red-500">*</span>
                                </Label>
                                <Input id="refPhone" type="tel" {...register('refPhone')} />
                                {errors.refPhone && <p className="text-sm text-red-500">{errors.refPhone.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="refEmail">
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <Input id="refEmail" type="email" {...register('refEmail')} />
                                {errors.refEmail && <p className="text-sm text-red-500">{errors.refEmail.message}</p>}
                            </div>
                        </div>
                    )}

                    {currentSegment === 3 && watch('referralSource') === "Healthcare Provider" && (
                        <div className="space-y-4">
                            <h2 className="text-l font-semibold">Please provide your NPI <span className="text-red-500">*</span></h2>
                            <div className="space-y-2">
                                <Input id="providerField" {...register('providerField')} />
                                {errors.providerField && <p className="text-sm text-red-500">{errors.providerField.message}</p>}
                            </div>
                        </div>
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
                        {showSubmitButton ? (
                            <Button
                                type="button"
                                onClick={handleFinalSubmit}
                                className="bg-secondary text-white rounded-2xl"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={goToNextSegment}
                                className="bg-secondary text-white rounded-2xl"
                                disabled={loadingExistsByEmailPhone}
                            >
                                Continue
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