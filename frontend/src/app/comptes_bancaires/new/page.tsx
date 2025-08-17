'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CompteBancaireForm from '@/components/comptes-bancaires/CompteBancaireForm';
import { CompteBancaire } from '@/types/models';
import { compteBancaireService } from '@/services/compteBancaireService';
import Navbar from '@/components/Navbar';

export default function NewCompteBancairePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (compteBancaire: CompteBancaire) => {
    try {
      await compteBancaireService.createCompteBancaire(compteBancaire);

      router.push('/comptes_bancaires');
    } catch (error) {
      console.error('Failed to create bank account:', error);
      setError('Une erreur est survenue lors de la création du compte bancaire');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/comptes_bancaires');
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

        <CompteBancaireForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </>
  );
}