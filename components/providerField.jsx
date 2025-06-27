'use client'
import React from "react";

export const ProviderField = ({ provider }) => {
    // Handle undefined or null diagnosis
    if (!provider) {
        return <div className="truncate whitespace-nowrap overflow-hidden">-</div>;
    }

    return (
        <div className="relative group w-full max-w-[140px]">
            {/* Truncated preview */}
            <div className="truncate whitespace-nowrap overflow-hidden cursor-pointer">
                {provider.length > 15 ? `${provider.slice(0, 15)}...` : provider}
            </div>

            {/* Tooltip on hover */}
            {provider.length > 15 ?
                <div className="absolute z-50 hidden group-hover:block bg-black/60 text-white text-sm px-3 py-2 rounded shadow-md top-full right-0 mt-1 max-w-xs w-max">
                    {provider}
                </div> : ""
            }
        </div>
    );
};

export default ProviderField;
