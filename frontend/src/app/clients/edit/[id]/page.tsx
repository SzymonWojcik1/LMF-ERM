'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientForm from '@/components/clients/ClientForm';
import { Client, clientService } from '@/services/clientService';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';

export default function EditClientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch client data on component mount
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const clientId = parseInt(params.id, 10);
        if (isNaN(clientId)) {
          notFound();
        }

        // This already handles token checking
        const data = await clientService.getClient(clientId);
        setClient(data);
      } catch (error) {
        console.error('Failed to fetch client:', error);

        // Handle 401 unauthorized by redirecting to login
        const apiError = error as { status?: number };
        if (apiError.status === 401) {
          router.push('/login');
          return;
        }

        setError(error instanceof Error ? error.message : 'Impossible de charger les données du client');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [params.id, router]);

  const handleSubmit = async (updatedClient: Client) => {
    if (!client?.cli_id) return;

    try {
      await clientService.updateClient(client.cli_id, updatedClient);
      router.push('/clients');
    } catch (error) {
      console.error('Failed to update client:', error);
      setError('Une erreur est survenue lors de la mise à jour du client');
      throw error; // Rethrow to let the form component handle specific field errors
    }
  };

  const handleCancel = () => {
    router.push('/clients');
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

  if (error || !client) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-4xl">
            {error || "Client non trouvé"}
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/clients')}
              className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Retour à la liste des clients
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
        <ClientForm
          client={client}
          isEditMode={true}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </>
  );
}
