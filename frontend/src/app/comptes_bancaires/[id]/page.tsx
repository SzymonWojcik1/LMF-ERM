'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { compteBancaireService, deleteCompteBancaire } from '@/services/compteBancaireService';
import { CompteBancaire } from '@/types/models';
import Navbar from '@/components/Navbar';

export default function CompteBancaireDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [compteBancaire, setCompteBancaire] = useState<CompteBancaire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompteBancaireDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const compteBancaireData = await compteBancaireService.getCompteBancaire(parseInt(params.id));
        setCompteBancaire(compteBancaireData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement du compte bancaire');
        console.error('Error fetching bank account details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompteBancaireDetails();
  }, [params.id, router]);

  const handleEdit = () => {
    router.push(`/comptes_bancaires/edit/${params.id}`);
  };

  const handleDelete = async () => {
    if (!compteBancaire) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer le compte "${compteBancaire.ban_nom_affichage}" ?`)) {
      return;
    }

    try {
      await deleteCompteBancaire(parseInt(params.id));
      router.push('/comptes_bancaires');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression');
      console.error('Error deleting bank account:', err);
    }
  };

  const handleReturn = () => {
    router.push('/comptes_bancaires');
  };

  const displayValue = (value: string | number | null | undefined) =>
    value !== null && value !== undefined ? value.toString() : '-';

  const formatActifStatus = (actif: boolean) => {
    return actif ? 'Actif' : 'Inactif';
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Détails du Compte Bancaire</h1>

        {isLoading ? (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-4xl">
            <p>{error}</p>
          </div>
        ) : compteBancaire ? (
          <div className="bg-white rounded-lg shadow-md w-full max-w-2xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Informations générales</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="font-medium">Nom d&apos;affichage:</div>
                <div>{displayValue(compteBancaire.ban_nom_affichage)}</div>

                <div className="font-medium">Banque:</div>
                <div>{displayValue(compteBancaire.ban_banque)}</div>

                <div className="font-medium">IBAN:</div>
                <div className="font-mono text-sm">{displayValue(compteBancaire.ban_iban)}</div>

                <div className="font-medium">Devise:</div>
                <div>{displayValue(compteBancaire.ban_devise)}</div>

                <div className="font-medium">Statut:</div>
                <div>
                  <span className={`px-2 py-1 rounded-full ${
                    compteBancaire.ban_actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {formatActifStatus(compteBancaire.ban_actif)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6 border-t pt-4">
              <h2 className="text-xl font-semibold mb-4">Adresse de la banque</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="font-medium">Nom de l&apos;entreprise:</div>
                <div>{displayValue(compteBancaire.ban_nom_entreprise)}</div>

                <div className="font-medium">Adresse:</div>
                <div>{displayValue(compteBancaire.ban_adresse)}</div>

                <div className="font-medium">Numéro de bâtiment:</div>
                <div>{displayValue(compteBancaire.ban_numero_batiment)}</div>

                <div className="font-medium">NPA:</div>
                <div>{displayValue(compteBancaire.ban_npa)}</div>

                <div className="font-medium">Ville:</div>
                <div>{displayValue(compteBancaire.ban_ville)}</div>

                <div className="font-medium">Pays:</div>
                <div>{displayValue(compteBancaire.ban_pays)}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Modifier le compte
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Supprimer le compte
              </button>
            </div>

            <button
              onClick={handleReturn}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Retourner aux comptes bancaires
            </button>
          </div>
        ) : (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 w-full max-w-4xl">
            <p>Compte bancaire introuvable</p>
          </div>
        )}
      </div>
    </>
  );
}