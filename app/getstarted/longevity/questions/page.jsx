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
import { ArrowDownWideNarrow, TriangleAlert } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  //Choose your treatment 
  treatmentChoose: z.string({ required_error: "Please Choose your treatment", invalid_type_error: "Please Choose your treatment" }).min(1, "Please Choose your treatment"),
  //What is your treatment goal
  treatmentGoal: z.string({ required_error: "Please Choose your treatment goal", invalid_type_error: "Please Choose your treatment goal" }).min(1, "Please Choose your treatment goal"),
  //Previous treatment with Glutathione? 
  previousTreatment: z.enum(['yes', 'no'], {
    required_error: "Please select an option",
    invalid_type_error: "Please select an option",
  }),
  //Did you experience any negative reactions or allergies to Glutathione treatment? 
  negativeReactions: z.enum(['yes', 'no'], {
    required_error: "Please select an option",
    invalid_type_error: "Please select an option",
  }).optional(),
  // When was your last Glutathione treatment?
  // Were you satisfied with your treatment?
  // Why did you stop the Glutathione treatment?
  lastSatisfiedStop: z.string({ required_error: "This field is required", invalid_type_error: "This field is required" }).min(1, "This field is required"),
  //Is there anything else you want your clinician to know about your health or condition?
  clinicianToKnowAboutYourHealth: z.enum(['yes', 'no'], {
    required_error: "Please select an option",
    invalid_type_error: "Please select an option",
  }),
  //Please provide additional information
  disclinicianToKnowAboutYourHealth: z.string().optional(),

  //How would you rate your cardiovascular health on a scale of 1-5? 
  cardiovascularHealth: z.enum(['1', '2', '3', '4', '5'], {
    required_error: "Please select an option",
    invalid_type_error: "Please select an option",
  }).optional(),
  //What is your current height and weight? 
  heightFeet: z.string({
    required_error: "Please select an option",
    invalid_type_error: "Please select an option",
  }).optional(),
  heightInches: z.string({
    required_error: "Please select an option",
    invalid_type_error: "Please select an option",
  }).optional(),
  currentWeight: z.string().optional(),
  //How would you rate your strength on a scale of 1-5?
  strength: z.enum(['1', '2', '3', '4', '5'], {
    required_error: "Please select an option",
    invalid_type_error: "Please select an option",
  }).optional(),

  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  // Age verification
  isOver18: z.enum(['yes', 'no'], {
    required_error: "You must be at least 18 years old to register",
    invalid_type_error: "You must be at least 18 years old to register",
  }),
  //dob
  dob: z.string().min(1, "Date of birth is required")
    .refine(dob => {
      // Parse the date string in MM / DD / YYYY format
      const [month, day, year] = dob.split('/').map(part => parseInt(part.trim()));
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();

      // Check if the date is valid
      if (isNaN(birthDate.getTime())) {
        return false;
      }

      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    }, "You must be at least 18 years old"),

  // Address
  address: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip code is required"),
  country: z.string().optional(),
  //sex
  sex: z.string({ required_error: "This field is required", invalid_type_error: "This field is required" }).min(1, "This field is required"),
  //Allergies 
  allergies: z.enum(['yes', 'no'], {
    required_error: "Please select an option",
    invalid_type_error: "Please select an option",
  }),
  desAllergies: z.string().optional(),
  //Have you ever been diagnosed with any of the following conditions? 
  diagnoses: z.array(z.string()).nonempty("Please select at least one option"),
  //Have you ever been diagnosed with any medical conditions? 
  diagnosed: z.enum(['yes', 'no'], {
    required_error: "Please select an option",
    invalid_type_error: "Please select an option",
  }),
  desDiagnosed: z.string().optional(),
  //Are you currently taking any medications or supplements? 
  currentlyTakingAnyMedications: z.enum(['yes', 'no'], {
    required_error: "Please select an option",
    invalid_type_error: "Please select an option",
  }),
  desCurrentlyTakingAnyMedications: z.string().optional(),
  //Any prior significant surgeries or hospitalization? 
  surgeriesOrHospitalization: z.enum(['yes', 'no'], {
    required_error: "Please select an option",
    invalid_type_error: "Please select an option",
  }),
  desSurgeriesOrHospitalization: z.string().optional(),
  //Are you pregnant or breastfeeding? 
  pregnantOrBreastfeeding: z.enum(['yes', 'no'], {
    required_error: "Please select an option",
    invalid_type_error: "Please select an option",
  }),
  // healthcareProvider
  healthcareProvider: z.enum(['yes', 'no'], {
    required_error: "Please select an option",
    invalid_type_error: "Please select an option",
  }),
  //idphoto
  idPhoto: z.string().min(1, "This field is required"),
  // How did you hear about us
  heardAbout: z.enum(['Instagram', 'Facebook', 'TikTok', 'Other'], {
    required_error: "Please tell us how you heard about us",
    invalid_type_error: "Please tell us how you heard about us",
  }),
  heardAboutOther: z.string().optional(),

  //last segment check box
  consent: z.boolean().refine(val => val === true, "You must consent to proceed"),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms"),
  treatment: z.boolean().refine(val => val === true, "You must consent to treatment"),
}).superRefine((data, ctx) => {
  if (data.previousTreatment === 'yes') {
    if (!data.negativeReactions) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select an option",
        path: ["negativeReactions"],
      });
    }
  }
  if (data.treatmentChoose?.trim().toLowerCase() === "sermorelin") {
    if (!data.cardiovascularHealth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select an option",
        path: ["cardiovascularHealth"],
      });
    }
    if (!data.heightFeet) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "This field is required",
        path: ["heightFeet"],
      });
    }
    if (!data.heightInches) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "This field is required",
        path: ["heightInches"],
      });
    }
    if (!data.currentWeight) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "This field is required",
        path: ["currentWeight"],
      });
    }
    if (!data.strength) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select an option",
        path: ["strength"],
      });
    }
  }
});

const segments = [
  { id: "treatmentChoose", name: "Choose Your Treatment" },
  { id: "treatmentGoal", name: "Treatment Goal" },
  { id: "previousTreatment", name: "Previous Treatment" },
  { id: "negativeReactions", name: "Negative Reactions" },
  { id: "lastSatisfiedStop", name: "Treatment Experience" },
  { id: "clinicianNotes", name: "Clinician Notes" },
  { id: "cardiovascularHealth", name: "Cardiovascular Health" },
  { id: "bodyStats", name: "Height & Weight" },
  { id: "strength", name: "Strength" },

  //step towards
  { id: "stepTowards", name: "Step Towards" },

  // Personal Info
  { id: "personal", name: "Personal Information" },
  { id: "age", name: "Age Verification" },
  { id: "dob", name: "Date of Birth" },

  // Address
  { id: "address", name: "Address Information" },

  // Sex
  { id: "sex", name: "Sex" },

  // Allergies
  { id: "allergies", name: "Allergies" },

  // Diagnoses
  { id: "diagnoses", name: "Diagnoses" },
  { id: "diagnosed", name: "Medical Conditions" },

  // Medications
  { id: "medications", name: "Medications & Supplements" },

  // Surgeries
  { id: "surgeriesOrHospitalization", name: "Surgeries / Hospitalization" },

  // Pregnancy
  { id: "pregnancy", name: "Pregnancy / Breastfeeding" },

  // Healthcare Provider
  { id: "healthcareProvider", name: "Healthcare Provider" },

  // ID Upload
  { id: "idPhoto", name: "ID Upload" },

  // Heard About Us
  { id: "heardAbout", name: "How Did You Hear About Us?" },

  // Consent + Terms
  { id: "consent", name: "Final Agreement" },
];

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

