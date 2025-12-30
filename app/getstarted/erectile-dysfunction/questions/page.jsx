"use client";

import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { ArrowDownWideNarrow, ChevronUp, TriangleAlert } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
    // Personal Information
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email("Invalid email address"),
    // Age verification
    isOver18: z.enum(['yes', 'no'], {
        required_error: "You must be at least 18 years old to register",
        invalid_type_error: "Please select an option"
    }),
    // Address
    address: z.string().min(1, "Address is required"),
    address2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "Zip code is required"),
    country: z.string().optional(),
    // Date of Birth
    dob: z.string().min(1, "Date of birth is required")
        .refine(dob => {
            const [month, day, year] = dob.split('/').map(part => parseInt(part.trim()));
            const birthDate = new Date(year, month - 1, day);
            const today = new Date();

            if (isNaN(birthDate.getTime())) return false;

            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                return age - 1 >= 18;
            }
            return age >= 18;
        }, "You must be at least 18 years old"),

    // Medical Questions
    nitratesMedication: z.enum(['yes', 'no'], {
        required_error: "This field is required",
        invalid_type_error: "Please select an option",
    }),
    substanceUse: z.array(z.string()).nonempty("Please select at least one option"),
    symptoms: z.array(z.string()).nonempty("Please select at least one option"),
    cardiovascularConditions: z.array(z.string()).nonempty("Please select at least one option"),
    urologicalConditions: z.array(z.string()).nonempty("Please select at least one option"),
    bloodConditions: z.array(z.string()).nonempty("Please select at least one option"),
    organConditions: z.array(z.string()).nonempty("Please select at least one option"),
    neurologicalConditions: z.enum(['yes', 'no'], {
        required_error: "This field is required",
        invalid_type_error: "Please select an option"
    }),
    cancerConditions: z.enum(['yes', 'no'], {
        required_error: "This field is required",
        invalid_type_error: "Please select an option"
    }),
    eyeConditions: z.enum(['yes', 'no'], {
        required_error: "This field is required",
        invalid_type_error: "Please select an option"
    }),

    // Current medications
    currentMedications: z.enum(['yes', 'no'], {
        required_error: "This field is required",
        invalid_type_error: "Please select an option"
    }),
    medicationsList: z.string().optional(),

    // Allergies
    medicationAllergies: z.enum(['yes', 'no'], {
        required_error: "This field is required",
        invalid_type_error: "Please select an option"
    }),
    allergiesList: z.string().optional(),

    // Additional medical conditions - QUESTION 15
    medicalConditions: z.enum(['yes', 'no'], {
        required_error: "This field is required",
        invalid_type_error: "Please select an option"
    }),
    medicalConditionsList: z.string().optional(),

    // ED Symptoms
    erectionChallenges: z.enum(['yes', 'no'], {
        required_error: "This field is required",
        invalid_type_error: "Please select an option"
    }),
    erectionSustaining: z.enum(['yes', 'no'], {
        required_error: "This field is required",
        invalid_type_error: "Please select an option"
    }),
    erectionChange: z.enum(['yes', 'no'], {
        required_error: "This field is required",
        invalid_type_error: "Please select an option"
    }),
    // QUESTION 19 - Fixed to be radio buttons as per requirements
    sexualEncounters: z.enum(['1-5', '5+'], {
        required_error: "This field is required",
        invalid_type_error: "Please select an option"
    }),
    nonPrescriptionSupplements: z.enum(['yes', 'no'], {
        required_error: "This field is required",
        invalid_type_error: "Please select an option"
    }),

    // Previous ED treatment
    previousEDMeds: z.enum(['yes', 'no'], {
        required_error: "This field is required",
        invalid_type_error: "Please select an option"
    }),

    // Uploads
    edMedicationPhoto: z.string().optional(),
    idPhoto: z.string().min(1, "This field is required"),

    // How did you hear about us
    heardAbout: z.enum(['Instagram', 'Facebook', 'TikTok', 'Other'], {
        required_error: "Please tell us how you heard about us",
    }),
    heardAboutOther: z.string().optional(),
    comments: z.string().optional(),

    // Consent
    consent: z.boolean().refine(val => val === true, "You must consent to proceed"),
    terms: z.boolean().refine(val => val === true, "You must agree to the terms"),
    treatment: z.boolean().refine(val => val === true, "You must consent to treatment"),
    agreetopay: z.boolean().refine(val => val === true, "You must consent to agree to pay"),

    // Medication Interest
    currentMedication: z.string().min(1, "Please select an ED medication"),
    currentDose: z.string().min(1, "Please select your dose"),
});

const segments = [
    { id: 'personal', name: 'Personal Information' },
    { id: 'age', name: 'Age Verification' },
    { id: 'dob', name: 'Date of Birth' },
    { id: 'address', name: 'Shipping Address' },
    { id: 'warning', name: 'Medical Warning' },
    { id: 'nitrates', name: 'Medication Check' },
    { id: 'substance', name: 'Substance Use' },
    { id: 'symptoms', name: 'Symptoms' },
    { id: 'cardiovascular', name: 'Heart Conditions' },
    { id: 'urological', name: 'Urological Conditions' },
    { id: 'blood', name: 'Blood Conditions' },
    { id: 'organ', name: 'Organ Conditions' },
    { id: 'neurological', name: 'Neurological Conditions' },
    { id: 'cancer', name: 'Cancer History' },
    { id: 'eye', name: 'Eye Conditions' },
    { id: 'currentMeds', name: 'Current Medications' },
    { id: 'allergies', name: 'Medication Allergies' },
    { id: 'medicalConditions', name: 'Medical Conditions' },
    { id: 'edSymptoms1', name: 'ED Symptoms Part 1' },
    { id: 'edSymptoms2', name: 'ED Symptoms Part 2' },
    { id: 'previousTreatment', name: 'Previous ED Treatment' },
    { id: 'interestedMedication', name: 'Medication Selection' },
    { id: 'edMedUpload', name: 'ED Medication Upload' },
    { id: 'idUpload', name: 'ID Upload' },
    { id: 'comments', name: 'Comments & Feedback' },
    { id: 'consent', name: 'Telehealth Consent' },
];

