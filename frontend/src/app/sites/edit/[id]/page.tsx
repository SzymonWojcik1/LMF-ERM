'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Site } from '@/types/models';
import SiteForm from '@/components/sites/SiteForm';
import { siteService } from '@/services/siteService';
import Navbar from '@/components/Navbar';

interface EditSitePageProps {
  params: {
    id: string;
  };
}

export default function EditSitePage({ params }: EditSitePageProps) {
  const router = useRouter();
  const [site, setSite] = useState<Site | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const siteId = parseInt(params.id);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        setIsLoading(true);
        const data = await siteService.getSite(siteId);
        setSite(data);
      } catch (error) {
        console.error('Failed to fetch site:', error);
        let errorMessage = 'Une erreur est survenue lors du chargement du site';

        // Type guard to safely access properties
        if (typeof error === 'object' && error !== null &&
            'data' in error && typeof error.data === 'object' && error.data !== null &&
            'message' in error.data && typeof error.data.message === 'string') {
          errorMessage = error.data.message;
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (siteId) {
      fetchSite();
    } else {
      setError('ID du site invalide');
      setIsLoading(false);
    }
  }, [siteId]);

  const handleSubmit = async (updatedSite: Site) => {
    try {
      console.log('About to update site with data:', updatedSite);

      if (!updatedSite.sit_updated_by) {
        const userJson = localStorage.getItem('user');
        let userId = null;

        if (userJson) {
          try {
            const user = JSON.parse(userJson);
            userId = user.id || user.usr_id || user.user_id || null;
          } catch (e) {
            console.error('Failed to parse user from localStorage:', e);
          }
        }

        if (userId) {
          updatedSite.sit_updated_by = Number(userId);
        } else {
          throw {
            data: {
              message: 'Utilisateur non authentifié. Veuillez vous reconnecter.'
            }
          };
        }
      }

      if (site && site.sit_created_by) {
        updatedSite.sit_created_by = Number(site.sit_created_by);
      }

      await siteService.updateSite(siteId, updatedSite);
      router.push('/sites'); // Navigate back to sites list
    } catch (error) {
      console.error('Failed to update site:', error);

      let errorMessage = 'Une erreur est survenue lors de la mise à jour du site';

      if (typeof error === 'object' && error !== null &&
          'data' in error && typeof error.data === 'object' && error.data !== null) {
        if ('message' in error.data && typeof error.data.message === 'string') {
          errorMessage = error.data.message;
        } else if ('errors' in error.data && typeof error.data.errors === 'object') {
          const errorObj = error.data.errors as Record<string, string>;
          const firstError = Object.values(errorObj)[0];
          if (firstError) {
            errorMessage = firstError;
          }
        }
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
            <h1 className="text-2xl font-bold">Modifier le site</h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : site ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <SiteForm
                site={site}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEditMode={true}
              />
            </div>
          ) : (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
              Site non trouvé. Veuillez vérifier l&apos;identifiant.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
