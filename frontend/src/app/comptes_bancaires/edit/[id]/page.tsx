'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CompteBancaireForm from '@/components/comptes-bancaires/CompteBancaireForm';
import { CompteBancaire } from '@/types/models';
import { compteBancaireService } from '@/services/compteBancaireService';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';

export default function EditCompteBancairePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [compteBancaire, setCompteBancaire] = useState<CompteBancaire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bank account data on component mount
  useEffect(() => {
    const fetchCompteBancaire = async () => {
      try {
        const compteBancaireId = parseInt(params.id, 10);
        if (isNaN(compteBancaireId)) {
          notFound();
        }

        const data = await compteBancaireService.getCompteBancaire(compteBancaireId);
        setCompteBancaire(data);
      } catch (error) {
        console.error('Failed to fetch bank account:', error);

        // Handle 401 unauthorized by redirecting to login
        const apiError = error as { status?: number };
        if (apiError.status === 401) {
          router.push('/login');
          return;
        }

        setError(error instanceof Error ? error.message : 'Impossible de charger les données du compte bancaire');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompteBancaire();
  }, [params.id, router]);

  const handleSubmit = async (updatedCompteBancaire: CompteBancaire) => {
    if (!compteBancaire?.ban_id) return;

    try {
      await compteBancaireService.updateCompteBancaire(compteBancaire.ban_id, updatedCompteBancaire);
      router.push('/comptes_bancaires');
    } catch (error) {
      console.error('Failed to update bank account:', error);
      setError('Une erreur est survenue lors de la mise à jour du compte bancaire');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/comptes_bancaires');
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (error || !compteBancaire) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-4xl">
            {error || "Compte bancaire non trouvé"}
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/comptes_bancaires')}
              className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Retour à la liste des comptes bancaires
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <CompteBancaireForm
          compteBancaire={compteBancaire}
          isEditMode={true}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </>
  );
}
