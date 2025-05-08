import { useState } from "react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const EditUserDialog = ({ staffMember }) => {
    const [staffType, setStaffType] = useState(staffMember.staffType.slice(0, 1));
    const [staffNumber, setStaffNumber] = useState(staffMember.staffId); // assumes id is like "T001"
    const [fullName, setFullName] = useState(staffMember.fullName);
    const [email, setEmail] = useState(staffMember.email);
    const [password, setPassword] = useState(staffMember.password); // Only update if filled

    // const handleUpdate = () => {
    //     const updatedData = {
    //         _id: staffMember.id, // Assuming you have the _id of the user to update
    //         id: staffType + staffNumber, // e.g., T0001 or C0001
    //         fullname: fullName,
    //         email: email,
    //         accounttype: staffType,
    //         password: password // Only include if not empty
    //     };

    //     console.log("Updated User Data:", updatedData);

    // };

    const handleUpdate = async () => {
        const updatedData = {
            _id: staffMember.id, // Assuming you have the _id of the user to update
            id: staffType+staffNumber, // e.g., T0001 or C0001
            fullname: fullName,
            email: email,
            accounttype: staffType,
            password: password // Only include if not empty
        };

        // Only include password if it's not empty
        if (password.trim() !== "") {
            updatedData.password = password;
        }

        try {
            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();
            console.log("Update Result:", result);
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Edit
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[600px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit User: {staffMember.staffId}</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Staff Type</label>
                            <Select
                                value={staffType}
                                onValueChange={setStaffType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="T">Technician</SelectItem>
                                    <SelectItem value="C">Clinician</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Staff Number</label>
                            <Input
                                placeholder="00001"
                                maxLength={5}
                                pattern="[0-9]*"
                                value={staffNumber}
                                onChange={(e) => setStaffNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <Input
                            placeholder="Enter full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <Input
                            type="text"
                            placeholder="Leave blank to keep current"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUpdate}>
                        Save Changes
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default EditUserDialog;
