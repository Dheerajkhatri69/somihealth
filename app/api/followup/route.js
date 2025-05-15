import { connectionSrt } from "@/lib/db";
import { FollowUp } from "@/lib/model/followup";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// GET: Fetch all follow-ups
export async function GET() {
    let data = [];
    let success = true;

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }
        data = await FollowUp.find().sort({ createTimeDate: -1 });
    } catch (error) {
        data = { result: "error", message: error.message };
        success = false;
    }

    return NextResponse.json({ result: data, success });
}

// POST: Create new follow-up
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

        // Create new follow-up with all form data
        const newFollowUp = new FollowUp({
            authid: body.authid,
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
            medicine: body.medicine,
            approvalStatus: body.approvalStatus,
            semaglutideDose: body.semaglutideDose,
            semaglutideUnit: body.semaglutideUnit,
            tirzepatideDose: body.tirzepatideDose,
            tirzepatideUnit: body.tirzepatideUnit,
            createTimeDate: new Date().toISOString(),
            closetickets: body.closetickets || false,
            Reasonclosetickets: body.Reasonclosetickets,
            images: body.images || [],
            file1: body.file1,
            file2: body.file2,
            // Follow-up specific fields
            followUpRefills: body.followUpRefills || false,
            needLabafter3RxFills: body.needLabafter3RxFills || false,
            initialAuthId: body.initialAuthId,
            glp1ApprovalLast6Months: body.glp1ApprovalLast6Months,
            currentWeight: body.currentWeight,
            currentGlp1Medication: body.currentGlp1Medication,
            anySideEffects: body.anySideEffects,
            listSideEffects: body.listSideEffects,
            happyWithMedication: body.happyWithMedication,
            switchMedication: body.switchMedication,
            continueDosage: body.continueDosage,
            increaseDosage: body.increaseDosage,
            patientStatement: body.patientStatement
        });

        result = await newFollowUp.save();
    } catch (error) {
        result = {
            result: "error",
            message: error.message.includes("duplicate key")
                ? "Follow-up with this authid already exists"
                : error.message
        };
        success = false;
    }

    return NextResponse.json({ result, success });
}

// PUT: Update follow-up by authid
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

        const updatedFollowUp = await FollowUp.findOneAndUpdate(
            { authid: body.authid },
            {
                $set: {
                    ...body,
                    createTimeDate: body.createTimeDate || new Date().toISOString(),
                }
            },
            { new: true }
        );

        if (!updatedFollowUp) {
            throw new Error("Follow-up not found");
        }

        result = updatedFollowUp;
    } catch (error) {
        result = {
            result: "error",
            message: error.message
        };
        success = false;
    }

    return NextResponse.json({ result, success });
}

// DELETE: Permanently delete follow-ups by authid array
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

        const deleteResult = await FollowUp.deleteMany({
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