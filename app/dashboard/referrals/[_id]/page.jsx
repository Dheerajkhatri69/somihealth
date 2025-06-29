'use client'
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const ReferralDetailPage = ({ params }) => {
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReferral = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/referrals/${params._id}`);
        const result = await response.json();
        if (result.success) {
          setReferral(result.referral);
        } else {
          setError(result.message || 'Not found');
        }
      } catch (err) {
        setError('Error fetching referral');
      } finally {
        setLoading(false);
      }
    };
    fetchReferral();
  }, [params._id]);

  if (loading) {
    return (
      <div className="mb-4 p-4">
        <div className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">
          <div className="mb-6">
            {/* Header Skeleton */}
            <Skeleton className="h-8 w-48 mb-4" />

            <div className="space-y-4">
              {/* Referral Source Section Skeleton */}
              <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#f1f5f9]">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Referrer and Referred Information Skeleton */}
              <div className='md:flex-row flex-col flex justify-between gap-4'>
                {/* Referrer Information Skeleton */}
                <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                  <div className="flex justify-between gap-2">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                {/* Referred Information Skeleton */}
                <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                  <div className="flex justify-between gap-2">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>

              {/* NPI Section Skeleton */}
              <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#f1f5f9]">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Created At Section Skeleton */}
              <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#f1f5f9]">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Close Button Skeleton */}
              <div className="w-full mx-auto">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!referral) return null;

  return (
    <div className="mb-4 p-4">
      <div className="w-full space-y-6 p-6 border rounded-xl shadow-sm bg-white">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Referral Details</h2>

          <div className="space-y-4">

            <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <div className="space-y-2">
                  <Label>Referral Source</Label>
                  <Input value={referral.referralSource} readOnly />
                </div>
              </div>
            </div>

            <div className='md:flex-row flex-col flex justify-between gap-4'>

              <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                <div className="flex justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="space-y-2">
                      <Label>Referrer First Name</Label>
                      <Input value={referral.firstName} readOnly />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="space-y-2">
                      <Label>Referrer Last Name</Label>
                      <Input value={referral.lastName} readOnly />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="space-y-2">
                    <Label>Referrer Email</Label>
                    <Input value={referral.email} readOnly />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="space-y-2">
                    <Label>Referrer Phone</Label>
                    <Input value={referral.phone} readOnly />
                  </div>
                </div>
              </div>
              <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-6 border rounded-xl shadow-sm bg-[#ede9f9]">
                <div className="flex justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="space-y-2">
                      <Label>Referred First Name</Label>
                      <Input value={referral.refFirstName} readOnly />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="space-y-2">
                      <Label>Referred Last Name</Label>
                      <Input value={referral.refLastName} readOnly />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="space-y-2">
                    <Label>Referred Email</Label>
                    <Input value={referral.refEmail} readOnly />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="space-y-2">
                    <Label>Referred Phone</Label>
                    <Input value={referral.refPhone} readOnly />
                  </div>
                </div>
              </div>
            </div>

            {referral.providerField && (
              <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#f1f5f9]">
                <div className="flex items-center gap-2">
                  <div className="space-y-2">
                    <Label>NPI</Label>
                    <Input value={referral.providerField} readOnly />
                  </div>
                </div>
              </div>
            )}
            <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-sm bg-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <div className="space-y-2">
                  <Label>Created At</Label>
                  <Input value={referral.createdAt ? new Date(referral.createdAt).toLocaleString() : ''} readOnly />
                </div>
              </div>
            </div>
            <div className="w-full mx-auto">
              <Link href="/dashboard/referrals">
                <Button className="w-full bg-secondary text-white hover:bg-secondary">Close</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDetailPage;