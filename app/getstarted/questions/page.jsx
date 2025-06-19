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
  }),
  // Address
  address: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip code is required"),
  country: z.string().optional(),
  // Medical Information
  glp1Preference: z.string().min(1, "This field is required"),
  sex: z.string().min(1, "This field is required"),
  heightFeet: z.string().min(1, "This field is required"),
  heightInches: z.string().min(1, "This field is required"),
  currentWeight: z.string().min(1, "This field is required"),
  goalWeight: z.string().min(1, "This field is required"),
  allergies: z.string().min(1, "This field is required"),
  // Conditions
  conditions: z.array(z.string()).nonempty("Please select at least one option"),
  familyConditions: z.array(z.string()).nonempty("Please select at least one option"),
  diagnoses: z.array(z.string()).nonempty("Please select at least one option"),
  weightLossSurgery: z.array(z.string()).nonempty("Please select at least one option"),
  weightRelatedConditions: z.array(z.string()).nonempty("Please select at least one option"),
  medications: z.array(z.string()).nonempty("Please select at least one option"),
  kidneyDisease: z.string().min(1, "This field is required"),
  // History
  pastWeightLossMeds: z.array(z.string()).nonempty("Please select at least one option"),
  diets: z.array(z.string()).nonempty("Please select at least one option"),
  glp1PastYear: z.array(z.string()).nonempty("Please select at least one option"),
  lastInjectionDate: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^(0[1-9]|1[0-2])\s\/\s(0[1-9]|[12][0-9]|3[01])\s\/\s(19|20)\d{2}$/.test(val);
  }, "Please use MM / DD / YYYY format"),
  otherConditions: z.string().min(1, "This field is required"),
  currentMedications: z.string().min(1, "This field is required"),
  surgeries: z.string().min(1, "This field is required"),
  // Additional Info
  pregnant: z.string().min(1, "This field is required"),
  breastfeeding: z.string().min(1, "This field is required"),
  healthcareProvider: z.string().min(1, "This field is required"),
  eatingDisorders: z.string().min(1, "This field is required"),
  labs: z.string().min(1, "This field is required"),
  glp1Statement: z.string().min(1, "This field is required"),
  glp1DoseInfo: z.string().optional(),
  agreeTerms: z.string().min(1, "This field is required"),
  prescriptionPhoto: z.string().optional(),
  idPhoto: z.string().min(1, "This field is required"),
  comments: z.string().optional(),
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
  consent: z.boolean().refine(val => val === true, "You must consent to proceed"),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms"),
  treatment: z.boolean().refine(val => val === true, "You must consent to treatment"),
  agreetopay: z.boolean().refine(val => val === true, "You must consent to agree to pay"),
  glp1StartingWeight: z.string().optional(),
  bloodPressure: z.string().min(1, "This field is required"),
  heartRate: z.string().min(1, "This field is required"),
});

