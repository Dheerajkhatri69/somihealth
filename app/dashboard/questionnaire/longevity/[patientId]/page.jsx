"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import UploadFile from "@/components/FileUpload";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

export default function LongevityUpdateForm({ params }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({});

    // -------------------------------------------
    // Fetch questionnaire
    // -------------------------------------------
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/longevity-questionnaire/${params.patientId}`);
                const data = await res.json();

                if (data.success) {
                    setFormData(data.result);
                } else {
                    toast.error("Failed to load questionnaire");
                }
            } catch (err) {
                toast.error("Error fetching questionnaire");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.patientId]);

    // -------------------------------------------
    // Input Handlers
    // -------------------------------------------
    const handleChange = (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSelect = (name, value) =>
        setFormData((prev) => ({ ...prev, [name]: value }));

    const handleCheckboxChange = (name, checked) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    // -------------------------------------------
    // Submit Handler
    // -------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch(`/api/longevity-questionnaire/${params.patientId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Questionnaire updated!");
                router.push("/dashboard/questionnaire/longevity");
            } else {
                toast.error(data.message || "Failed to update");
            }
        } catch (err) {
            toast.error("Error submitting update");
        } finally {
            setSubmitting(false);
        }
    };

    // -------------------------------------------
    // Loading Skeleton
    // -------------------------------------------
    if (loading) {
        return (
            <div className="mb-4 p-4">
                <div className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">

                    {/* Basic Information Section Skeleton */}
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Address Section Skeleton */}
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#e0f2fe]">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Vitals Section Skeleton */}
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#fef9c3]">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Medical Information Section Skeleton */}
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#fce7f3]">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Weight Management Section Skeleton */}
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#ecfdf5]">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* GLP-1 Section Skeleton */}
                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#fef3c7]">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#f3e8ff]">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Submit Button Skeleton */}
                    <div className="flex justify-end space-x-4 mt-6">
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------
    // FORM RENDER
    // -------------------------------------------
    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">

            <h2 className="text-2xl font-bold">Longevity Questionnaire</h2>

            {/* ---------------- BASIC INFO ---------------- */}
            <section className="p-6 border rounded-xl bg-[#ede9f9] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label>Auth ID</Label>
                    <Input value={formData.authid} disabled className="bg-muted cursor-not-allowed" />
                </div>
                <div>
                    <Label>First Name</Label>
                    <Input name="firstName" value={formData.firstName || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>Last Name</Label>
                    <Input name="lastName" value={formData.lastName || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>Email</Label>
                    <Input type="email" name="email" value={formData.email || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>Phone</Label>
                    <Input name="phone" value={formData.phone || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>Sex</Label>
                    <Select value={formData.sex || ""} onValueChange={(v) => handleSelect("sex", v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Date of Birth</Label>
                    <Input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth?.split("T")[0] || ""}
                        onChange={handleChange}
                    />
                </div>
            </section>

            {/* ---------------- ADDRESS ---------------- */}
            <section className="p-6 border rounded-xl bg-[#e0f2fe] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label>Address</Label>
                    <Input name="address" value={formData.address || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>Address Line 2</Label>
                    <Input name="address2" value={formData.address2 || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>City</Label>
                    <Input name="city" value={formData.city || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>State</Label>
                    <Input name="state" value={formData.state || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>ZIP</Label>
                    <Input name="zip" value={formData.zip || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>Country</Label>
                    <Input name="country" value={formData.country || ""} onChange={handleChange} />
                </div>
            </section>

            {/* ---------------- TREATMENT SECTION ---------------- */}
            <section className="p-6 border rounded-xl bg-[#fef9c3] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label>Treatment Choose</Label>
                    <Input name="treatmentChoose" value={formData.treatmentChoose || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>Treatment Goal</Label>
                    <Input
                        name="treatmentGoal"
                        value={Array.isArray(formData.treatmentGoal) ? formData.treatmentGoal.join(", ") : formData.treatmentGoal || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                treatmentGoal: e.target.value.split(",").map((x) => x.trim()).filter(x => x),
                            }))
                        }
                        placeholder="Enter goals separated by commas"
                    />
                </div>
                <div>
                    <Label>Previous Treatment (yes/no)</Label>
                    <Select value={formData.previousTreatment || ""} onValueChange={(v) => handleSelect("previousTreatment", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Negative Reactions</Label>
                    <Select value={formData.negativeReactions || ""} onValueChange={(v) => handleSelect("negativeReactions", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="md:col-span-2">
                    <Label>If yes, describe</Label>
                    <Textarea name="lastSatisfiedStop" value={formData.lastSatisfiedStop || ""} onChange={handleChange} />
                </div>
            </section>

            {/* ---------------- HEALTH ---------------- */}
            <section className="p-6 border rounded-xl bg-[#fce7f3] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label>Clinician should know about your health?</Label>
                    <Select
                        value={formData.clinicianToKnowAboutYourHealth || ""}
                        onValueChange={(v) => handleSelect("clinicianToKnowAboutYourHealth", v)}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>If yes, describe</Label>
                    <Textarea
                        name="disclinicianToKnowAboutYourHealth"
                        value={formData.disclinicianToKnowAboutYourHealth || ""}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label>Cardiovascular Health (1–5)</Label>
                    <Input name="cardiovascularHealth" value={formData.cardiovascularHealth || ""} onChange={handleChange} />
                </div>

                <div>
                    <Label>Strength Level (1–5)</Label>
                    <Input name="strength" value={formData.strength || ""} onChange={handleChange} />
                </div>
            </section>

            {/* ---------------- VITALS ---------------- */}
            <section className="p-6 border rounded-xl bg-[#ecfdf5] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <Label>Height (Feet)</Label>
                    <Input name="heightFeet" value={formData.heightFeet || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>Height (Inches)</Label>
                    <Input name="heightInches" value={formData.heightInches || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>Current Weight</Label>
                    <Input name="currentWeight" value={formData.currentWeight || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>BMI</Label>
                    <Input name="bmi" value={formData.bmi || ""} onChange={handleChange} />
                </div>
            </section>

            {/* ---------------- ALLERGIES ---------------- */}
            <section className="p-6 border rounded-xl bg-[#fef3c7] shadow-sm space-y-6">
                <div>
                    <Label>Allergies (yes/no)</Label>
                    <Select
                        value={formData.allergies || ""}
                        onValueChange={(v) => handleSelect("allergies", v)}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>If yes, describe</Label>
                    <Textarea name="desAllergies" value={formData.desAllergies || ""} onChange={handleChange} />
                </div>
            </section>

            {/* ---------------- DIAGNOSES ---------------- */}
            <section className="p-6 border rounded-xl bg-[#f3e8ff] shadow-sm space-y-6">
                <div>
                    <Label>Diagnosed (yes/no)</Label>
                    <Select value={formData.diagnosed || ""} onValueChange={(v) => handleSelect("diagnosed", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>If yes, describe</Label>
                    <Textarea name="desDiagnosed" value={formData.desDiagnosed || ""} onChange={handleChange} />
                </div>

                <div>
                    <Label>Diagnoses (comma-separated)</Label>
                    <Textarea
                        name="diagnoses"
                        value={formData.diagnoses?.join(", ") || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                diagnoses: e.target.value.split(",").map((x) => x.trim()),
                            }))
                        }
                    />
                </div>
            </section>

            {/* ---------------- MEDICATIONS ---------------- */}
            <section className="p-6 border rounded-xl bg-[#e8fffc] shadow-sm space-y-6">
                <div>
                    <Label>Currently Taking Medications?</Label>
                    <Select
                        value={formData.currentlyTakingAnyMedications || ""}
                        onValueChange={(v) => handleSelect("currentlyTakingAnyMedications", v)}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>If yes, describe</Label>
                    <Textarea
                        name="desCurrentlyTakingAnyMedications"
                        value={formData.desCurrentlyTakingAnyMedications || ""}
                        onChange={handleChange}
                    />
                </div>
            </section>

            {/* ---------------- SURGERIES ---------------- */}
            <section className="p-6 border rounded-xl bg-[#efffe8] shadow-sm space-y-6">
                <div>
                    <Label>Surgeries or Hospitalization?</Label>
                    <Select
                        value={formData.surgeriesOrHospitalization || ""}
                        onValueChange={(v) => handleSelect("surgeriesOrHospitalization", v)}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>If yes, describe</Label>
                    <Textarea
                        name="desSurgeriesOrHospitalization"
                        value={formData.desSurgeriesOrHospitalization || ""}
                        onChange={handleChange}
                    />
                </div>
            </section>

            {/* ---------------- PREGNANCY ---------------- */}
            <section className="p-6 border rounded-xl bg-[#fff7e8] shadow-sm">
                <Label>Pregnant or Breastfeeding?</Label>
                <Select
                    value={formData.pregnantOrBreastfeeding || ""}
                    onValueChange={(v) => handleSelect("pregnantOrBreastfeeding", v)}
                >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                </Select>
            </section>

            {/* ---------------- HEALTHCARE PROVIDER ---------------- */}
            <section className="p-6 border rounded-xl bg-[#ffe8f6] shadow-sm">
                <Label>Healthcare Provider?</Label>
                <Select
                    value={formData.healthcareProvider || ""}
                    onValueChange={(v) => handleSelect("healthcareProvider", v)}
                >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                </Select>
            </section>

            {/* ---------------- ID PHOTO ---------------- */}
            <section className="p-6 border rounded-xl bg-white shadow-sm">
                <Label>ID Photo</Label>
                <UploadFile
                    file={formData.idPhoto}
                    onUploadComplete={(url) =>
                        setFormData((prev) => ({ ...prev, idPhoto: url }))
                    }
                    onDelete={() =>
                        setFormData((prev) => ({ ...prev, idPhoto: "" }))
                    }
                />
            </section>

            {/* ---------------- HEARD ABOUT ---------------- */}
            <section className="p-6 border rounded-xl bg-[#ffe8f8] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label>How did you hear about us?</Label>
                    <Select
                        value={formData.heardAbout || ""}
                        onValueChange={(v) => handleSelect("heardAbout", v)}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            <SelectItem value="Facebook">Facebook</SelectItem>
                            <SelectItem value="TikTok">TikTok</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {formData.heardAbout === "Other" && (
                    <div>
                        <Label>Other Source</Label>
                        <Input
                            name="heardAboutOther"
                            value={formData.heardAboutOther || ""}
                            onChange={handleChange}
                        />
                    </div>
                )}
            </section>

            {/* ---------------- FINAL CHECKBOXES ---------------- */}
            <section className="p-6 border rounded-xl bg-[#fcffe8] shadow-sm grid grid-cols-1 gap-6">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="consent"
                        checked={formData.consent || false}
                        onCheckedChange={(checked) => handleCheckboxChange('consent', checked)}
                    />
                    <Label htmlFor="consent" className="text-sm">
                        I consent to treatment and acknowledge the risks and benefits
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="terms"
                        checked={formData.terms || false}
                        onCheckedChange={(checked) => handleCheckboxChange('terms', checked)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                        I agree to the terms and conditions
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="treatment"
                        checked={formData.treatment || false}
                        onCheckedChange={(checked) => handleCheckboxChange('treatment', checked)}
                    />
                    <Label htmlFor="treatment" className="text-sm">
                        I understand the treatment plan and agree to follow it
                    </Label>
                </div>
            </section>

            {/* ---------------- SUBMIT BUTTON ---------------- */}
            <Button className="w-full bg-secondary text-white" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
            </Button>
        </form>
    );
}
