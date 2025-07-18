'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Site } from '@/types/models';
import SiteForm from '@/components/sites/SiteForm';
import { siteService } from '@/services/siteService';
import Navbar from '@/components/Navbar';

export default function NewSitePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (site: Site) => {
    try {
      console.log('About to create site with data:', site);
      await siteService.createSite(site);
      router.push('/sites'); // Navigate back to sites list
    } catch (error) {
      console.error('Failed to create site:', error);

      let errorMessage = 'Une erreur est survenue lors de la création du site';

      if (typeof error === 'object' && error !== null &&
          'data' in error && typeof error.data === 'object' && error.data !== null &&
          'message' in error.data && typeof error.data.message === 'string') {
        errorMessage = error.data.message;
      }

      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    router.push('/sites');
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center py-12 px-4">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-4xl">
            {error}
          </div>
        )}

        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Créer un nouveau site</h1>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <SiteForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditMode={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}
