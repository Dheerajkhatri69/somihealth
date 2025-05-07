"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

const formSchema = z.object({
    staffType: z.enum(["T", "C"], {
        required_error: "Please select a staff type",
    }),
    staffNumber: z.string()
        .length(3, "Must be 3 digits")
        .regex(/^\d+$/, "Must be numeric"),
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function StaffForm() {
    const [staff, setStaff] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        async function fetchStaff() {
            try {
                const response = await fetch("/api/users");
                const result = await response.json();
                const data = result.result;
                if (Array.isArray(data)) {
                    const formattedData = data
                        .filter((user) => user.accounttype !== "A") // Filter out admins
                        .map((user) => ({
                            staffId: user.id,
                            fullName: user.fullname,
                            email: user.email,
                            staffType:
                                user.accounttype === "T"
                                    ? "Technician"
                                    : user.accounttype === "C"
                                    ? "Clinician"
                                    : "Unknown", // No need to map "A" as it's filtered out
                            password: user.password, // Ideally, do NOT expose plain passwords
                        }));
                    setStaff(formattedData);
                } else {
                    console.error("Invalid data format from server:", data.result);
                }
            } catch (error) {
                console.error("Failed to fetch staff:", error);
            }
        }
    
        fetchStaff();
    }, []);
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            staffType: undefined,
            staffNumber: "",
            fullName: "",
            email: "",
            password: "",
        },
    });

    const handleEdit = (staffId) => {
        const staffMember = staff.find(m => m.staffId === staffId);
        if (staffMember) {
            setEditingId(staffId);
            form.reset({
                staffType: staffMember.staffType[0],
                staffNumber: staffMember.staffId.slice(1),
                fullName: staffMember.fullName,
                email: staffMember.email,
                password: '' // Password typically shouldn't be retrievable
            });
        }
    };

    const handleDelete = (staffId) => {
        setStaff(staff.filter(m => m.staffId !== staffId));
        if (editingId === staffId) {
            setEditingId(null);
            form.reset();
        }
    };

    async function onSubmit(values) {
        const id = `${values.staffType}${values.staffNumber}`;
        const staffMember = {
            id,
            fullName: values.fullName,
            email: values.email,
            accounttype: values.staffType, // only "T" or "C"
            password: values.password
        };

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(staffMember)
            });

            const result = await response.json();

            if (result.success) {
                setStaff([...staff, {
                    staffId: id,
                    fullName: values.fullName,
                    email: values.email,
                    staffType: values.staffType === "T" ? "Technician" : "Clinician",
                    password: values.password
                }]);
                form.reset();
            } else {
                console.error(result.result.message);
            }
        } catch (err) {
            console.error("Failed to submit:", err);
        }

        setEditingId(null);
    }


    return (
        <div className="p-4 space-y-8">

            <Card className="p-6 w-full mx-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-wrap gap-4 items-end">
                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="staffType"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Staff Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="T">Technician</SelectItem>
                                                <SelectItem value="C">Clinician</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="staffNumber"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Staff Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="001"
                                                maxLength={3}
                                                pattern="[0-9]*"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter full name" {...field} />
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
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Enter password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-2">
                            {!editingId && (
                                <Button type="submit">
                                    Add Staff
                                </Button>
                            )}
                            {editingId && (
                                <>
                                    <Button type="submit">
                                        Update Staff
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingId(null);
                                            form.reset();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </Form>
            </Card>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Staff ID</TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Staff Type</TableHead>
                            <TableHead>Password</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staff.map((staffMember) => (
                            <TableRow key={staffMember.staffId}>
                                <TableCell className="font-medium">{staffMember.staffId}</TableCell>
                                <TableCell>{staffMember.fullName}</TableCell>
                                <TableCell>{staffMember.email}</TableCell>
                                <TableCell>{staffMember.staffType}</TableCell>
                                <TableCell>{staffMember.password}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(staffMember.staffId)}
                                    >
                                        Update
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(staffMember.staffId)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

        </div>
    );
}