'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Site, Client } from '@/types/models';
import SiteForm from '@/components/sites/SiteForm';
import { siteService } from '@/services/siteService';
import { clientService } from '@/services/clientService';
import Navbar from '@/components/Navbar';

export default function NewSitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');

  const [error, setError] = useState<string | null>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(false);
  const [prefilledClient, setPrefilledClient] = useState<Client | null>(null);

  // Load client data if clientId is provided
  useEffect(() => {
    const loadClient = async () => {
      if (clientId) {
        setIsLoadingClient(true);
        try {
          const client = await clientService.getClient(parseInt(clientId));
          setPrefilledClient(client);
        } catch (err) {
          console.error('Failed to load client:', err);
          setError('Impossible de charger les informations du client');
        } finally {
          setIsLoadingClient(false);
        }
      }
    };

    loadClient();
  }, [clientId]);

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
            <h1 className="text-2xl font-bold">
              {prefilledClient ? `Nouveau Site - ${
                prefilledClient.cli_type === 'entreprise'
                  ? prefilledClient.cli_nom_entreprise
                  : `${prefilledClient.cli_prenom} ${prefilledClient.cli_nom}`
              }` : 'Créer un nouveau site'}
            </h1>
          </div>

          {prefilledClient && (
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
              Les informations du client "{
                prefilledClient.cli_type === 'entreprise'
                  ? prefilledClient.cli_nom_entreprise
                  : `${prefilledClient.cli_prenom} ${prefilledClient.cli_nom}`
              }" ont été pré-remplies automatiquement.
            </div>
          )}

          {isLoadingClient ? (
            <div className="flex justify-center mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <SiteForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEditMode={false}
                prefilledClient={prefilledClient}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
