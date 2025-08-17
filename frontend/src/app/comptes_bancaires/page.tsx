'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { compteBancaireService, deleteCompteBancaire } from '@/services/compteBancaireService';
import { CompteBancaire } from '@/types/models';
import Navbar from '@/components/Navbar';

export default function ComptesBancairesPage() {
  const [comptesBancaires, setComptesBancaires] = useState<CompteBancaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComptesBancaires = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const data = await compteBancaireService.getComptesBancaires();
        setComptesBancaires(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error('Error fetching bank accounts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComptesBancaires();
  }, []);

  const displayValue = (value: string | number | null | undefined) =>
    value !== null && value !== undefined ? value.toString() : '-';

  // Helper function to format IBAN with spaces every 4 characters
  const formatIban = (iban: string | null | undefined): string => {
    if (!iban) return '-';
    // Remove all spaces and convert to uppercase
    const cleanValue = iban.replace(/\s/g, '').toUpperCase();
    // Add spaces every 4 characters
    return cleanValue.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatActifStatus = (actif: boolean) => {
    return actif ? 'Actif' : 'Inactif';
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="flex justify-between items-center w-full max-w-6xl mb-8">
          <h1 className="text-3xl font-bold">Comptes Bancaires</h1>
          <Link
            href="/comptes_bancaires/new"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md whitespace-nowrap">
            + Nouveau compte bancaire
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
            <div className="grid grid-cols-12 bg-gray-200 font-semibold p-4">
              <div className="col-span-2">Nom</div>
              <div className="col-span-2">Banque</div>
              <div className="col-span-3">IBAN</div>
              <div className="col-span-1">Devise</div>
              <div className="col-span-1">Statut</div>
              <div className="col-span-3 text-center">Actions</div>
            </div>

            {/* Table Content */}
            {comptesBancaires.length > 0 ? (
              comptesBancaires.map((compte) => (
                <div key={compte.ban_id} className="grid grid-cols-12 p-4 border-b border-gray-200">
                  <div className="col-span-2">{displayValue(compte.ban_nom_affichage)}</div>
                  <div className="col-span-2">{displayValue(compte.ban_banque)}</div>
                  <div className="col-span-3">{formatIban(compte.ban_iban)}</div>
                  <div className="col-span-1">{displayValue(compte.ban_devise)}</div>
                  <div className="col-span-1">{formatActifStatus(compte.ban_actif)}</div>
                  <div className="col-span-3 flex justify-center items-center space-x-2">
                    <Link
                      href={compte.ban_id ? `/comptes_bancaires/${compte.ban_id}` : '#'}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm text-center min-w-[80px]"
                    >
                      Voir
                    </Link>
                    <Link
                      href={compte.ban_id ? `/comptes_bancaires/edit/${compte.ban_id}` : '#'}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm text-center min-w-[80px]"
                    >
                      Modifier
                    </Link>
                    <button
                    onClick={async () => {
                      if (!compte.ban_id) {
                        setError("Impossible de supprimer ce compte bancaire (ID manquant)");
                        return;
                      }

                      if (confirm(`Êtes-vous sûr de vouloir supprimer le compte ${compte.ban_nom_affichage} ?`)) {
                        try {
                          await deleteCompteBancaire(compte.ban_id);
                          setComptesBancaires(comptesBancaires.filter((c) => c.ban_id !== compte.ban_id));
                        } catch (err) {
                          console.error('Failed to delete bank account:', err);
                          const error = err as {data?: {message?: string}, status?: number};
                          if (error.data && error.data.message) {
                            setError(`Erreur: ${error.data.message}`);
                          } else {
                            setError('Une erreur est survenue lors de la suppression du compte bancaire');
                          }
                        }
                      }
                    }}
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm text-center min-w-[80px]">
                      Supprimer
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Aucun compte bancaire trouvé
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}