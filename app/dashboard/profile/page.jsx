"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/* ui (your existing components) */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

/* icons */
import { Loader2, Mail, User, PencilLine, Shield, Save, X, KeyRound } from "lucide-react";

/* ---------- Schemas ---------- */
const profileSchema = z.object({
  fullname: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
  });

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [userType, setUserType] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullname: "", email: "" },
  });

  const pwForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  /* ---------- Guard: Admin only ---------- */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("usertype");
      setUserType(stored);
      if (stored && stored !== "A") {
        toast.error("Access denied. Admin privileges required.");
        router.replace("/dashboard");
      }
    }
  }, [router]);

  /* ---------- Fetch user ---------- */
  useEffect(() => {
    if (session?.user && userType === "A") {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, userType]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const json = await res.json();

      if (json.success && Array.isArray(json.result)) {
        const adminUser = json.result.find(
          (u) => u.accounttype === "A" && (u.id === session.user.id || u._id === session.user.id)
        );
        if (adminUser) {
          setUserData(adminUser);
          form.reset({
            fullname: adminUser.fullname ?? "",
            email: adminUser.email ?? "",
          });
        } else {
          toast.error("Admin user not found");
        }
      } else {
        toast.error("Failed to load user data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Helpers ---------- */
  const initials = useMemo(() => {
    const n = userData?.fullname || "";
    return n
      .split(" ")
      .filter(Boolean)
      .map((s) => s[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  }, [userData]);

  /* ---------- Submit: Profile (name/email) ---------- */
  const onSaveProfile = async (values) => {
    if (!userData) {
      toast.error("User data not available");
      return;
    }
    setSaving(true);
    try {
      const payload = { _id: userData._id, fullname: values.fullname, email: values.email };
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Profile updated successfully");
        if (typeof window !== "undefined" && json.result?.id) {
          localStorage.setItem("userid", json.result.id);
        }
        await fetchUserData();
        setEditMode(false);
      } else {
        toast.error(json.result?.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Submit: Password ---------- */
  const onSavePassword = async (values) => {
    if (!userData) {
      toast.error("User data not available");
      return;
    }
    if (values.currentPassword !== userData.password) {
      pwForm.setError("currentPassword", { message: "Current password is incorrect" });
      toast.error("Current password is incorrect");
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: userData._id, password: values.newPassword }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Password updated successfully");
        await fetchUserData();
        pwForm.reset();
        setShowPwForm(false);
      } else {
        toast.error(json.result?.message || "Failed to update password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update password");
    } finally {
      setPwSaving(false);
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="px-3 sm:px-4 lg:px-6 py-6 flex items-center justify-center min-h-[420px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading profile…</span>
        </div>
      </div>
    );
  }

  if (userType !== "A") {
    return (
      <div className="px-3 sm:px-4 lg:px-6 py-6 flex items-center justify-center min-h-[420px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            <CardDescription className="text-center">
              Admin privileges required to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="px-3 sm:px-4 lg:px-6 py-6 w-full max-w-5xl mx-auto overflow-x-hidden">
      <Card className="overflow-hidden">
        <CardHeader className="bg-secondary/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Avatar + name/email */}
            <div className="flex items-center gap-4 min-w-0">
              {/* Simple initials circle */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-white font-semibold">
                {initials || "AD"}
              </div>

              {/* Make this container shrinkable and allow truncation */}
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 min-w-0">
                  <span className="truncate">{userData?.fullname || "Admin User"}</span>
                  <Badge variant="secondary" className="shrink-0 gap-1 text-white py-1">
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                  </Badge>
                </CardTitle>

                <CardDescription className="mt-1 flex items-center gap-2 min-w-0">
                  <Mail className="h-4 w-4 shrink-0" />
                  {/* Email truncates on small screens */}
                  <span className="truncate max-w-[70vw] sm:max-w-xs md:max-w-sm lg:max-w-md">
                    {userData?.email || "—"}
                  </span>
                </CardDescription>
              </div>
            </div>

            {/* Right: Actions (wrap on small screens) */}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowPwForm((v) => !v)}
              >
                <KeyRound className="h-4 w-4" />
                {showPwForm ? "Cancel" : "Change Password"}
              </Button>

              <Button
                variant={editMode ? "secondary" : "default"}
                className="gap-2"
                onClick={() => setEditMode((v) => !v)}
                title={editMode ? "Cancel Edit" : "Edit Profile"}
              >
                <PencilLine className="h-4 w-4" />
                {editMode ? "Cancel" : "Edit"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {/* Password Form (inline, responsive) */}
          {showPwForm && (
            <div className="mb-6 border rounded-lg p-4 sm:p-5 bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <KeyRound className="h-5 w-5" /> Change Password
              </h3>

              <Form {...pwForm}>
                <form
                  onSubmit={pwForm.handleSubmit(onSavePassword)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={pwForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" className="w-full" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pwForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" className="w-full" placeholder="New password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pwForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" className="w-full" placeholder="Confirm new password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowPwForm(false)}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                    <Button type="submit" disabled={pwSaving} className="gap-2">
                      {pwSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" /> Save Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Profile info / Edit form */}
          {!editMode ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="rounded-2xl border bg-card p-4 sm:p-5">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-1">Full Name</div>
                  <div className="text-base sm:text-lg font-medium break-words">
                    {userData?.fullname || "—"}
                  </div>
                </div>
                <div className="rounded-2xl border bg-card p-4 sm:p-5">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-1">Email</div>
                  <div className="text-base sm:text-lg font-medium break-words">
                    {userData?.email || "—"}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="text-xs sm:text-sm text-muted-foreground">
                Tip: Use <span className="font-medium">Change Password</span> to update your password.
              </div>
            </>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSaveProfile)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="fullname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" /> Full Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" className="w-full" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Email
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email" className="w-full" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      form.reset({
                        fullname: userData?.fullname ?? "",
                        email: userData?.email ?? "",
                      });
                      setEditMode(false);
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="gap-2">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