// Medication options
const medicationOptions = {
    'Sildenafil (Generic of Viagra)': ['25mg', '50mg', '100mg'],
    'Tadalafil (Generic of Cialis)': ['5mg', '10mg', '20mg'],
    'Fusion Mini Troches (Tadalafil/Sildenafil)': ['5/35mg', '10/40mg']
};

// Custom progress bar component
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

export default function EDQuestionnaireForm() {
    const router = useRouter();
    const [currentSegment, setCurrentSegment] = useState(0);
    const [showIneligible, setShowIneligible] = useState(false);
    const [fileUrls, setFileUrls] = useState({ file1: '', file2: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [userSessionId, setUserSessionId] = useState("");
    const [previousBasicData, setPreviousBasicData] = useState(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
        trigger,
        setValue,
        control,
    } = useForm({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
    });

    const formValues = watch();
    // Safely get shape from schema which might be ZodEffects due to superRefine
    const schemaShape = formSchema._def.schema ? formSchema._def.schema.shape : formSchema.shape;
    const schemaFields = Object.keys(schemaShape);
    const totalFields = schemaFields.length;
    const completedFields = schemaFields.filter(
        (key) => formValues[key] && !errors[key]
    ).length;
    const progress = Math.round((completedFields / totalFields) * 100);
    const firstName = watch("firstName");
    const lastName = watch("lastName");
    const phone = watch("phone");
    const email = watch("email");
    const currentMedication = watch("currentMedication");
    const currentDose = watch("currentDose");

    // Helper function to handle checkbox changes
    const handleCheckboxChange = (field, value, checked) => {
        const currentValues = watch(field) || [];
        if (checked) {
            setValue(field, [...currentValues, value]);
        } else {
            setValue(field, currentValues.filter(item => item !== value));
        }
    };

    // Generate session ID once
    useEffect(() => {
        let id = localStorage.getItem("edSessionId");
        if (!id) {
            id = `ED-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            localStorage.setItem("edSessionId", id);
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

        fetch("/api/ed-abandonment", {
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

            fetch("/api/ed-abandonment", {
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

    // Render ineligible state
    if (showIneligible) {
        // Track ineligible state
        const currentData = { firstName, lastName, phone, email };
        fetch("/api/ed-abandonment", {
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

        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-2 font-SofiaSans">
                <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
                    <div className="font-tagesschrift text-center text-6xl mb-2 text-secondary font-bold">somi</div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 text-center mb-4">
                        Based on your responses, you currently do not meet the criteria for erectile dysfunction medication.
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

    // Render success state
    if (showSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 font-SofiaSans">
                <div className="w-full max-w-md mx-auto bg-white p-2 rounded-xl shadow-lg flex flex-col items-center">
                    <div className="font-tagesschrift text-center text-4xl -mb-4 md:text-6xl text-secondary font-bold">somi</div>

                    <div className="space-y-2 p-4">
                        <div className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 mx-auto mt-4 mb-6">
                            <Image
                                src="https://res.cloudinary.com/dvmbfolrm/image/upload/v1764026433/fileUploader/ndlhh6jb3defevddp7rq.jpg"
                                alt="edsuccesspic"
                                fill
                                className="rounded-xl object-cover"
                                priority
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 800px"
                            />
                        </div>
                        <h3 className="text-lg md:text-x text-center">
                            Thank you for completing your ED Intake form
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

    const handleNext = async () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Age verification
        if (currentSegment === 1) { // Changed from 2 to 1
            const isOver18Valid = watch('isOver18') === 'yes';
            if (!isOver18Valid) {
                setShowIneligible(true);
                return;
            }
            setShowIneligible(false);
            setCurrentSegment(currentSegment + 1);
            return;
        }

        const segmentFields = getSegmentFields(segments[currentSegment].id);
        const isValid = await trigger(segmentFields);

        if (isValid && currentSegment < segments.length - 1) {
            // Check for disqualifying conditions
            const currentSegmentId = segments[currentSegment].id;
            const currentValues = watch();

            // Function to check if only "None of the above" is selected
            const hasOnlyNoneOfTheAbove = (field) => {
                const values = currentValues[field];
                return Array.isArray(values) && values.length === 1 && values.includes('None of the above');
            };

            // Function to check if "None of the above" is not selected but other options are
            const hasOtherOptionsSelected = (field) => {
                const values = currentValues[field];
                return Array.isArray(values) && values.length > 0 && !values.includes('None of the above');
            };

            let isIneligible = false;

            switch (currentSegmentId) {
                case 'nitrates':
                    if (watch('nitratesMedication') === 'yes') {
                        isIneligible = true;
                    }
                    break;
                case 'substance':
                    if (hasOtherOptionsSelected('substanceUse')) {
                        isIneligible = true;
                    }
                    break;
                case 'symptoms':
                    if (hasOtherOptionsSelected('symptoms')) {
                        isIneligible = true;
                    }
                    break;
                case 'cardiovascular':
                    if (hasOtherOptionsSelected('cardiovascularConditions')) {
                        isIneligible = true;
                    }
                    break;
                case 'urological':
                    if (hasOtherOptionsSelected('urologicalConditions')) {
                        isIneligible = true;
                    }
                    break;
                case 'blood':
                    if (hasOtherOptionsSelected('bloodConditions')) {
                        isIneligible = true;
                    }
                    break;
                case 'organ':
                    if (hasOtherOptionsSelected('organConditions')) {
                        isIneligible = true;
                    }
                    break;
                case 'neurological':
                    if (watch('neurologicalConditions') === 'yes') {
                        isIneligible = true;
                    }
                    break;
                case 'cancer':
                    if (watch('cancerConditions') === 'yes') {
                        isIneligible = true;
                    }
                    break;
                case 'eye':
                    if (watch('eyeConditions') === 'yes') {
                        isIneligible = true;
                    }
                    break;
            }

            if (isIneligible) {
                setShowIneligible(true);
                return;
            }

            let count = 1;
            if (currentSegmentId === 'interestedMedication' && watch('previousEDMeds') === 'no') {
                count = 2;
            }

            setShowIneligible(false);
            setCurrentSegment(currentSegment + count);
        }
    };

    const handlePrevious = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (currentSegment > 0) {
            const currentSegmentId = segments[currentSegment].id;
            let decrement = 1;
            if (currentSegmentId === 'idUpload' && watch('previousEDMeds') === 'no') {
                decrement = 2;
            }
            setCurrentSegment(currentSegment - decrement);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        try {
            // Format date from "MM / DD / YYYY" to ISO string
            const [month, day, year] = data.dob.split('/').map(part => part.trim());
            const formattedDate = new Date(year, month - 1, day).toISOString();

            const submissionData = {
                ...data,
                dateOfBirth: formattedDate,
                edMedicationPhoto: fileUrls.file1,
                idPhoto: fileUrls.file2,
                authid: `ED${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
                questionnaire: true,
            };

            const response = await fetch('/api/ed-questionnaire', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to submit form');
            }

            // Track form completion
            if (userSessionId) {
                const currentData = {
                    firstName: watch("firstName"),
                    lastName: watch("lastName"),
                    phone: watch("phone"),
                    email: watch("email"),
                };

                fetch("/api/ed-abandonment", {
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

                localStorage.removeItem("edSessionId");
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

    const getSegmentFields = (segmentId) => {
        switch (segmentId) {
            case 'personal': return ['firstName', 'lastName', 'phone', 'email'];
            case 'age': return ['isOver18'];
            case 'dob': return ['dob'];
            case 'address': return ['address', 'address2', 'city', 'state', 'zip', 'country'];
            case 'warning': return [];
            case 'nitrates': return ['nitratesMedication'];
            case 'substance': return ['substanceUse'];
            case 'symptoms': return ['symptoms'];
            case 'cardiovascular': return ['cardiovascularConditions'];
            case 'urological': return ['urologicalConditions'];
            case 'blood': return ['bloodConditions'];
            case 'organ': return ['organConditions'];
            case 'neurological': return ['neurologicalConditions'];
            case 'cancer': return ['cancerConditions'];
            case 'eye': return ['eyeConditions'];
            case 'currentMeds': return ['currentMedications'];
            case 'allergies': return ['medicationAllergies'];
            case 'medicalConditions': return ['medicalConditions']; // QUESTION 15
            case 'edSymptoms1': return ['erectionChallenges', 'erectionSustaining', 'erectionChange'];
            case 'edSymptoms2': return ['sexualEncounters', 'nonPrescriptionSupplements'];
            case 'previousTreatment': return ['previousEDMeds'];
            case 'interestedMedication': return ['currentMedication', 'currentDose'];
            case 'edMedUpload': return ['edMedicationPhoto'];
            case 'idUpload': return ['idPhoto'];
            case 'comments': return ['heardAbout', 'heardAboutOther', 'comments'];
            case 'consent': return ['consent', 'terms', 'treatment', 'agreetopay'];
            default: return [];
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-[500px] flex flex-col min-h-screen font-SofiaSans">
            {/* Sticky header for logo and progress bar */}
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

            {/* Add top padding to prevent overlap with fixed header */}
            <div style={{ paddingTop: '120px' }}>
                {/* Loading Overlay */}
                {isSubmitting && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
                            <p className="text-lg font-medium text-gray-700">Submitting your information...</p>
                        </div>
                    </div>
                )}

                {/* Form segments */}
                <form
                    onSubmit={(e) => {
                        handleSubmit(onSubmit)(e);
                    }}
                    className="space-y-8 p-6 bg-white rounded-xl border border-gray-200 shadow-secondary shadow-2xl"
                    noValidate
                >
                    {/* Personal Information segment */}
                    {currentSegment === 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Let&apos;s get to know you!</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">
                                        First name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="firstName" {...register('firstName')} />
                                    {errors.firstName && (
                                        <p className="text-sm text-red-500">{errors.firstName.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">
                                        Last name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="lastName" {...register('lastName')} />
                                    {errors.lastName && (
                                        <p className="text-sm text-red-500">{errors.lastName.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    Phone number <span className="text-red-500">*</span>
                                </Label>
                                <Input id="phone" type="tel" {...register('phone')} />
                                {errors.phone && (
                                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <Input id="email" type="email" {...register('email')} />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Age verification segment */}
                    {currentSegment === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Age Verification</h2>
                            <div className="space-y-2">
                                <Label>
                                    Are you over 18? <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2 justify-center flex-col items-center">
                                    {['yes', 'no'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`isOver18-${index}`}
                                            className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('isOver18') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`isOver18-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('isOver18')}
                                            />
                                            <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.isOver18 && (
                                    <p className="text-sm text-red-500">{errors.isOver18.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Date of Birth segment */}
                    {currentSegment === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Date of Birth</h2>
                            <div className="space-y-2">
                                <Label htmlFor="dob">
                                    Date of Birth <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative w-[200px]">
                                    <Input
                                        id="dob"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="MM / DD / YYYY"
                                        className="bg-gray-50 border text-base sm:text-base border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                        {...register('dob', {
                                            pattern: {
                                                value: /^(0[1-9]|1[0-2])\s\/\s(0[1-9]|[12][0-9]|3[01])\s\/\s(19|20)\d{2}$/,
                                                message: "Please use MM / DD / YYYY format"
                                            }
                                        })}
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/\D/g, '');

                                            // Handle backspace
                                            if (e.nativeEvent.inputType === 'deleteContentBackward') {
                                                e.target.value = value;
                                                return;
                                            }

                                            // Format the input
                                            if (value.length <= 8) {
                                                let formatted = value;
                                                if (value.length > 4) {
                                                    formatted = `${value.slice(0, 2)} / ${value.slice(2, 4)} / ${value.slice(4)}`;
                                                } else if (value.length > 2) {
                                                    formatted = `${value.slice(0, 2)} / ${value.slice(2)}`;
                                                }
                                                e.target.value = formatted;
                                            }

                                            // Validate month
                                            if (value.length >= 2) {
                                                const month = parseInt(value.slice(0, 2));
                                                if (month > 12) {
                                                    e.target.value = `12 / ${value.slice(2)}`;
                                                }
                                            }

                                            // Validate day
                                            if (value.length >= 4) {
                                                const month = parseInt(value.slice(0, 2));
                                                const day = parseInt(value.slice(2, 4));
                                                const maxDay = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
                                                if (day > maxDay) {
                                                    e.target.value = `${value.slice(0, 2)} / ${maxDay} / ${value.slice(4)}`;
                                                }
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            // Prevent form submission when Enter is pressed
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                return;
                                            }

                                            // Allow: backspace, delete, tab, escape, enter
                                            if ([8, 46, 9, 27, 13].includes(e.keyCode)) {
                                                return;
                                            }
                                            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                            if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) {
                                                return;
                                            }
                                            // Allow: home, end, left, right
                                            if ([35, 36, 37, 39].includes(e.keyCode)) {
                                                return;
                                            }
                                            // Block any other key that's not a number
                                            if (!/^\d$/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                    {errors.dob && (
                                        <p className="text-sm text-red-500">{errors.dob.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Address segment */}
                    {currentSegment === 3 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Shipping Address</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">
                                        Address line 1 <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="address"
                                        {...register('address')}
                                    />
                                    {errors.address && (
                                        <p className="text-sm text-red-500">{errors.address.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address2">Address line 2</Label>
                                    <Input
                                        id="address2"
                                        {...register('address2')}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">
                                            City/Town <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="city"
                                            {...register('city')}
                                        />
                                        {errors.city && (
                                            <p className="text-sm text-red-500">{errors.city.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">
                                            State/Region/Province <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="state"
                                            {...register('state')}
                                        />
                                        {errors.state && (
                                            <p className="text-sm text-red-500">{errors.state.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="zip">
                                            Zip/Post code <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="zip"
                                            {...register('zip')}
                                        />
                                        {errors.zip && (
                                            <p className="text-sm text-red-500">{errors.zip.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            {...register('country')}
                                        />
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm flex items-center gap-1 sm:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis">
                                    <TriangleAlert className="text-gray-700 flex-shrink-0" size={15} />
                                    <span>Please make sure the information provided is accurate.</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Warning segment */}
                    {currentSegment === 4 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-SofiaSans text-secondary text-center font-semibold">If you are noticing any of these symptoms or have been diagnosed with any of these conditions, we recommend scheduling an in-person visit with your doctor or specialist.</h2>
                        </div>
                    )}

                    {/* Nitrates Medication segment - QUESTION 1 */}
                    {currentSegment === 5 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Medication Check</h2>
                            <div className="space-y-4">
                                <Label>
                                    Are you currently using nitrates or alpha-blockers medication? <span className="text-red-500">*</span>
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                                </Label>
                                <div className="flex gap-2 justify-center flex-col items-center">
                                    {['yes', 'no'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`nitrates-${index}`}
                                            className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('nitratesMedication') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`nitrates-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('nitratesMedication')}
                                            />
                                            <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.nitratesMedication && (
                                    <p className="text-sm text-red-500">{errors.nitratesMedication.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Substance Use segment - QUESTION 2 */}
                    {currentSegment === 6 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Substance Use</h2>
                            <div className="space-y-2">
                                <Label>
                                    Are you currently using any of these substances? <span className="text-red-500">*</span>
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                                </Label>
                                <div className="flex flex-col gap-3">
                                    {[
                                        'Cocaine',
                                        'Poppers',
                                        'None of the above'
                                    ].map((substance, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`substance-${index}`}
                                            className={`flex items-center px-4 max-w-[180px] py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('substanceUse')?.includes(substance) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                id={`substance-${index}`}
                                                className="hidden"
                                                checked={watch('substanceUse')?.includes(substance) || false}
                                                onChange={(e) => handleCheckboxChange('substanceUse', substance, e.target.checked)}
                                            />
                                            <span>
                                                {substance}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.substanceUse && (
                                    <p className="text-sm text-red-500">{errors.substanceUse.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Symptoms segment - QUESTION 3 */}
                    {currentSegment === 7 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Symptoms</h2>
                            <div className="space-y-2">
                                <Label>
                                    Are you experiencing any of these symptoms? <span className="text-red-500">*</span>
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                                </Label>
                                <div className="flex flex-col gap-3">
                                    {[
                                        'Chest pain or Shortness of breath when going up the stairs, walking few miles or during sexual activities',
                                        'Prolonged Leg cramps with exercise',
                                        'Palpitations',
                                        'Frequent urination, weak stream, or nocturia',
                                        'None of the above'
                                    ].map((symptom, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`symptom-${index}`}
                                            className={`flex items-center px-4 w-full py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('symptoms')?.includes(symptom) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                id={`symptom-${index}`}
                                                className="hidden"
                                                checked={watch('symptoms')?.includes(symptom) || false}
                                                onChange={(e) => handleCheckboxChange('symptoms', symptom, e.target.checked)}
                                            />
                                            <span>
                                                {symptom}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.symptoms && (
                                    <p className="text-sm text-red-500">{errors.symptoms.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Cardiovascular Conditions segment - QUESTION 4 */}
                    {currentSegment === 8 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Cardiovascular / Heart Conditions</h2>
                            <div className="space-y-2">
                                <Label>
                                    Have you been diagnosed with any of the following? <span className="text-red-500">*</span>
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                                </Label>
                                <div className="flex flex-col gap-3">
                                    {[
                                        'History of heart attack, stroke, or narrowing of the arteries',
                                        'Angina',
                                        'Heart arrhythmia',
                                        'Congestive heart failure (CHF)',
                                        'Abnormal heart valve',
                                        'History of QT prolongation',
                                        'Uncontrolled high blood pressure (Hypertension)',
                                        'Congenital heart issues (present from birth)',
                                        'Peripheral vascular disease (PVD)',
                                        'None of the above'
                                    ].map((condition, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`cardio-${index}`}
                                            className={`flex items-center px-4 w-full py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('cardiovascularConditions')?.includes(condition) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                id={`cardio-${index}`}
                                                className="hidden"
                                                checked={watch('cardiovascularConditions')?.includes(condition) || false}
                                                onChange={(e) => handleCheckboxChange('cardiovascularConditions', condition, e.target.checked)}
                                            />
                                            <span>
                                                {condition}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.cardiovascularConditions && (
                                    <p className="text-sm text-red-500">{errors.cardiovascularConditions.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Urological Conditions segment - QUESTION 5 */}
                    {currentSegment === 9 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Urological / Reproductive Conditions</h2>
                            <div className="space-y-2">
                                <Label>
                                    Have you been diagnosed with any of the following? <span className="text-red-500">*</span>
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                                </Label>
                                <div className="flex flex-col gap-3">
                                    {[
                                        'Priapism (erection lasting longer than 4 hours)',
                                        'Scarring or other physical issues related to the penis (e.g., Peyronie\'s disease)',
                                        'Prostate cancer or enlarged prostate (BPH)',
                                        'None of the above'
                                    ].map((condition, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`uro-${index}`}
                                            className={`flex items-center px-4 w-full py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('urologicalConditions')?.includes(condition) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                id={`uro-${index}`}
                                                className="hidden"
                                                checked={watch('urologicalConditions')?.includes(condition) || false}
                                                onChange={(e) => handleCheckboxChange('urologicalConditions', condition, e.target.checked)}
                                            />
                                            <span>
                                                {condition}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.urologicalConditions && (
                                    <p className="text-sm text-red-500">{errors.urologicalConditions.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Blood Conditions segment - QUESTION 6 */}
                    {currentSegment === 10 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Hematologic / Blood Conditions</h2>
                            <div className="space-y-2">
                                <Label>
                                    Have you been diagnosed with any of the following? <span className="text-red-500">*</span>
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                                </Label>
                                <div className="flex flex-col gap-3">
                                    {[
                                        'Blood clotting or bleeding disorders',
                                        'Sickle cell anemia',
                                        'None of the above'
                                    ].map((condition, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`blood-${index}`}
                                            className={`flex items-center px-4 max-w-[280px] py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('bloodConditions')?.includes(condition) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                id={`blood-${index}`}
                                                className="hidden"
                                                checked={watch('bloodConditions')?.includes(condition) || false}
                                                onChange={(e) => handleCheckboxChange('bloodConditions', condition, e.target.checked)}
                                            />
                                            <span>
                                                {condition}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.bloodConditions && (
                                    <p className="text-sm text-red-500">{errors.bloodConditions.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Organ Conditions segment - QUESTION 7 */}
                    {currentSegment === 11 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Liver, Kidney, and Gastrointestinal Conditions</h2>
                            <div className="space-y-2">
                                <Label>
                                    Have you been diagnosed with any of the following? <span className="text-red-500">*</span>
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                                </Label>
                                <div className="flex flex-col gap-3">
                                    {[
                                        'Liver disease',
                                        'Kidney disease',
                                        'Stomach or gastrointestinal cancer',
                                        'Gastrointestinal ulcer',
                                        'None of the above'
                                    ].map((condition, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`organ-${index}`}
                                            className={`flex items-center px-4 max-w-[300px] py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('organConditions')?.includes(condition) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                id={`organ-${index}`}
                                                className="hidden"
                                                checked={watch('organConditions')?.includes(condition) || false}
                                                onChange={(e) => handleCheckboxChange('organConditions', condition, e.target.checked)}
                                            />
                                            <span>
                                                {condition}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.organConditions && (
                                    <p className="text-sm text-red-500">{errors.organConditions.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Neurological Conditions segment - QUESTION 8 */}
                    {currentSegment === 12 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Neurological / Nervous System Conditions</h2>
                            <div className="space-y-4">
                                <Label>
                                    Have you been diagnosed with Multiple sclerosis (MS) or other nervous system disorders? <span className="text-red-500">*</span>
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                                </Label>
                                <div className="flex gap-2 justify-center flex-col items-center">
                                    {['yes', 'no'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`neuro-${index}`}
                                            className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('neurologicalConditions') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`neuro-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('neurologicalConditions')}
                                            />
                                            <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.neurologicalConditions && (
                                    <p className="text-sm text-red-500">{errors.neurologicalConditions.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Cancer Conditions segment - QUESTION 9 */}
                    {currentSegment === 13 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Cancer History</h2>
                            <div className="space-y-4">
                                <Label>
                                    Have you been diagnosed with any cancers? <span className="text-red-500">*</span>
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                                </Label>
                                <div className="flex gap-2 justify-center flex-col items-center">
                                    {['yes', 'no'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`cancer-${index}`}
                                            className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('cancerConditions') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`cancer-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('cancerConditions')}
                                            />
                                            <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.cancerConditions && (
                                    <p className="text-sm text-red-500">{errors.cancerConditions.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Eye Conditions segment - QUESTION 10 */}
                    {currentSegment === 14 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Eye / Vision Conditions</h2>
                            <div className="space-y-4">
                                <Label>
                                    Have you been diagnosed with Retinitis pigmentosa or anterior ischemic optic neuropathy (AION)? <span className="text-red-500">*</span>
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                                </Label>
                                <div className="flex gap-2 justify-center flex-col items-center">
                                    {['yes', 'no'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`eye-${index}`}
                                            className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('eyeConditions') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`eye-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('eyeConditions')}
                                            />
                                            <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.eyeConditions && (
                                    <p className="text-sm text-red-500">{errors.eyeConditions.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Current Medications segment - QUESTION 11 */}
                    {currentSegment === 15 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Current Medications</h2>
                            <div className="space-y-4">
                                <Label>
                                    Are you currently using any medication? <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2 justify-center flex-col items-center">
                                    {['yes', 'no'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`currentMeds-${index}`}
                                            className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('currentMedications') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`currentMeds-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('currentMedications')}
                                            />
                                            <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.currentMedications && (
                                    <p className="text-sm text-red-500">{errors.currentMedications.message}</p>
                                )}

                                {/* Show textarea if Yes is selected - QUESTION 12 */}
                                {watch('currentMedications') === 'yes' && (
                                    <div className="mt-4 space-y-2">
                                        <Label htmlFor="medicationsList">
                                            Please provide all the medications you are currently taking, including doses and directions <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="medicationsList"
                                            {...register('medicationsList')}
                                            placeholder="List all medications, doses, and directions..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Medication Allergies segment - QUESTION 13 */}
                    {currentSegment === 16 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Medication Allergies</h2>
                            <div className="space-y-4">
                                <Label>
                                    Are you allergic to any medication? <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2 justify-center flex-col items-center">
                                    {['yes', 'no'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`allergies-${index}`}
                                            className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('medicationAllergies') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`allergies-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('medicationAllergies')}
                                            />
                                            <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.medicationAllergies && (
                                    <p className="text-sm text-red-500">{errors.medicationAllergies.message}</p>
                                )}

                                {/* Show textarea if Yes is selected - QUESTION 14 */}
                                {watch('medicationAllergies') === 'yes' && (
                                    <div className="mt-4 space-y-2">
                                        <Label htmlFor="allergiesList">
                                            Please list all the medication allergies and type of reactions <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="allergiesList"
                                            {...register('allergiesList')}
                                            placeholder="List all allergies and reactions..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Other Medical Conditions segment - QUESTION 15 */}
                    {currentSegment === 17 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Medical Conditions</h2>
                            <div className="space-y-4">
                                <Label>
                                    Do you have any medical conditions? <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2 justify-center flex-col items-center">
                                    {['yes', 'no'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`medicalConditions-${index}`}
                                            className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('medicalConditions') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`medicalConditions-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('medicalConditions')}
                                            />
                                            <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.medicalConditions && (
                                    <p className="text-sm text-red-500">{errors.medicalConditions.message}</p>
                                )}

                                {/* Show textarea if Yes is selected */}
                                {watch('medicalConditions') === 'yes' && (
                                    <div className="mt-4 space-y-2">
                                        <Label htmlFor="medicalConditionsList">
                                            Please list all medical conditions <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="medicalConditionsList"
                                            {...register('medicalConditionsList')}
                                            placeholder="List all medical conditions..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ED Symptoms Part 1 segment - QUESTIONS 16, 17, 18 */}
                    {currentSegment === 18 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">ED Symptoms</h2>

                            <div className="space-y-4">
                                <Label>
                                    Have you noticed challenges with getting an erection in the past 6 months? <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2 justify-center flex-col items-center">
                                    {['yes', 'no'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`challenges-${index}`}
                                            className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('erectionChallenges') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`challenges-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('erectionChallenges')}
                                            />
                                            <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.erectionChallenges && (
                                    <p className="text-sm text-red-500">{errors.erectionChallenges.message}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <Label>
                                    Have you experienced trouble sustaining an erection in the past 6 months? <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2 justify-center flex-col items-center">
                                    {['yes', 'no'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`sustaining-${index}`}
                                            className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('erectionSustaining') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`sustaining-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('erectionSustaining')}
                                            />
                                            <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.erectionSustaining && (
                                    <p className="text-sm text-red-500">{errors.erectionSustaining.message}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <Label>
                                    Did you notice a sudden change in erectile function, or did it gradually worsen? <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2 justify-center flex-col items-center">
                                    {['yes', 'no'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`change-${index}`}
                                            className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('erectionChange') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`change-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('erectionChange')}
                                            />
                                            <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.erectionChange && (
                                    <p className="text-sm text-red-500">{errors.erectionChange.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ED Symptoms Part 2 segment - QUESTIONS 19, 20 */}
                    {segments[currentSegment].id === 'edSymptoms2' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Additional ED Information</h2>

                            <div className="space-y-4">
                                <Label>
                                    In a typical month, how many sexual encounters do you have? <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2 justify-center flex-col items-center">
                                    {['1-5', '5+'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`encounters-${index}`}
                                            className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('sexualEncounters') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`encounters-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('sexualEncounters')}
                                            />
                                            <span>{option === '1-5' ? '1-5' : '5+'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.sexualEncounters && (
                                    <p className="text-sm text-red-500">{errors.sexualEncounters.message}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <Label>
                                    Have you used any non-prescription supplements to help with erectile issues? <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2 justify-center flex-col items-center">
                                    {['yes', 'no'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`supplements-${index}`}
                                            className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('nonPrescriptionSupplements') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`supplements-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('nonPrescriptionSupplements')}
                                            />
                                            <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.nonPrescriptionSupplements && (
                                    <p className="text-sm text-red-500">{errors.nonPrescriptionSupplements.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Previous ED Treatment segment - QUESTION 21 */}
                    {segments[currentSegment].id === 'previousTreatment' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Previous ED Treatment</h2>
                            <div className="space-y-4">
                                <Label>
                                    Have you previously taken prescription drugs for erectile dysfunction such as Sildenafil (Viagra) and Tadalafil (Cialis)? <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2 justify-center flex-col items-center">
                                    {['yes', 'no'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`previousED-${index}`}
                                            className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('previousEDMeds') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`previousED-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('previousEDMeds')}
                                            />
                                            <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.previousEDMeds && (
                                    <p className="text-sm text-red-500">{errors.previousEDMeds.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Interested Medication Selection segment */}
                    {segments[currentSegment].id === 'interestedMedication' && (
                        <div className="space-y-4 text-center">
                            <Label className="text-xl font-semibold mb-4 block">
                                Which ED medication are you interested in? <span className="text-red-500">*</span>
                            </Label>

                            {/* Medication selection - using button-style design */}
                            <div className="space-y-4 flex flex-col items-center">
                                {Object.entries(medicationOptions).map(([medication, doses]) => (
                                    <div key={medication} className="space-y-3 w-full flex flex-col items-center">
                                        {/* Medication option as button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setValue('currentMedication', medication);
                                                setValue('currentDose', ''); // Reset dose when changing medication
                                            }}
                                            className={`w-full flex items-center max-w-[280px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${currentMedication === medication ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                                        >
                                            <span className="text-sm font-medium">{medication}</span>
                                        </button>

                                        {/* Show doses only if this medication is selected */}
                                        {currentMedication === medication && (
                                            <div className="space-y-2 w-full flex flex-col items-center">
                                                <Label className="text-sm text-gray-600">Select your preferred dose:</Label>
                                                <div className="flex flex-wrap gap-2 justify-center">
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

                    {/* ED Medication Upload segment - QUESTION 22 */}
                    {segments[currentSegment].id === 'edMedUpload' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">ED Medication Upload</h2>
                            <div className="space-y-2">
                                <Label>
                                    {watch('previousEDMeds') === 'yes'
                                        ? "Please upload a photo of your current ED medication"
                                        : "Skip this section if you don't have previous ED medication"}
                                </Label>
                                <UploadFile
                                    onUploadComplete={(url) => {
                                        setFileUrls(prev => ({ ...prev, file1: url }));
                                        setValue('edMedicationPhoto', url);
                                    }}
                                    onDelete={() => {
                                        setFileUrls(prev => ({ ...prev, file1: '' }));
                                        setValue('edMedicationPhoto', '');
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ID Upload segment - QUESTION 23 */}
                    {segments[currentSegment].id === 'idUpload' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">ID Upload</h2>
                            <div className="space-y-2">
                                <Label>
                                    Please upload your GOVERNMENT-ISSUED photo ID <span className="text-red-500">*</span>
                                </Label>
                                <UploadFile
                                    onUploadComplete={(url) => {
                                        setFileUrls(prev => ({ ...prev, file2: url }));
                                        setValue('idPhoto', url);
                                    }}
                                    onDelete={() => {
                                        setFileUrls(prev => ({ ...prev, file2: '' }));
                                        setValue('idPhoto', '');
                                    }}
                                />
                                {errors.idPhoto && (
                                    <p className="text-sm text-red-500">{errors.idPhoto.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* How did you hear about us + Comments segment */}
                    {segments[currentSegment].id === 'comments' && (
                        <div className="space-y-6">
                            {/* How did you hear about us */}
                            <div className="space-y-3">
                                <h2 className="text-xl font-semibold">How did you hear about us?</h2>
                                <Label>
                                    Please select one option <span className="text-red-500">*</span>
                                </Label>

                                <div className="flex flex-col gap-3">
                                    {['Instagram', 'Facebook', 'TikTok', 'Other'].map((option, index) => (
                                        <label
                                            key={index}
                                            htmlFor={`heardAbout-${index}`}
                                            className={`flex items-center justify-center ${option == "Other" ? "w-[320px]" : "w-[160px]"} px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('heardAbout') === option
                                                ? 'bg-secondary text-white'
                                                : 'bg-white text-secondary'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                id={`heardAbout-${index}`}
                                                value={option}
                                                className="hidden"
                                                {...register('heardAbout')}
                                            />
                                            <span>{option == "Other" ? "Others(Friends or Family)" : option}</span>
                                        </label>
                                    ))}
                                </div>

                                {/* Show text field when "Other" is selected */}
                                {watch('heardAbout') === 'Other' && (
                                    <div className="mt-3 space-y-2">
                                        <Label htmlFor="heardAboutOther">
                                            Please tell us where you heard about us
                                        </Label>
                                        <Input
                                            id="heardAboutOther"
                                            type="text"
                                            {...register('heardAboutOther')}
                                            placeholder="e.g. family, friend or any specific name etc."
                                        />
                                    </div>
                                )}

                                {errors.heardAbout && (
                                    <p className="text-sm text-red-500">{errors.heardAbout.message}</p>
                                )}
                            </div>

                            {/* Questions / comments for provider */}
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">
                                    Do you have any questions or comments for the provider?
                                </h2>
                                <Label htmlFor="comments">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="comments"
                                    {...register('comments')}
                                    placeholder="Type your answer here..."
                                />
                                {errors.comments && (
                                    <p className="text-sm text-red-500">{errors.comments.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Telehealth Consent segment */}
                    {segments[currentSegment].id === 'consent' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Telehealth Consent to Treatment and HIPAA Notice</h2>
                            <div className="space-y-4">
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Erectile Dysfunction Therapy Consent (Sildenafil, Tadalafil, and Fusion Mini Trochess)</h3>
                                    <p>This document confirms informed consent for prescription therapy including Sildenafil, Tadalafil, and compounded Fusion Mini Troches (Sildenafil + Tadalafil), intended for the treatment of erectile dysfunction and related conditions.</p>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold">A. Patient Informed Consent</h4>
                                        <p>I request treatment at Somi Health and have disclosed all relevant medical information truthfully and completely. I acknowledge that I have been informed of alternative treatment options, potential risks, possible side effects, and expected benefits of therapy for erectile dysfunction.</p>
                                        <p>These medications are intended to:</p>
                                        <ul className="list-disc pl-5">
                                            <li><strong>Sildenafil:</strong> Improve erectile function by increasing blood flow to the penis</li>
                                            <li><strong>Tadalafil:</strong> Support erectile function and may also aid in urinary symptoms associated with benign prostatic hyperplasia</li>
                                            <li><strong>Fusion Mini Troches (Sildenafil + Tadalafil):</strong> Provide a compounded option for convenience and flexibility in dosing</li>
                                        </ul>
                                        <p>Medications may be prepared by a compounding pharmacy that is not FDA-approved, but is FDA-monitored and third-party tested. Prices include the provider&apos;s time, medical supplies, and medication.</p>
                                        <p>I understand common side effects may include, but are not limited to:</p>
                                        <ul className="list-disc pl-5">
                                            <li>Headache</li>
                                            <li>Flushing</li>
                                            <li>Dizziness or lightheadedness</li>
                                            <li>Nasal congestion</li>
                                            <li>Upset stomach</li>
                                        </ul>
                                        <p>I understand rare but serious risks may include:</p>
                                        <ul className="list-disc pl-5">
                                            <li>Severe hypotension or blood pressure changes</li>
                                            <li>Priapism (painful or prolonged erection)</li>
                                            <li>Vision changes or loss</li>
                                            <li>Hearing changes or loss</li>
                                            <li>Heart attack or stroke in patients with cardiovascular risk factors</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold">B. Patient Responsibilities</h4>
                                        <p>I agree to:</p>
                                        <ul className="list-disc pl-5">
                                            <li>Obtain prescriptions only through Somi Health</li>
                                            <li>Provide a complete and accurate medical history, including cardiovascular disease, kidney, liver, or eye conditions</li>
                                            <li>Disclose any medications I am taking, particularly nitrates or alpha-blockers</li>
                                            <li>Notify my provider of any health changes or adverse reactions</li>
                                            <li>Follow all dosing instructions and do not exceed prescribed amounts</li>
                                            <li>Store medications safely, away from children and others</li>
                                        </ul>
                                        <p>I acknowledge that my provider may discontinue or modify therapy if:</p>
                                        <ul className="list-disc pl-5">
                                            <li>I experience adverse reactions</li>
                                            <li>The medication is ineffective</li>
                                            <li>I fail to comply with treatment instructions</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold">C. Safety Requirements</h4>
                                        <p>I understand and agree to the following:</p>
                                        <ul className="list-disc pl-5">
                                            <li>Keep medication out of reach of children under 18 years of age</li>
                                            <li>Do not share, give, or sell medication to any other person</li>
                                            <li>Only use medication as prescribed</li>
                                            <li>Seek immediate medical attention if experiencing chest pain, severe dizziness, or priapism</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold">D. Financial Acknowledgment</h4>
                                        <p>I understand that Somi Health, LLC does not accept insurance for this treatment. This is a self-pay service.</p>
                                        <p><strong>Same-Day Payment</strong><br />
                                            Self-pay patients are required to pay all costs in full on the same day of service, including visits, products, and medications. Payment plans may be available.</p>
                                        <p><strong>Self-Pay Patient Definition</strong><br />
                                            If I do not have insurance or my insurance will not cover this service, I will be considered a self-pay patient.</p>
                                        <p><strong>Refund Policy</strong><br />
                                            No refunds, credits, or exchanges are permitted on medications once dispensed, mixed, or once they have physically left the pharmacy. This ensures patient safety and product integrity.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold">E. Somi Health Telehealth Practice State Disclosure</h4>
                                        <p>I acknowledge that I am receiving healthcare services from Somi Health and understand that my care is governed by the laws of the state in which I am physically located at the time of service. I confirm that I am located in one of the following licensed states:</p>
                                        <p>Arizona, Connecticut, Colorado, Florida, Georgia, Iowa, Kentucky, Minnesota, New Jersey, North Carolina, Oklahoma, Tennessee, Texas, or Washington D.C.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold">HIPAA Notice</h4>
                                        <p><strong>Your Information. Your Rights. Our Responsibilities.</strong></p>
                                        <p><strong>Introduction</strong><br />This notice explains how your medical information may be used, disclosed, and how you may access it. Please review it carefully.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold">Your Rights</h4>
                                        <ul className="list-disc pl-5">
                                            <li>Obtain a copy of your health records</li>
                                            <li>Request corrections to your records</li>
                                            <li>Request confidential communications</li>
                                            <li>Request restrictions on use or disclosure</li>
                                            <li>Receive a list of disclosures</li>
                                            <li>Obtain a copy of this privacy notice</li>
                                            <li>Appoint a personal representative</li>
                                            <li>File a complaint if you believe your privacy rights have been violated</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold">Contact Information</h4>
                                        <p>Somi Health<br />
                                            4111 E Rose Lake Dr<br />
                                            Charlotte, NC 28217<br />
                                            (704) 386-6871<br />
                                            joinsomi.com</p>
                                        <p>This notice is effective as of 03/15/2025</p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold">LEGALLY BINDING CONSENT & RELEASE</h4>
                                        <p>By signing this document:</p>
                                        <p>
                                            I confirm that I have had the opportunity to ask questions about Sildenafil, Tadalafil, and Fusion Mini Troches therapy and any alternatives, and that all questions were answered to my satisfaction.<br />
                                            I acknowledge that I am voluntarily consenting to receive this therapy with full knowledge of potential risks and benefits.<br />
                                            I understand this treatment is elective and cash-based.<br />
                                            I release and hold harmless Somi Health PLLC, its affiliated providers, and associated pharmacies from any liability, claim, or damages arising from the use of this therapy as prescribed.<br />
                                            I agree to comply with my provider&apos;s treatment plan, safety instructions, and follow-up requirements.
                                        </p>
                                    </div>

                                    <div className="space-y-4 mt-6">
                                        <div className="flex space-x-2">
                                            <input
                                                type="checkbox"
                                                id="consent"
                                                {...register('consent')}
                                                className="h-4 w-4 text-secondary mt-1 border-secondary rounded"
                                            />
                                            <label htmlFor="consent-checkbox" className="text-sm">
                                                I have read the Somi Health Telehealth Consent Form and HIPAA Privacy Notice at{' '}
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
                                        {errors.consent && (
                                            <p className="text-sm text-red-500">{errors.consent.message}</p>
                                        )}
                                        <div className="flex space-x-2">
                                            <input
                                                type="checkbox"
                                                id="terms"
                                                {...register('terms')}
                                                className="h-4 w-4 mt-1 text-secondary border-secondary rounded"
                                            />
                                            <label htmlFor="terms-checkbox" className="text-sm">
                                                I have read the Somi Health Terms of Services at{' '}
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
                                        {errors.terms && (
                                            <p className="text-sm text-red-500">{errors.terms.message}</p>
                                        )}
                                        <div className="flex space-x-2 mb-10">
                                            <input
                                                type="checkbox"
                                                id="treatment"
                                                {...register('treatment')}
                                                className="h-4 w-4 mt-0 text-secondary border-secondary rounded"
                                            />
                                            <label htmlFor="treatment-checkbox" className="text-sm">
                                                I have read these forms, understand it, and voluntarily consent to treatment.
                                            </label>
                                        </div>
                                        {errors.treatment && (
                                            <p className="text-sm text-red-500">{errors.treatment.message}</p>
                                        )}
                                        <div className="flex space-x-2 mb-10">
                                            <input
                                                type="checkbox"
                                                id="agreetopay"
                                                {...register('agreetopay')}
                                                className="h-4 w-4 mt-1 text-secondary border-secondary rounded"
                                            />
                                            <label htmlFor="agree-to-pay-checkbox" className="text-sm font-bold">
                                                I agree to use electronic records and signatures and I acknowledge that I have read the related consumer disclosure.
                                            </label>
                                        </div>
                                        {errors.agreetopay && (
                                            <p className="text-sm text-red-500">{errors.agreetopay.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    {currentSegment === 0 && (
                        <div className="space-y-4">
                            <div className="flex justify-between mt-8">
                                <div></div>
                                <Button
                                    onClick={handleNext}
                                    disabled={!firstName || !lastName || !email || !phone}
                                    type="button"
                                    className="bg-secondary text-white hover:bg-secondary rounded-2xl"
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Warning segment - no validation needed */}
                    {currentSegment === 4 && (
                        <div className="space-y-4">
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
                        </div>
                    )}

                    {/* Other segments */}
                    {currentSegment > 0 && currentSegment < segments.length - 1 && currentSegment !== 4 && (
                        <div className="space-y-4">
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
                        </div>
                    )}

                    {/* Final segment */}
                    {currentSegment === segments.length - 1 && (
                        <div className="space-y-4">
                            <div className="flex justify-center mt-8">
                                <Button
                                    onClick={() => {
                                        handleSubmit(onSubmit)();
                                    }}
                                    type="button"
                                    className="bg-green-400 text-white hover:bg-green-500 rounded-2xl"
                                >
                                    Submit
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}