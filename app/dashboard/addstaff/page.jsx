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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Delete } from "lucide-react";
import toast from "react-hot-toast";
import EditUserDialog from "@/components/updateStaff";

const formSchema = z.object({
    staffType: z.enum(["T", "C"], {
        required_error: "Please select a staff type",
    }),
    staffNumber: z.string()
        .length(5, "Must be 5 digits")
        .regex(/^\d+$/, "Must be numeric"),
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function StaffForm() {
    const [staff, setStaff] = useState([]);
    const [editingId, setEditingId] = useState(null);
    // Add pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;
    useEffect(() => {
        fetchStaff();
    }, []);

    async function fetchStaff() {
        try {
            const response = await fetch("/api/users");
            const result = await response.json();
            const data = result.result;
            if (Array.isArray(data)) {
                const formattedData = data
                    .filter((user) => user.accounttype !== "A") // Filter out admins
                    .map((user) => ({
                        id: user._id,
                        staffId: user.id,
                        fullName: user.fullname,
                        email: user.email,
                        password: user.password,
                        staffType:
                            user.accounttype === "T"
                                ? "Technician"
                                : user.accounttype === "C"
                                    ? "Clinician"
                                    : "Unknown",
                    }));
                setStaff(formattedData);
            } else {
                console.error("Invalid data format from server:", data.result);
                toast.error("Failed to load staff data");
            }
        } catch (error) {
            console.error("Failed to fetch staff:", error);
            toast.error("Failed to load staff data");
        }
    }

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
            setEditingId(staffMember.id);
            form.reset({
                staffType: staffMember.staffType[0],
                staffNumber: staffMember.staffId.slice(1),
                fullName: staffMember.fullName,
                email: staffMember.email,
                password: '' // Password typically shouldn't be retrievable
            });
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            const response = await fetch('/api/users', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id: id })
            });

            const result = await response.json();

            if (result.success) {
                toast.success("User deleted successfully");
                // Refresh the staff list
                await fetchStaff();
                // Reset form if editing the deleted user
                if (editingId === id) {
                    setEditingId(null);
                    form.reset();
                }
            } else {
                toast.error(result.result.message || "Failed to delete user");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        }
    };

    const handleUpdateUser = async (values) => {
        const id = `${values.staffType}${values.staffNumber}`;
        const staffMember = {
            _id: editingId,
            id,
            fullname: values.fullName,
            email: values.email,
            accounttype: values.staffType,
            password: values.password
        };

        try {
            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staffMember),
            });

            const result = await response.json();
            if (result.success) {
                toast.success("User updated successfully");
                await fetchStaff();
                setEditingId(null);
                form.reset();
            } else {
                toast.error(result.result.message || "Update failed");
            }
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Failed to update user");
        }
    };
    const [staffType, setStaffType] = useState("");
    const [staffNumber, setStaffNumber] = useState(""); // assumes id is like "T001"
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); // Only update if filled
    const handleUpdate = () => {
        const updatedData = {
            id: staffType + staffNumber,
            fullname: fullName,
            email: email,
            accounttype: staffType,
            password: password, // Only update if filled
        };

        console.log("Updated User Data:", updatedData);
        toast.success("User updated successfully");

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

    const totalPages = Math.ceil(staff.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = staff.slice(indexOfFirstRow, indexOfLastRow);
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
                                                placeholder="00001"
                                                maxLength={5}
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
                            {!editingId ? (
                                <Button type="submit">
                                    Add Staff
                                </Button>
                            ) : (
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
                        {currentRows.map((staffMember) => (

                            <TableRow key={staffMember.id}>
                                <TableCell className="font-medium">{staffMember.staffId}</TableCell>
                                <TableCell>{staffMember.fullName}</TableCell>
                                <TableCell>{staffMember.email}</TableCell>
                                <TableCell>{staffMember.staffType}</TableCell>
                                <TableCell>{staffMember.password}</TableCell>
                                <TableCell className="text-right flex justify-end space-x-2">
                                    <EditUserDialog staffMember={staffMember} />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                                <Delete className="mr-2 h-4 w-4" />
                                                Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete the user.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteUser(staffMember.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete Permanently
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>

                        ))}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Showing {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, staff.length)} of{" "}
                        {staff.length} patients
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}