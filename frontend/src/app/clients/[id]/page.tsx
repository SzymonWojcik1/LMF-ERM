'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clientService } from '@/services/clientService';
import { Client } from '@/types/models';
import Navbar from '@/components/Navbar';


export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const clientData = await clientService.getClient(parseInt(params.id));
        setClient(clientData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement du client');
        console.error('Error fetching client details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientDetails();
  }, [params.id, router]);

  const handleEdit = () => {
    router.push(`/clients/edit/${params.id}`);
  };

  const handleDelete = async () => {
    if (!client) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      return;
    }

    try {
      await clientService.deleteClient(parseInt(params.id));
      router.push('/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression');
      console.error('Error deleting client:', err);
    }
  };

  const handleReturn = () => {
    router.push('/clients');
  };

  // Helper function to display value or dash
  const displayValue = (value: string | null | undefined) => value || '-';

  // Helper function to format client type for display
  const formatClientType = (type: string | undefined) => {
    if (type === 'entreprise') return 'Entreprise';
    if (type === 'particulier') return 'Individuel';
    return type;
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Détails du Client</h1>

        {isLoading ? (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-4xl">
            <p>{error}</p>
          </div>
        ) : client ? (
          <div className="bg-white rounded-lg shadow-md w-full max-w-2xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Informations du client</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="font-medium">Type:</div>
                <div>{formatClientType(client.cli_type)}</div>

                {client.cli_type === 'entreprise' && (
                  <>
                    <div className="font-medium">Nom de l&apos;entreprise:</div>
                    <div>{displayValue(client.cli_nom_entreprise)}</div>
                  </>
                )}

                <div className="font-medium">Nom:</div>
                <div>{displayValue(client.cli_nom)}</div>

                <div className="font-medium">Prénom:</div>
                <div>{displayValue(client.cli_prenom)}</div>

                <div className="font-medium">Email:</div>
                <div>{displayValue(client.cli_email)}</div>

                <div className="font-medium">Adresse:</div>
                <div>{displayValue(client.cli_adresse)}</div>

                <div className="font-medium">NPA:</div>
                <div>{client.cli_npa}</div>

                <div className="font-medium">Ville:</div>
                <div>{client.cli_ville}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Modifier le client
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Supprimer le client
              </button>
              <button
                onClick={() => router.push(`/sites/new?clientId=${params.id}`)}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Créer un site
              </button>
            </div>

            <button
              onClick={handleReturn}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Retourner sur les clients
            </button>
          </div>
        ) : (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 w-full max-w-4xl">
            <p>Client introuvable</p>
          </div>
        )}
      </div>
    </>
  );
}