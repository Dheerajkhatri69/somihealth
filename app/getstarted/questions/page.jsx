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
import { AlertDialog, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Form validation schema
const formSchema = z.object({
  // Age verification
  isOver18: z.enum(['yes', 'no'], {
    required_error: "You must be at least 18 years old to register",
  }),

  // Basic Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  height: z.string().min(1, "Height is required"),
  email: z.string().email("Invalid email address"),
  sex: z.string().min(1, "Sex is required"),
  weight: z.string().min(1, "Weight is required"),
  phone: z.string().min(1, "Phone number is required"),
  bmi: z.string().min(1, "BMI is required"),
  glp1: z.string().min(1, "GLP-1 Preference is required"),

  // Address
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip code is required"),

  // Vitals
  bloodPressure: z.string().min(1, "Blood pressure is required"),
  heartRate: z.string().min(1, "Heart rate is required"),

  // Medical History
  takingMedication: z.string().min(1, "This field is required"),
  medicineAllergy: z.string().min(1, "This field is required"),
  majorSurgeries: z.string().min(1, "This field is required"),
  bariatricSurgery: z.string().min(1, "This field is required"),
  thyroidCancerHistory: z.string().min(1, "This field is required"),
  listAllMedication: z.string().min(1, "This field is required"),
  allergyList: z.string().min(1, "This field is required"),
  surgeryList: z.string().min(1, "This field is required"),
  disqualifiers: z.string().min(1, "This field is required"),

  // Diagnosis
  diagnosis: z.string().min(1, "Diagnosis is required"),

  // Weight Progress
  startingWeight: z.string().min(1, "This field is required"),
  currentWeight: z.string().min(1, "This field is required"),
  goalWeight: z.string().min(1, "This field is required"),
  weightChange12m: z.string().min(1, "This field is required"),
  weightLossPrograms: z.string().min(1, "This field is required"),

  // Weight Loss Medication
  weightLossMeds12m: z.string().min(1, "This field is required"),

  // GLP-1
  glpTaken: z.string().min(1, "This field is required"),
  glpRecentInjection: z.string().min(1, "This field is required"),

  // Semaglutide
  semaglutideLastDose: z.string().min(1, "This field is required"),
  semaglutideRequestedDose: z.string().min(1, "This field is required"),

  // Tirzepatide
  tirzepetideLastDose: z.string().min(1, "This field is required"),
  tirzepetideRequestedDose: z.string().min(1, "This field is required"),
  tirzepetidePlanPurchased: z.string().min(1, "This field is required"),
  tirzepetideVial: z.string().min(1, "This field is required"),
  tirzepetideDosingSchedule: z.string().min(1, "This field is required"),

  // Comments
  providerComments: z.string().min(1, "This field is required"),

  // Medication Selection
  medicine: z.string().min(1, "This field is required"),
});

const segments = [
  { id: 'age', name: 'Age Verification' },
  { id: 'basic', name: 'Basic Information' },
  { id: 'address', name: 'Address' },
  { id: 'vitals', name: 'Vitals' },
  { id: 'medical', name: 'Medical History' },
  { id: 'diagnosis', name: 'Diagnosis' },
  { id: 'weight', name: 'Weight Progress' },
  { id: 'medication', name: 'Weight Loss Medication' },
  { id: 'glp1', name: 'GLP-1' },
  { id: 'semaglutide', name: 'Semaglutide' },
  { id: 'tirzepatide', name: 'Tirzepatide' },
  { id: 'comments', name: 'Comments' },
  { id: 'final', name: 'Review & Submit' },
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
        setShowAgeAlert(true);
        return;
      }
      setShowAgeAlert(false);
      setCurrentSegment(currentSegment + 1);
      return;
    }

    const segmentFields = getSegmentFields(segments[currentSegment].id);
    const isValid = await trigger(segmentFields);

    if (isValid && currentSegment < segments.length - 1) {
      setCurrentSegment(currentSegment + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSegment > 0) {
      setCurrentSegment(currentSegment - 1);
    }
  };
  // const { toast } = useToaster();
  const router = useRouter();
  const onSubmit = async (data) => {
    // Add authid
    const randomNum = Math.floor(Math.random() * 100000);
    const submissionData = {
      ...data,
      authid: `P${randomNum.toString().padStart(5, '0')}`,
      questionnaire: true,
    };

    try {
      const patientResponse = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!patientResponse.ok) {
        throw new Error('Failed to submit patient data');
      }

      const patientData = await patientResponse.json();

      // Show success alert using shadcn
      toast.success(`Patient registered! Auth ID: ${submissionData.authid}`);
      console.log('Patient registered:', patientData);
      // Redirect after a short delay (e.g., 1.5 seconds)
      setTimeout(() => {
        router.push('/getstarted');
      }, 1500);

    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    }
  };


  const getSegmentFields = (segmentId) => {
    switch (segmentId) {
      case 'age': return ['isOver18'];
      case 'basic': return ['firstName', 'lastName', 'dob', 'height', 'email', 'sex', 'weight', 'phone', 'bmi', 'glp1'];
      case 'address': return ['address1', 'city', 'state', 'zip'];
      case 'vitals': return ['bloodPressure', 'heartRate'];
      case 'medical': return ['takingMedication', 'medicineAllergy', 'majorSurgeries', 'bariatricSurgery',
        'thyroidCancerHistory', 'listAllMedication', 'allergyList', 'surgeryList', 'disqualifiers'];
      case 'diagnosis': return ['diagnosis'];
      case 'weight': return ['startingWeight', 'currentWeight', 'goalWeight', 'weightChange12m', 'weightLossPrograms'];
      case 'medication': return ['weightLossMeds12m'];
      case 'glp1': return ['glpTaken', 'glpRecentInjection'];
      case 'semaglutide': return ['semaglutideLastDose', 'semaglutideRequestedDose'];
      case 'tirzepatide': return ['tirzepetideLastDose', 'tirzepetideRequestedDose', 'tirzepetidePlanPurchased',
        'tirzepetideVial', 'tirzepetideDosingSchedule'];
      case 'comments': return ['providerComments'];
      case 'final': return ['medicine'];
      default: return [];
    }
  };

  // Calculate form completion progress
  const formValues = watch();
  const totalFields = Object.keys(formSchema.shape).length;
  const completedFields = Object.keys(formValues).filter(
    (key) => formValues[key] && !errors[key]
  ).length;
  const progress = Math.round((completedFields / totalFields) * 100);

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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6 bg-white rounded-xl border border-gray-200 shadow-secondary shadow-2xl">
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

        {/* Basic information segment */}
        {currentSegment === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="sex">
                  Sex <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => setValue('sex', value)}
                  defaultValue={watch('sex')}
                >
                  <SelectTrigger id="sex" className="w-full">
                    <SelectValue placeholder="Select gender" />
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">
                  Height <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="height"
                  {...register('height')}
                  placeholder="e.g. 5'9&quot;"
                />
                {errors.height && (
                  <p className="text-sm text-red-500">{errors.height.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">
                  Weight (lbs) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="weight"
                  {...register('weight')}
                  placeholder="e.g. 214"
                />
                {errors.weight && (
                  <p className="text-sm text-red-500">{errors.weight.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bmi">
                  BMI <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bmi"
                  {...register('bmi')}
                  placeholder="e.g. 32"
                />
                {errors.bmi && (
                  <p className="text-sm text-red-500">{errors.bmi.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="example@mail.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+1 555 123 4567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="glp1">
                GLP-1 Preference <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue('glp1', value)}
                defaultValue={watch('glp1')}
              >
                <SelectTrigger id="glp1" className="w-full">
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
                  <SelectItem value="Semaglutide">Semaglutide</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                </SelectContent>
              </Select>
              {errors.glp1 && (
                <p className="text-sm text-red-500">{errors.glp1.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Address segment */}
        {currentSegment === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Address</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address1">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address1"
                  {...register('address1')}
                  placeholder="Street address"
                />
                {errors.address1 && (
                  <p className="text-sm text-red-500">{errors.address1.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address2">
                  Address line 2
                </Label>
                <Input
                  id="address2"
                  {...register('address2')}
                  placeholder="Apartment, suite, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City/Town <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="e.g. Springfield"
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="e.g. California"
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">
                  Zip code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="zip"
                  {...register('zip')}
                  placeholder="e.g. 12345"
                />
                {errors.zip && (
                  <p className="text-sm text-red-500">{errors.zip.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vitals segment */}
        {currentSegment === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Vitals</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodPressure">
                  Blood Pressure <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bloodPressure"
                  {...register('bloodPressure')}
                  placeholder="e.g. 120/80"
                />
                {errors.bloodPressure && (
                  <p className="text-sm text-red-500">{errors.bloodPressure.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="heartRate">
                  Heart Rate <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="heartRate"
                  {...register('heartRate')}
                  placeholder="e.g. 72 bpm"
                />
                {errors.heartRate && (
                  <p className="text-sm text-red-500">{errors.heartRate.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Medical History segment */}
        {currentSegment === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Medical History</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['takingMedication', 'medicineAllergy', 'majorSurgeries', 'bariatricSurgery', 'thyroidCancerHistory'].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>
                    {field === 'takingMedication' ? 'Taking Medication' :
                      field === 'medicineAllergy' ? 'Medicine Allergy' :
                        field === 'majorSurgeries' ? 'Major Surgeries' :
                          field === 'bariatricSurgery' ? 'Bariatric Surgery (last 18 months)' :
                            'Family History of Thyroid Cancer'} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue(field, value)}
                  >
                    <SelectTrigger id={field} className="w-full">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors[field] && (
                    <p className="text-sm text-red-500">{errors[field]?.message}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="listAllMedication">
                List All Medication <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="listAllMedication"
                {...register('listAllMedication')}
                placeholder="List known medication..."
              />
              {errors.listAllMedication && (
                <p className="text-sm text-red-500">{errors.listAllMedication.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergyList">
                Allergy List <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="allergyList"
                {...register('allergyList')}
                placeholder="List known allergies..."
              />
              {errors.allergyList && (
                <p className="text-sm text-red-500">{errors.allergyList.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="surgeryList">
                Surgery List <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="surgeryList"
                {...register('surgeryList')}
                placeholder="List of major surgeries..."
              />
              {errors.surgeryList && (
                <p className="text-sm text-red-500">{errors.surgeryList.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="disqualifiers">
                Disqualifiers <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="disqualifiers"
                {...register('disqualifiers')}
                placeholder="Mention any disqualifiers..."
              />
              {errors.disqualifiers && (
                <p className="text-sm text-red-500">{errors.disqualifiers.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Diagnosis segment */}
        {currentSegment === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Diagnosis</h2>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">
                Diagnosis <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="diagnosis"
                {...register('diagnosis')}
                placeholder="Enter patient diagnosis, symptoms, or relevant notes..."
                rows={6}
              />
              {errors.diagnosis && (
                <p className="text-sm text-red-500">{errors.diagnosis.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Weight Progress segment */}
        {currentSegment === 6 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Weight Progress</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['startingWeight', 'currentWeight', 'goalWeight', 'weightChange12m'].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>
                    {field === 'startingWeight' ? 'Starting Weight (lbs)' :
                      field === 'currentWeight' ? 'Current Weight (lbs)' :
                        field === 'goalWeight' ? 'Goal Weight (lbs)' :
                          '12-Month Weight Change (lbs)'} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={field}
                    {...register(field)}
                    placeholder={
                      field === 'startingWeight' ? 'e.g. 240' :
                        field === 'currentWeight' ? 'e.g. 214' :
                          field === 'goalWeight' ? 'e.g. 180' : 'e.g. -26, +10, etc.'
                    }
                  />
                  {errors[field] && (
                    <p className="text-sm text-red-500">{errors[field]?.message}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightLossPrograms">
                Weight Loss Programs <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="weightLossPrograms"
                {...register('weightLossPrograms')}
                placeholder="List any previous or current weight loss programs..."
              />
              {errors.weightLossPrograms && (
                <p className="text-sm text-red-500">{errors.weightLossPrograms.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Weight Loss Medication segment */}
        {currentSegment === 7 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Weight Loss Medication (Last 12 Months)</h2>

            <div className="space-y-2">
              <Label htmlFor="weightLossMeds12m">
                Medication List <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="weightLossMeds12m"
                {...register('weightLossMeds12m')}
                placeholder="List any weight loss medications taken in the past 12 months..."
                rows={6}
              />
              {errors.weightLossMeds12m && (
                <p className="text-sm text-red-500">{errors.weightLossMeds12m.message}</p>
              )}
            </div>
          </div>
        )}

        {/* GLP-1 segment */}
        {currentSegment === 8 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">GLP-1</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="glpTaken">
                  GLP-1 Taken <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="glpTaken"
                  {...register('glpTaken')}
                  placeholder="Enter value"
                />
                {errors.glpTaken && (
                  <p className="text-sm text-red-500">{errors.glpTaken.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="glpRecentInjection">
                  Date of last Injection <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  id="glpRecentInjection"
                  {...register('glpRecentInjection')}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
                {errors.glpRecentInjection && (
                  <p className="text-sm text-red-500">{errors.glpRecentInjection.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Semaglutide segment */}
        {currentSegment === 9 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Semaglutide</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['semaglutideLastDose', 'semaglutideRequestedDose'].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>
                    {field === 'semaglutideLastDose' ? 'Last Dose' : 'Requested Dose'} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={field}
                    {...register(field)}
                    placeholder="Enter dose"
                  />
                  {errors[field] && (
                    <p className="text-sm text-red-500">
                      {errors[field]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tirzepatide segment */}
        {currentSegment === 10 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Tirzepatide</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['tirzepetideLastDose', 'tirzepetideRequestedDose'].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>
                    {field === 'tirzepetideLastDose' ? 'Last Dose' : 'Requested Dose'} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={field}
                    {...register(field)}
                    placeholder="Enter dose"
                  />
                  {errors[field] && (
                    <p className="text-sm text-red-500">
                      {errors[field]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tirzepetidePlanPurchased">
                  Plan Purchased <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tirzepetidePlanPurchased"
                  {...register('tirzepetidePlanPurchased')}
                  placeholder="Enter plan"
                />
                {errors.tirzepetidePlanPurchased && (
                  <p className="text-sm text-red-500">{errors.tirzepetidePlanPurchased.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tirzepetideVial">
                  Vial <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tirzepetideVial"
                  {...register('tirzepetideVial')}
                  placeholder="Enter vial"
                />
                {errors.tirzepetideVial && (
                  <p className="text-sm text-red-500">{errors.tirzepetideVial.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tirzepetideDosingSchedule">
                  Dosing Schedule <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => setValue('tirzepetideDosingSchedule', value)}
                >
                  <SelectTrigger id="tirzepetideDosingSchedule" className="w-full">
                    <SelectValue placeholder="Select dosing schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tirzepetideDosingSchedule && (
                  <p className="text-sm text-red-500">{errors.tirzepetideDosingSchedule.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Comments segment */}
        {currentSegment === 11 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Questions and Comments</h2>

            <div className="space-y-2">
              <Label htmlFor="providerComments">
                Enter your questions and comments <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="providerComments"
                {...register('providerComments')}
                placeholder="Write your questions or comments here..."
                rows={6}
              />
              {errors.providerComments && (
                <p className="text-sm text-red-500">{errors.providerComments.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Final segment - Review and Submit */}
        {currentSegment === 12 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Review and Submit</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicine">
                  Medication Selection <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => setValue('medicine', value)}
                >
                  <SelectTrigger id="medicine" className="w-full">
                    <SelectValue placeholder="Select medication" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semaglutide">Semaglutide</SelectItem>
                    <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
                    <SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
                {errors.medicine && (
                  <p className="text-sm text-red-500">{errors.medicine.message}</p>
                )}
              </div>

              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2">Please review all your information before submitting</h3>
                <p className="text-sm text-muted-foreground">
                  All fields are required. Make sure all information is accurate before submitting.
                </p>
              </div>
            </div>
          </div>
        )}

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
              ) : (
                <Button
                  type="submit"
                  className="bg-green-400 text-white hover:bg-green-500 rounded-2xl"
                >
                  Submit
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}