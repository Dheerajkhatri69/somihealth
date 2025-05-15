import { connectionSrt } from "@/lib/db";
import { Patient } from "@/lib/model/patient";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// GET: Fetch all patients
export async function GET() {
    let data = [];
    let success = true;

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }
        data = await Patient.find().sort({ createTimeDate: -1 });
    } catch (error) {
        data = { result: "error", message: error.message };
        success = false;
    }

    return NextResponse.json({ result: data, success });
}

// POST: Create new patient
export async function POST(request) {
    let success = true;
    let result;

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        const body = await request.json();

        // Validate required field
        if (!body.authid) {
            throw new Error("authid is required");
        }

        // Create new patient with all form data
        const newPatient = new Patient({
            authid: body.authid,
            patientId: body.patientId,
            firstName: body.firstName,
            lastName: body.lastName,
            dob: body.dob,
            height: body.height,
            email: body.email,
            sex: body.sex,
            weight: body.weight,
            phone: body.phone,
            glp1: body.glp1,
            bmi: body.bmi,
            address1: body.address1,
            address2: body.address2,
            city: body.city,
            state: body.state,
            zip: body.zip,
            bloodPressure: body.bloodPressure,
            heartRate: body.heartRate,
            takingMedication: body.takingMedication,
            medicineAllergy: body.medicineAllergy,
            listAllMedication: body.listAllMedication,
            allergyList: body.allergyList,
            majorSurgeries: body.majorSurgeries,
            bariatricSurgery: body.bariatricSurgery,
            thyroidCancerHistory: body.thyroidCancerHistory,
            surgeryList: body.surgeryList,
            disqualifiers: body.disqualifiers,
            diagnosis: body.diagnosis,
            startingWeight: body.startingWeight,
            currentWeight: body.currentWeight,
            goalWeight: body.goalWeight,
            weightChange12m: body.weightChange12m,
            weightLossPrograms: body.weightLossPrograms,
            weightLossMeds12m: body.weightLossMeds12m,
            glpTaken: body.glpTaken,
            glpRecentInjection: body.glpRecentInjection,
            semaglutideLastDose: body.semaglutideLastDose,
            semaglutideRequestedDose: body.semaglutideRequestedDose,
            tirzepetideLastDose: body.tirzepetideLastDose,
            tirzepetideRequestedDose: body.tirzepetideRequestedDose,
            tirzepetidePlanPurchased: body.tirzepetidePlanPurchased,
            tirzepetideVial: body.tirzepetideVial,
            tirzepetideDosingSchedule: body.tirzepetideDosingSchedule,
            providerComments: body.providerComments,
            medicine: body.medicine,
            approvalStatus: body.approvalStatus,
            semaglutideDose: body.semaglutideDose,
            semaglutideUnit: body.semaglutideUnit,
            tirzepatideDose: body.tirzepatideDose,
            tirzepatideUnit: body.tirzepatideUnit,
            providerNote: body.providerNote,
            createTimeDate: new Date().toISOString(),
            closetickets: body.closetickets || false,
            Reasonclosetickets: body.Reasonclosetickets,
            images: body.images || [],
            file1: body.file1,
            file2: body.file2,
        });

        result = await newPatient.save();
    } catch (error) {
        result = {
            result: "error",
            message: error.message.includes("duplicate key")
                ? "Patient with this authid already exists"
                : error.message
        };
        success = false;
    }

    return NextResponse.json({ result, success });
}
// PUT: Update patient by authid
export async function PUT(request) {
    let success = true;
    let result;

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        const body = await request.json();

        if (!body.authid) {
            throw new Error("authid is required for update");
        }

        const updatedPatient = await Patient.findOneAndUpdate(
            { authid: body.authid },
            {
                $set: {
                    ...body,
                    createTimeDate: body.createTimeDate || new Date().toISOString(), // preserve or update time
                }
            },
            { new: true }
        );

        if (!updatedPatient) {
            throw new Error("Patient not found");
        }

        result = updatedPatient;
    } catch (error) {
        result = {
            result: "error",
            message: error.message
        };
        success = false;
    }

    return NextResponse.json({ result, success });
}

// DELETE: Permanently delete patients by authid array
export async function DELETE(request) {
    let success = true;
    let result;

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        const body = await request.json();

        if (!body.authids || !Array.isArray(body.authids)) {
            throw new Error("authids (array) are required for deletion");
        }

        const deleteResult = await Patient.deleteMany({
            authid: { $in: body.authids }
        });

        result = deleteResult;
    } catch (error) {
        result = {
            result: "error",
            message: error.message
        };
        success = false;
    }

    return NextResponse.json({ result, success });
}
