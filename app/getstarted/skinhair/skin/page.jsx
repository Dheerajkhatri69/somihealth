"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import UploadFile from "@/components/FileUpload";
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

// Form validation schema for Rx Skin
const formSchema = z.object({
    // Skin specific fields
    skinAllergies: z.array(z.string()).nonempty("Please select at least one option"),
    acneSymptoms: z.object({
        facialHairAcne: z.enum(['yes', 'no'], { required_error: "This field is required" }),
        chestAcne: z.enum(['yes', 'no'], { required_error: "This field is required" }),
        backAcne: z.enum(['yes', 'no'], { required_error: "This field is required" }),
        painfulLesions: z.enum(['yes', 'no'], { required_error: "This field is required" }),
        recurrentBreakouts: z.enum(['yes', 'no'], { required_error: "This field is required" }),
    }),
    triedAcneProductsNotWork: z.enum(['yes', 'no'], { required_error: "This field is required", invalid_type_error: "This field is required" }),
    notWorkProductsDesc: z.string().optional(),
    triedAcneProductsWorked: z.enum(['yes', 'no'], { required_error: "This field is required", invalid_type_error: "This field is required" }),
    workedProductsDesc: z.string().optional(),
    pregnantBreastfeeding: z.enum(['yes', 'no'], { required_error: "This field is required", invalid_type_error: "This field is required" }),

    // Common medical fields
    currentlyUsingMedication: z.enum(['yes', 'no'], { required_error: "This field is required", invalid_type_error: "This field is required" }),
    currentMedications: z.string().optional(),
    medicationAllergies: z.enum(['yes', 'no'], { required_error: "This field is required", invalid_type_error: "This field is required" }),
    allergiesList: z.string().optional(),

    // Photos
    acnePhotos: z.string().min(1, "Please upload acne photos"),
    idPhoto: z.string().min(1, "Government ID photo is required"),

    // Consent checkboxes
    consent: z.boolean().refine(val => val === true, "You must consent to proceed"),
    terms: z.boolean().refine(val => val === true, "You must agree to the terms"),
    treatment: z.boolean().refine(val => val === true, "You must consent to treatment"),
})

const segments = [
    { id: "skinAllergies", name: "Skin Medication Allergies" },
    { id: "acneSymptoms", name: "Acne Symptoms" },
    { id: "triedAcneProductsNotWork", name: "Previous Acne Products Not Working" },
    { id: "triedAcneProductsWorked", name: "Previous Acne Products Worked" },
    { id: "pregnancy", name: "Pregnancy / Breastfeeding" },
    { id: "medication", name: "Current Medications" },
    { id: "medicationAllergies", name: "Medication Allergies" },
    { id: "acnePhotos", name: "Acne Photos Upload" },
    { id: "idPhoto", name: "ID Upload" },
    { id: "consent", name: "Final Agreement" },
];

