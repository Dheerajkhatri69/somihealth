import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Patient } from "@/lib/model/patient";
// import Patient from "@/models/patient";

const connectionSrt = process.env.MONGODB_URI;

export async function GET(request, { params }) {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        const patient = await Patient.findOne({ authid: params.authid });
        
        if (!patient) {
            return NextResponse.json(
                { success: false, error: "Patient not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            patient: {
                authid: patient.authid,
                firstName: patient.firstName,
                lastName: patient.lastName,
                dob: patient.dob,
                height: patient.height,
                email: patient.email,
                sex: patient.sex,
                weight: patient.weight,
                phone: patient.phone,
                glp1: patient.glp1,
                bmi: patient.bmi,
                address1: patient.address1,
                address2: patient.address2,
                city: patient.city,
                state: patient.state,
                zip: patient.zip,
                medicine: patient.medicine,
                approvalStatus: patient.approvalStatus,
                semaglutideDose: patient.semaglutideDose,
                semaglutideUnit: patient.semaglutideUnit,
                tirzepatideDose: patient.tirzepatideDose,
                tirzepatideUnit: patient.tirzepatideUnit,
                createTimeDate: patient.createTimeDate,
                images: patient.images,
            }
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}