"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';

// Form validation schema for basic info
const formSchema = z.object({
    // Choose your treatment
    treatmentChoose: z.enum(['Finasteride', 'Minoxidil', 'Rx Hair', 'Rx Skin'], {
        required_error: "Please choose your treatment",
        invalid_type_error: "Please choose your treatment",
    }),

    // Personal Information
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email("Invalid email address"),

    // Age verification
    isOver18: z.enum(['yes', 'no'], {
        required_error: "You must be at least 18 years old to register",
        invalid_type_error: "You must be at least 18 years old to register"
    }),

    // Address
    address: z.string().min(1, "Address is required"),
    address2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "Zip code is required"),
});

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

export default function SkinHairBasicInfoForm() {
    const router = useRouter();
    const [currentSegment, setCurrentSegment] = useState(0);
    const [showIneligible, setShowIneligible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userSessionId, setUserSessionId] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        trigger,
    } = useForm({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
    });

    const formValues = watch();
    const treatmentChoose = watch("treatmentChoose");
    const firstName = watch("firstName");
    const lastName = watch("lastName");
    const phone = watch("phone");
    const email = watch("email");

    const segments = React.useMemo(() => [
        { id: "treatmentChoose", name: "Choose Your Treatment" },
        { id: "personal", name: "Personal Information" },
        { id: "age", name: "Age Verification" },
        { id: "address", name: "Address Information" },
    ], []);

    const totalSegments = segments.length;
    const progress = Math.round((currentSegment / (totalSegments - 1)) * 100);

    useEffect(() => {
        let id = localStorage.getItem("skinhairSessionId");
        if (!id) {
            id = `SH-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            localStorage.setItem("skinhairSessionId", id);
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

        fetch("/api/skinhair-abandonment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).catch(err => console.error("Abandonment update failed:", err));

    }, [currentSegment, firstName, lastName, phone, email, userSessionId, segments]);

    const handleNext = async () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const segmentFields = getSegmentFields(segments[currentSegment].id);
        const isValid = await trigger(segmentFields);

        if (!isValid) {
            console.log('Validation failed for fields:', segmentFields);
            console.log('Errors:', errors);
            return;
        }

        // Check age requirement
        if (segments[currentSegment].id === 'age' && formValues.isOver18 === 'no') {
            // Track ineligible state
            if (userSessionId) {
                const currentData = { firstName, lastName, phone, email };
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

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        try {
            // Save data to localStorage for the next page
            localStorage.setItem('skinhairFormData', JSON.stringify(data));

            // Redirect to appropriate flow based on treatment choice
            if (data.treatmentChoose === 'Rx Skin') {
                router.push('/getstarted/skinhair/skin');
            } else {
                router.push('/getstarted/skinhair/hair');
            }

        } catch (error) {
            console.error('Error saving form data:', error);
            toast.error('Failed to save form data. Please try again.');
            setIsSubmitting(false);
        }
    };

    const getSegmentFields = (segmentId) => {
        switch (segmentId) {
            case "treatmentChoose": return ["treatmentChoose"];
            case "personal": return ["firstName", "lastName", "phone", "email"];
            case "age": return ["isOver18"];
            case "address": return ["address", "address2", "city", "state", "zip"];
            default: return [];
        }
    };

    if (showIneligible) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-2 font-SofiaSans">
                <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
                    <div className="font-tagesschrift text-center text-6xl mb-2 text-secondary font-bold">somi</div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 text-center mb-4">
                        You must be at least 18 years old to register for treatment.
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
                            <p className="text-lg font-medium text-gray-700">Processing...</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6 bg-white rounded-xl border border-gray-200 shadow-secondary shadow-2xl" noValidate>

                    {/* Segment 0: Treatment Choice */}
                    {currentSegment === 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Choose Your Treatment</h2>
                            <Label>Select one option <span className="text-red-500">*</span></Label>
                            <div className="flex flex-col gap-3 items-center">
                                {["Finasteride", "Minoxidil", "Rx Hair", "Rx Skin"].map((option, i) => (
                                    <label key={i} className={`flex items-center justify-center w-full px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch("treatmentChoose") === option ? "bg-secondary text-white" : "bg-white text-secondary"}`}>
                                        <input type="radio" value={option} className="hidden" {...register("treatmentChoose")} />
                                        <span>
                                            {option === "Rx Hair" ? "Rx Hair (Finasteride + Biotin)" :
                                                option === "Rx Skin" ? "Rx Skin (Azelaic acid, Niacinamide, Clindamycin, and Tretinoin)" :
                                                    option}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.treatmentChoose && <p className="text-sm text-red-500">{errors.treatmentChoose.message}</p>}
                        </div>
                    )}

                    {/* Segment 1: Personal Information */}
                    {currentSegment === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Personal Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First name <span className="text-red-500">*</span></Label>
                                    <Input {...register('firstName')} />
                                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Last name <span className="text-red-500">*</span></Label>
                                    <Input {...register('lastName')} />
                                    {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Phone number <span className="text-red-500">*</span></Label>
                                <Input type="tel" {...register('phone')} />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Email <span className="text-red-500">*</span></Label>
                                <Input type="email" {...register('email')} />
                                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                            </div>
                        </div>
                    )}

                    {/* Segment 2: Age Verification */}
                    {currentSegment === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Age Verification <span className="text-red-500">*</span></h2>
                            <Label>Are you over 18?</Label>
                            <div className="flex gap-2 justify-center flex-col items-center">
                                {['yes', 'no'].map((option, index) => (
                                    <label key={index} className={`flex items-center w-[100px] justify-center text-sm px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('isOver18') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                                        <input type="radio" value={option} className="hidden" {...register('isOver18')} />
                                        <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.isOver18 && <p className="text-sm text-red-500">{errors.isOver18.message}</p>}
                        </div>
                    )}

                    {/* Segment 3: Address Information */}
                    {currentSegment === 3 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Address Information</h2>
                            <div className="space-y-2">
                                <Label>Address line 1 <span className="text-red-500">*</span></Label>
                                <Input {...register('address')} />
                                {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Address line 2</Label>
                                <Input {...register('address2')} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>City <span className="text-red-500">*</span></Label>
                                    <Input {...register('city')} />
                                    {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>State <span className="text-red-500">*</span></Label>
                                    <Input {...register('state')} />
                                    {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Zip code <span className="text-red-500">*</span></Label>
                                <Input {...register('zip')} />
                                {errors.zip && <p className="text-sm text-red-500">{errors.zip.message}</p>}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    {currentSegment === 0 && (
                        <div className="flex justify-between mt-8">
                            <div></div>
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
                                {isSubmitting ? 'Continuing...' : 'Continue to Medical Questions'}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}