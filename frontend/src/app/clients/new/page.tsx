'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientForm from '@/components/clients/ClientForm';
import { Client, clientService } from '@/services/clientService';
import Navbar from '@/components/Navbar';

export default function NewClientPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (client: Client) => {
    try {
      await clientService.createClient(client);

      // Redirect to clients list after successful creation
      router.push('/clients');
    } catch (error) {
      console.error('Failed to create client:', error);
      setError('Une erreur est survenue lors de la création du client');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/clients');
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

        <ClientForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </>
  );
}
