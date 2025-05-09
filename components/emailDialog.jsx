'use client'
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "@/components/ui/alert-dialog";
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import toast from "react-hot-toast";
import emailjs from "emailjs-com";

const preDefinedMessages = [
    {
        title: "Appointment Reminder",
        content: "Dear Patient,\n\nThis is a reminder about your upcoming appointment.\n\nBest regards,\nYour Healthcare Team"
    },
    {
        title: "Test Results",
        content: "Dear Patient,\n\nYour test results are now available. Please log in to your patient portal to view them.\n\nBest regards,\nYour Healthcare Team"
    },
    // Add more templates as needed
];

export const EmailDialog = ({ selectedPatients, selectedEmail }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedMessage, setSelectedMessage] = useState("");
    const [isSending, setIsSending] = useState(false);


    // Add your EmailJS credentials here
    const SERVICE_ID = "service_zice66h";
    const TEMPLATE_ID = "template_0eby6om";
    const PUBLIC_KEY = "811fNuzzHWaT8iM0o";

    const handleSendEmail = async (message) => {
        if (!selectedEmail || !message) {
            toast.error("Email and message are required.");
            return;
        }

        setIsSending(true);

        const templateParams = {
            to_email: selectedEmail,     // patient's email
            name: "Somi Health",         // or pass dynamic sender name
            time: new Date().toLocaleString(), // optional, for {{time}}
            message: selectedMessage,    // textarea message
            title: "Patient Communication", // or dynamic title
            email: "your-reply@email.com" // optional, shown in reply-to
        };


        try {
            const res = await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                templateParams,
                PUBLIC_KEY
            );
            console.log("Email sent:", res.status, res.text);
            toast.success("Email sent successfully!");
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Email sending error:", error);
            toast.error("Failed to send email.");
        } finally {
            setIsSending(false);
        }
    };


    return (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
                <Button disabled={!selectedPatients.length}>
                    Send Email
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Send Patient Email</AlertDialogTitle>
                    <AlertDialogDescription>
                        <Input value={selectedEmail} readOnly className="my-2" />

                        <Select
                            value={selectedTemplate}
                            onValueChange={(value) => {
                                const message = preDefinedMessages[value]?.content || '';
                                setSelectedTemplate(value);
                                setSelectedMessage(message);
                            }}
                        >
                            <SelectTrigger id="template" className="w-full">
                                <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                                {preDefinedMessages.map((message, index) => (
                                    <SelectItem key={index} value={String(index)}>
                                        {message.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <textarea
                            className="w-full mt-2 p-2 border rounded-md"
                            placeholder="Compose message..."
                            value={selectedMessage}
                            onChange={(e) => setSelectedMessage(e.target.value)}
                            rows={6}
                        />
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => handleSendEmail(selectedMessage)}
                        disabled={isSending}
                    >
                        {isSending ? "Sending..." : "Send"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};