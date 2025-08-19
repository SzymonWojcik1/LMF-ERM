'use client';

import { useState, useEffect } from 'react';
import { deleteSite, siteService } from '@/services/siteService';
import { Site } from '@/types/models';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSites = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const data = await siteService.getSites();
        setSites(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error('Error fetching sites:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSites();
  }, []);

  // Helper function to display value or dash
  const displayValue = (value: string | null | undefined) => value || '-';

  // Helper function to format site status for display
  const formatSiteStatus = (status: string) => {
    if (status === 'actif') return 'Actif';
    if (status === 'terminé') return 'Terminé';
    return status;
  };

  // Helper function to format client name
  const formatClientName = (site: Site) => {
    if (!site.client) return '-';

    if (site.client.cli_type === 'entreprise') {
      return displayValue(site.client.cli_nom_entreprise);
    } else {
      return `${displayValue(site.client.cli_nom)} ${displayValue(site.client.cli_prenom)}`;
    }
  };

  // Helper function to format user initials
  const formatUserInitials = (site: Site) => {
    if (!site.updatedBy) return '-';

    console.log('updatedBy data:', site.updatedBy);

    const prenom = site.updatedBy.usr_prenom || '';
    const nom = site.updatedBy.usr_nom || '';

    if (prenom && nom) {
      return `${prenom[0]}.${nom[0]}`;
    }

    return '-';
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

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="flex justify-between items-center w-full max-w-6xl mb-8">
          <h1 className="text-3xl font-bold">Sites</h1>
          <Link
            href="/sites/new"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md whitespace-nowrap">
            + Nouveau site
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-6xl">
            <p>{error}</p>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg shadow-sm w-full max-w-6xl">
            {/* Table Header */}
            <div className="grid grid-cols-24 bg-gray-200 font-semibold p-4">
              <div className="col-span-4">Nom</div>
              <div className="col-span-4">Client</div>
              <div className="col-span-2 text-center">Heures</div>
              <div className="col-span-3 text-center">Personnes</div>
              <div className="col-span-5">Adresse</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2 text-center">Modifié</div>
              <div className="col-span-2 text-center">Mise à jour</div>
            </div>

            {/* Table Content */}
            {sites.length > 0 ? (
              sites.map((site) => (
                <div key={site.sit_id} className="mb-4 border-b border-gray-200">
                  <div className="grid grid-cols-24 p-4">
                    <div className="col-span-4">{site.sit_nom}</div>
                    <div className="col-span-4">{formatClientName(site)}</div>
                    <div className="col-span-2 text-center">{site.sit_heure}</div>
                    <div className="col-span-3 text-center">{site.sit_nb_personne}</div>
                    <div className="col-span-5">{displayValue(site.sit_adresse)}</div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded-full ${
                        site.sit_statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {formatSiteStatus(site.sit_statut)}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">{formatUserInitials(site)}</div>
                    <div className="col-span-2 text-center">{formatDate(site.sit_updated_at)}</div>
                  </div>
                  <div className="flex justify-center space-x-2 py-2 bg-gray-50">
                    <a
                      href={`/sites/${site.sit_id}`}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm min-w-[80px] text-center"
                    >
                      Voir
                    </a>
                    <a
                      href={`/sites/edit/${site.sit_id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm min-w-[80px] text-center"
                    >
                      Modifier
                    </a>
                    <a
                      href={`/factures/new?siteId=${site.sit_id}`}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm min-w-[80px] text-center"
                    >
                      Créer une facture
                    </a>
                    <button
                      onClick={async () => {
                        if (confirm(`Êtes-vous sûr de vouloir supprimer le site "${site.sit_nom}" ?`)) {
                          try {
                            await deleteSite(site.sit_id!);
                            setSites(sites.filter((s) => s.sit_id !== site.sit_id));
                          } catch (err) {
                            console.error('Failed to delete site:', err);
                            const error = err as {data?: {message?: string}, status?: number};
                            if (error.data && error.data.message) {
                              setError(`Erreur: ${error.data.message}`);
                            } else {
                              setError('Une erreur est survenue lors de la suppression du site');
                            }
                          }
                        }
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm min-w-[80px] text-center"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Aucun site trouvé
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
