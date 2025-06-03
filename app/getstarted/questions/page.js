'use client';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { BasicInformationSegment } from '@/components/segments/BasicInformationSegment';
import { AddressSegment } from '@/components/segments/AddressSegment';
import { VitalsSegment } from '@/components/segments/VitalsSegment';
import { MedicalHistorySegment } from '@/components/segments/MedicalHistorySegment';
import { DiagnosisSegment } from '@/components/segments/DiagnosisSegment';
import { WeightProgressSegment } from '@/components/segments/WeightProgressSegment';
import { WeightLossMedicationSegment } from '@/components/segments/WeightLossMedicationSegment';
import { GLP1Segment } from '@/components/segments/GLP1Segment';
import { SemaglutideSegment } from '@/components/segments/SemaglutideSegment';
import { TirzepatideSegment } from '@/components/segments/TirzepatideSegment';
import { TirzepatideDetailsSegment } from '@/components/segments/TirzepatideDetailsSegment';
import { CommentsSegment } from '@/components/segments/CommentsSegment';
import { MedicationSelectionSegment } from '@/components/segments/MedicationSelectionSegment';

const segments = [
    'Let start with the Basic Information',
    'Address',
    'Vitals',
    'Medical History',
    'Diagnosis',
    'Weight Progress',
    'Weight Loss Medication',
    'GLP-1',
    'Semaglutide',
    'Tirzepatide',
    'Tirzepatide Details',
    'Comments',
    'Medication Selection'
];

const QuestionForm = () => {
    const [currentSegment, setCurrentSegment] = useState(0);

    const randomNum = Math.floor(Math.random() * 100000);
    const [formData, setFormData] = useState({
        authid: `P${randomNum.toString().padStart(5, '0')}`,
        firstName: '',
        lastName: '',
        dob: '',
        height: '',
        email: '',
        sex: '',
        weight: '',
        phone: '',
        glp1: '',
        bmi: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        bloodPressure: '',
        heartRate: '',
        takingMedication: '',
        medicineAllergy: '',
        majorSurgeries: '',
        bariatricSurgery: '',
        thyroidCancerHistory: '',
        listAllMedication: '',
        allergyList: '',
        surgeryList: '',
        disqualifiers: '',
        diagnosis: '',
        startingWeight: '',
        currentWeight: '',
        goalWeight: '',
        weightChange12m: '',
        weightLossPrograms: '',
        weightLossMeds12m: '',
        glpTaken: '',
        glpRecentInjection: '',
        semaglutideLastDose: '',
        semaglutideRequestedDose: '',
        tirzepetideLastDose: '',
        tirzepetideRequestedDose: '',
        tirzepetidePlanPurchased: '',
        tirzepetideVial: '',
        tirzepetideDosingSchedule: '',
        providerComments: '',
        medicine: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextSegment = () => {
        if (currentSegment < segments.length - 1) {
            setCurrentSegment(currentSegment + 1);
        }
    };

    const prevSegment = () => {
        if (currentSegment > 0) {
            setCurrentSegment(currentSegment - 1);
        }
    };

    const progressValue = ((currentSegment + 1) / segments.length) * 100;

    const renderCurrentSegment = () => {
        switch (currentSegment) {
            case 0:
                return (
                    <BasicInformationSegment
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleSelectChange={handleSelectChange}
                    />
                );
            case 1:
                return <AddressSegment formData={formData} handleInputChange={handleInputChange} />;
            case 2:
                return <VitalsSegment formData={formData} handleInputChange={handleInputChange} />;
            case 3:
                return (
                    <MedicalHistorySegment
                        formData={formData}
                        handleSelectChange={handleSelectChange}
                        handleInputChange={handleInputChange}
                    />
                );
            case 4:
                return <DiagnosisSegment formData={formData} handleInputChange={handleInputChange} />;
            case 5:
                return <WeightProgressSegment formData={formData} handleInputChange={handleInputChange} />;
            case 6:
                return <WeightLossMedicationSegment formData={formData} handleInputChange={handleInputChange} />;
            case 7:
                return <GLP1Segment formData={formData} handleInputChange={handleInputChange} />;
            case 8:
                return <SemaglutideSegment formData={formData} handleInputChange={handleInputChange} />;
            case 9:
                return <TirzepatideSegment formData={formData} handleInputChange={handleInputChange} />;
            case 10:
                return (
                    <TirzepatideDetailsSegment
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleSelectChange={handleSelectChange}
                    />
                );
            case 11:
                return <CommentsSegment formData={formData} handleInputChange={handleInputChange} />;
            case 12:
                return <MedicationSelectionSegment formData={formData} handleSelectChange={handleSelectChange} />;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl flex flex-col min-h-screen">
            <div className="flex-grow">
                <h1 className="font-tagesschrift text-center text-6xl mb-2 text-secondary font-bold">somi</h1>
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">
                            {currentSegment + 1} of {segments.length} segments
                        </span>
                        <span className="text-sm font-medium">
                            {Math.round(progressValue)}% complete
                        </span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                </div>

                <div className="mb-8">
                    {renderCurrentSegment()}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-4 shadow-sm">
                <div className="container mx-auto max-w-6xl px-6">
                    <div className="flex justify-between">
                        <button
                            onClick={prevSegment}
                            disabled={currentSegment === 0}
                            className={`px-4 py-2 rounded-2xl ${currentSegment === 0 ? 'bg-gray-200 cursor-not-allowed' : 'bg-secondary text-white hover:bg-secondary'}`}
                        >
                            Previous
                        </button>

                        {currentSegment < segments.length - 1 ? (
                            <button
                                onClick={nextSegment}
                                className="px-4 py-2 bg-secondary rounded-2xl text-white hover:bg-secondary"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                onClick={() => console.log('Form submitted', formData)}
                                className="px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600"
                            >
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionForm;