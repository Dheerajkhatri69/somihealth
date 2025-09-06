"use client";

import { useState, useEffect } from "react";
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

export default function ContactFormShadcn({ settings = null }) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [formSettings, setFormSettings] = useState(settings);

  // Fetch settings if not provided
  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/contact-form-settings');
      const data = await res.json();
      if (data.success) {
        setFormSettings(data.result);
      }
    } catch (error) {
      console.error('Error fetching form settings:', error);
    }
  };

  // Create dynamic schema based on settings
  const createSchema = () => {
    const baseSchema = {
      firstName: z.string().min(1, "Required"),
      email: z.string().email("Enter a valid email"),
      phone: z.string().min(1, "Required"),
      interestedIn: z.string().min(1, "Required"),
    };

    if (formSettings?.config?.requireLastName) {
      baseSchema.lastName = z.string().min(1, "Required");
    } else {
      baseSchema.lastName = z.string().optional();
    }

    if (formSettings?.config?.requireComments) {
      baseSchema.comments = z.string().min(1, "Required");
    } else {
      baseSchema.comments = z.string().max(formSettings?.fields?.comments?.maxLength || 600, `Max ${formSettings?.fields?.comments?.maxLength || 600} characters`).optional();
    }

    return z.object(baseSchema);
  };

  const Schema = createSchema();

  const form = useForm({
    resolver: zodResolver(Schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      interestedIn: formSettings?.fields?.interestedIn?.options?.[0]?.value || "Medical Weight Loss",
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
      
      const data = await res.json();
      
      if (data.success) {
        setStatus({ 
          ok: true, 
          msg: formSettings?.messages?.success || "Thanks! We'll get back to you shortly." 
        });
        form.reset();
      } else {
        throw new Error(data.message || "Failed");
      }
    } catch (error) {
      setStatus({ 
        ok: false, 
        msg: formSettings?.messages?.error || "Something went wrong. Please try again." 
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Don't render if settings are not loaded
  if (!formSettings) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-2xl border bg-white p-6 shadow-sm md:p-8"
      style={{
        backgroundColor: formSettings.styling?.backgroundColor || '#ffffff',
        borderColor: formSettings.styling?.borderColor || '#e2e8f0',
        color: formSettings.styling?.textColor || '#0f172a'
      }}
    >
      <h2 
        className="text-2xl font-semibold"
        style={{ color: formSettings.styling?.textColor || '#0f172a' }}
      >
        {formSettings.title || 'Contact Us Form'}
      </h2>

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
                    {formSettings.fields?.firstName?.label || 'Name'} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={formSettings.fields?.firstName?.placeholder || 'First'} 
                      {...field} 
                    />
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
                  <FormLabel className={formSettings.config?.requireLastName ? "" : "invisible"}>
                    {formSettings.fields?.lastName?.label || 'Last'} 
                    {formSettings.config?.requireLastName && <span className="text-red-500">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={formSettings.fields?.lastName?.placeholder || 'Last'} 
                      {...field} 
                    />
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
                    {formSettings.fields?.email?.label || 'Email'} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder={formSettings.fields?.email?.placeholder || 'you@example.com'} 
                      {...field} 
                    />
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
                    {formSettings.fields?.phone?.label || 'Phone'} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder={formSettings.fields?.phone?.placeholder || '(704) 386-6871'} 
                      {...field} 
                    />
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
                  {formSettings.fields?.interestedIn?.label || 'I am interested in:'} <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {formSettings.fields?.interestedIn?.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    )) || (
                      <>
                        <SelectItem value="Medical Weight Loss">Medical Weight Loss</SelectItem>
                        <SelectItem value="Hormone Therapy">Hormone Therapy</SelectItem>
                        <SelectItem value="General Question">General Question</SelectItem>
                      </>
                    )}
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
                <FormLabel>
                  {formSettings.fields?.comments?.label || 'Comments'}
                  {formSettings.config?.requireComments && <span className="text-red-500">*</span>}
                </FormLabel>
                <p className="text-sm text-slate-500">
                  {formSettings.fields?.comments?.description || 'Please let us know what\'s on your mind. Have a question for us? Ask away.'}
                </p>
                <FormControl>
                  <Textarea
                    rows={6}
                    maxLength={formSettings.fields?.comments?.maxLength || 600}
                    placeholder={formSettings.fields?.comments?.placeholder || ''}
                    {...field}
                  />
                </FormControl>
                <div className="text-xs text-slate-500">
                  {charCount} of {formSettings.fields?.comments?.maxLength || 600} max characters
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button 
            type="submit" 
            disabled={submitting} 
            className="mt-2 inline-flex items-center gap-2"
            style={{ backgroundColor: formSettings.styling?.primaryColor || '#3b82f6' }}
          >
            <Send className="h-4 w-4" />
            {submitting 
              ? (formSettings.submitButton?.loadingText || "Sending…") 
              : (formSettings.submitButton?.text || "Send message")
            }
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
