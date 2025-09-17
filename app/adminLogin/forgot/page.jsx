"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import emailjs from "emailjs-com";
import toast from "react-hot-toast";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Mail, Shield, KeyRound, CheckCircle2, Lock, Hash, Loader2, ArrowLeft } from "lucide-react";

// Reuse the existing EmailJS credentials as demonstrated in components/emailDialog.jsx
const SERVICE_ID = "service_zice66h";
const TEMPLATE_ID = "template_0eby6om";
const PUBLIC_KEY = "811fNuzzHWaT8iM0o";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email")
});

const otpSchema = z.object({
  otp: z.string().length(6, "Enter 6 digit OTP").regex(/^\d{6}$/g, "Enter 6 digits")
});

const resetSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm: z.string().min(6, "Please confirm your password"),
}).refine((v) => v.password === v.confirm, {
  message: "Passwords do not match",
  path: ["confirm"]
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [step, setStep] = useState("email"); // email | otp | reset | done
  const [loading, setLoading] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [sentOtp, setSentOtp] = useState("");
  const [newPasswordShownOnce, setNewPasswordShownOnce] = useState(false);
  const [adminIdHint, setAdminIdHint] = useState("");

  useEffect(() => {
    const id = params.get("id") || "";
    // Only accept admin-like hint (A followed by digits)
    if (/^A\d+$/.test(id)) {
      setAdminIdHint(id);
    }
  }, [params]);

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const resetForm = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleSendOtp = async (values) => {
    setLoading(true);
    try {
      // Find Admin by email
      const res = await fetch("/api/users");
      const json = await res.json();
      if (!json.success || !Array.isArray(json.result)) {
        toast.error("Failed to find account");
        return;
      }

      const admin = json.result.find((u) => u.accounttype === "A" && u.email?.toLowerCase() === values.email.toLowerCase());
      if (!admin) {
        toast.error("No admin account found for this email");
        return;
      }

      // If user gave an adminId hint, ensure it matches this admin (optional soft check)
      if (adminIdHint && admin.id !== adminIdHint) {
        toast.error("This email does not match the admin ID provided");
        return;
      }

      const otp = generateOtp();
      setSentOtp(otp);
      setTargetUser(admin);

      // Compose message for email
      const message = `Your Somi admin account OTP is ${otp}. It will expire in 10 minutes. If you did not request this, please ignore this email.`;
      const templateParams = {
        to_email: admin.email,
        name: "Somi Health",
        time: new Date().toLocaleString(),
        message,
        title: "Admin Password Reset OTP",
        email: "no-reply@joinsomi.com",
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (values) => {
    if (values.otp !== sentOtp) {
      otpForm.setError("otp", { message: "Incorrect OTP" });
      toast.error("Incorrect OTP");
      return;
    }
    setStep("reset");
  };

  const handleResetPassword = async (values) => {
    if (!targetUser) {
      toast.error("No user in context");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: targetUser._id, password: values.password }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Password updated");
        setStep("done");
        setNewPasswordShownOnce(true);
      } else {
        toast.error(json.result?.message || "Failed to update password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Card className="overflow-hidden">
          <CardHeader className="bg-secondary/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Admin Password Recovery
                </CardTitle>
                <CardDescription>Only admin accounts (IDs starting with A...)</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => router.push("/")} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            {step === "email" && (
              <div className="space-y-5">
                {adminIdHint && (
                  <div className="text-xs text-muted-foreground">Attempting recovery for Admin ID: <span className="font-medium">{adminIdHint}</span></div>
                )}
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Mail className="h-4 w-4" /> Admin Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading} className="gap-2">
                        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><KeyRound className="h-4 w-4" /> Send OTP</>}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-5">
                <div className="text-sm text-muted-foreground">We sent a 6‑digit OTP to <span className="font-medium">{targetUser?.email}</span>. Enter it below.</div>
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Hash className="h-4 w-4" /> One-Time Password</FormLabel>
                          <FormControl>
                            <Input inputMode="numeric" maxLength={6} placeholder="123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between gap-2">
                      <Button type="button" variant="ghost" onClick={() => setStep("email")}>Change email</Button>
                      <Button type="submit" className="gap-2">Verify OTP</Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {step === "reset" && (
              <div className="space-y-5">
                <div className="text-sm text-muted-foreground flex items-center gap-2"><Lock className="h-4 w-4" /> Set a new password for admin ID <span className="font-medium">{targetUser?.id}</span></div>
                <Form {...resetForm}>
                  <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                    <FormField
                      control={resetForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetForm.control}
                      name="confirm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading} className="gap-2">
                        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : <><CheckCircle2 className="h-4 w-4" /> Update Password</>}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {step === "done" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" /> Password updated successfully
                </div>
                <Separator />
                {newPasswordShownOnce && (
                  <div className="rounded-md border p-4 bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">Use these credentials to sign in:</div>
                    <div className="text-sm"><span className="font-medium">ID:</span> {targetUser?.id}</div>
                    <div className="text-sm"><span className="font-medium">New Password:</span> {resetForm.getValues("password")}</div>
                    <div className="text-xs text-muted-foreground mt-2">Note: This will be shown only once.</div>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button onClick={() => router.push("/")}>Go to Login</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


