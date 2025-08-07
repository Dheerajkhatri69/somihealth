"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const Schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(1, "Required"),
  interestedIn: z.string().min(1, "Required"),
  comments: z.string().max(600, "Max 600 characters").optional(),
});

export default function ContactFormShadcn() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const form = useForm({
    resolver: zodResolver(Schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      interestedIn: "Medical Weight Loss",
      comments: "",
    },
  });

  const charCount = form.watch("comments")?.length ?? 0;

  async function onSubmit(values) {
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus({ ok: true, msg: "Thanks! We’ll get back to you shortly." });
      form.reset();
    } catch {
      setStatus({ ok: false, msg: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-semibold text-slate-900">Contact Us Form</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-4">
          {/* Name (First / Last) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="First" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="invisible">Last</FormLabel>
                  <FormControl>
                    <Input placeholder="Last" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email / Phone */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(704) 386-6871" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Interested In (select) */}
          <FormField
            control={form.control}
            name="interestedIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  I am interested in: <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Medical Weight Loss">Medical Weight Loss</SelectItem>
                    <SelectItem value="Hormone Therapy">Hormone Therapy</SelectItem>
                    <SelectItem value="General Question">General Question</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Comments */}
          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comments</FormLabel>
                <p className="text-sm text-slate-500">
                  Please let us know what’s on your mind. Have a question for us? Ask away.
                </p>
                <FormControl>
                  <Textarea
                    rows={6}
                    maxLength={600}
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <div className="text-xs text-slate-500">{charCount} of 600 max characters</div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button type="submit" disabled={submitting} className="mt-2 inline-flex items-center gap-2">
            <Send className="h-4 w-4" />
            {submitting ? "Sending…" : "Send message"}
          </Button>

          {status && (
            <p className={`text-sm ${status.ok ? "text-emerald-600" : "text-red-600"}`}>
              {status.msg}
            </p>
          )}
        </form>
      </Form>
    </div>
  );
}
