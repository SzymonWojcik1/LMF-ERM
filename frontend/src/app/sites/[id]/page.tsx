'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { siteService, deleteSite } from '@/services/siteService';
import { Site } from '@/types/models';
import Navbar from '@/components/Navbar';

export default function SiteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const siteData = await siteService.getSite(parseInt(params.id));
        setSite(siteData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement du site');
        console.error('Error fetching site details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteDetails();
  }, [params.id, router]);

  const handleEdit = () => {
    router.push(`/sites/edit/${params.id}`);
  };

  const handleDelete = async () => {
    if (!site) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer le site "${site.sit_nom}" ?`)) {
      return;
    }

    try {
      await deleteSite(parseInt(params.id));
      router.push('/sites');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression');
      console.error('Error deleting site:', err);
    }
  };

  const handleReturn = () => {
    router.push('/sites');
  };

  // Helper function to display value or dash
  const displayValue = (value: string | null | undefined) => value || '-';

  // Helper function to format site status for display
  const formatSiteStatus = (status: string) => {
    if (status === 'ACTIF') return 'Actif';
    if (status === 'TERMINE') return 'Terminé';
    return status;
  };

  // Helper function to format client information
  const formatClientInfo = (site: Site | null) => {
    if (!site || !site.client) return '-';

    if (site.client.cli_type === 'entreprise') {
      let info = displayValue(site.client.cli_nom_entreprise);

      // Add name and surname if they exist
      const nom = site.client.cli_nom;
      const prenom = site.client.cli_prenom;

      if (nom || prenom) {
        info += ` (${displayValue(prenom)} ${displayValue(nom)})`;
      }

      return info;
    } else {
      return `${displayValue(site.client.cli_prenom)} ${displayValue(site.client.cli_nom)}`;
    }
  };

  // Helper function to format client type
  const formatClientType = (site: Site | null) => {
    if (!site || !site.client) return '-';

    if (site.client.cli_type === 'entreprise') return 'Entreprise';
    if (site.client.cli_type === 'particulier') return 'Particulier';
    return site.client.cli_type;
  };

  // Helper function to format datetime
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper function to format user info
  const formatUserInfo = (user: { usr_nom?: string, usr_prenom?: string } | undefined) => {
    if (!user) return '-';
    return `${displayValue(user.usr_prenom)} ${displayValue(user.usr_nom)}`;
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Détails du Site</h1>

        {isLoading ? (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-4xl">
            <p>{error}</p>
          </div>
        ) : site ? (
          <div className="bg-white rounded-lg shadow-md w-full max-w-2xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Informations du site</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="font-medium">Nom:</div>
                <div>{displayValue(site.sit_nom)}</div>

                <div className="font-medium">Statut:</div>
                <div>
                  <span className={`px-2 py-1 rounded-full ${
                    site.sit_statut === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formatSiteStatus(site.sit_statut)}
                  </span>
                </div>

                <div className="font-medium">Heures:</div>
                <div>{site.sit_heure}</div>

                <div className="font-medium">Nombre de personnes:</div>
                <div>{site.sit_nb_personne}</div>

                <div className="font-medium">Adresse:</div>
                <div>{displayValue(site.sit_adresse)}</div>

                {/* NPA and Ville are not part of the Site interface, removed */}
              </div>
            </div>

            <div className="mb-6 border-t pt-4">
              <h2 className="text-xl font-semibold mb-4">Informations du client</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="font-medium">Type de client:</div>
                <div>{formatClientType(site)}</div>

                <div className="font-medium">Client:</div>
                <div>{formatClientInfo(site)}</div>

                {/* Email is not part of the client interface in Site type */}
              </div>
            </div>

            <div className="mb-6 border-t pt-4">
              <h2 className="text-xl font-semibold mb-4">Informations de gestion</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="font-medium">Créé par:</div>
                <div>{formatUserInfo(site.createdBy)}</div>

                <div className="font-medium">Modifié par:</div>
                <div>{formatUserInfo(site.updatedBy)}</div>

                <div className="font-medium">Date de création:</div>
                <div>{formatDate(site.sit_created_at)}</div>

                <div className="font-medium">Dernière modification:</div>
                <div>{formatDate(site.sit_updated_at)}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Modifier le site
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Supprimer le site
              </button>
            </div>

            <button
              onClick={handleReturn}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Retourner aux sites
            </button>
          </div>
        ) : (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 w-full max-w-4xl">
            <p>Site introuvable</p>
          </div>
        )}
      </div>
    </>
  );
}
