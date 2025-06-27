'use client'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  id: z.string()
    .min(4, "ID must be at least 4 characters")
    .regex(/^[A-Za-z0-9]+$/, "Only letters and numbers are allowed")
    .trim(),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .trim(),
});

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      password: "",
    },
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(values) {
    setIsLoading(true);
    try {
      const res = await signIn('credentials', {
        id: values.id,
        password: values.password,
        redirect: false,
      });

      if (res?.error) {
        const errorMessage = res.error.includes("Invalid password")
          ? "Invalid password"
          : "Invalid ID";
        setMessage(errorMessage);
        setIsDialogOpen(true);
      } else {
        // Fetch session to get user type
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.accounttype) {
          localStorage.setItem('usertype', sessionData.user.accounttype);
        }
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setMessage("An unexpected error occurred. Please try again later.");
      setIsDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-secondary shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Section */}
        <div className="relative md:w-1/2 w-full flex justify-start items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#5d77ae] via-[#50699f] to-[#28354f] [clip-path:ellipse(100%_100%_at_50%_0%)] md:[clip-path:ellipse(100%_100%_at_0%_50%)] z-0"></div>
          <h1 className="font-tagesschrift md:text-9xl text-7xl w-full text-center text-white z-10 font-bold">
            somi
          </h1>
        </div>

        {/* Right Section */}
        <div className="md:w-1/2 w-full p-8 md:p-12 flex flex-col justify-center z-30 bg-white">
          <h2 className="text-2xl font-bold text-secondary mb-1">ASYINC</h2>
          <p className="text-sm text-gray-500 mb-6">
            SIGN IN
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center bg-gray-100 p-3 rounded">
                        <User className="text-gray-400 mr-2" />
                        <Input
                          type="text"
                          placeholder="User Name"
                          className="bg-transparent border-none outline-none flex-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center bg-gray-100 p-3 rounded">
                        <Lock className="text-gray-400 mr-2" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="bg-transparent border-none outline-none flex-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field}
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="cursor-pointer text-secondary"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Sign in Button */}
              <Button
                type="submit"
                className="w-full bg-secondary text-white py-2 rounded hover:opacity-90 transition"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Sign in"}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign in</AlertDialogTitle>
            <AlertDialogDescription>{message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}