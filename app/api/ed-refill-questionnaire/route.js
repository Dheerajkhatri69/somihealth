import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import EDRefillQuestionnaire from '@/lib/model/edRefillQuestionnaire';

// POST - Create new ED refill questionnaire
export async function POST(req) {
    let body;
    try {
        await connectMongoDB();
        body = await req.json();
        const { authid, userSessionId } = body;

        if (!authid) {
            return NextResponse.json({ message: "authid is required." }, { status: 400 });
        }

        // Create a regex to find the base authid and any suffixed versions
        const baseAuthId = authid.split('-')[0];
        const authIdRegex = new RegExp(`^${baseAuthId}(-\\d+)?$`);

        // Count existing documents with the same base authid
        const count = await EDRefillQuestionnaire.countDocuments({ authid: authIdRegex });

        let newAuthId = authid;
        if (count > 0) {
            newAuthId = `${baseAuthId}-${count}`;
        }

        const submissionData = {
            ...body,
            authid: newAuthId,
            questionnaire: true,
            createTimeDate: new Date(),
        };

        // Save the questionnaire
        await EDRefillQuestionnaire.create(submissionData);

        // Update abandonment record to "completed" state if userSessionId exists
        if (userSessionId) {
            try {
                await fetch(`${req.headers.get('origin')}/api/ed-refill-abandonment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userSessionId,
                        state: 2, // Completed
                        authid: newAuthId,
                        completedAt: new Date(),
                        question: "Form Submitted Successfully",
                    }),
                });
            } catch (abandonmentError) {
                console.error("Failed to update abandonment record:", abandonmentError);
                // Don't fail the main request if abandonment update fails
            }
        }

        return NextResponse.json({
            message: "ED refill questionnaire submitted successfully.",
            authid: newAuthId,
            success: true
        }, { status: 201 });
    } catch (error) {
        console.error("Error submitting ED refill questionnaire: ", error);

        // Try to update abandonment record to "failed" state
        if (body && body.userSessionId) {
            try {
                await fetch(`${req.headers.get('origin')}/api/ed-refill-abandonment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userSessionId: body.userSessionId,
                        state: 1, // Abandoned (failed submission)
                        question: "Form submission failed",
                        timestamp: new Date(),
                    }),
                });
            } catch (abandonmentError) {
                // Silent fail
            }
        }

        return NextResponse.json({
            message: "An error occurred while submitting the form.",
            success: false
        }, { status: 500 });
    }
}

// GET - Fetch all ED refill questionnaires
export async function GET(req) {
    try {
        await connectMongoDB();

        // Check if there's a query parameter for specific authid
        const { searchParams } = new URL(req.url);
        const authid = searchParams.get('authid');

        let questionnaires;
        if (authid) {
            // Fetch by specific authid
            questionnaires = await EDRefillQuestionnaire.find({ authid });
        } else {
            // Fetch all, sorted by latest
            questionnaires = await EDRefillQuestionnaire.find().sort({ createdAt: -1 });
        }

        return NextResponse.json({
            success: true,
            result: questionnaires,
            count: questionnaires.length
        });
    } catch (error) {
        console.error("Error fetching ED refill questionnaires: ", error);
        return NextResponse.json({
            success: false,
            message: "An error occurred while fetching questionnaires."
        }, { status: 500 });
    }
}

// DELETE - Delete specific questionnaires by either ids or authids
export async function DELETE(req) {
    try {
        await connectMongoDB();
        const { ids, authids } = await req.json(); // Accept both

        if ((!ids || !Array.isArray(ids) || ids.length === 0) &&
            (!authids || !Array.isArray(authids) || authids.length === 0)) {
            return NextResponse.json({
                success: false,
                message: "Either ids or authids are required for deletion."
            }, { status: 400 });
        }

        let result;
        let query;

        // If authids are provided, delete by authid
        if (authids && authids.length > 0) {
            query = { authid: { $in: authids } };
        } else {
            // Otherwise delete by MongoDB _id
            query = { _id: { $in: ids } };
        }

        result = await EDRefillQuestionnaire.deleteMany(query);

        if (result.deletedCount === 0) {
            return NextResponse.json({
                success: false,
                message: "No matching questionnaires found to delete."
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: `${result.deletedCount} questionnaire(s) deleted successfully.`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Error deleting ED refill questionnaires: ", error);
        return NextResponse.json({
            success: false,
            message: "An error occurred while deleting questionnaires."
        }, { status: 500 });
    }
}

// PUT - Update ED refill questionnaire
export async function PUT(req) {
    try {
        await connectMongoDB();
        const body = await req.json();
        const { id, authid, updates } = body; // Add authid support

        if (!id && !authid) {
            return NextResponse.json({
                success: false,
                message: "ID or authid is required."
            }, { status: 400 });
        }

        let updatedQuestionnaire;

        // If authid is provided, find by authid
        if (authid) {
            updatedQuestionnaire = await EDRefillQuestionnaire.findOneAndUpdate(
                { authid: authid },
                { ...updates, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
        } else {
            // Otherwise use id (MongoDB _id)
            updatedQuestionnaire = await EDRefillQuestionnaire.findByIdAndUpdate(
                id,
                { ...updates, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
        }

        if (!updatedQuestionnaire) {
            return NextResponse.json({
                success: false,
                message: "Questionnaire not found."
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Questionnaire updated successfully.",
            result: updatedQuestionnaire
        });
    } catch (error) {
        console.error("Error updating ED refill questionnaire: ", error);
        return NextResponse.json({
            success: false,
            message: "An error occurred while updating the questionnaire."
        }, { status: 500 });
    }
}

