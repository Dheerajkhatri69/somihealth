'use client'
import React from "react";

export const DiagnosisCell = ({ diagnosis }) => {
    // Handle undefined or null diagnosis
    if (!diagnosis) {
        return <div className="truncate whitespace-nowrap overflow-hidden">-</div>;
    }

    return (
        <div className="relative group w-full max-w-[140px]">
            {/* Truncated preview */}
            <div className="truncate whitespace-nowrap overflow-hidden cursor-pointer">
                {diagnosis.length > 15 ? `${diagnosis.slice(0, 15)}...` : diagnosis}
            </div>

            {/* Tooltip on hover */}
            {diagnosis.length > 15 ?
                <div className="absolute z-50 hidden group-hover:block bg-black/60 text-white text-sm px-3 py-2 rounded shadow-md top-full left-0 mt-1 max-w-xs w-max">
                    {diagnosis}
                </div> : ""
            }
        </div>
    );
};

export default DiagnosisCell;
