'use client'
import { useEffect, useState } from 'react';
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
import { useSession } from 'next-auth/react';

const preDefinedMessages = [
    {
        title: "Request a Call",
        content: `Hi {customerName},\n
I hope you're doing well. I would like to speak with you briefly to clarify some details and gather additional information regarding your GLP-1 weight loss treatment request.\n
Please let me know what time is convenient for a quick phone call. Additionally, if you prefer to discuss this via a video appointment, kindly share your availability so we can arrange a suitable time.\n
Thank you, and I look forward to your response.\n
Sincerely,\n
{providerName}\n
Txt: (704) 386-6871\n
Email: support@joinsomi.com\n 
joinsomi.com`
    },
    {
        title: "Approval Semaglutide",
        content: `Hi {customerName},\n
Good news! Your request for Semaglutide {DOSE} has been approved! We are happy that you have chosen Somi to support you on your weightloss journey.\n
As the next step, a member of the Somi team will be reaching out to you shortly to discuss the details and ensure you have all the information you need. We are here to support you every step of the way.\n
If you have any questions in the meantime, please do not hesitate to contact us.\n
Sincerely,\n
{providerName}\n
Txt: (704) 386-6871\n
Email: support@joinsomi.com\n 
joinsomi.com\n
https://joinsomi.com/wp-content/uploads/2022/11/Somi-GLP-1-Patient-Information-Handout.pdf
`
    },
    {
        title: "Approval Tirzepatide",
        content: `Hi {customerName},\n
Good news! Your request for Tirzepatide {DOSE} has been approved! We are happy that you have chosen Somi to support you on your weightloss journey.\n
As the next step, a member of the Somi team will be reaching out to you shortly to discuss the details and ensure you have all the information you need. We are here to support you every step of the way.\n
If you have any questions in the meantime, please do not hesitate to contact us.\n
Sincerely,\n
{providerName}\n
Txt: (704) 386-6871\n
Email: support@joinsomi.com\n
joinsomi.com\n
https://joinsomi.com/wp-content/uploads/2022/11/Somi-GLP-1-Patient-Information-Handout.pdf
`
    },
    {
        title: "Denial Based on Opioids",
        content: `Hi {customerName},\n
Due to your current use of {opioidName} which is an Opioid and has side effects such as slowed gastric motility which causes constipation. A side effect of GLP-1 is Slow gastric Motility. For these reasons, The use of GLP-1 is not advisable at this time, and does not currently meet the eligibility criteria for safe telehealth prescribing. Please follow up with your primary care provider or specialist for clearance for GLP-1 medication weight-loss management. A medical note is required for approval.\n
Sincerely,\n
{providerName}\n
Txt: (704) 386-6871\n
Email: support@joinsomi.com\n 
joinsomi.com`
    },
    {
        title: "Denial Based on BMI < 27",
        content: `Hi {customerName},\n
Thank you for completing your questionnaire for GLP-1 therapy. After a thorough review of your request by a medical provider, we regret to inform you that we are unable to approve coverage for the GLP-1 medication at this time, as your BMI is below the required threshold of 27 for eligibility.\n
We understand this may be disappointing, and we encourage you to discuss alternative options with your healthcare provider. If you have any questions or need further assistance, please do not hesitate to contact us.\n
Thank you for your understanding.\n
Sincerely,\n
{providerName}\n
Txt: (704) 386-6871\n
Email: support@joinsomi.com\n 
joinsomi.com`
    },
    {
        title: "Denial Based on No Comorbidity (BMI 27-29)",
        content: `Hi {customerName},\n
Thank you for your request. After a comprehensive review of your case, we regret to inform you that we are unable to approve coverage for the GLP-1 medication at this time. Our policy requires the presence of a qualifying comorbidity for coverage, and since no such condition has been documented in your case, and your BMI is within 27-29, the request does not meet the necessary criteria.\n

We recommend discussing alternative treatment options with your healthcare provider. If you have any questions or need further assistance, please feel free to contact us.\n

If you choose to request us to send you for labs to determine if you have one or more comorbidity required for approval for GLP-1 therapy, please text us at 704.386.6871\n


To qualify for GLP-1 medications through our telehealth service, you must have a BMI of above 27 and meet one of the following criteria:\n
• BMI of 27 or higher with at least one weight-related comorbid condition, such as:\n
o Sleep apnea\n
o PCOS\n
o Type 2 diabetes (not on insulin)\n
o Pre-diabetes\n
o High cholesterol/triglycerides\n
o Osteoarthritis\n
o Fatty liver disease\n
o High Blood Pressure\n
o Heart disease\n
OR\n
• BMI of 30 or greater with or without a weight-related comorbid condition.\n
OR\n
• Proof that you have taken a GLP-1 medication in the past 12 months.\n
If you believe you met these criteria or have additional medical information to support your eligibility, please let us know, and we'll be happy to review your case further.\n
Sincerely,\n
{providerName}\n
Txt: (704) 386-6871\n
Email: support@joinsomi.com\n
joinsomi.com`
    },
    {
        title: "Incomplete Medical History",
        content: `Hi {customerName},\n
This a request from a Somi provider for additional information or missing information on your GLP-1 request.\n
Please provide ALL medications, ALL Mental health diagnoses, ALL medical diagnoses and ALL past surgeries if applicable. It is very important to have accurate medical history. Failure to provide the requested information may result in denial.\n

Sincerely,\n
{providerName}\n
Txt: (704) 386-6871\n
Email: support@joinsomi.com\n
joinsomi.com`
    },
    {
        title: "Pending for Comorbidity",
        content: `Hi {customerName},\n
This a request from a Somi provider for additional information or missing information on your GLP-1 request.\n
Based on the information provided, your BMI is {BMI}, which does not currently meet the eligibility criteria for safe telehealth prescribing.\n
To qualify for GLP-1 medications through our telehealth service, you must meet one of the following criteria:\n
• BMI of 27 or higher with at least one weight-related comorbid condition, such as:\n
o Sleep apnea\n
o PCOS\n
o Type 2 diabetes (not on insulin)\n
o Pre-diabetes\n
o High cholesterol/triglycerides\n
o Osteoarthritis\n
o Fatty liver disease\n
o High Blood Pressure\n
o Heart disease\n
OR\n
• BMI of 30 or greater with or without a weight-related comorbid condition.\n
OR\n
• Proof that you have taken a GLP-1 medication in the past 12 months.\n
If you believe you met these criteria or have additional medical information to support your eligibility, please let us know, and we'll be happy to review your case further.\n
Sincerely,\n
{providerName}\n
Txt: (704) 386-6871\n
Email: support@joinsomi.com\n 
joinsomi.com`
    },
    {
        title: "Custom Communication",
        content: `Hi {customerName},\n
{message}\n

Sincerely,\n
{providerName}\n
Txt: (704) 386-6871\n
Email: support@joinsomi.com\n 
joinsomi.com`
    },
    {
        title: "Soft Denial Requiring Labs (BMI 27-29 w/o Comorbidity)",
        content: `Hi {customerName},\n
Thank you for your request. We are pleased to inform you that your BMI meets the requirement for GLP-1 therapy, as it is above 27. However, based on the information provided, we were unable to find documentation of the necessary comorbidity required for approval.\n

To proceed, you may consider undergoing additional labs or medical assessments to help determine if you have at least one qualifying comorbidity, such as type 2 diabetes, prediabetes, High cholesterol/triglycerides or other related conditions. Providing documentation of these conditions can support your case for approval. Your Somi healthcare provider can order the appropriate tests for you.\n
Once we have the results, we will review your request again to determine if you are a good candidate for GLP-1 therapy. If you have completed any lab within the 3-6 months, please feel free to provide us with a copy.\n
If you choose to request a Somi provider to send you for labs to determined for you have one or more comorbidity required for approval for GLP-1 therapy, please text us at \n
(704) 386-6871\n
Thank you for your understanding and cooperation.\n
Sincerely,\n
{providerName}\n
Txt: (704) 386-6871\n
Email: support@joinsomi.com\n 
joinsomi.com`
    }
];