// Progress bar component
const ProgressBar = ({ progress }) => {
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
                className="bg-secondary h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};

export default function RxSkinForm() {
    const router = useRouter();
    const [currentSegment, setCurrentSegment] = useState(0);
    const [showIneligible, setShowIneligible] = useState(false);
    const [fileUrls, setFileUrls] = useState({
        idPhoto: '',
        acnePhotos: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [userSessionId, setUserSessionId] = useState("");
    const [basicData, setBasicData] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        trigger,
        setValue,
        setError,
        clearErrors,
    } = useForm({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            consent: false,
            terms: false,
            treatment: false
        }
    });

    const formValues = watch();
    const currentlyUsingMedication = watch("currentlyUsingMedication");
    const medicationAllergies = watch("medicationAllergies");

    const totalSegments = segments.length;
    const progress = Math.round((currentSegment / (totalSegments - 1)) * 100);

    const handleCheckboxChange = (field, value, checked) => {
        const currentValues = watch(field) || [];
        if (checked) {
            if (value.includes('None') || value.includes('none')) {
                setValue(field, [value]);
            } else {
                const filteredValues = currentValues.filter(item =>
                    !item.includes('None') && !item.includes('none')
                );
                setValue(field, [...filteredValues, value]);
            }
        } else {
            setValue(field, currentValues.filter(item => item !== value));
        }
    };

    useEffect(() => {
        // Get basic data from localStorage
        const savedData = localStorage.getItem('skinhairFormData');
        if (savedData) {
            setBasicData(JSON.parse(savedData));
        }

        // Get session ID
        let id = localStorage.getItem("skinhairSessionId");
        if (!id) {
            id = `SH-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            localStorage.setItem("skinhairSessionId", id);
        }
        setUserSessionId(id);
    }, []);

    // Track abandonment on segment change
    useEffect(() => {
        if (!userSessionId || !basicData) return;

        const currentData = {
            firstName: basicData.firstName || "",
            lastName: basicData.lastName || "",
            phone: basicData.phone || "",
            email: basicData.email || "",
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

        fetch("/api/skinhair-abandonment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).catch(err => console.error("Abandonment update failed:", err));

    }, [currentSegment, userSessionId, basicData]);

    // Updated handleNext function
    const handleNext = async () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const currentSegmentFields = getSegmentFields(currentSegment);

        // Special validation for checkbox groups
        if (currentSegmentFields.includes('skinAllergies')) {
            const currentValues = watch('skinAllergies') || [];
            if (currentValues.length === 0) {
                setError('skinAllergies', {
                    type: 'manual',
                    message: 'Please select at least one option'
                }, { shouldFocus: true });

                // Scroll to error
                setTimeout(() => {
                    const errorElement = document.querySelector('.error-skinAllergies');
                    if (errorElement) {
                        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);

                return;
            } else {
                clearErrors('skinAllergies');
            }
        }

        // Validate acne symptoms individually
        if (currentSegment === 1) {
            const acneFields = [
                'acneSymptoms.facialHairAcne',
                'acneSymptoms.chestAcne',
                'acneSymptoms.backAcne',
                'acneSymptoms.painfulLesions',
                'acneSymptoms.recurrentBreakouts'
            ];

            let hasError = false;
            for (const field of acneFields) {
                const value = watch(field);
                if (!value) {
                    setError(field, {
                        type: 'manual',
                        message: 'This field is required'
                    }, { shouldFocus: true });
                    hasError = true;
                } else {
                    clearErrors(field);
                }
            }
            if (hasError) return;
        }

        const isValid = await trigger(currentSegmentFields, { shouldFocus: true });

        if (!isValid) {
            // Force error display by focusing on first error
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                setTimeout(() => {
                    let element;
                    if (firstErrorField.includes('acneSymptoms')) {
                        // Find the specific radio group for acne symptoms
                        const fieldName = firstErrorField.split('.')[1];
                        element = document.querySelector(`input[name="acneSymptoms.${fieldName}"]`);
                    } else {
                        element = document.querySelector(`[name="${firstErrorField}"]`);
                    }

                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        const parentLabel = element.closest('label');
                        if (parentLabel) {
                            parentLabel.focus();
                        }
                    }
                }, 100);
            }
            return;
        }

        // Check for disqualifying conditions
        if (currentSegment === 0) {
            const allergies = watch("skinAllergies") || [];
            const hasMedicationAllergy = allergies.some(allergy =>
                allergy !== 'None of the above' &&
                !allergy.toLowerCase().includes('none')
            );
            if (hasMedicationAllergy) {
                // Track ineligible state
                if (userSessionId && basicData) {
                    const currentData = {
                        firstName: basicData.firstName || "",
                        lastName: basicData.lastName || "",
                        phone: basicData.phone || "",
                        email: basicData.email || "",
                    };
                    fetch("/api/skinhair-abandonment", {
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
                    }).catch((err) => console.error("Ineligible abandonment failed:", err));
                }
                setShowIneligible(true);
                return;
            }
        }

        if (currentSegment === 4 && watch("pregnantBreastfeeding") === 'yes') {
            // Track ineligible state
            if (userSessionId && basicData) {
                const currentData = {
                    firstName: basicData.firstName || firstName,
                    lastName: basicData.lastName || lastName,
                    phone: basicData.phone || phone,
                    email: basicData.email || email,
                };
                fetch("/api/skinhair-abandonment", {
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
                }).catch((err) => console.error("Ineligible abandonment failed:", err));
            }
            setShowIneligible(true);
            return;
        }

        setShowIneligible(false);

        // Move to next segment (no skipping - conditional fields are handled in the UI)
        if (currentSegment < totalSegments - 1) {
            setCurrentSegment(currentSegment + 1);
        }
    };
    const handlePrevious = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (currentSegment > 0) {
            setCurrentSegment(currentSegment - 1);
        }
    };

    const getSegmentFields = (segmentIndex) => {
        const segmentFields = [
            ["skinAllergies"],
            ["acneSymptoms.facialHairAcne", "acneSymptoms.chestAcne", "acneSymptoms.backAcne", "acneSymptoms.painfulLesions", "acneSymptoms.recurrentBreakouts"],
            ["triedAcneProductsNotWork"],
            ["triedAcneProductsWorked"],
            ["pregnantBreastfeeding"],
            ["currentlyUsingMedication"],
            ["medicationAllergies"],
            ["acnePhotos"],
            ["idPhoto"],
            ["consent", "terms", "treatment"],
        ];

        const fields = segmentFields[segmentIndex] || [];

        // Handle conditional fields
        if (segmentIndex === 2 && watch("triedAcneProductsNotWork") === 'yes') {
            return [...fields, "notWorkProductsDesc"];
        }
        if (segmentIndex === 3 && watch("triedAcneProductsWorked") === 'yes') {
            return [...fields, "workedProductsDesc"];
        }
        if (segmentIndex === 5 && watch("currentlyUsingMedication") === 'yes') {
            return [...fields, "currentMedications"];
        }
        if (segmentIndex === 6 && watch("medicationAllergies") === 'yes') {
            return [...fields, "allergiesList"];
        }

        return fields;
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        try {
            // Combine basic data with skin-specific data
            const submissionData = {
                ...basicData,
                ...data,
                treatmentChoose: 'Rx Skin',
                authid: `SH${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
                questionnaire: true,
                treatmentType: 'Rx Skin',
                submissionDate: new Date().toISOString(),
            };

            const response = await fetch('/api/skinhair-questionnaire', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || result.message || 'Failed to submit form');
            }

            // Track form completion
            if (userSessionId) {
                const currentData = {
                    firstName: basicData?.firstName || "",
                    lastName: basicData?.lastName || "",
                    phone: basicData?.phone || "",
                    email: basicData?.email || "",
                };

                fetch("/api/skinhair-abandonment", {
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

                localStorage.removeItem("skinhairSessionId");
                localStorage.removeItem('skinhairFormData');
                setUserSessionId("");
            }

            setIsSubmitting(false);
            setShowSuccess(true);

        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error.message || 'Failed to submit form. Please try again.');
            setIsSubmitting(false);
        }
    };

    if (showIneligible) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-2 font-SofiaSans">
                <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
                    <div className="font-tagesschrift text-center text-6xl mb-2 text-secondary font-bold">somi</div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 text-center mb-4">
                        Based on your response to the previous question, you currently do not meet the criteria for treatment.
                        <br />
                        <br />
                        If you&apos;ve made a payment or purchased a plan, 100% of your money will be refunded - No questions asked.
                    </h2>
                    <div className="relative w-36 h-36 mb-2">
                        <Image
                            src="/pricing/guaranteed.png"
                            alt="Guaranteed"
                            fill
                            className="rounded-xl object-contain"
                            priority
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            window.location.href = "https://joinsomi.com/";
                        }}
                        className="bg-secondary text-white hover:text-white hover:bg-secondary rounded-2xl"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 font-SofiaSans">
                <div className="w-full max-w-md mx-auto bg-white p-2 rounded-xl shadow-lg flex flex-col items-center">
                    <div className="font-tagesschrift text-center text-4xl -mb-4 md:text-6xl text-secondary font-bold">somi</div>
                    <div className="space-y-2 p-4">
                        <div className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 mx-auto mt-4 mb-6">
                            <Image
                                src="https://res.cloudinary.com/dvmbfolrm/image/upload/v1764026867/fileUploader/w1jmxvaiwra357qqag1k.jpg"
                                alt="skinhairSuccesspic"
                                fill
                                className="rounded-xl object-cover"
                                priority
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 800px"
                            />
                        </div>
                        <h3 className="text-lg md:text-xl text-center">
                            Thank you for completing your Rx Skin Medical Intake Form
                        </h3>
                        <p className="text-gray-600 text-center">
                            Please allow up to 24 hours for one of our clinicians to carefully review your submitted form and get back to you. Thanks for your patience.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            window.location.href = 'https://joinsomi.com/';
                        }}
                        className="bg-secondary text-white hover:text-white hover:bg-secondary rounded-2xl"
                    >
                        End
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-[500px] flex flex-col min-h-screen font-SofiaSans">
            <div className="fixed top-0 left-0 w-full z-40 bg-white">
                <div className="max-w-[500px] mx-auto flex flex-col items-center">
                    <div className="font-tagesschrift text-center text-6xl mt-2 mb-2 text-secondary font-bold">somi</div>
                    <div className="w-full px-6">
                        <ProgressBar progress={progress} />
                        <div className="text-right text-sm text-gray-600 mb-2">
                            {progress}% Complete
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ paddingTop: '120px' }}>
                {isSubmitting && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
                            <p className="text-lg font-medium text-gray-700">Submitting your information...</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6 bg-white rounded-xl border border-gray-200 shadow-secondary shadow-2xl" noValidate>

                    {/* Segment 0: Skin Allergies */}
                    {/* Segment 0: Skin Allergies */}
                    {currentSegment === 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">
                                Are you allergic to any of the medications included in Rx Skin?
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">Disqualifier</span>
                            </h2>
                            <div className="flex flex-col gap-3">
                                {["Azelaic acid", "Niacinamide", "Clindamycin", "Tretinoin", "None of the above"].map((medication, index) => (
                                    <label key={index}
                                        className={`flex items-center max-w-[250px] px-4 py-2 text-sm border rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${errors.skinAllergies ? 'border-red-500' : 'border-blue-400'} ${watch('skinAllergies')?.includes(medication) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                    >
                                        <input type="checkbox" className="hidden" checked={watch('skinAllergies')?.includes(medication) || false} onChange={(e) => handleCheckboxChange('skinAllergies', medication, e.target.checked)} />
                                        <span>{medication}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.skinAllergies && (
                                <div className="error-skinAllergies p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600 font-medium">{errors.skinAllergies.message}</p>
                                    <p className="text-xs text-red-500 mt-1">Please select at least one option to continue</p>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Segment 1: Acne Symptoms */}
                    {/* Segment 1: Acne Symptoms */}
                    {currentSegment === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">What symptoms are you experiencing? <span className="text-red-500">*</span></h2>
                            <div className="space-y-4">
                                {[
                                    { key: 'facialHairAcne', label: 'Acne within facial hair areas' },
                                    { key: 'chestAcne', label: 'Acne affecting the chest' },
                                    { key: 'backAcne', label: 'Acne affecting the back' },
                                    { key: 'painfulLesions', label: 'Large, firm, painful lesions' },
                                    { key: 'recurrentBreakouts', label: 'Recurrent facial acne breakouts' },
                                ].map((symptom, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <Label>{symptom.label} <span className="text-red-500">*</span></Label>
                                        <div className="flex gap-2">
                                            {['yes', 'no'].map((val) => (
                                                <label key={val}
                                                    className={`flex items-center justify-center w-16 px-3 py-1 border rounded-full cursor-pointer ${errors[`acneSymptoms.${symptom.key}`] ? 'border-red-500' : 'border-blue-400'} ${watch(`acneSymptoms.${symptom.key}`) === val ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        value={val}
                                                        className="hidden"
                                                        name={`acneSymptoms.${symptom.key}`}
                                                        checked={watch(`acneSymptoms.${symptom.key}`) === val}
                                                        onChange={(e) => setValue(`acneSymptoms.${symptom.key}`, e.target.value, { shouldValidate: true })}
                                                    />
                                                    <span className="text-sm">{val === 'yes' ? 'Yes' : 'No'}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {Object.keys(errors).some(key => key.includes('acneSymptoms')) && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600 font-medium">Please answer all questions to continue</p>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Segment 2: Tried Acne Products Not Work */}
                    {currentSegment === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Previous Acne Products</h2>
                            <div className="space-y-3">
                                <Label>Have you tried any acne products that did not work? <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2">
                                    {['yes', 'no'].map((val) => (
                                        <label key={val} className={`flex items-center justify-center w-20 px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('triedAcneProductsNotWork') === val ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            <input type="radio" value={val} className="hidden" {...register('triedAcneProductsNotWork')} />
                                            <span>{val === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.triedAcneProductsNotWork && <p className="text-sm text-red-500">{errors.triedAcneProductsNotWork.message}</p>}
                            </div>

                            {watch('triedAcneProductsNotWork') === 'yes' && (
                                <div className="space-y-2">
                                    <Label>Please describe the products that did not work <span className="text-red-500">*</span></Label>
                                    <Textarea {...register('notWorkProductsDesc')} placeholder="List the products and why they didn't work..." />
                                    {errors.notWorkProductsDesc && <p className="text-sm text-red-500">{errors.notWorkProductsDesc.message}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Segment 3: Tried Acne Products Worked */}
                    {currentSegment === 3 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Previous Acne Products</h2>
                            <div className="space-y-3">
                                <Label>Have you tried any acne products that worked? <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2">
                                    {['yes', 'no'].map((val) => (
                                        <label key={val} className={`flex items-center justify-center w-20 px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('triedAcneProductsWorked') === val ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                            <input type="radio" value={val} className="hidden" {...register('triedAcneProductsWorked')} />
                                            <span>{val === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.triedAcneProductsWorked && <p className="text-sm text-red-500">{errors.triedAcneProductsWorked.message}</p>}
                            </div>

                            {watch('triedAcneProductsWorked') === 'yes' && (
                                <div className="space-y-2">
                                    <Label>Please describe the products that worked <span className="text-red-500">*</span></Label>
                                    <Textarea {...register('workedProductsDesc')} placeholder="List the products and how they helped..." />
                                    {errors.workedProductsDesc && <p className="text-sm text-red-500">{errors.workedProductsDesc.message}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Segment 4: Pregnancy/Breastfeeding */}
                    {currentSegment === 4 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">
                                Are you pregnant or are you currently breastfeeding?
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">Disqualifier</span>
                                <span className="text-red-500 ml-2">*</span>
                            </h2>
                            <div className="flex flex-col gap-2 items-center">
                                {['yes', 'no'].map((val) => (
                                    <label key={val} className={`flex items-center justify-center w-[120px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('pregnantBreastfeeding') === val ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                        <input type="radio" value={val} className="hidden" {...register('pregnantBreastfeeding')} />
                                        <span>{val === 'yes' ? 'Yes' : 'No'}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.pregnantBreastfeeding && <p className="text-sm text-red-500">{errors.pregnantBreastfeeding.message}</p>}
                        </div>
                    )}

                    {/* Segment 5: Current Medications */}
                    {currentSegment === 5 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Current Medications</h2>
                            <Label>Are you currently using any medication? <span className="text-red-500">*</span></Label>
                            <div className="flex flex-col gap-2 items-center">
                                {['yes', 'no'].map((val) => (
                                    <label key={val} className={`flex items-center justify-center w-[120px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('currentlyUsingMedication') === val ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                        <input type="radio" value={val} className="hidden" {...register('currentlyUsingMedication')} />
                                        <span>{val === 'yes' ? 'Yes' : 'No'}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.currentlyUsingMedication && <p className="text-sm text-red-500">{errors.currentlyUsingMedication.message}</p>}

                            {watch('currentlyUsingMedication') === 'yes' && (
                                <div className="space-y-2">
                                    <Label>Please provide all the medications you are currently taking, including doses and directions <span className="text-red-500">*</span></Label>
                                    <Textarea {...register('currentMedications')} placeholder="List medications, doses, and directions..." rows={4} />
                                    {errors.currentMedications && <p className="text-sm text-red-500">{errors.currentMedications.message}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Segment 6: Medication Allergies */}
                    {currentSegment === 6 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Medication Allergies</h2>
                            <Label>Are you allergic to any medication? <span className="text-red-500">*</span></Label>
                            <div className="flex flex-col gap-2 items-center">
                                {['yes', 'no'].map((val) => (
                                    <label key={val} className={`flex items-center justify-center w-[120px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('medicationAllergies') === val ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                        <input type="radio" value={val} className="hidden" {...register('medicationAllergies')} />
                                        <span>{val === 'yes' ? 'Yes' : 'No'}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.medicationAllergies && <p className="text-sm text-red-500">{errors.medicationAllergies.message}</p>}

                            {watch('medicationAllergies') === 'yes' && (
                                <div className="space-y-2">
                                    <Label>Please list all medication allergies and type of reactions <span className="text-red-500">*</span></Label>
                                    <Textarea {...register('allergiesList')} placeholder="List allergies and reactions..." rows={4} />
                                    {errors.allergiesList && <p className="text-sm text-red-500">{errors.allergiesList.message}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Segment 7: Acne Photos */}
                    {currentSegment === 7 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Acne Photos <span className="text-red-500">*</span></h2>
                            <Label>Please upload photos of your acne</Label>
                            <UploadFile
                                key="acne-photos"
                                onUploadComplete={(url) => {
                                    setFileUrls(prev => ({ ...prev, acnePhotos: url }));
                                    setValue('acnePhotos', url, { shouldValidate: true });
                                }}
                                onDelete={() => {
                                    setFileUrls(prev => ({ ...prev, acnePhotos: '' }));
                                    setValue('acnePhotos', '', { shouldValidate: true });
                                }}
                                existingFileUrl={fileUrls.acnePhotos}
                            />
                            {errors.acnePhotos && <p className="text-sm text-red-500">{errors.acnePhotos.message}</p>}
                        </div>
                    )}

                    {/* Segment 8: ID Upload */}
                    {currentSegment === 8 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">ID Upload <span className="text-red-500">*</span></h2>
                            <Label>Please upload a GOVERNMENT-ISSUED photo ID</Label>
                            <UploadFile
                                key="id-photo"
                                onUploadComplete={(url) => {
                                    setFileUrls(prev => ({ ...prev, idPhoto: url }));
                                    setValue('idPhoto', url, { shouldValidate: true });
                                }}
                                onDelete={() => {
                                    setFileUrls(prev => ({ ...prev, idPhoto: '' }));
                                    setValue('idPhoto', '', { shouldValidate: true });
                                }}
                                existingFileUrl={fileUrls.idPhoto}
                            />
                            {errors.idPhoto && <p className="text-sm text-red-500">{errors.idPhoto.message}</p>}
                        </div>
                    )}

                    {/* Segment 9: Consent */}
                    {/* Segment 9: Consent */}
                    {currentSegment === 9 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold">
                                Telehealth Consent to Treatment and HIPAA Notice
                            </h3>

                            {/* SKIN-SPECIFIC CONSENT CONTENT */}
                            <h4 className="text-lg font-semibold">
                                Rx Skin Therapy Consent (Azelaic Acid, Niacinamide, Clindamycin, and Tretinoin)
                            </h4>

                            <div className="space-y-4">
                                <p className="text-sm">
                                    This document confirms informed consent for prescription topical skin therapy
                                    containing Azelaic Acid, Niacinamide, Clindamycin, and Tretinoin.
                                </p>

                                <div className="space-y-3">
                                    <h5 className="font-semibold text-base">A. Patient Informed Consent</h5>
                                    <p className="text-sm">
                                        I request treatment at Somi Health and have disclosed all relevant medical information
                                        truthfully and completely. I acknowledge that I have been informed of alternative treatment
                                        options, potential risks, possible side effects, and expected benefits of prescription
                                        topical skin therapy.
                                    </p>
                                    <p className="text-sm">
                                        This compounded medication may contain Azelaic Acid, Niacinamide, Clindamycin, and Tretinoin
                                        and is intended to treat conditions such as acne, hyperpigmentation, inflammation, and skin
                                        texture concerns.
                                    </p>
                                    <p className="text-sm">
                                        I understand this medication is typically applied topically to the skin and may be prepared
                                        by a compounding pharmacy that is not FDA-approved, but is FDA-monitored and third-party tested.
                                        Pricing includes the provider&apos;s time, medical supplies, and medication.
                                    </p>
                                    <p className="text-sm">
                                        I understand that common side effects may include, but are not limited to:
                                    </p>
                                    <ul className="text-sm list-disc pl-5 space-y-1">
                                        <li>Skin dryness</li>
                                        <li>Peeling or flaking</li>
                                        <li>Redness or irritation</li>
                                        <li>Burning or stinging sensation</li>
                                        <li>Temporary darkening or lightening of the skin</li>
                                    </ul>
                                    <p className="text-sm">
                                        I understand rare but serious risks may include:
                                    </p>
                                    <ul className="text-sm list-disc pl-5 space-y-1">
                                        <li>Severe allergic reactions</li>
                                        <li>Significant skin blistering or chemical irritation</li>
                                        <li>Increased sensitivity to sunlight</li>
                                        <li>Antibiotic resistance with improper use of topical antibiotics</li>
                                    </ul>
                                </div>

                                <div className="space-y-3">
                                    <h5 className="font-semibold text-base">B. Patient Responsibilities</h5>
                                    <p className="text-sm">I agree to:</p>
                                    <ul className="text-sm list-disc pl-5 space-y-1">
                                        <li>Obtain compounded prescriptions only through Somi Health</li>
                                        <li>Provide a complete and accurate medical history</li>
                                        <li>Disclose any skin conditions, allergies, pregnancy, or breastfeeding status</li>
                                        <li>Inform my provider of any changes to my health or medications</li>
                                        <li>Follow all application and dosing instructions</li>
                                        <li>Avoid use on broken or severely irritated skin unless instructed</li>
                                        <li>Use sunscreen and protective measures while using tretinoin</li>
                                    </ul>
                                    <p className="text-sm">
                                        I acknowledge that my provider may discontinue or modify treatment if:
                                    </p>
                                    <ul className="text-sm list-disc pl-5 space-y-1">
                                        <li>I experience adverse reactions</li>
                                        <li>The medication is ineffective</li>
                                        <li>I fail to comply with treatment instructions</li>
                                    </ul>
                                </div>

                                <div className="space-y-3">
                                    <h5 className="font-semibold text-base">C. Safety Requirements</h5>
                                    <p className="text-sm">I understand and agree to the following safety requirements:</p>
                                    <ul className="text-sm list-disc pl-5 space-y-1">
                                        <li>Keep medication out of reach of children under 18 years of age</li>
                                        <li>Do not share, give, or sell this medication to any other person</li>
                                        <li>Use medication only as directed</li>
                                        <li>Avoid contact with eyes, mouth, and mucous membranes</li>
                                    </ul>
                                </div>

                                <div className="space-y-3">
                                    <h5 className="font-semibold text-base">D. Financial Acknowledgment</h5>
                                    <p className="text-sm">
                                        I understand that Somi Health, LLC does not accept insurance for this treatment.
                                        This is a self-pay service.
                                    </p>
                                    <p className="text-sm font-semibold">Same-Day Payment</p>
                                    <p className="text-sm">
                                        Self-pay patients are required to pay all costs in full on the same day of service,
                                        including visits, products, and medication. Payment plans may be available.
                                    </p>
                                    <p className="text-sm font-semibold">Self-Pay Patient Definition</p>
                                    <p className="text-sm">
                                        If I do not have insurance or my insurance will not cover this service,
                                        I will be considered a self-pay patient.
                                    </p>
                                    <p className="text-sm font-semibold">Refund Policy</p>
                                    <p className="text-sm">
                                        No refunds, credits, or exchanges are permitted on medications once dispensed,
                                        mixed, or once they have physically left the pharmacy. This policy exists to
                                        ensure product safety and product integrity.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h5 className="font-semibold text-base">E. Somi Health Telehealth Practice State Disclosure</h5>
                                    <p className="text-sm">
                                        I acknowledge that I am receiving healthcare services from Somi Health and understand
                                        that my care is governed by the laws of the state in which I am physically located at
                                        the time of service. I confirm that I am located in one of the following licensed states:
                                    </p>
                                    <p className="text-sm">
                                        Arizona, Connecticut, Colorado, Florida, Georgia, Iowa, Kentucky, Minnesota,
                                        New Jersey, North Carolina, Oklahoma, Tennessee, Texas, or Washington D.C.,
                                        New Hampshire, Washington State.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h5 className="font-semibold text-base">HIPAA Notice</h5>
                                    <p className="text-sm font-semibold">Your Information. Your Rights. Our Responsibilities.</p>
                                    <p className="text-sm font-semibold">Introduction</p>
                                    <p className="text-sm">
                                        This notice explains how your medical information may be used, disclosed, and how you
                                        may access it. Please review it carefully.
                                    </p>
                                    <p className="text-sm font-semibold">Your Rights</p>
                                    <p className="text-sm">You have the right to:</p>
                                    <ul className="text-sm list-disc pl-5 space-y-1">
                                        <li>Obtain a copy of your health records</li>
                                        <li>Request corrections to your records</li>
                                        <li>Request confidential communications</li>
                                        <li>Request restrictions on how your information is used or shared</li>
                                        <li>Receive a list of those with whom your information has been shared</li>
                                        <li>Obtain a copy of this privacy notice</li>
                                        <li>Appoint a personal representative</li>
                                        <li>File a complaint if you believe your privacy rights have been violated</li>
                                    </ul>
                                    <p className="text-sm font-semibold">Contact Information</p>
                                    <p className="text-sm">Somi Health</p>
                                    <p className="text-sm">4111 E Rose Lake Dr</p>
                                    <p className="text-sm">Charlotte, NC 28217</p>
                                    <p className="text-sm">(704) 386-6871</p>
                                    <p className="text-sm">joinsomi.com</p>
                                    <p className="text-sm">Effective Date: 03/15/2025</p>
                                </div>

                                <div className="space-y-3 border-t pt-4">
                                    <h5 className="font-semibold text-base">Legally Binding Consent & Release</h5>
                                    <p className="text-sm">
                                        By signing this document:
                                    </p>
                                    <ul className="text-sm list-disc pl-5 space-y-1">
                                        <li>
                                            I confirm that I have had the opportunity to ask questions about this
                                            treatment and any alternatives, and that all questions were answered
                                            to my satisfaction.
                                        </li>
                                        <li>
                                            I acknowledge that I am voluntarily consenting to receive prescription
                                            topical skin therapy with full knowledge of potential risks and benefits.
                                        </li>
                                        <li>I understand this treatment is elective and cash-based.</li>
                                        <li>
                                            I release and hold harmless Somi Health PLLC, its affiliated providers,
                                            and associated pharmacies from any liability, claim, or damages arising
                                            from the use of this therapy as prescribed.
                                        </li>
                                        <li>
                                            I agree to comply with my provider&apos;s treatment plan, safety instructions,
                                            and follow-up care requirements.
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="flex space-x-2 items-start">
                                        <input
                                            type="checkbox"
                                            id="consent"
                                            {...register('consent')}
                                            className="h-5 w-5 text-secondary mt-1 border-secondary rounded"
                                        />
                                        <label htmlFor="consent" className="text-sm">
                                            I have read the Somi Health Telehealth Consent Form and HIPAA Privacy Notice at:{' '}
                                            <a
                                                href="https://joinsomi.com/telehealth-consent/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-secondary hover:underline"
                                            >
                                                https://joinsomi.com/telehealth-consent/
                                            </a>
                                        </label>
                                    </div>
                                    {errors.consent && <p className="text-sm text-red-500">{errors.consent.message}</p>}

                                    <div className="flex space-x-2 items-start">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            {...register('terms')}
                                            className="h-5 w-5 text-secondary mt-1 border-secondary rounded"
                                        />
                                        <label htmlFor="terms" className="text-sm">
                                            I have read the Somi Health Terms of Service at:{' '}
                                            <a
                                                href="https://joinsomi.com/terms-of-use/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-secondary hover:underline"
                                            >
                                                https://joinsomi.com/terms-of-use/
                                            </a>
                                        </label>
                                    </div>
                                    {errors.terms && <p className="text-sm text-red-500">{errors.terms.message}</p>}

                                    <div className="flex space-x-2 items-start">
                                        <input
                                            type="checkbox"
                                            id="treatment"
                                            {...register('treatment')}
                                            className="h-5 w-5 text-secondary mt-1 border-secondary rounded"
                                        />
                                        <label htmlFor="treatment" className="text-sm">
                                            I have read and understood this document and voluntarily consent to treatment.
                                            I agree to the use of electronic records and electronic signatures and
                                            acknowledge that I have read the related consumer disclosures.
                                        </label>
                                    </div>
                                    {errors.treatment && <p className="text-sm text-red-500">{errors.treatment.message}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Navigation Buttons */}
                    {currentSegment === 0 && (
                        <div className="flex justify-between mt-8">
                            <Button
                                variant="outline"
                                onClick={() => router.back()}
                                type="button"
                                className="bg-secondary text-white hover:text-white hover:bg-secondary rounded-2xl"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleNext}
                                type="button"
                                className="bg-secondary text-white hover:bg-secondary rounded-2xl"
                            >
                                Continue
                            </Button>
                        </div>
                    )}

                    {currentSegment > 0 && currentSegment < totalSegments - 1 && (
                        <div className="flex justify-between mt-8">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                type="button"
                                className="bg-secondary text-white hover:text-white hover:bg-secondary rounded-2xl"
                            >
                                Previous
                            </Button>
                            <Button
                                onClick={handleNext}
                                type="button"
                                className="bg-secondary text-white hover:bg-secondary rounded-2xl"
                            >
                                Continue
                            </Button>
                        </div>
                    )}

                    {currentSegment === totalSegments - 1 && (
                        <div className="flex justify-between mt-8">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                type="button"
                                className="bg-secondary text-white hover:text-white hover:bg-secondary rounded-2xl"
                            >
                                Previous
                            </Button>
                            <Button
                                type="submit"
                                className="bg-secondary text-white hover:bg-secondary rounded-2xl"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Form'}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}