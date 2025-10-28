"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DeshPricingPage = () => {
    return (
        <div className="flex justify-center bg-gray-50 pt-2 px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                
                <Link href="/dashboard/pricing/pricing-landing" className="w-full">
                    <Card className="flex flex-col justify-between border-l-4 border-secondary shadow-sm hover:shadow-md transition-all">
                        <CardHeader>
                            <CardTitle>Pricing Landing Page</CardTitle>
                            <CardDescription>
                                Manage and customize the pricing landing content for users.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/pricing/pricing-weightloss" className="w-full">
                    <Card className="flex flex-col justify-between border-l-4 border-secondary shadow-sm hover:shadow-md transition-all">
                        <CardHeader>
                            <CardTitle>WeightLoss Landing Page</CardTitle>
                            <CardDescription>
                                Manage and customize the WeightLoss landing content for users.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/pricing/pricing-pay-options" className="w-full">
                    <Card className="flex flex-col justify-between border-l-4 border-secondary shadow-sm hover:shadow-md transition-all">
                        <CardHeader>
                            <CardTitle>Pricing Pay Option Page</CardTitle>
                            <CardDescription>
                                Customize and configure payment options and pricing settings.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
};

export default DeshPricingPage;