export const EmailDialog = ({ selectedPatients, selectedEmail, selectedPatientData }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedMessage, setSelectedMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const { data: session } = useSession();
    useEffect(() => {
        if (selectedTemplate !== "" && selectedPatientData) {
            const message = preDefinedMessages[selectedTemplate]?.content || '';
            setSelectedMessage(formatMessage(message));
        }
    }, [selectedPatientData, selectedTemplate]);

    // Add your EmailJS credentials here
    const SERVICE_ID = "service_3p1q3ip";
    const TEMPLATE_ID = "template_33dgxbh";
    const PUBLIC_KEY = "JQNcCq1z7OUSglvd9";

    const formatMessage = (message) => {
        return message
            .replace(/{customerName}/g, selectedPatientData.firstName + " " + selectedPatientData.lastName)
            .replace(/{providerName}/g, session?.user?.fullname || "Somi Health Provider")
            .replace(/{DOSE}/g, selectedPatientData.medicine === "Semaglutide"
                ? selectedPatientData.semaglutideDose + "mg"
                : selectedPatientData.tirzepatideDose + "mg")
            .replace(/{opioidName}/g, selectedPatientData.medicineAllergy === "yes"
                ? selectedPatientData.allergyList || "the opioid medication"
                : "the opioid medication")
            .replace(/{BMI}/g, selectedPatientData.bmi || "")
            .replace(/{message}/g, selectedPatientData.providerNote || "");
    };

    const handleSendEmail = async (message) => {
        if (!selectedEmail || !message) {
            toast.error("Email and message are required.");
            return;
        }

        setIsSending(true);

        const formattedMessage = formatMessage(message);

        const templateParams = {
            to_email: `${selectedEmail}, dheerajkum838@gmail.com`,
            name: "Somi Health",
            time: new Date().toLocaleString(),
            message: formattedMessage,
            title: "Patient Communication",
            email: "your-reply@email.com"
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

            //creating email history
            await fetch("/api/emailhis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pid: selectedPatientData.authid,
                    pname: selectedPatientData.firstName + " " + selectedPatientData.lastName,
                    cid: session?.user?.id,
                    cname: session?.user?.fullname,
                    email: selectedEmail,
                    date: new Date().toISOString(),
                    message: formattedMessage
                }),
            });

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
                                setSelectedMessage(formatMessage(message));
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