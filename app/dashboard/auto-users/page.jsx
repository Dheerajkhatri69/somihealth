"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function AutoUsersPage() {
    const [users, setUsers] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [emailSearch, setEmailSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 50;

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Edit state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [editEmail, setEditEmail] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [updating, setUpdating] = useState(false);

    // Fetch user credentials
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/user-credentials");
            const json = await res.json();
            if (json.success) {
                setUsers(json.result);
                setFilteredData(json.result);
            }
        } catch (err) {
            console.error("Error fetching user credentials:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter logic
    useEffect(() => {
        const filtered = users.filter((item) =>
            item.email.toLowerCase().includes(emailSearch.toLowerCase())
        );
        setFilteredData(filtered);
        setCurrentPage(1);
    }, [emailSearch, users]);

    const togglePasswordVisibility = (userId) => {
        setVisiblePasswords((prev) => ({
            ...prev,
            [userId]: !prev[userId],
        }));
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        console.log(`${type} copied to clipboard`);
    };

    // Delete handlers
    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/user-credentials/${userToDelete.userId}`, {
                method: "DELETE",
            });
            const json = await res.json();

            if (json.success) {
                console.log("✅ User credential deleted");
                await fetchData(); // Refresh the list
            } else {
                console.error("❌ Failed to delete:", json.error);
                alert("Failed to delete credential: " + json.error);
            }
        } catch (error) {
            console.error("Error deleting credential:", error);
            alert("Error deleting credential");
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    // Edit handlers
    const handleEditClick = (user) => {
        setUserToEdit(user);
        setEditEmail(user.email);
        setEditPassword(user.password);
        setEditDialogOpen(true);
    };

    const handleUpdateConfirm = async () => {
        if (!userToEdit) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/user-credentials/${userToEdit.userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: editEmail,
                    password: editPassword,
                }),
            });
            const json = await res.json();

            if (json.success) {
                console.log("✅ User credential updated");
                await fetchData(); // Refresh the list
            } else {
                console.error("❌ Failed to update:", json.error);
                alert("Failed to update credential: " + json.error);
            }
        } catch (error) {
            console.error("Error updating credential:", error);
            alert("Error updating credential");
        } finally {
            setUpdating(false);
            setEditDialogOpen(false);
            setUserToEdit(null);
            setEditEmail("");
            setEditPassword("");
        }
    };

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

    if (loading) {
        return (
            <div className="p-4 space-y-4">
                {/* Header Skeleton */}
                <Skeleton className="h-8 w-64" />

                {/* Search Filter Skeleton */}
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-full md:w-1/3" />
                </div>

                {/* Table Skeleton */}
                <div className="border rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-secondary text-white">
                            <TableRow>
                                {[...Array(5)].map((_, i) => (
                                    <TableHead key={i} className="text-white">
                                        <Skeleton className="h-4 w-16 bg-white/20" />
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {[...Array(5)].map((_, colIndex) => (
                                        <TableCell key={colIndex}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Skeleton */}
                <div className="flex items-center justify-between space-x-2 py-4">
                    <Skeleton className="h-4 w-48" />
                    <div className="space-x-2 flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Auto-Generated User Credentials</h2>

            <div className="flex gap-4">
                <Input
                    placeholder="Search by Email"
                    value={emailSearch}
                    onChange={(e) => setEmailSearch(e.target.value)}
                    className="w-full md:w-1/3"
                />
            </div>

            <div className="border rounded-lg overflow-x-auto">
                <Table>
                    <TableHeader className="bg-secondary text-white">
                        <TableRow>
                            <TableHead className="text-white">User ID</TableHead>
                            <TableHead className="text-white">Email</TableHead>
                            <TableHead className="text-white">Password</TableHead>
                            <TableHead className="text-white">Created At</TableHead>
                            <TableHead className="text-white">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                    No user credentials found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentRows.map((user) => (
                                <TableRow key={user.userId}>
                                    <TableCell className="font-mono">{user.userId}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="font-mono">
                                        <div className="flex items-center gap-2">
                                            <span>
                                                {visiblePasswords[user.userId]
                                                    ? user.password
                                                    : "••••••••••••"}
                                            </span>
                                            <button
                                                onClick={() => togglePasswordVisibility(user.userId)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                {visiblePasswords[user.userId] ? (
                                                    <EyeOff size={16} />
                                                ) : (
                                                    <Eye size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {new Date(user.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => copyToClipboard(user.password, "Password")}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Copy Password"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="text-green-600 hover:text-green-800"
                                                title="Edit Credential"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(user)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete Credential"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Showing {indexOfFirstRow + 1}-
                    {Math.min(indexOfLastRow, filteredData.length)} of{" "}
                    {filteredData.length} users
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User Credential?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the credential for{" "}
                            <strong>{userToDelete?.email}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User Credential</DialogTitle>
                        <DialogDescription>
                            Update the email or password for this credential.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                placeholder="user@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="text"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                            disabled={updating}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateConfirm} disabled={updating}>
                            {updating ? "Updating..." : "Update"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