const segments = [
  { id: 'personal', name: 'Personal Information' },
  { id: 'age', name: 'Age Verification' },
  { id: 'bmiInfo', name: 'BMI Information' },
  { id: 'dob', name: 'Date of Birth' },
  { id: 'address', name: 'Shipping Address' },
  { id: 'preference', name: 'GLP-1 Preference' },
  { id: 'sex', name: 'Sex' },
  { id: 'height', name: 'Height' },
  { id: 'weight', name: 'Weight' },
  { id: 'glp1StartingWeight', name: 'GLP-1 Medication' },
  { id: 'bloodPressure', name: 'Blood Pressure' },
  { id: 'heartRate', name: 'Heart Rate' },
  { id: 'allergies', name: 'Allergies' },
  { id: 'conditions', name: 'Medical Conditions' },
  { id: 'family', name: 'Family History' },
  { id: 'diagnoses', name: 'Diagnoses' },
  { id: 'surgery', name: 'Weight Loss Surgery' },
  { id: 'weightConditions', name: 'Weight Related Conditions' },
  { id: 'medications', name: 'Medications' },
  { id: 'kidney', name: 'Kidney Health' },
  { id: 'pastMeds', name: 'Past Weight Loss Medications' },
  { id: 'diets', name: 'Diets' },
  { id: 'glp1History', name: 'GLP-1 History' },
  { id: 'otherMedical', name: 'Other Medical Info' },
  { id: 'currentMeds', name: 'Current Medications' },
  { id: 'surgicalHistory', name: 'Surgical History' },
  { id: 'pregnancy', name: 'Pregnancy Status' },
  { id: 'breastfeeding', name: 'Breastfeeding' },
  { id: 'provider', name: 'Healthcare Provider' },
  { id: 'eating', name: 'Eating Disorders' },
  { id: 'labs', name: 'Lab Tests' },
  { id: 'statement', name: 'GLP-1 Statement' },
  { id: 'terms', name: 'Terms Agreement' },
  { id: 'prescription', name: 'Prescription Upload' },
  { id: 'id', name: 'ID Upload' },
  { id: 'comments', name: 'Comments' },
  { id: 'consent', name: 'Telehealth Consent' },
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
  const [showAgeAlert, setShowAgeAlert] = useState(false);
  const [showIneligible, setShowIneligible] = useState(false);
  const [fileUrls, setFileUrls] = useState({ file1: '', file2: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
  const schemaFields = Object.keys(formSchema.shape);
  const totalFields = schemaFields.length;
  const completedFields = schemaFields.filter(
    (key) => formValues[key] && !errors[key]
  ).length;
  const progress = Math.round((completedFields / totalFields) * 100);

  // Additional watch hooks for BMI calculation
  const watchedFeet = useWatch({ control, name: 'heightFeet' });
  const watchedInches = useWatch({ control, name: 'heightInches' });
  const watchedWeight = useWatch({ control, name: 'currentWeight' });

  // Calculate BMI
  let bmi = null;
  const totalInches = parseInt(watchedFeet || '0') * 12 + parseInt(watchedInches || '0');
  if (totalInches > 0 && watchedWeight) {
    bmi = (parseFloat(watchedWeight) / (totalInches * totalInches)) * 703;
    bmi = Math.round(bmi * 10) / 10; // round to 1 decimal
  }

  // Helper function to handle checkbox changes
  const handleCheckboxChange = (field, value, checked) => {
    const currentValues = watch(field) || [];
    if (checked) {
      setValue(field, [...currentValues, value]);
    } else {
      setValue(field, currentValues.filter(item => item !== value));
    }
  };
  const [userSessionId, setUserSessionId] = useState("");
  const [lastVisitedSegment, setLastVisitedSegment] = useState(0);
  const [previousBasicData, setPreviousBasicData] = useState(null);

  // Generate session ID once
  useEffect(() => {
    let id = localStorage.getItem("userSessionId");
    if (!id) {
      id = `USR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem("userSessionId", id);
    }
    setUserSessionId(id);
  }, []);

  // Update database on every segment change
  useEffect(() => {
    const currentData = {
      firstName: watch("firstName"),
      lastName: watch("lastName"),
      phone: watch("phone"),
      email: watch("email"),
    };

    setLastVisitedSegment(currentSegment);

    if (!userSessionId) return;

    const payload = {
      userSessionId,
      firstSegment: currentData,
      lastSegmentReached: currentSegment,
      state: 0,
      timestamp: new Date().toISOString(),
    };

    fetch("/api/abandoned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => console.error("Segment update failed:", err));
  }, [currentSegment]); // <-- runs on *every* segment change

  // Update firstSegment if changed in Segment 0
  useEffect(() => {
    if (currentSegment !== 0 || !userSessionId) return;

    const currentData = {
      firstName: watch("firstName"),
      lastName: watch("lastName"),
      phone: watch("phone"),
      email: watch("email"),
    };

    const changed = JSON.stringify(currentData) !== JSON.stringify(previousBasicData);
    if (changed) {
      setPreviousBasicData(currentData);
      fetch("/api/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSessionId,
          firstSegment: currentData,
          lastSegmentReached: currentSegment,
          state: 0,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => console.error("Basic info update failed:", err));
    }
  }, [watch("firstName"), watch("lastName"), watch("phone"), watch("email"), currentSegment]);

  // Final fallback on tab/browser close
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentData = {
        firstName: watch("firstName"),
        lastName: watch("lastName"),
        phone: watch("phone"),
        email: watch("email"),
      };

      const payload = {
        userSessionId,
        firstSegment: currentData,
        lastSegmentReached: currentSegment,
        state: 0,
        timestamp: new Date().toISOString(),
      };

      navigator.sendBeacon("/api/abandoned", JSON.stringify(payload));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [userSessionId, currentSegment]);

  // Render ineligible state
  if (showIneligible) {
    const currentData = {
      firstName: watch("firstName"),
      lastName: watch("lastName"),
      phone: watch("phone"),
      email: watch("email"),
    };

    fetch("/api/abandoned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userSessionId,
        firstSegment: currentData,
        lastSegmentReached: currentSegment,
        state: 1,
        timestamp: new Date().toISOString(),
      }),
    }).catch((err) => console.error("Disqualified state update failed:", err));

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
          <div className="font-tagesschrift text-center text-6xl mb-2 text-secondary font-bold">somi</div>
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">
            Based on your response to the previous question, you currently do not meet the criteria for GLP-1 medication.
          </h2>
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
            <h3 className="text-lg md:text-x text-center">
              {/* Thanks for filling out your GLP-1 weight loss treatment intake form! */}
              <span className='text-black'>Click on </span><span className='font-bold text-secondary'>&quot;Pay Here&quot;</span><span className='text-black'> to complete the $25 Initial Review payment.</span>
            </h3>

            <p className="text-gray-600 text-center">
              <span className='font-bold'>Note:</span> $25 Initial review fee will be refunded if our Nurse practitioner determines you are <br /><span className='font-bold'>NOT</span> eligible for GLP-1 Medication
            </p>
            <p className="text-gray-600 text-center">
              Please Allow up to 24 hours for a Nurse Practitioner to carefully review your submitted form and get back to you. Thanks for your patierice.
            </p>
          </div>
          <Button
            onClick={() => { window.location.href = 'https://connect.intuit.com/pay/SomiHealth/scs-v1-7cb597849501499f9f119195593be1d6be2309e7d7e848b3b451bfa6260191d54dd7f556dff049078713b75ad2bba03c?locale=EN_US'; }}
            className="bg-green-400 text-white hover:bg-green-500 rounded-2xl font-bold text-lg px-8 w-[120px]"
          >
            Pay Here
          </Button>
        </div>
      </div>
    );
  }


  const handleNext = async () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentSegment === 1) {
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

      // Check conditions based on current segment
      let isIneligible = false;

      switch (currentSegmentId) {
        case 'conditions':
          if (hasOtherOptionsSelected('conditions')) {
            isIneligible = true;
          }
          break;
        case 'family':
          if (hasOtherOptionsSelected('familyConditions')) {
            isIneligible = true;
          }
          break;
        case 'diagnoses':
          if (hasOtherOptionsSelected('diagnoses')) {
            isIneligible = true;
          }
          break;
        case 'surgery':
          // Removed ineligibility check for weight loss surgery
          break;
        case 'weightConditions':
          // Removed ineligibility check for weight related conditions
          break;
        case 'medications':
          const medications = currentValues.medications || [];
          if (medications.includes('Opioid pain medication')) {
            // Allow opioid pain medication without disqualification
            break;
          }
          if (hasOtherOptionsSelected('medications')) {
            isIneligible = true;
          }
          break;
        case 'kidney':
          if (watch('kidneyDisease') === 'yes') {
            isIneligible = true;
          }
          break;
        case 'pastMeds':
          // Removed ineligibility check for past medications
          break;
        case 'diets':
          // Removed ineligibility check for diets
          break;
        case 'glp1History':
          break;
        case 'pregnancy':
          if (currentValues.pregnant === 'yes') {
            isIneligible = true;
          }
          break;
        case 'breastfeeding':
          if (currentValues.breastfeeding === 'yes') {
            isIneligible = true;
          }
          break;
      }

      if (isIneligible) {
        setShowIneligible(true);
        return;
      }

      setShowIneligible(false);
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
      // Calculate BMI
      const heightInches = parseInt(data.heightFeet) * 12 + parseInt(data.heightInches);
      // const bmi = (parseInt(data.currentWeight) / (heightInches * heightInches)) * 703;
      // const bmi = bmi;

      let bmi = null;
      const totalInches = parseInt(watchedFeet || '0') * 12 + parseInt(watchedInches || '0');
      if (totalInches > 0 && watchedWeight) {
        bmi = (parseFloat(watchedWeight) / (totalInches * totalInches)) * 703;
        bmi = Math.round(bmi * 10) / 10; // round to 1 decimal
      }

      // Format date from "MM / DD / YYYY" to ISO string
      const [month, day, year] = data.dob.split('/').map(part => part.trim());
      const formattedDate = new Date(year, month - 1, day).toISOString();

      // Handle array fields
      const glp1PastYear = Array.isArray(data.glp1PastYear) ? data.glp1PastYear[0] : data.glp1PastYear;
      const conditions = Array.isArray(data.conditions) ? data.conditions : [data.conditions].filter(Boolean);
      const familyConditions = Array.isArray(data.familyConditions) ? data.familyConditions : [data.familyConditions].filter(Boolean);
      const diagnoses = Array.isArray(data.diagnoses) ? data.diagnoses : [data.diagnoses].filter(Boolean);
      const weightLossSurgery = Array.isArray(data.weightLossSurgery) ? data.weightLossSurgery : [data.weightLossSurgery].filter(Boolean);
      const weightRelatedConditions = Array.isArray(data.weightRelatedConditions) ? data.weightRelatedConditions : [data.weightRelatedConditions].filter(Boolean);
      const medications = Array.isArray(data.medications) ? data.medications : [data.medications].filter(Boolean);
      const pastWeightLossMeds = Array.isArray(data.pastWeightLossMeds) ? data.pastWeightLossMeds : [data.pastWeightLossMeds].filter(Boolean);
      const diets = Array.isArray(data.diets) ? data.diets : [data.diets].filter(Boolean);

      const submissionData = {
        ...data,
        dateOfBirth: formattedDate,
        glp1PastYear,
        lastInjectionDate: data.lastInjectionDate,
        conditions,
        familyConditions,
        diagnoses,
        weightLossSurgery,
        weightRelatedConditions,
        medications,
        pastWeightLossMeds,
        diets,
        bmi: bmi,
        prescriptionPhoto: fileUrls.file1,
        idPhoto: fileUrls.file2,
        authid: `P${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
        questionnaire: true,
      };

      // Make API call to save data
      const response = await fetch('/api/questionnaire', {
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

      setIsSubmitting(false);
      setShowSuccess(true);


      if (userSessionId) {
        const currentData = {
          firstName: watch("firstName"),
          lastName: watch("lastName"),
          phone: watch("phone"),
          email: watch("email"),
        };
        fetch("/api/abandoned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userSessionId,
            firstSegment: currentData,
            lastSegmentReached: currentSegment,
            state: 2,
            timestamp: new Date().toISOString(),
          }),
        });
        localStorage.removeItem("userSessionId");
      }

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
      case 'bmiInfo': return [];
      case 'dob': return ['dob'];
      case 'address': return ['address', 'address2', 'city', 'state', 'zip', 'country'];
      case 'preference': return ['glp1Preference'];
      case 'sex': return ['sex'];
      case 'height': return ['heightFeet', 'heightInches', 'currentWeight'];
      case 'weight': return ['goalWeight'];
      case 'glp1StartingWeight': return ['glp1StartingWeight'];
      case 'bloodPressure': return ['bloodPressure'];
      case 'heartRate': return ['heartRate'];
      case 'allergies': return ['allergies'];
      case 'conditions': return ['conditions'];
      case 'family': return ['familyConditions'];
      case 'diagnoses': return ['diagnoses'];
      case 'surgery': return ['weightLossSurgery'];
      case 'weightConditions': return ['weightRelatedConditions'];
      case 'medications': return ['medications'];
      case 'kidney': return ['kidneyDisease'];
      case 'pastMeds': return ['pastWeightLossMeds'];
      case 'diets': return ['diets'];
      case 'glp1History': return ['glp1PastYear'];
      case 'otherMedical': return ['otherConditions'];
      case 'currentMeds': return ['currentMedications'];
      case 'surgicalHistory': return ['surgeries'];
      case 'pregnancy': return ['pregnant'];
      case 'breastfeeding': return ['breastfeeding'];
      case 'provider': return ['healthcareProvider'];
      case 'eating': return ['eatingDisorders'];
      case 'labs': return ['labs'];
      case 'statement': return ['glp1Statement'];
      case 'terms': return ['agreeTerms'];
      case 'prescription': return ['prescriptionPhoto'];
      case 'id': return ['idPhoto'];
      case 'comments': return ['comments'];
      case 'consent': return ['consent', 'terms', 'treatment', 'agreetopay'];
      default: return [];
    }
  };

  // Ineligibility full page
  if (showIneligible) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
          {/* Replace with somi logo or styled text */}
          <div className="font-tagesschrift text-center text-6xl mb-2 text-secondary font-bold">somi</div>
          <h2 className="text-2xl font-semibold text-gray-900 text-center mt-4 mb-2">Based on your response to the previous question, you currently do not meet the criteria for GLP-1 medication.</h2>
          <Button
            variant="outline"
            onClick={() => { window.location.href = 'https://joinsomi.com/'; }}
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4">
        <div className="w-full max-w-md mx-auto bg-white p-4 rounded-xl shadow-lg flex flex-col">
          <div className="font-tagesschrift text-center text-4xl md:text-6xl mb-2 text-secondary font-bold">somi</div>
          <div className="space-y-2 p-4 md:p-6">
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
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 text-center">
              Thanks for filling out your GLP-1 weight loss treatment intake form!
            </h3>

            <p className="text-gray-600 text-center">
              Please Allow up to 24 hours for a Nurse Practitioner to carefully review your submitted form and get back to you.
            </p>
            <p className="text-gray-600 text-center">
              Thanks for your patience.
            </p>
          </div>
          <Button
            onClick={() => { window.location.href = 'https://joinsomi.com/'; }}
            className="bg-secondary text-white hover:bg-secondary rounded-2xl px-8"
          >
            End
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-[500px] flex flex-col min-h-screen " >
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
            console.log('Form submit event triggered');
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
                  <Input
                    id="firstName"
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                />
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
                      className={`flex items-center w-[100px] justify-center text-sm px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('isOver18') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
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

          {/* BMI Information segment */}
          {currentSegment === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Body Max Index (BMI) requirement</h2>
              <p className="text-gray-600">
                FDA guidelines for GLP-1 medications like Semaglutide and Tirzepatide require a BMI of at least 30, or a BMI of at least 27 with a weight-related condition such as:
              </p>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Type 2 diabetes</li>
                <li>Hypertension</li>
                <li>High cholesterol</li>
                <li>Sleep apnea</li>
                <li>Cardiovascular disease</li>
              </ul>
              <p className="text-gray-600">
                These criteria ensure the medication helps those who need GLP-1 therapies for weight loss management.
              </p>
            </div>
          )}

          {/* Date of Birth segment */}
          {currentSegment === 3 && (
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
          {currentSegment === 4 && (
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
              </div>
            </div>
          )}

          {/* GLP-1 Preference segment */}
          {currentSegment === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Do you have a GLP-1 Preference<span className="text-red-500">*</span></h2>
              <div className="space-y-2">
                <div className="flex gap-2 justify-center flex-col">
                  {['Semaglutide', 'Tirzepatide', 'None'].map((option, index) => (
                    <label
                      key={index}
                      htmlFor={`glp1Preference-${index}`}
                      className={`flex items-center text-sm justify-center w-[140px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('glp1Preference') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="radio"
                        id={`glp1Preference-${index}`}
                        value={option}
                        className="hidden"
                        {...register('glp1Preference')}
                      />
                      <span >{option}</span>
                    </label>
                  ))}
                </div>
                {errors.glp1Preference && (
                  <p className="text-sm text-red-500">{errors.glp1Preference.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Sex segment */}
          {currentSegment === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Sex assigned at birth<span className="text-red-500">*</span></h2>
              <div className="space-y-2">
                <div className="flex gap-2 justify-center flex-col">
                  {['Male', 'Female'].map((option, index) => (
                    <label
                      key={index}
                      htmlFor={`sex-${index}`}
                      className={`flex items-center w-[140px] justify-center text-sm px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('sex') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="radio"
                        id={`sex-${index}`}
                        value={option}
                        className="hidden"
                        {...register('sex')}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {errors.sex && (
                  <p className="text-sm text-red-500">{errors.sex.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Height segment */}
          {currentSegment === 7 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Height</h2>
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      Feet <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {[1, 2, 3, 4, 5, 6, 7].map((feet, index) => (
                        <label
                          key={index}
                          htmlFor={`heightFeet-${index}`}
                          className={`flex items-center justify-center px-4 py-2 border border-blue-400 rounded-full cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('heightFeet') === feet.toString() ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                        >
                          <input
                            type="radio"
                            id={`heightFeet-${index}`}
                            value={feet.toString()}
                            className="hidden"
                            {...register('heightFeet')}
                          />
                          <span>{feet}</span>
                        </label>
                      ))}
                    </div>
                    {errors.heightFeet && (
                      <p className="text-sm text-red-500">{errors.heightFeet.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Inches <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((inches, index) => (
                        <label
                          key={index}
                          htmlFor={`heightInches-${index}`}
                          className={`flex items-center justify-center px-4 py-2 border border-blue-400 rounded-full cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('heightInches') === inches.toString() ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                        >
                          <input
                            type="radio"
                            id={`heightInches-${index}`}
                            value={inches.toString()}
                            className="hidden"
                            {...register('heightInches')}
                          />
                          <span>{inches}</span>
                        </label>
                      ))}
                    </div>
                    {errors.heightInches && (
                      <p className="text-sm text-red-500">{errors.heightInches.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentWeight">
                    Current Weight (lbs) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="currentWeight"
                    type="number"
                    {...register('currentWeight')}
                    onKeyDown={(e) => {
                      // Prevent form submission when Enter is pressed
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        return;
                      }
                    }}
                  />
                  {bmi !== null && (
                    <div className="flex justify-center">
                      <Badge
                        className="px-3 py-1 text-lg mt-2 font-bold rounded-md bg-green-200 text-green-900 hover:bg-green-200"
                      >
                        BMI: {bmi}
                      </Badge>
                    </div>
                  )}

                  {errors.currentWeight && (
                    <p className="text-sm text-red-500">{errors.currentWeight.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Weight segment */}
          {currentSegment === 8 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Weight</h2>
              <div className="space-y-2">
                <Label htmlFor="goalWeight">
                  Goal Weight (lbs) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="goalWeight"
                  type="number"
                  {...register('goalWeight')}
                  onKeyDown={(e) => {
                    // Prevent form submission when Enter is pressed
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      return;
                    }
                  }}
                />
                {errors.goalWeight && (
                  <p className="text-sm text-red-500">{errors.goalWeight.message}</p>
                )}
              </div>
            </div>
          )}

          {/* GLP-1 Starting Weight segment */}
          {currentSegment === 9 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">GLP-1 Medication</h2>
              <div className="space-y-2">
                <Label htmlFor="glp1StartingWeight">
                  If you are currently on GLP-1 Medication, what was your starting weight? (lbs)
                </Label>
                <Input
                  id="glp1StartingWeight"
                  type="number"
                  {...register('glp1StartingWeight')}
                  onKeyDown={(e) => {
                    // Prevent form submission when Enter is pressed
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      return;
                    }
                  }}
                />
                {errors.glp1StartingWeight && (
                  <p className="text-sm text-red-500">{errors.glp1StartingWeight.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Blood Pressure segment */}
          {currentSegment === 10 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Blood Pressure</h2>
              <div className="space-y-2">
                <Label>
                  What is your blood pressure range? <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col gap-3">
                  {[
                    'Normal < 120/<80',
                    'Elevated 120-129/<80',
                    'Stage 1 HTN 130-139/80-90',
                    'Stage 2 HTN 140 or Higher/ 90 or Higher'
                  ].map((option, index) => (
                    <label
                      key={index}
                      htmlFor={`bp-${index}`}
                      className={`flex items-center px-4 max-w-[270px] text-xs py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('bloodPressure') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="checkbox"
                        id={`bp-${index}`}
                        className="hidden"
                        checked={watch('bloodPressure') === option}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setValue('bloodPressure', option);
                          } else {
                            setValue('bloodPressure', '');
                          }
                        }}
                      />
                      <span>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.bloodPressure && (
                  <p className="text-sm text-red-500">{errors.bloodPressure.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Heart Rate segment */}
          {currentSegment === 11 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Heart Rate</h2>
              <div className="space-y-2">
                <Label>
                  What is your resting heart rate range? <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col gap-3">
                  {[
                    'Slow <60 beats per minute',
                    'Normal 60-100 beats per minute',
                    'Lightly Fast >100 to 115 beats per minute',
                    'Fast >150 beats per minute'
                  ].map((option, index) => (
                    <label
                      key={index}
                      htmlFor={`hr-${index}`}
                      className={`flex items-center px-4 text-xs max-w-[270px] py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('heartRate') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="checkbox"
                        id={`hr-${index}`}
                        className="hidden"
                        checked={watch('heartRate') === option}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setValue('heartRate', option);
                          } else {
                            setValue('heartRate', '');
                          }
                        }}
                      />
                      <span>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.heartRate && (
                  <p className="text-sm text-red-500">{errors.heartRate.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Allergies segment */}
          {currentSegment === 12 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Allergies</h2>
              <div className="space-y-2">
                <Label htmlFor="allergies">
                  Do you have any allergies? If not applicable, Type N/A <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="allergies"
                  {...register('allergies')}
                  placeholder="Type your answer here..."
                />
                {errors.allergies && (
                  <p className="text-sm text-red-500">{errors.allergies.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Medical Conditions segment */}
          {currentSegment === 13 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Medical Conditions</h2>
              <div className="space-y-2">
                <Label>
                  Have you ever experienced any of the following conditions? <span className="text-red-500">*</span>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                </Label>
                <div className="flex flex-col gap-3">
                  {[
                    'History of severe GI disease/ Chronic Constipation',
                    'Current gallbladder problems (not including previous gallbladder removal/cholecystectomy)',
                    'Retinal impairment/diabetic retinopathy',
                    'Bariatric surgery less than 6 months ago',
                    'Multiple endocrine neoplasia syndrome type 2 (MEN-2)',
                    'History of medullary thyroid cancer',
                    'Cancer',
                    'Liver Failure',
                    'Organ Transplant',
                    'None of the above'
                  ].map((condition, index) => (
                    <label
                      key={index}
                      htmlFor={`condition-${index}`}
                      className={`flex items-center px-4 text-xs py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('conditions')?.includes(condition) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="checkbox"
                        id={`condition-${index}`}
                        className="hidden"
                        checked={watch('conditions')?.includes(condition) || false}
                        onChange={(e) => handleCheckboxChange('conditions', condition, e.target.checked)}
                      />
                      <span>
                        {condition}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.conditions && (
                  <p className="text-sm text-red-500">{errors.conditions.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Family History segment */}
          {currentSegment === 14 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Family History</h2>
              <div className="space-y-2">
                <Label>
                  Does any members of your family have these conditions? <span className="text-red-500">*</span>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                </Label>
                <div className="flex flex-col gap-3">
                  {[
                    'Medullary thyroid cancer',
                    'Multiple endocrine neoplasia type 2',
                    'None of the above'
                  ].map((condition, index) => (
                    <label
                      key={index}
                      htmlFor={`family-${index}`}
                      className={`flex items-center px-4 text-xs max-w-[240px] py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('familyConditions')?.includes(condition) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="checkbox"
                        id={`family-${index}`}
                        className="hidden"
                        checked={watch('familyConditions')?.includes(condition) || false}
                        onChange={(e) => handleCheckboxChange('familyConditions', condition, e.target.checked)}
                      />
                      <span>
                        {condition}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.familyConditions && (
                  <p className="text-sm text-red-500">{errors.familyConditions.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Diagnoses segment */}
          {currentSegment === 15 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Diagnoses</h2>
              <div className="space-y-2">
                <Label>
                  Have you ever received any of these diagnoses? <span className="text-red-500">*</span>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                </Label>
                <div className="flex flex-col gap-3">
                  {[
                    'Type 1 diabetes',
                    'Pancreatitis',
                    'Gastroparesis',
                    'Seizures',
                    'Glaucoma',
                    'None of the above'
                  ].map((diagnosis, index) => (
                    <label
                      key={index}
                      htmlFor={`diagnosis-${index}`}
                      className={`flex items-center max-w-[140px] px-4 py-2 text-xs border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('diagnoses')?.includes(diagnosis) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="checkbox"
                        id={`diagnosis-${index}`}
                        className="hidden"
                        checked={watch('diagnoses')?.includes(diagnosis) || false}
                        onChange={(e) => handleCheckboxChange('diagnoses', diagnosis, e.target.checked)}
                      />
                      <span >
                        {diagnosis}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.diagnoses && (
                  <p className="text-sm text-red-500">{errors.diagnoses.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Weight Loss Surgery segment */}
          {currentSegment === 16 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Weight Loss Surgery</h2>
              <div className="space-y-2">
                <Label>
                  Have you had weight loss surgery in the last 18 months? <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col gap-3">
                  {[
                    'Sleeve gastrectomy',
                    'Laparoscopic adjustable gastric band (Lap-band)',
                    'Roux-en-Y gastric bypass',
                    'Gastric balloon',
                    'Other procedure',
                    'None of the above'
                  ].map((surgery, index) => (
                    <label
                      key={index}
                      htmlFor={`surgery-${index}`}
                      className={`flex items-center px-4 text-xs max-w-[320px] py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('weightLossSurgery')?.includes(surgery) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="checkbox"
                        id={`surgery-${index}`}
                        className="hidden"
                        checked={watch('weightLossSurgery')?.includes(surgery) || false}
                        onChange={(e) => handleCheckboxChange('weightLossSurgery', surgery, e.target.checked)}
                      />
                      <span>
                        {surgery}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.weightLossSurgery && (
                  <p className="text-sm text-red-500">{errors.weightLossSurgery.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Weight Related Conditions segment */}
          {currentSegment === 17 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Weight Related Conditions</h2>
              <div className="space-y-2">
                <Label>
                  Have you ever been diagnosed with any of the following weight-related conditions? <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col gap-3">
                  {[
                    'Type 2 diabetes (Non-insulin dependent)',
                    'Sleep apnea',
                    'Low HDL-C',
                    'High triglycerides',
                    'High Cholesterol',
                    'Prediabetes',
                    'High blood pressure',
                    'Heart disease',
                    'Osteoarthritis',
                    'Metabolic syndrome',
                    'Polycystic ovarian syndrome (PCOS)',
                    'Non-alcoholic fatty liver disease (NAFLD)',
                    'Coronary Artery Disease',
                    'A-Fib/Venous thromboembolism',
                    'Male Hypogonadism/Low Testosterone',
                    'Hypothyrodisim',
                    'Depression',
                    'Gout',
                    'Stress Incontinence',
                    'GERD',
                    'Stroke',
                    'Reactive airway disease/Asthma',
                    'None of the above'
                  ].map((condition, index) => (
                    <label
                      key={index}
                      htmlFor={`weightCondition-${index}`}
                      className={`flex items-center text-xs max-w-[280px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('weightRelatedConditions')?.includes(condition) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="checkbox"
                        id={`weightCondition-${index}`}
                        className="hidden"
                        checked={watch('weightRelatedConditions')?.includes(condition) || false}
                        onChange={(e) => handleCheckboxChange('weightRelatedConditions', condition, e.target.checked)}
                      />
                      <span>
                        {condition}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.weightRelatedConditions && (
                  <p className="text-sm text-red-500">{errors.weightRelatedConditions.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Medications segment */}
          {currentSegment === 18 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Medications</h2>
              <div className="space-y-2">
                <Label>
                  Are you taking any of these medications? <span className="text-red-500">*</span>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                </Label>
                <div className="flex flex-col gap-3">
                  {[
                    'Insulin',
                    'Sulfonylureas',
                    'Opioid pain medication',
                    'None of the above'
                  ].map((med, index) => (
                    <label
                      key={index}
                      htmlFor={`med-${index}`}
                      className={`flex items-center text-xs max-w-[180px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('medications')?.includes(med) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="checkbox"
                        id={`med-${index}`}
                        className="hidden"
                        checked={watch('medications')?.includes(med) || false}
                        onChange={(e) => handleCheckboxChange('medications', med, e.target.checked)}
                      />
                      <span>
                        {med}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.medications && (
                  <p className="text-sm text-red-500">{errors.medications.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Kidney Health segment */}
          {currentSegment === 19 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Kidney Health</h2>
              <div className="space-y-4">
                <Label>
                  History of kidney disease or failure? Consulted a nephrologist? <span className="text-red-500">*</span>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                </Label>
                {/* container */}
                <div className="flex gap-2 justify-center flex-col items-center">
                  {['Yes', 'No'].map((option, index) => (
                    <label
                      key={index}
                      htmlFor={`kidney${option}`}
                      className={`flex items-center w-[100px] text-sm justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('kidneyDisease') === option.toLowerCase()
                        ? 'bg-secondary text-white'
                        : 'bg-white text-secondary'
                        }`}
                    >
                      <input
                        type="radio"
                        id={`kidney${option}`}
                        value={option.toLowerCase()}
                        className="hidden"
                        {...register('kidneyDisease')}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>

                {errors.kidneyDisease && (
                  <p className="text-sm text-red-500">{errors.kidneyDisease.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Past Weight Loss Medications segment */}
          {currentSegment === 20 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Past Weight Loss Medications</h2>
              <div className="space-y-2">
                <Label>
                  Have you used any of these medications for weight loss? <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col gap-3">
                  {[
                    'Zepbound (Tirzepatide)',
                    'Wegovy (Semaglutide)',
                    'Ozempic (Semaglutide)',
                    'Mounjaro (Tirzepatide)',
                    'Saxenda (Liraglutide)',
                    'Victoza (Liraglutide)',
                    'Compound Semaglutide',
                    'Compound Tirzepatide',
                    'Metformin',
                    'Phentermine',
                    'Topiramate',
                    'Orlistat/Alli',
                    'Saxenda',
                    'Contrave',
                    'Qsymia',
                    'None of the above'
                  ].map((med, index) => (
                    <label
                      key={index}
                      htmlFor={`pastMed-${index}`}
                      className={`flex items-center text-xs max-w-[180px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('pastWeightLossMeds')?.includes(med) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="checkbox"
                        id={`pastMed-${index}`}
                        className="hidden"
                        checked={watch('pastWeightLossMeds')?.includes(med) || false}
                        onChange={(e) => handleCheckboxChange('pastWeightLossMeds', med, e.target.checked)}
                      />
                      <span>
                        {med}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.pastWeightLossMeds && (
                  <p className="text-sm text-red-500">{errors.pastWeightLossMeds.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Diets segment */}
          {currentSegment === 21 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Lifestyle Changes</h2>
              <div className="space-y-2">
                <Label>
                  Have you ever tried any of these diets/lifestyle changes? <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col gap-3">
                  {[
                    'Keto',
                    'Whole30',
                    'Weight Watchers',
                    'Paleo',
                    'Intermittent Fasting',
                    'Carnivore Diet',
                    'Mediterranean Diet',
                    'Vegan Diet',
                    'Vegetarian Diet',
                    'DASH Diet',
                    'Exercise',
                    'None of the above'
                  ].map((diet, index) => (
                    <label
                      key={index}
                      htmlFor={`diet-${index}`}
                      className={`flex items-center text-xs max-w-[150px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('diets')?.includes(diet) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="checkbox"
                        id={`diet-${index}`}
                        className="hidden"
                        checked={watch('diets')?.includes(diet) || false}
                        onChange={(e) => handleCheckboxChange('diets', diet, e.target.checked)}
                      />
                      <span>
                        {diet}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.diets && (
                  <p className="text-sm text-red-500">{errors.diets.message}</p>
                )}
              </div>
            </div>
          )}

          {/* GLP-1 History segment */}
          {currentSegment === 22 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">GLP-1 History</h2>
              <div className="space-y-4">
                <Label>
                  Have you taken any of the following GLP-1 medications in the past year? <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col gap-3">
                  {[
                    'Zepbound (Tirzepatide)',
                    'Wegovy (Semaglutide)',
                    'Ozempic (Semaglutide)',
                    'Mounjaro (Tirzepatide)',
                    'Saxenda (Liraglutide)',
                    'Victoza (Liraglutide)',
                    'Compound Semaglutide',
                    'Compound Tirzepatide',
                    'None of the above'
                  ].map((med, index) => (
                    <label
                      key={index}
                      htmlFor={`glp1History-${index}`}
                      className={`flex items-center text-xs max-w-[180px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer md:hover:bg-secondary md:hover:text-white transition-all duration-150 ${watch('glp1PastYear')?.includes(med) ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="checkbox"
                        id={`glp1History-${index}`}
                        className="hidden"
                        checked={watch('glp1PastYear')?.includes(med) || false}
                        onChange={(e) => handleCheckboxChange('glp1PastYear', med, e.target.checked)}
                      />
                      <span>
                        {med}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.glp1PastYear && (
                  <p className="text-sm text-red-500">{errors.glp1PastYear.message}</p>
                )}

                {/* Last Injection Date Input */}
                {watch('glp1PastYear')?.some(med => med !== 'None of the above') && (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="lastInjectionDate">
                      When was your last GLP-1 injection?
                    </Label>
                    <div className="relative w-[200px]">
                      <Input
                        id="lastInjectionDate"
                        type="text"
                        inputMode="numeric"
                        placeholder="MM / DD / YYYY"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        {...register('lastInjectionDate')}
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
                      {errors.lastInjectionDate && (
                        <p className="text-sm text-red-500">{errors.lastInjectionDate.message}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other Medical Info segment */}
          {currentSegment === 23 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Other Medical Info</h2>
              <div className="space-y-2">
                <Label htmlFor="otherConditions">
                  List any other medical conditions, if any. Otherwise, type N/A. <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="otherConditions"
                  {...register('otherConditions')}
                  placeholder="Type your answer here..."
                />
                {errors.otherConditions && (
                  <p className="text-sm text-red-500">{errors.otherConditions.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Current Medications segment */}
          {currentSegment === 24 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Current Medications</h2>
              <div className="space-y-2">
                <Label htmlFor="currentMedications">
                  Are you taking any medications or supplements? If YES, please list. If None, type NA <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="currentMedications"
                  {...register('currentMedications')}
                  placeholder="Type your answer here..."
                />
                {errors.currentMedications && (
                  <p className="text-sm text-red-500">{errors.currentMedications.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Surgical History segment */}
          {currentSegment === 25 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Surgical History</h2>
              <div className="space-y-2">
                <Label htmlFor="surgeries">
                  Any prior significant surgeries or hospitalization? If YES, please list. If None, type NA.<span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="surgeries"
                  {...register('surgeries')}
                  placeholder="Type your answer here..."
                />
                {errors.surgeries && (
                  <p className="text-sm text-red-500">{errors.surgeries.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Pregnancy Status segment */}
          {currentSegment === 26 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Pregnancy Status</h2>
              <div className="space-y-4">
                <Label>
                  Are you pregnant or planning to become pregnant in the near future? <span className="text-red-500">*</span>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                </Label>
                <div className="flex gap-2 justify-center flex-col items-center">
                  {['yes', 'no'].map((option, index) => (
                    <label
                      key={index}
                      htmlFor={`pregnant-${index}`}
                      className={`flex items-center text-sm w-[100px] justify-center px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('pregnant') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="radio"
                        id={`pregnant-${index}`}
                        value={option}
                        className="hidden"
                        {...register('pregnant')}
                      />
                      <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                    </label>
                  ))}
                </div>
                {errors.pregnant && (
                  <p className="text-sm text-red-500">{errors.pregnant.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Breastfeeding segment */}
          {currentSegment === 27 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Breastfeeding</h2>
              <div className="space-y-4">
                <Label>
                  Are you breastfeeding? <span className="text-red-500">*</span>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-secondary text-white rounded-full">Disqualifier</span>
                </Label>
                <div className="flex gap-2 justify-center flex-col items-center">
                  {['yes', 'no'].map((option, index) => (
                    <label
                      key={index}
                      htmlFor={`breastfeeding-${index}`}
                      className={`flex items-center w-[100px] justify-center text-sm px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('breastfeeding') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="radio"
                        id={`breastfeeding-${index}`}
                        value={option}
                        className="hidden"
                        {...register('breastfeeding')}
                      />
                      <span >{option === 'yes' ? 'Yes' : 'No'}</span>
                    </label>
                  ))}
                </div>
                {errors.breastfeeding && (
                  <p className="text-sm text-red-500">{errors.breastfeeding.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Healthcare Provider segment */}
          {currentSegment === 28 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Healthcare Provider</h2>
              <div className="space-y-4">
                <Label>
                  Are you under the care of a healthcare provider? <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 justify-center flex-col items-center">
                  {['yes', 'no'].map((option, index) => (
                    <label
                      key={index}
                      htmlFor={`provider-${index}`}
                      className={`flex items-center justify-center text-sm w-[100px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('healthcareProvider') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="radio"
                        id={`provider-${index}`}
                        value={option}
                        className="hidden"
                        {...register('healthcareProvider')}
                      />
                      <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                    </label>
                  ))}
                </div>
                {errors.healthcareProvider && (
                  <p className="text-sm text-red-500">{errors.healthcareProvider.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Eating Disorders segment */}
          {currentSegment === 29 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Eating Disorders</h2>
              <div className="space-y-4">
                <Label>
                  Do you have a history of eating disorders? <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 justify-center flex-col items-center">
                  {['yes', 'no'].map((option, index) => (
                    <label
                      key={index}
                      htmlFor={`eating-${index}`}
                      className={`flex items-center justify-center text-sm w-[100px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('eatingDisorders') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="radio"
                        id={`eating-${index}`}
                        value={option}
                        className="hidden"
                        {...register('eatingDisorders')}
                      />
                      <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                    </label>
                  ))}
                </div>
                {errors.eatingDisorders && (
                  <p className="text-sm text-red-500">{errors.eatingDisorders.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Lab Tests segment */}
          {currentSegment === 30 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Lab Tests</h2>
              <div className="space-y-4">
                <Label>
                  Have you had any labs done in the last year that includes Hgb A1c, kidney function (CMP/BMP), lipids, and thyroid studies? <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 justify-center flex-col items-center">
                  {['yes', 'no'].map((option, index) => (
                    <label
                      key={index}
                      htmlFor={`labs-${index}`}
                      className={`flex items-center justify-center text-sm w-[100px] px-4 py-2 border border-blue-400 rounded-full cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('labs') === option ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="radio"
                        id={`labs-${index}`}
                        value={option}
                        className="hidden"
                        {...register('labs')}
                      />
                      <span>{option === 'yes' ? 'Yes' : 'No'}</span>
                    </label>
                  ))}
                </div>
                {errors.labs && (
                  <p className="text-sm text-red-500">{errors.labs.message}</p>
                )}
              </div>
            </div>
          )}

          {/* GLP-1 Statement segment */}
          {currentSegment === 31 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">GLP-1 Statement</h2>
              <div className="space-y-2">
                <Label>
                  Please select the following statement that applies to you. <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col gap-3">
                  {['New to GLP-1 therapy', 'Currently on Semaglutide, requesting dose increase', 'Currently on Semaglutide, keep my current dose', 'Currently on Tirzepatide, requesting dose increase', 'Currently on Tirzepatide, keep my current dose', 'On Semaglutide, requesting change to Tirzepatide', 'On Tirzepatide, requesting change to Semaglutide', 'Other'].map((statement, index) => (
                    <label
                      key={index}
                      htmlFor={`statement-${index}`}
                      className={`flex items-center text-xs max-w-[330px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('glp1Statement') === statement ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="radio"
                        id={`statement-${index}`}
                        value={statement}
                        className="hidden"
                        {...register('glp1Statement')}
                      />
                      <span>{statement}</span>
                    </label>
                  ))}
                </div>
                {errors.glp1Statement && (
                  <p className="text-sm text-red-500">{errors.glp1Statement.message}</p>
                )}

                {/* Conditional field for dose details */}
                {watch('glp1Statement') !== 'New to GLP-1 therapy' && watch('glp1Statement') !== 'Other' && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold">
                      You have selected to continue on your current therapy or a change in therapy, please specify below, if applicable.
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="glp1DoseInfo">
                          A) Please provide your current GLP-1 dose
                          <br />
                          B) Please provide the new GLP-1 dose you are requesting.
                          <br />
                          Description (optional)
                        </Label>
                        <Textarea
                          id="glp1DoseInfo"
                          {...register('glp1DoseInfo')}
                          placeholder="Type your answer here..."
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Terms Agreement segment */}
          {currentSegment === 32 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Terms Agreement</h2>
              <div className="space-y-4">
                <Label>
                  I agree to only use Somi Health for GLP-1. <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 justify-center flex-col items-center">
                  {['Yes', 'No'].map((option, index) => (
                    <label
                      key={index}
                      htmlFor={`terms-${index}`}
                      className={`flex items-center justify-center text-sm w-[100px] px-4 py-2 border border-blue-400 rounded-3xl cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 ${watch('agreeTerms') === option.toLowerCase() ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}
                    >
                      <input
                        type="radio"
                        id={`terms-${index}`}
                        value={option.toLowerCase()}
                        className="hidden"
                        {...register('agreeTerms')}
                      />
                      <span >{option}</span>
                    </label>
                  ))}
                </div>
                {errors.agreeTerms && (
                  <p className="text-sm text-red-500">{errors.agreeTerms.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Prescription Upload segment */}
          {currentSegment === 33 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Prescription Upload</h2>
              <div className="space-y-2">
                <Label>
                  Please upload a clear photo of your GLP-1 prescription (Optional)
                </Label>
                <UploadFile
                  onUploadComplete={(url) => {
                    setFileUrls(prev => ({ ...prev, file1: url }));
                    setValue('prescriptionPhoto', url);
                  }}
                  onDelete={() => {
                    setFileUrls(prev => ({ ...prev, file1: '' }));
                    setValue('prescriptionPhoto', '');
                  }}
                />
                {errors.prescriptionPhoto && (
                  <p className="text-sm text-red-500">{errors.prescriptionPhoto.message}</p>
                )}
              </div>
            </div>
          )}

          {/* ID Upload segment */}
          {currentSegment === 34 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">ID Upload</h2>
              <div className="space-y-2">
                <Label>
                  Please upload a GOVERNMENT-ISSUED photo ID <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-600 mb-4">
                  I&apos;m responsible for any co-pays, deductibles, and coinsurance amounts as determined by my insurance plan.
                </p>
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

          {/* Comments segment */}
          {currentSegment === 35 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Do you have any questions or comments for the provider?</h2>
              <div className="space-y-2">
                <Label htmlFor="comments">
                  Discription (Optional)
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
          {currentSegment === 36 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Telehealth Consent to Treatment and HIPAA Notice</h2>
              <div className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Weight Management (Semaglutide and Tirzepatide) Prescription Drug Management Consent</h3>
                  <p>This document confirms informed consent for GLP-1, a weight management medication.</p>

                  <div className="space-y-2">
                    <h4 className="font-semibold">A. Patient Informed Consent</h4>
                    <p>I request treatment at Somi Health and have disclosed relevant medical information. I acknowledge being informed of alternatives, side effects, risks, and benefits. The medication is administered via subcutaneous injection, may come from a non-FDA-approved compounding pharmacy, but is FDA-monitored and third-party tested. Prices include the provider&apos;s time, supplies, and medication.</p>
                    <p>I understand the potential common side effects (e.g., nausea, headache, fatigue) and severe reactions (e.g., thyroid cancer, acute kidney injury, pancreatitis).</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">B. Responsibilities</h4>
                    <p>I will obtain compounded prescriptions from Somi Health, disclose complete medical history, and notify providers of any health changes or pregnancy. I will follow prescribed instructions, store medication properly, and seek help if needed. Medications must be kept away from others.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Safety:</h4>
                    <ul className="list-disc pl-5">
                      <li>Keep medication away from children (&lt;18 years old).</li>
                      <li>Do not give/sell medication to others.</li>
                    </ul>
                    <p>If adverse effects or inefficacy occur, or if I fail to comply with responsibilities, Somi Health providers may discontinue the medication.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Financial Acknowledgment</h4>
                    <p>Currently, Somi Health, LLC does not accept insurance. Our weight loss service is a self-pay service.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">SAME-DAY PAYMENT</h4>
                    <p>Self-pay patients are required to pay all costs incurred during each visit in-full on the same day. These may include visit fees, additional services, and medicines. We do offer payment plans.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">SELF-PAY PATIENTS</h4>
                    <p><strong>DEFINITION:</strong> If you are not insured or your insurance company will not cover the visit and there is no deductible to be met, you will be considered a SELF-PAY patient.</p>
                    <p><strong>REFUNDS POLICY:</strong> No refunds, credits, or exchanges are allowed on any medicines that are dispensed, mixed, or purchased. Once medicines have physically left the pharmacy we can no longer guarantee the integrity of the product. Thus, to guarantee the health and safety of other patients, medicines cannot be returned, refunded, credited, or exchanged under any circumstances.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">SOMI HEALTH TELEHEALTH PRACTICE STATE DISCLOSURE</h4>
                    <p><strong>Patient Acknowledgment and Consent:</strong> I acknowledge that I am receiving healthcare services from Somi Health and understand that my care is provided in accordance with the laws and regulations of the state in which I am receiving services. I agree I&apos;m present in one of the following states in which Somi Health is licensed at the time of my care: Arizona, Connecticut, Colorado, Florida, Georgia, Iowa, Kentucky, Minnesota, New Jersey, North Carolina, Oklahoma, Tennessee, Texas and Washington D.C.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">HIPAA Notice</h4>
                    <p><strong>Your Information. Your Rights. Our Responsibilities.</strong></p>
                    <p><strong>Introduction</strong><br />This notice explains how your medical information may be used, disclosed, and how you can access it. Please review it carefully.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Your Rights</h4>
                    <ul className="list-disc pl-5">
                      <li>Get a copy of your health records.</li>
                      <li>Correct your health records.</li>
                      <li>Request confidential communications.</li>
                      <li>Ask us to limit what we use or share.</li>
                      <li>Get a list of those I&apos;ve shared information with.</li>
                      <li>Get a copy of this privacy notice.</li>
                      <li>Choose someone to act for you.</li>
                      <li>File a complaint if your rights are violated.</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Contact Information</h4>
                    <p>Somi Health<br />
                      4111 E Rose Lake Dr<br />
                      Charlotte NC, 28217<br />
                      (704) 386-6871<br />
                      joinsomi.com</p>
                    <p>This notice is effective as of 03/15/2025</p>
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
                          href="https://joinsomi.com/terrms-of-use/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary hover:underline"
                        >
                          https://joinsomi.com/terrms-of-use/
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
                        I agree to pay the $25 initial review payment. This will be refunded if our provider determines you are NOT eligible for GLP-1 treatment.
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

          {/* Other segments */}
          {currentSegment > 0 && currentSegment < segments.length - 1 && (
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

          {/* Final segment */}
          {currentSegment === segments.length - 1 && (
            <div className="space-y-4">
              {/* Final segment content */}
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => {
                    console.log('Final form data:', watch());
                    handleSubmit(onSubmit)();
                  }}
                  type="button"
                  className="bg-green-400 text-white hover:bg-green-500 rounded-2xl"
                >
                  Continue to payment
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}