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

    const handleSendEmail = async (message) => {
        console.log("Sending email to:", message);
        // if (!message.trim()) {
        //     toast.error("Please enter a message");
        //     return;
        // }

        // setIsSending(true);
        // try {
        //     const response = await fetch('/api/send-email', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //             to: selectedEmail, // Patient's email
        //             cc: 'recruitment@yourdomain.com', // Your recruitment email
        //             subject: 'Message from Your Healthcare Provider',
        //             text: message,
        //             html: `<p>${message.replace(/\n/g, '<br>')}</p>`, // Convert newlines to <br> for HTML email
        //         }),
        //     });

        //     const data = await response.json();

        //     if (data.success) {
        //         toast.success("Email sent successfully to patient and recruitment");
        //         setIsDialogOpen(false);
        //     } else {
        //         toast.error(data.message || "Failed to send email");
        //     }
        // } catch (error) {
        //     console.error("Error sending email:", error);
        //     toast.error("Failed to send email");
        // } finally {
        //     setIsSending(false);
        // }
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