'use client'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";
import logo from '@/public/logo/somilogo.png';
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
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";

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
    <div className="min-h-screen bg-gradient-to-br from-[#50699f] via-[#2c3a57] to-[#5d77ae] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Left Section */}
        <div className="md:w-1/2 w-full text-white p-8 md:p-12 relative flex flex-col justify-start items-start">
          {/* <div className="flex justify-center z-20">
            <Image src={logo} alt="Logo" width={100} height={100} />
          </div> */}
          <h1 className="font-tagesschrift text-5xl mb-2 text-white z-20 font-bold">
            Somi
          </h1>
          <h4 className="text-lg font-semibold mb-2 z-20">Your Health, Your Future, Your Time.</h4>

          <TypeAnimation
            sequence={[
              "No hidden fees. No hassle. Just results.",
              2000,
              "Custom plans. Real help. Real care.",
              2000,
            ]}
            wrapper="p"
            speed={50}
            style={{ fontSize: '0.875rem', opacity: 0.8 }}
            className="z-20 min-h-[3.5rem]"
            repeat={Infinity}
          />
          {/* Circles */}
          <div className="absolute -top-48 -left-10 w-[600px] h-[600px] md:-top-28 md:-left-28  md:w-[500px] md:h-[500px] bg-gradient-to-br from-[#5d77ae] via-[#50699f] to-[#28354f] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 md:w-96 md:h-96 bg-gradient-to-br from-[#2b354a] via-[#50699f] to-[#5d77ae]  rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute bottom-[10%] right-0 w-36 h-36 md:w-64 md:h-64 bg-gradient-to-br from-[#5d77ae] via-[#50699f] to-[#28354f]  rounded-full"></div>
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

              {/* Or */}
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <div className="flex-1 border-t"></div>
                <div className="flex-1 border-t"></div>
              </div>
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