'use client'
import React, { useEffect, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

export const ClinicianDropdown = ({ selectedPatients }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Ensures component only renders after client-side hydration
        setIsClient(true);
    }, []);

    const handleClinicianClick = (clinicianNumber) => {
        console.log(`Clinician ${clinicianNumber}:`, selectedPatients);
    };

    if (!isClient) return null; // or a placeholder like <Skeleton />

    return (

        <DropdownMenu>
            <DropdownMenuTrigger className='text-white bg-secondary px-2 rounded-sm hover:bg-secondary-foreground duration-200 flex justify-center items-center gap-1'>
                <Plus size={18} />
                Assign Clinician
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>ALL Clinician</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[1, 2, 3, 4].map((num) => (
                    <DropdownMenuItem
                        key={num}
                        onClick={() => handleClinicianClick(num)}
                    >
                        {num} Clinician
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
