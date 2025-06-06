"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogDescription, AlertDialogHeader, AlertDialogContent, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import UploadFile from "@/components/FileUpload";

// Form validation schema
const formSchema = z.object({
  // Age verification
  isOver18: z.enum(['yes', 'no'], {
    required_error: "You must be at least 18 years old to register",
  }),
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  // Address
  address: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
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
  agreeTerms: z.string().min(1, "This field is required"),
  prescriptionPhoto: z.string().min(1, "This field is required"),
  idPhoto: z.string().min(1, "This field is required"),
  comments: z.string().min(1, "This field is required"),
  dob: z.string().min(1, "Date of birth is required")
    .refine(dob => {
      const birthDate = new Date(dob);
      const today = new Date();
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
});

const segments = [
  { id: 'age', name: 'Age Verification' },
  { id: 'bmiInfo', name: 'BMI Information' },
  { id: 'dob', name: 'Date of Birth' },
  { id: 'personal', name: 'Personal Information' },
  { id: 'address', name: 'Shipping Address' },
  { id: 'preference', name: 'GLP-1 Preference' },
  { id: 'sex', name: 'Sex' },
  { id: 'height', name: 'Height' },
  { id: 'weight', name: 'Weight' },
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
  { id: 'consent', name: 'Telehealth Consent' }
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
  const [currentSegment, setCurrentSegment] = useState(0);
  const [showAgeAlert, setShowAgeAlert] = useState(false);
  const [showIneligible, setShowIneligible] = useState(false);
  const [fileUrls, setFileUrls] = useState({ file1: '', file2: '' });

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

  const handleNext = async () => {
    if (currentSegment === 0) {
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
          if (hasOtherOptionsSelected('weightLossSurgery')) {
            isIneligible = true;
          }
          break;
        case 'medications':
          if (hasOtherOptionsSelected('medications')) {
            isIneligible = true;
          }
          break;
        case 'weightConditions':
          if (hasOtherOptionsSelected('weightRelatedConditions')) {
            isIneligible = true;
          }
          break;
        case 'pastMeds':
          if (hasOtherOptionsSelected('pastWeightLossMeds')) {
            isIneligible = true;
          }
          break;
        case 'diets':
          if (hasOtherOptionsSelected('diets')) {
            isIneligible = true;
          }
          break;
        case 'glp1History':
          if (hasOtherOptionsSelected('glp1PastYear')) {
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
    if (currentSegment > 0) {
      setCurrentSegment(currentSegment - 1);
    }
  };

  const router = useRouter();
  const onSubmit = async (data) => {
    console.log('Form submission started');
    console.log('Raw form data:', data);
    
    try {
      // Calculate BMI
      const heightInInches = parseInt(data.heightFeet) * 12 + parseInt(data.heightInches);
      const bmi = (parseInt(data.currentWeight) / (heightInInches * heightInInches)) * 703;
      console.log('Calculated BMI:', bmi);

      const submissionData = {
        ...data,
        bmi: bmi,
        prescriptionPhoto: fileUrls.file1,
        idPhoto: fileUrls.file2,
        authid: `P${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
        questionnaire: true,
      };

      console.log('Final submission data:', submissionData);
      
      // You can add your API call here
      // const response = await fetch('/api/submit-form', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(submissionData),
      // });

      toast.success('Form submitted successfully!');
      router.push('/getstarted'); // Redirect to success page or wherever you want
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    }
  };

  const getSegmentFields = (segmentId) => {
    switch (segmentId) {
      case 'age': return ['isOver18'];
      case 'bmiInfo': return [];
      case 'dob': return ['dob'];
      case 'personal': return ['firstName', 'lastName', 'phone', 'email'];
      case 'address': return ['address', 'address2', 'city', 'state', 'zip', 'country'];
      case 'preference': return ['glp1Preference'];
      case 'sex': return ['sex'];
      case 'height': return ['heightFeet', 'heightInches'];
      case 'weight': return ['currentWeight', 'goalWeight'];
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
      case 'consent': return ['consent'];
      default: return [];
    }
  };

  // Calculate form completion progress
  const formValues = watch();
  const schemaFields = Object.keys(formSchema.shape);
  const totalFields = schemaFields.length;
  const completedFields = schemaFields.filter(
    (key) => formValues[key] && !errors[key]
  ).length;
  const progress = Math.round((completedFields / totalFields) * 100);

  // Helper function to handle checkbox changes
  const handleCheckboxChange = (field, value, checked) => {
    const currentValues = watch(field) || [];
    if (checked) {
      setValue(field, [...currentValues, value]);
    } else {
      setValue(field, currentValues.filter(item => item !== value));
    }
  };


  return (
    <div className="container mx-auto p-6 max-w-6xl flex flex-col min-h-screen">
      <h1 className="font-tagesschrift text-center text-6xl mb-2 text-secondary font-bold">somi</h1>

      {/* Custom progress bar */}
      <div className="mb-8">
        <ProgressBar progress={progress} />
        <div className="text-right text-sm text-gray-600">
          {progress}% Complete
        </div>
      </div>

      {/* Form segments */}
      <form 
        onSubmit={(e) => {
          console.log('Form submit event triggered');
          handleSubmit(onSubmit)(e);
        }} 
        className="space-y-8 p-6 bg-white rounded-xl border border-gray-200 shadow-secondary shadow-2xl"
        noValidate
      >
        {/* Age verification segment */}
        {currentSegment === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Age Verification</h2>

            {showAgeAlert && (
              <AlertDialog variant="destructive" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDialogDescription>
                  You must be at least 18 years old to register.
                </AlertDialogDescription>
              </AlertDialog>
            )}

            <div className="space-y-2">
              <Label htmlFor="isOver18">
                Are you over 18? <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue('isOver18', value)}
                defaultValue={watch('isOver18')}
              >
                <SelectTrigger id="isOver18" className="w-full">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes, I am over 18</SelectItem>
                  <SelectItem value="no">No, I am under 18</SelectItem>
                </SelectContent>
              </Select>
              {errors.isOver18 && (
                <p className="text-sm text-red-500">{errors.isOver18.message}</p>
              )}
            </div>
          </div>
        )}

        {/* BMI Information segment */}
        {currentSegment === 1 && (
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
        {currentSegment === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Date of Birth</h2>
            <div className="space-y-2">
              <Label htmlFor="dob">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dob"
                type="date"
                {...register('dob')}
              />
              {errors.dob && (
                <p className="text-sm text-red-500">{errors.dob.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Personal Information segment */}
        {currentSegment === 3 && (
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

        {/* Address segment */}
        {currentSegment === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Please provide your shipping address</h2>
            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-red-500">*</span>
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
                <Label htmlFor="country">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="country"
                  {...register('country')}
                />
                {errors.country && (
                  <p className="text-sm text-red-500">{errors.country.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GLP-1 Preference segment */}
        {currentSegment === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Do you have a GLP-1 Preference</h2>
            <div className="space-y-2">
              <Select
                onValueChange={(value) => setValue('glp1Preference', value)}
                defaultValue={watch('glp1Preference')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semaglutide">Semaglutide</SelectItem>
                  <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                </SelectContent>
              </Select>
              {errors.glp1Preference && (
                <p className="text-sm text-red-500">{errors.glp1Preference.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Sex segment */}
        {currentSegment === 6 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Sex assigned at birth</h2>
            <div className="space-y-2">
              <Select
                onValueChange={(value) => setValue('sex', value)}
                defaultValue={watch('sex')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heightFeet">
                  Height in Feet <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => setValue('heightFeet', value)}
                  defaultValue={watch('heightFeet')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feet" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map(feet => (
                      <SelectItem key={feet} value={feet.toString()}>{feet}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.heightFeet && (
                  <p className="text-sm text-red-500">{errors.heightFeet.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="heightInches">
                  Height in Inches <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => setValue('heightInches', value)}
                  defaultValue={watch('heightInches')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select inches" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(inches => (
                      <SelectItem key={inches} value={inches.toString()}>{inches}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.heightInches && (
                  <p className="text-sm text-red-500">{errors.heightInches.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Weight segment */}
        {currentSegment === 8 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Weight</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentWeight">
                  Current Weight (lbs) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="currentWeight"
                  type="number"
                  {...register('currentWeight')}
                />
                {errors.currentWeight && (
                  <p className="text-sm text-red-500">{errors.currentWeight.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalWeight">
                  Goal Weight (lbs) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="goalWeight"
                  type="number"
                  {...register('goalWeight')}
                />
                {errors.goalWeight && (
                  <p className="text-sm text-red-500">{errors.goalWeight.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Allergies segment */}
        {currentSegment === 9 && (
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
        {currentSegment === 10 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Medical Conditions</h2>
            <div className="space-y-2">
              <Label>
                Have you ever experienced any of the following conditions? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 gap-3">
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
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('conditions')?.includes(condition) ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="checkbox"
                      id={`condition-${index}`}
                      className="hidden"
                      checked={watch('conditions')?.includes(condition) || false}
                      onChange={(e) => handleCheckboxChange('conditions', condition, e.target.checked)}
                    />
                    <span className="ml-2">
                      {String.fromCharCode(65 + index)}. {condition}
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
        {currentSegment === 11 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Family History</h2>
            <div className="space-y-2">
              <Label>
                Does any members of your family have these conditions? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Medullary thyroid cancer',
                  'Multiple endocrine neoplasia type 2',
                  'None of the above'
                ].map((condition, index) => (
                  <label
                    key={index}
                    htmlFor={`family-${index}`}
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('familyConditions')?.includes(condition) ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="checkbox"
                      id={`family-${index}`}
                      className="hidden"
                      checked={watch('familyConditions')?.includes(condition) || false}
                      onChange={(e) => handleCheckboxChange('familyConditions', condition, e.target.checked)}
                    />
                    <span className="ml-2">
                      {String.fromCharCode(65 + index)}. {condition}
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
        {currentSegment === 12 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Diagnoses</h2>
            <div className="space-y-2">
              <Label>
                Have you ever received any of these diagnoses? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 gap-3">
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
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('diagnoses')?.includes(diagnosis) ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="checkbox"
                      id={`diagnosis-${index}`}
                      className="hidden"
                      checked={watch('diagnoses')?.includes(diagnosis) || false}
                      onChange={(e) => handleCheckboxChange('diagnoses', diagnosis, e.target.checked)}
                    />
                    <span className="ml-2">
                      {String.fromCharCode(65 + index)}. {diagnosis}
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
        {currentSegment === 13 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Weight Loss Surgery</h2>
            <div className="space-y-2">
              <Label>
                Have you had weight loss surgery in the last 18 months? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 gap-3">
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
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('weightLossSurgery')?.includes(surgery) ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="checkbox"
                      id={`surgery-${index}`}
                      className="hidden"
                      checked={watch('weightLossSurgery')?.includes(surgery) || false}
                      onChange={(e) => handleCheckboxChange('weightLossSurgery', surgery, e.target.checked)}
                    />
                    <span className="ml-2">
                      {String.fromCharCode(65 + index)}. {surgery}
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
        {currentSegment === 14 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Weight Related Conditions</h2>
            <div className="space-y-2">
              <Label>
                Have you ever been diagnosed with any of the following weight-related conditions? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 gap-3">
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
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('weightRelatedConditions')?.includes(condition) ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="checkbox"
                      id={`weightCondition-${index}`}
                      className="hidden"
                      checked={watch('weightRelatedConditions')?.includes(condition) || false}
                      onChange={(e) => handleCheckboxChange('weightRelatedConditions', condition, e.target.checked)}
                    />
                    <span className="ml-2">
                      {String.fromCharCode(65 + index)}. {condition}
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
        {currentSegment === 15 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Medications</h2>
            <div className="space-y-2">
              <Label>
                Are you taking any of these medications? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Insulin',
                  'Sulfonylureas',
                  'Opioid pain medication',
                  'None of the above'
                ].map((med, index) => (
                  <label
                    key={index}
                    htmlFor={`med-${index}`}
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('medications')?.includes(med) ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="checkbox"
                      id={`med-${index}`}
                      className="hidden"
                      checked={watch('medications')?.includes(med) || false}
                      onChange={(e) => handleCheckboxChange('medications', med, e.target.checked)}
                    />
                    <span className="ml-2">
                      {String.fromCharCode(65 + index)}. {med}
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
        {currentSegment === 16 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Kidney Health</h2>
            <div className="space-y-2">
              <Label>
                History of kidney disease or failure? Consulted a nephrologist? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {['Yes', 'No'].map((option, index) => (
                  <label
                    key={index}
                    htmlFor={`kidney${option}`}
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('kidneyDisease') === option.toLowerCase() ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="radio"
                      id={`kidney${option}`}
                      value={option.toLowerCase()}
                      className="hidden"
                      {...register('kidneyDisease')}
                    />
                    <span className="ml-2">{option}</span>
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
        {currentSegment === 17 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Past Weight Loss Medications</h2>
            <div className="space-y-2">
              <Label>
                Have you used any of these medications for weight loss? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 gap-3">
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
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('pastWeightLossMeds')?.includes(med) ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="checkbox"
                      id={`pastMed-${index}`}
                      className="hidden"
                      checked={watch('pastWeightLossMeds')?.includes(med) || false}
                      onChange={(e) => handleCheckboxChange('pastWeightLossMeds', med, e.target.checked)}
                    />
                    <span className="ml-2">
                      {String.fromCharCode(65 + index)}. {med}
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
        {currentSegment === 18 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Diets</h2>
            <div className="space-y-2">
              <Label>
                Have you tried any of these diets? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 gap-3">
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
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('diets')?.includes(diet) ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="checkbox"
                      id={`diet-${index}`}
                      className="hidden"
                      checked={watch('diets')?.includes(diet) || false}
                      onChange={(e) => handleCheckboxChange('diets', diet, e.target.checked)}
                    />
                    <span className="ml-2">
                      {String.fromCharCode(65 + index)}. {diet}
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
        {currentSegment === 19 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">GLP-1 History</h2>
            <div className="space-y-2">
              <Label>
                Have you taken GLP-1 medications in the past year? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 gap-3">
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
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('glp1PastYear')?.includes(med) ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="checkbox"
                      id={`glp1History-${index}`}
                      className="hidden"
                      checked={watch('glp1PastYear')?.includes(med) || false}
                      onChange={(e) => handleCheckboxChange('glp1PastYear', med, e.target.checked)}
                    />
                    <span className="ml-2">
                      {String.fromCharCode(65 + index)}. {med}
                    </span>
                  </label>
                ))}
              </div>
              {errors.glp1PastYear && (
                <p className="text-sm text-red-500">{errors.glp1PastYear.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Other Medical Info segment */}
        {currentSegment === 20 && (
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
        {currentSegment === 21 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Current Medications</h2>
            <div className="space-y-2">
              <Label htmlFor="currentMedications">
                What medications or supplements are you currently taking? List if yes, write None if no. <span className="text-red-500">*</span>
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
        {currentSegment === 22 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Surgical History</h2>
            <div className="space-y-2">
              <Label htmlFor="surgeries">
                Any prior significant surgeries or hospital stays? If YES, describe if NO, enter N/A. <span className="text-red-500">*</span>
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
        {currentSegment === 23 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Pregnancy Status</h2>
            <div className="space-y-2">
              <Label>
                Are you pregnant or planning to become pregnant in the near future? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {['Yes', 'No'].map((option, index) => (
                  <label
                    key={index}
                    htmlFor={`pregnant${option}`}
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('pregnant') === option.toLowerCase() ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="radio"
                      id={`pregnant${option}`}
                      value={option.toLowerCase()}
                      className="hidden"
                      {...register('pregnant')}
                    />
                    <span className="ml-2">{option}</span>
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
        {currentSegment === 24 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Breastfeeding</h2>
            <div className="space-y-2">
              <Label>
                Are you breastfeeding? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {['Yes', 'No'].map((option, index) => (
                  <label
                    key={index}
                    htmlFor={`breastfeeding${option}`}
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('breastfeeding') === option.toLowerCase() ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="radio"
                      id={`breastfeeding${option}`}
                      value={option.toLowerCase()}
                      className="hidden"
                      {...register('breastfeeding')}
                    />
                    <span className="ml-2">{option}</span>
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
        {currentSegment === 25 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Healthcare Provider</h2>
            <div className="space-y-2">
              <Label>
                Are you under the care of a healthcare provider? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {['Yes', 'No'].map((option, index) => (
                  <label
                    key={index}
                    htmlFor={`provider${option}`}
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('healthcareProvider') === option.toLowerCase() ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="radio"
                      id={`provider${option}`}
                      value={option.toLowerCase()}
                      className="hidden"
                      {...register('healthcareProvider')}
                    />
                    <span className="ml-2">{option}</span>
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
        {currentSegment === 26 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Eating Disorders</h2>
            <div className="space-y-2">
              <Label>
                Do you have a history of eating disorders? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {['Yes', 'No'].map((option, index) => (
                  <label
                    key={index}
                    htmlFor={`eating${option}`}
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('eatingDisorders') === option.toLowerCase() ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="radio"
                      id={`eating${option}`}
                      value={option.toLowerCase()}
                      className="hidden"
                      {...register('eatingDisorders')}
                    />
                    <span className="ml-2">{option}</span>
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
        {currentSegment === 27 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Lab Tests</h2>
            <div className="space-y-2">
              <Label>
                Have you had any labs done in the last year that includes Hgb A1c, kidney function (CMP/BMP), lipids, and thyroid studies? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {['Yes', 'No'].map((option, index) => (
                  <label
                    key={index}
                    htmlFor={`labs${option}`}
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('labs') === option.toLowerCase() ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="radio"
                      id={`labs${option}`}
                      value={option.toLowerCase()}
                      className="hidden"
                      {...register('labs')}
                    />
                    <span className="ml-2">{option}</span>
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
        {currentSegment === 28 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">GLP-1 Statement</h2>
            <div className="space-y-2">
              <Label>
                Please select the following statement that applies to you. <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue('glp1Statement', value)}
                defaultValue={watch('glp1Statement')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New to GLP-1 therapy">New to GLP-1 therapy</SelectItem>
                  <SelectItem value="Currently on Semaglutide, requesting dose increase">Currently on Semaglutide, requesting dose increase</SelectItem>
                  <SelectItem value="Currently on Semaglutide, keep my current dose">Currently on Semaglutide, keep my current dose</SelectItem>
                  <SelectItem value="Currently on Tirzepatide, requesting dose increase">Currently on Tirzepatide, requesting dose increase</SelectItem>
                  <SelectItem value="Currently on Tirzepatide, keep my current dose">Currently on Tirzepatide, keep my current dose</SelectItem>
                  <SelectItem value="On Semaglutide, requesting change to Tirzepatide">On Semaglutide, requesting change to Tirzepatide</SelectItem>
                  <SelectItem value="On Tirzepatide, requesting change to Semaglutide">On Tirzepatide, requesting change to Semaglutide</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.glp1Statement && (
                <p className="text-sm text-red-500">{errors.glp1Statement.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Terms Agreement segment */}
        {currentSegment === 29 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Terms Agreement</h2>
            <div className="space-y-2">
              <Label>
                I agree to only use Somi Health for GLP-1. <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {['Yes', 'No'].map((option, index) => (
                  <label
                    key={index}
                    htmlFor={`terms${option}`}
                    className={`flex items-center px-4 py-2 border text-secondary border-secondary bg-white rounded-full cursor-pointer hover:bg-secondary/90 hover:text-white transition-all duration-200 ${watch('agreeTerms') === option.toLowerCase() ? 'bg-secondary/95 text-white' : ''}`}
                  >
                    <input
                      type="radio"
                      id={`terms${option}`}
                      value={option.toLowerCase()}
                      className="hidden"
                      {...register('agreeTerms')}
                    />
                    <span className="ml-2">{option}</span>
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
        {currentSegment === 30 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Prescription Upload</h2>
            <div className="space-y-2">
              <Label>
                Please upload a clear photo of your GLP-1 prescription. If not applicable, Click ok <span className="text-red-500">*</span>
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
        {currentSegment === 31 && (
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
        {currentSegment === 32 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Questions/Comments for Provider</h2>
            <div className="space-y-2">
              <Label htmlFor="comments">
                Questions/Comments for Provider? If none <span className="text-red-500">*</span>
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
        {currentSegment === 33 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Telehealth Consent to Treatment and HIPAA Notice</h2>
            <div className="space-y-4 p-4 border rounded-lg">
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
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="consent-checkbox"
                      {...register('consent')}
                      className="h-4 w-4 text-secondary border-secondary rounded"
                    />
                    <label htmlFor="consent-checkbox" className="text-sm">
                      I have read the Somi Health telehealth consent form and HIPAA Privacy Notice at https://joinsomi.com/telehealth-consent/
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms-checkbox"
                      {...register('terms')}
                      className="h-4 w-4 text-secondary border-secondary rounded"
                    />
                    <label htmlFor="terms-checkbox" className="text-sm">
                      I have read the Somi Health Terms of Services at https://joinsomi.com/terrms-of-use/
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="treatment-checkbox"
                      {...register('treatment')}
                      className="h-4 w-4 text-secondary border-secondary rounded"
                    />
                    <label htmlFor="treatment-checkbox" className="text-sm">
                      I have read these forms, understand it, and voluntarily consent to treatment.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ineligible Alert Dialog */}
        <AlertDialog open={showIneligible} onOpenChange={setShowIneligible}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ineligibility Notice</AlertDialogTitle>
              <AlertDialogDescription>
                Based on your responses, you currently do not meet the criteria for GLP-1 medication.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push('/getstarted')}
                className="bg-secondary text-white hover:text-white hover:bg-secondary rounded-2xl"
              >
                Go Back
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        <div className="fixed bottom-0 left-0 right-0 py-4">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="flex justify-between">
              {currentSegment > 0 ? (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  type="button"
                  className="bg-secondary text-white hover:text-white hover:bg-secondary rounded-2xl"
                >
                  Previous
                </Button>
              ) : (
                <div></div>
              )}

              {currentSegment < segments.length - 1 ? (
                <Button
                  onClick={handleNext}
                  type="button"
                  className="bg-secondary text-white hover:bg-secondary rounded-2xl"
                >
                  Continue
                </Button>
              ) : currentSegment === segments.length - 1 ? (
                <Button
                  onClick={() => {
                    console.log('Final form data:', watch());
                    handleSubmit(onSubmit)();
                  }}
                  type="button"
                  className="bg-green-400 text-white hover:bg-green-500 rounded-2xl"
                >
                  OK
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}