export default function PatientRegistrationForm() {
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

  // Get the inner ZodObject from ZodEffects
  const innerSchema =
    formSchema._def?.schema?._def?.shape
      ? formSchema._def.schema
      : formSchema;

  // Extract fields safely
  const schemaShape = innerSchema._def.shape;
  const schemaFields = Object.keys(schemaShape);

  const formValues = watch();

  const totalFields = schemaFields.length;

  const completedFields = schemaFields.filter((key) => {
    const value = formValues[key];
    const hasError = errors[key];
    return value !== undefined && value !== "" && !hasError;
  }).length;

  const totalSegments = segments.length;
  const progress = Math.round((currentSegment / (totalSegments - 1)) * 100);

  // Additional watch hooks for BMI calculation
  const watchedFeet = useWatch({ control, name: 'heightFeet' });
  const watchedInches = useWatch({ control, name: 'heightInches' });
  const watchedWeight = useWatch({ control, name: 'currentWeight' });
  // Watch basic user identity fields
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const phone = watch("phone");
  const email = watch("email");

  // Calculate BMI
  let bmi = null;
  const totalInches = parseInt(watchedFeet || '0') * 12 + parseInt(watchedInches || '0');
  if (totalInches > 0 && watchedWeight) {
    bmi = (parseFloat(watchedWeight) / (totalInches * totalInches)) * 703;
    bmi = Math.round(bmi * 10) / 10; // round to 1 decimal
  }


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
    let id = localStorage.getItem("longevitySessionId");
    if (!id) {
      id = `LON-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem("longevitySessionId", id);
    }
    setUserSessionId(id);
  }, []);
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
      question, // NEW FIELD
      timestamp: new Date().toISOString(),
    };

    fetch("/api/longevity-abandonment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(err => console.error("Abandonment update failed:", err));

  }, [currentSegment, firstName, lastName, phone, email, userSessionId]);
  useEffect(() => {
    if (currentSegment !== 0 || !userSessionId) return;

    const currentData = { firstName, lastName, phone, email };
    const changed = JSON.stringify(currentData) !== JSON.stringify(previousBasicData);

    if (changed) {
      setPreviousBasicData(currentData);

      fetch("/api/longevity-abandonment", {
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

  const handleNext = async () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    let count = 1;
    const segmentFields = getSegmentFields(segments[currentSegment].id);
    const isValid = await trigger(segmentFields);

    if (isValid && currentSegment < segments.length - 1) {
      // Check for disqualifying conditions
      const currentSegmentId = segments[currentSegment].id;
      const currentValues = watch();

      let isIneligible = false;
      const hasOtherOptionsSelected = (field) => {
        const values = currentValues[field];
        return Array.isArray(values) && values.length > 0 && !values.includes('None of the above');
      };
      // Add specific disqualification logic here if needed
      if (currentSegmentId === 'age' && currentValues.isOver18 === 'no') {
        isIneligible = true;
      }
      if (currentSegmentId === 'negativeReactions' && currentValues.negativeReactions === 'yes') {
        isIneligible = true;
      }
      if (currentSegmentId === 'pregnancy' && currentValues.pregnantOrBreastfeeding === 'yes') {
        isIneligible = true;
      }
      if (currentSegmentId === 'previousTreatment' && watch("previousTreatment") === 'no') {
        count++;
      }
      if (currentSegmentId === "clinicianNotes") {
        if (watch("treatmentChoose") !== "Sermorelin") {
          count = 4;  // Skip cardio, body, strength
        } else {
          count = 1;  // Normal flow
        }
      }
      if (hasOtherOptionsSelected('diagnoses')) {
        isIneligible = true;
      }
      if (isIneligible) {
        setShowIneligible(true);
        return;
      }

      setShowIneligible(false);
      setCurrentSegment(currentSegment + count);
    }
  };

  const handlePrevious = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const segmentFields = getSegmentFields(segments[currentSegment].id);
    const currentSegmentId = segments[currentSegment].id;
    if (currentSegmentId === 'lastSatisfiedStop' && watch("previousTreatment") === 'no') {
      setCurrentSegment(currentSegment - 2);
    } else if (currentSegment > 0) {
      setCurrentSegment(currentSegment - 1);
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
        bmi: bmi,
        idPhoto: fileUrls.file2,
        authid: `P${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
        questionnaire: true,
      };
      const response = await fetch('/api/longevity-questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.result.message || 'Failed to submit form');
      }
      if (userSessionId) {
        const currentData = {
          firstName: watch("firstName"),
          lastName: watch("lastName"),
          phone: watch("phone"),
          email: watch("email"),
        };

        fetch("/api/longevity-abandonment", {
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

        localStorage.removeItem("longevitySessionId");
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
      case "treatmentChoose": return ["treatmentChoose"];
      case "treatmentGoal": return ["treatmentGoal"];
      case "previousTreatment": return ["previousTreatment"];
      case "negativeReactions": return ["negativeReactions"];
      case "lastSatisfiedStop": return ["lastSatisfiedStop"];
      case "clinicianNotes": return ["clinicianToKnowAboutYourHealth"];
      case "cardiovascularHealth": return ["cardiovascularHealth"];
      case "bodyStats": return ["heightFeet", "heightInches", "currentWeight"];
      case "strength": return ["strength"];
      case "personal": return ["firstName", "lastName", "phone", "email"];
      case "age": return ["isOver18"];
      case "dob": return ["dob"];
      case "address": return ["address", "address2", "city", "state", "zip", "country"];
      case "sex": return ["sex"];
      case "allergies": return ["allergies", "desAllergies"];
      case "diagnoses": return ["diagnoses"];
      case "diagnosed": return ["diagnosed", "desDiagnosed"];
      case "medications": return ["currentlyTakingAnyMedications", "desCurrentlyTakingAnyMedications"];
      case "surgeriesOrHospitalization": return ["surgeriesOrHospitalization", "desSurgeriesOrHospitalization"];
      case "pregnancy": return ["pregnantOrBreastfeeding"];
      case "healthcareProvider": return ["healthcareProvider"];
      case "idPhoto": return ["idPhoto"];
      case "heardAbout": return ["heardAbout", "heardAboutOther"];
      case "consent": return ["consent", "terms", "treatment"];
      default: return [];
    }
  };

  if (showIneligible) {
    const currentData = { firstName, lastName, phone, email };
    fetch("/api/longevity-abandonment", {
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

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-2 font-SofiaSans">
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
          <div className="font-tagesschrift text-center text-6xl mb-2 text-secondary font-bold">somi</div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 text-center mb-4">
            Based on your response to the previous question, you currently do not meet the criteria for Treatment medication.
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
                src="/longevitymain1.png"
                alt="Longevity"
                fill
                className="rounded-xl object-cover"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 800px"
              />
            </div>
            <h3 className="text-lg md:text-x text-center">
              Thank you for completing your Longevity Intake form
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

          {/* Render segments based on currentSegment */}
          {currentSegment === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Choose Your Treatment</h2>
              <Label>Select one option <span className="text-red-500">*</span></Label>
              <div className="flex flex-col gap-3 items-center">
                {["NAD+", "Glutathione", "Sermorelin"].map((option, i) => (
                  <label key={i} className={`flex items-center justify-center w-[200px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch("treatmentChoose") === option ? "bg-secondary text-white" : "bg-white text-secondary"}`}>
                    <input type="radio" value={option} className="hidden" {...register("treatmentChoose")} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {errors.treatmentChoose && <p className="text-sm text-red-500">{errors.treatmentChoose.message}</p>}
            </div>
          )}

          {currentSegment === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Treatment Goal</h2>

              {/* Dynamic Options */}
              <div className="flex flex-col gap-3 items-center">

                {(
                  watch("treatmentChoose") === "NAD+" ?
                    ["Overall wellness", "Mental clarity", "Better sleep", "Energy boost", "Anti-aging", "All of the above"]
                    : watch("treatmentChoose") === "Glutathione" ?
                      ["Overall wellness", "Mental clarity", "Better sleep", "Energy boost", "Anti-aging", "All of the above"]
                      : watch("treatmentChoose") === "Sermorelin" ?
                        [
                          "Maintain a healthy weight",
                          "Improve metabolic health",
                          "Improve cardiovascular health",
                          "Improve overall quality of life",
                          "Improve mood",
                          "Increase energy",
                          "Improve muscle tone",
                          "Other"
                        ]
                        : []
                ).map((goal, i) => (
                  <label
                    key={i}
                    className={`flex items-center justify-center w-[280px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer transition-all duration-150 
                    ${watch("treatmentGoal") === goal ? "bg-secondary text-white" : "bg-white text-secondary"}`}
                  >
                    <input
                      type="radio"
                      value={goal}
                      {...register("treatmentGoal")}
                      className="hidden"
                    />
                    <span>{goal}</span>
                  </label>
                ))}
              </div>

              {errors.treatmentGoal && (
                <p className="text-sm text-red-500">{errors.treatmentGoal.message}</p>
              )}
            </div>

          )}

          {currentSegment === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Previous treatment with {watch("treatmentChoose")}?</h2>
              <div className="flex flex-col gap-2 items-center">
                {["yes", "no"].map((val, i) => (
                  <label key={i} className={`flex items-center justify-center w-[120px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer transition-all duration-150 ${watch("previousTreatment") === val ? "bg-secondary text-white" : "bg-white text-secondary"}`}>
                    <input type="radio" value={val} className="hidden" {...register("previousTreatment")} />
                    <span>{val === "yes" ? "Yes" : "No"}</span>
                  </label>
                ))}
              </div>
              {errors.previousTreatment && <p className="text-sm text-red-500">{errors.previousTreatment.message}</p>}
            </div>
          )}

          {currentSegment === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Did you experience any negative reactions or allergies to {watch("treatmentChoose")} treatment?
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span></h2>
              <div className="flex flex-col gap-2 items-center">
                {["yes", "no"].map((val, i) => (
                  <label key={i} className={`flex items-center justify-center w-[120px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch("negativeReactions") === val ? "bg-secondary text-white" : "bg-white text-secondary"}`}>
                    <input type="radio" value={val} className="hidden" {...register("negativeReactions")} />
                    <span>{val === "yes" ? "Yes" : "No"}</span>
                  </label>
                ))}
              </div>
              {errors.negativeReactions && <p className="text-sm text-red-500">{errors.negativeReactions.message}</p>}
            </div>
          )}

          {currentSegment === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">When was your last {watch("treatmentChoose")} treatment?<br />
                Were you satisfied with your treatment?<br />
                Why did you stop the {watch("treatmentChoose")} treatment?<span className="text-red-500">*</span></h2>
              <Textarea {...register("lastSatisfiedStop")} placeholder="Leave a Description" />
              {errors.lastSatisfiedStop && <p className="text-sm text-red-500">{errors.lastSatisfiedStop.message}</p>}
            </div>
          )}

          {currentSegment === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Is there anything else you want your clinician to know about your health or condition? <span className="text-red-500">*</span></h2>
              <div className="flex flex-col gap-2 items-center">
                {["yes", "no"].map((val, i) => (
                  <label key={i} className={`flex items-center justify-center w-[120px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch("clinicianToKnowAboutYourHealth") === val ? "bg-secondary text-white" : "bg-white text-secondary"}`}>
                    <input type="radio" value={val} className="hidden" {...register("clinicianToKnowAboutYourHealth")} />
                    <span>{val === "yes" ? "Yes" : "No"}</span>
                  </label>
                ))}
                {errors.clinicianToKnowAboutYourHealth && <p className="text-sm text-red-500">{errors.clinicianToKnowAboutYourHealth.message}</p>}
              </div>
              {watch("clinicianToKnowAboutYourHealth") === "yes" && (
                <div className="mt-4 space-y-2">
                  <Label>Please provide additional information </Label>
                  <Textarea {...register("disclinicianToKnowAboutYourHealth")} placeholder="Leave a Description" />
                </div>
              )}
            </div>
          )}

          {currentSegment === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">How would you rate your cardiovascular health?<span className="text-red-500">*</span></h2>
              <Label>Rank with 1 being the lowest and 5 being the highest</Label>
              <div className="flex flex-wrap gap-3 justify-center">
                {["1", "2", "3", "4", "5"].map((val, i) => (
                  <label key={i} className={`flex items-center justify-center w-[60px] px-4 py-2 border border-blue-400 rounded-full cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch("cardiovascularHealth") === val ? "bg-secondary text-white" : "bg-white text-secondary"}`}>
                    <input type="radio" value={val} className="hidden" {...register("cardiovascularHealth")} />
                    <span>{val}</span>
                  </label>
                ))}
              </div>
              {errors.cardiovascularHealth && <p className="text-sm text-red-500">{errors.cardiovascularHealth.message}</p>}
            </div>
          )}

          {currentSegment === 7 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Height & Weight</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Feet <span className="text-red-500">*</span></Label>
                  <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4, 5, 6, 7].map((feet, index) => (
                      <label key={index} className={`flex items-center justify-center px-4 py-2 border border-blue-400 rounded-full cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('heightFeet') === feet.toString() ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                        <input type="radio" value={feet.toString()} className="hidden" {...register('heightFeet')} />
                        <span>{feet}</span>
                      </label>
                    ))}
                  </div>
                  {errors.heightFeet && <p className="text-sm text-red-500">{errors.heightFeet.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Inches <span className="text-red-500">*</span></Label>
                  <div className="flex flex-wrap gap-3">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((inches, index) => (
                      <label key={index} className={`flex items-center justify-center px-4 py-2 border border-blue-400 rounded-full cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('heightInches') === inches.toString() ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                        <input type="radio" value={inches.toString()} className="hidden" {...register('heightInches')} />
                        <span>{inches}</span>
                      </label>
                    ))}
                  </div>
                  {errors.heightInches && <p className="text-sm text-red-500">{errors.heightInches.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Current Weight (lbs) <span className="text-red-500">*</span></Label>
                  <Input
                    {...register('currentWeight')}
                  />
                  {errors.currentWeight && (
                    <p className="text-sm text-red-500">
                      {errors.currentWeight.message}
                    </p>
                  )}
                </div>
                {bmi !== null && <Badge className="px-3 py-1 text-lg mt-2 font-bold rounded-md bg-green-200 text-green-900">BMI: {bmi}</Badge>}
              </div>
            </div>
          )}

          {currentSegment === 8 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">How would you rate your strength?<span className="text-red-500">*</span></h2>
              <Label>Rank with 1 being the lowest and 5 being the highest</Label>
              <div className="flex flex-wrap justify-center gap-3">
                {["1", "2", "3", "4", "5"].map((val, i) => (
                  <label key={i} className={`flex items-center justify-center w-[60px] px-4 py-2 border border-blue-400 rounded-full cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch("strength") === val ? "bg-secondary text-white" : "bg-white text-secondary"}`}>
                    <input type="radio" value={val} className="hidden" {...register("strength")} />
                    <span>{val}</span>
                  </label>
                ))}
              </div>
              {errors.strength && <p className="text-sm text-red-500">{errors.strength.message}</p>}
            </div>
          )}

          {currentSegment === 9 && (
            <div className="space-y-4">
              <h2 className="text-xl font-SofiaSans text-secondary text-center font-semibold">Welcome to Somi Health, you are about to take your first step towards your wellness goal!</h2>
            </div>
          )}

          {currentSegment === 10 && (
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

          {currentSegment === 11 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Age Verification</h2>
              <Label>Are you over 18? <span className="text-red-500">*</span></Label>
              <div className="flex gap-2 justify-center flex-col items-center">
                {['yes', 'no'].map((option, index) => (
                  <label key={index} className={`flex items-center w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('isOver18') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                    <input type="radio" value={option} className="hidden" {...register('isOver18')} />
                    <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
              {errors.isOver18 && <p className="text-sm text-red-500">{errors.isOver18.message}</p>}
            </div>
          )}

          {currentSegment === 12 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Date of Birth</h2>
              <Label>Date of Birth <span className="text-red-500">*</span></Label>
              <Input placeholder="MM / DD / YYYY" {...register('dob')} className="w-[200px]" />
              {errors.dob && <p className="text-sm text-red-500">{errors.dob.message}</p>}
            </div>
          )}

          {currentSegment === 13 && (
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zip code <span className="text-red-500">*</span></Label>
                  <Input {...register('zip')} />
                  {errors.zip && <p className="text-sm text-red-500">{errors.zip.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input {...register('country')} />
                </div>
              </div>
              <p className="text-gray-600 text-sm flex items-center gap-1 sm:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis">
                <TriangleAlert className="text-gray-700 flex-shrink-0" size={15} />
                <span>Please make sure the information provided is accurate.</span>
              </p>
            </div>
          )}

          {currentSegment === 14 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Sex assigned at birth <span className="text-red-500">*</span></h2>
              <div className="flex gap-2 justify-center flex-col">
                {['Male', 'Female'].map((option, index) => (
                  <label key={index} className={`flex items-center w-[140px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('sex') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                    <input type="radio" value={option} className="hidden" {...register('sex')} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {errors.sex && <p className="text-sm text-red-500">{errors.sex.message}</p>}
            </div>
          )}

          {currentSegment === 15 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Allergies</h2>
              <Label>Do you have any allergies? <span className="text-red-500">*</span></Label>
              <div className="flex flex-col gap-2 items-center">
                {["yes", "no"].map((val, i) => (
                  <label key={i} className={`flex items-center justify-center w-[120px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch("allergies") === val ? "bg-secondary text-white" : "bg-white text-secondary"}`}>
                    <input type="radio" value={val} className="hidden" {...register("allergies")} />
                    <span>{val === "yes" ? "Yes" : "No"}</span>
                  </label>
                ))}
                {errors.allergies && <p className="text-sm text-red-500">{errors.allergies.message}</p>}
              </div>
              {watch("allergies") === "yes" && (
                <div className="mt-4 space-y-2">
                  <Label>Please describe your allergies <span className="text-red-500">*</span></Label>
                  <Textarea {...register("desAllergies")} placeholder="Leave a Description" />
                  {errors.desAllergies && <p className="text-sm text-red-500">{errors.desAllergies.message}</p>}
                </div>
              )}
            </div>
          )}

          {currentSegment === 16 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Diagnoses <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span></h2>
              <Label>Have you ever been diagnosed with any of the following? <span className="text-red-500">*</span></Label>

              <div className="flex flex-col gap-3">
                {["Liver Failure", "Organ Transplant", "Kidney Failure", "Cancer (Less than 5 years)", 'None of the above'].map((diagnosis, index) => (
                  <label key={index}
                    className={`flex items-center max-w-[200px] px-4 py-2 text-xs border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('diagnoses')?.includes(diagnosis) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}

                  >
                    <input type="checkbox" className="hidden" checked={watch('diagnoses')?.includes(diagnosis) || false} onChange={(e) => handleCheckboxChange('diagnoses', diagnosis, e.target.checked)} />
                    <span>{diagnosis}</span>
                  </label>
                ))}
              </div>
              {errors.diagnoses && <p className="text-sm text-red-500">{errors.diagnoses.message}</p>}
            </div>
          )}

          {currentSegment === 17 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Medical Conditions</h2>
              <Label>Have you ever been diagnosed with any medical conditions? <span className="text-red-500">*</span></Label>
              <div className="flex flex-col gap-2 items-center">
                {["yes", "no"].map((val, i) => (
                  <label key={i} className={`flex items-center justify-center w-[120px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch("diagnosed") === val ? "bg-secondary text-white" : "bg-white text-secondary"}`}>
                    <input type="radio" value={val} className="hidden" {...register("diagnosed")} />
                    <span>{val === "yes" ? "Yes" : "No"}</span>
                  </label>
                ))}
                {errors.diagnosed && <p className="text-sm text-red-500">{errors.diagnosed.message}</p>}
              </div>
              {watch("diagnosed") === "yes" && (
                <div className="mt-4 space-y-2">
                  <Label>Please list your diagnosed conditions <span className="text-red-500">*</span></Label>
                  <Textarea {...register("desDiagnosed")} placeholder="Leave a Description" />
                  {errors.desDiagnosed && <p className="text-sm text-red-500">{errors.desDiagnosed.message}</p>}
                </div>
              )}
            </div>
          )}

          {currentSegment === 18 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Medications & Supplements</h2>
              <Label>Are you currently taking ANY medications or supplements? <span className="text-red-500">*</span></Label>
              <div className="flex flex-col gap-2 items-center">
                {["yes", "no"].map((val, i) => (
                  <label key={i} className={`flex items-center justify-center w-[120px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch("currentlyTakingAnyMedications") === val ? "bg-secondary text-white" : "bg-white text-secondary"}`}>
                    <input type="radio" value={val} className="hidden" {...register("currentlyTakingAnyMedications")} />
                    <span>{val === "yes" ? "Yes" : "No"}</span>
                  </label>
                ))}
                {errors.currentlyTakingAnyMedications && <p className="text-sm text-red-500">{errors.currentlyTakingAnyMedications.message}</p>}
              </div>
              {watch("currentlyTakingAnyMedications") === "yes" && (
                <div className="mt-4 space-y-2">
                  <Label>Please list all medications & supplements <span className="text-red-500">*</span></Label>
                  <Textarea {...register("desCurrentlyTakingAnyMedications")} placeholder="Leave a Description" />
                  {errors.desCurrentlyTakingAnyMedications && <p className="text-sm text-red-500">{errors.desCurrentlyTakingAnyMedications.message}</p>}
                </div>
              )}
            </div>
          )}

          {currentSegment === 19 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Surgeries / Hospitalization</h2>
              <Label>Any prior significant surgeries or hospitalization? <span className="text-red-500">*</span></Label>
              <div className="flex flex-col gap-2 items-center">
                {["yes", "no"].map((val, i) => (
                  <label key={i} className={`flex items-center justify-center w-[120px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch("surgeriesOrHospitalization") === val ? "bg-secondary text-white" : "bg-white text-secondary"}`}>
                    <input type="radio" value={val} className="hidden" {...register("surgeriesOrHospitalization")} />
                    <span>{val === "yes" ? "Yes" : "No"}</span>
                  </label>
                ))}
                {errors.surgeriesOrHospitalization && <p className="text-sm text-red-500">{errors.surgeriesOrHospitalization.message}</p>}
              </div>
              {watch("surgeriesOrHospitalization") === "yes" && (
                <div className="mt-4 space-y-2">
                  <Label>Please provide additional information <span className="text-red-500">*</span></Label>
                  <Textarea {...register("desSurgeriesOrHospitalization")} placeholder="Leave a Description" />
                  {errors.desSurgeriesOrHospitalization && <p className="text-sm text-red-500">{errors.desSurgeriesOrHospitalization.message}</p>}
                </div>
              )}
            </div>
          )}

          {currentSegment === 20 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Pregnancy / Breastfeeding<span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span></h2>
              <Label>Are you pregnant or breastfeeding? <span className="text-red-500">*</span></Label>
              <div className="flex flex-col gap-2 items-center">
                {["yes", "no"].map((val, i) => (
                  <label key={i} className={`flex items-center justify-center w-[120px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch("pregnantOrBreastfeeding") === val ? "bg-secondary text-white" : "bg-white text-secondary"}`}>
                    <input type="radio" value={val} className="hidden" {...register("pregnantOrBreastfeeding")} />
                    <span>{val === "yes" ? "Yes" : "No"}</span>
                  </label>
                ))}
              </div>
              {errors.pregnantOrBreastfeeding && <p className="text-sm text-red-500">{errors.pregnantOrBreastfeeding.message}</p>}
            </div>
          )}

          {currentSegment === 21 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Healthcare Provider</h2>
              <Label>Are you currently under the care of a healthcare provider? <span className="text-red-500">*</span></Label>
              <div className="flex flex-col gap-2 items-center">
                {["yes", "no"].map((val, i) => (
                  <label key={i} className={`flex items-center justify-center w-[120px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch("healthcareProvider") === val ? "bg-secondary text-white" : "bg-white text-secondary"}`}>
                    <input type="radio" value={val} className="hidden" {...register("healthcareProvider")} />
                    <span>{val === "yes" ? "Yes" : "No"}</span>
                  </label>
                ))}
              </div>
              {errors.healthcareProvider && <p className="text-sm text-red-500">{errors.healthcareProvider.message}</p>}
            </div>
          )}

          {currentSegment === 22 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">ID Upload</h2>
              <Label>Please upload a GOVERNMENT-ISSUED photo ID <span className="text-red-500">*</span></Label>
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
              {errors.idPhoto && <p className="text-sm text-red-500">{errors.idPhoto.message}</p>}
            </div>
          )}

          {currentSegment === 23 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">How Did You Hear About Us?</h2>
              <Label>Please select one option <span className="text-red-500">*</span></Label>
              <div className="flex flex-col gap-3">
                {['Instagram', 'Facebook', 'TikTok', 'Other'].map((option, index) => (
                  <label key={index} className={`flex items-center justify-center ${option == "Other" ? "w-[320px]" : "w-[160px]"} px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('heardAbout') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                    <input type="radio" value={option} className="hidden" {...register('heardAbout')} />
                    <span>{option == "Other" ? "Others(Friends or Family)" : option}</span>
                  </label>
                ))}
              </div>
              {watch('heardAbout') === 'Other' && (
                <div className="mt-3 space-y-2">
                  <Label>Please tell us where you heard about us</Label>
                  <Input {...register('heardAboutOther')} placeholder="e.g. family, friend or any specific name etc." />
                </div>
              )}
              {errors.heardAbout && <p className="text-sm text-red-500">{errors.heardAbout.message}</p>}
            </div>
          )}

          {currentSegment === 24 && (<div className="space-y-4">
            <h3 className="font-semibold">Peptide Therapy Informed Consent & Release of Liability</h3>

            {/* SECTION 1 */}
            <div className="space-y-2">
              <h4 className="font-semibold">Section 1: Treatment Overview</h4>
              <p>
                I voluntarily consent to be evaluated and treated with Peptide Therapy by a licensed
                provider at Somi Health PLLC. Peptides are short chains of amino acids that help regulate
                various physiological functions and may support metabolic, hormonal, immune, cognitive,
                and tissue repair processes.
              </p>
            </div>

            {/* SECTION 2 */}
            <div className="space-y-2">
              <h4 className="font-semibold">Section 2: Peptides Covered Under This Consent</h4>
              <p>This consent applies to the current or future use of the following peptide therapies:</p>

              <ul className="list-disc pl-5 space-y-1">
                <li>Tesamorelin (GHRH analog)</li>
                <li>Glutathione (detoxification support)</li>
                <li>Sermorelin (GHRH)</li>
                <li>NAD+ (cellular energy and DNA repair)</li>
                <li>Ipamorelin (GHRP analog)</li>
                <li>CJC-1295 (GHRH analog)</li>
                <li>BPC-157 (Body Protection Compound)</li>
                <li>Thymosin Alpha-1 (immune modulation)</li>
                <li>Thymosin Beta-4 / TB-500 (tissue healing)</li>
                <li>AOD-9604 (fat metabolism)</li>
                <li>5-Amino-1MQ (metabolic optimization)</li>
                <li>Selank (nootropic / anti-anxiety)</li>
                <li>Semax (nootropic / neuroprotection)</li>
                <li>DSIP (Delta Sleep-Inducing Peptide)</li>
                <li>PT-141 / Bremelanotide (sexual health)</li>
                <li>GHK-Cu (wound healing / skin regeneration)</li>
                <li>KPV (anti-inflammatory peptide)</li>
                <li>Tirzepatide</li>
                <li>Semaglutide</li>
              </ul>

              <p>
                This list may be updated without requiring re-signing if a peptide is added or
                discontinued based on clinical judgment.
              </p>
            </div>

            {/* SECTION 3 */}
            <div className="space-y-2">
              <h4 className="font-semibold">Section 3: Acknowledgements & Disclosures</h4>

              <h5 className="font-semibold">FDA Status</h5>
              <p>
                Some peptides, including compounded tirzepatide and others listed above, are not
                FDA-approved for specific indications and may be used off-label based on medical judgment.
                I understand that compounded peptides are produced in FDA-registered 503A or 503B
                pharmacies and are subject to quality controls, but are not individually FDA-approved.
              </p>

              <h5 className="font-semibold">Purpose of Use</h5>
              <p>Peptide therapy may be used to support:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Weight management</li>
                <li>Hormonal support</li>
                <li>Recovery, repair, and regeneration</li>
                <li>Cognitive enhancement</li>
                <li>Immune modulation</li>
                <li>Metabolic optimization</li>
                <li>Sexual health</li>
              </ul>

              <h5 className="font-semibold">Risks and Side Effects</h5>
              <p>Possible side effects include, but are not limited to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Nausea, vomiting, diarrhea, or constipation</li>
                <li>Fatigue, headache, or dizziness</li>
                <li>Hypoglycemia (especially with GLP-1 medications)</li>
                <li>Allergic or injection site reactions</li>
                <li>Rare risks: pancreatitis, gallstones, thyroid nodules</li>
                <li>Unknown long-term risks</li>
              </ul>

              <h5 className="font-semibold">Contraindications</h5>
              <p>I confirm that I have disclosed whether I have the following:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Active or prior cancer, liver disease, or kidney disease</li>
                <li>Pregnancy or breastfeeding (these therapies are contraindicated)</li>
              </ul>

              <p>I agree to notify my provider of any health status or medication changes.</p>

              <h5 className="font-semibold">Monitoring Requirements</h5>
              <p>
                I may be required to undergo bloodwork or physical evaluations to monitor safety,
                including glucose, kidney function, liver function, lipids, thyroid function, or hormone
                levels.
              </p>

              <h5 className="font-semibold">No Guarantee of Results</h5>
              <p>
                I understand that results vary and no specific outcome—such as weight loss or hormone
                improvement—is guaranteed.
              </p>

              <h5 className="font-semibold">Off-Label & Investigational Status</h5>
              <p>
                Many peptides may be investigational and lack long-term human trial data. Use is based on
                clinical judgment and emerging evidence.
              </p>

              <h5 className="font-semibold">Insurance Disclaimer & Payment Responsibility</h5>
              <p>
                I understand peptide therapy is not covered by insurance and is elective and cash-based. I
                accept full financial responsibility for all peptide-related services.
              </p>
            </div>

            {/* SECTION 4 */}
            <div className="space-y-2">
              <h4 className="font-semibold">Section 4: Legally Binding Consent & Release</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  I confirm I have had the opportunity to ask questions, and all questions were answered.
                </li>
                <li>
                  I voluntarily consent to peptide therapy with full knowledge of potential risks and
                  benefits.
                </li>
                <li>I understand this treatment is elective and cash-based.</li>
                <li>
                  I release Somi Health PLLC, affiliated providers, and pharmacies from liability related to
                  peptide therapy use.
                </li>
                <li>
                  I agree to comply with the treatment plan, safety instructions, and follow-up
                  requirements.
                </li>
              </ul>

              <p className="mt-2">
                By checking the applicable box, I agree to the use of electronic records and electronic
                signatures and acknowledge that I have read and understand the related disclosures.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-2">
                <input type="checkbox" id="consent" {...register('consent')}
                  className="h-4 w-4 text-secondary mt-1 border-secondary rounded"
                />
                <label htmlFor="consent-checkbox" className="text-sm">
                  I have read the Somi Health telehealth consent form and HIPAA Privacy Notice at{' '}
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

              <div className="flex space-x-2">
                <input type="checkbox" id="terms" {...register('terms')}
                  className="h-4 w-4 text-secondary mt-1 border-secondary rounded"
                />
                <label htmlFor="terms-checkbox" className="text-sm">
                  I have read the Somi Health Terms of Services at{' '}
                  <a
                    href="https://joinsomi.com/terrms-of-use/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:underline"
                  >
                    https://joinsomi.com/terrms-of-use/
                  </a>
                </label>
              </div>
              {errors.terms && <p className="text-sm text-red-500">{errors.terms.message}</p>}

              <div className="flex space-x-2">
                <input type="checkbox" id="treatment" {...register('treatment')}
                  className="h-4 w-4 text-secondary mt-1 border-secondary rounded"
                />
                <label htmlFor="treatment-checkbox" className="text-sm">
                  I have read these forms, understand it, and voluntarily consent to treatment.
                </label>
              </div>
              {errors.treatment && <p className="text-sm text-red-500">{errors.treatment.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-secondary text-white hover:bg-secondary rounded-2xl">Submit</Button>
          </div>
          )}

          {/* Form segments */}
          {currentSegment === 0 && (
            <div className="space-y-4">
              {/* Age verification content */}
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
            </div>
          )}
          {currentSegment === 9 && (
            <div className="space-y-4">
              {/* Age verification content */}
              <div className="flex justify-between mt-8">
                <Button
                  onClick={handleNext}
                  type="button"
                  className="bg-secondary w-full text-white hover:bg-secondary rounded-2xl"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Other segments */}
          {currentSegment > 0 && currentSegment < segments.length - 1 && currentSegment != 9 && (
            <div className="space-y-4">
              {/* Segment content */}
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

        </form>
      </div >
    </div >
  );
}