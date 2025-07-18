'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { clientService, deleteClient } from '@/services/clientService';
import { Client } from '@/types/models';
import Navbar from '@/components/Navbar';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const data = await clientService.getClients();
        setClients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error('Error fetching clients:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Helper function to display value or dash
  const displayValue = (value: string | null | undefined) => value || '-';

  // Helper function to format client type for display
  const formatClientType = (type: string) => {
    if (type === 'entreprise') return 'Entreprise';
    if (type === 'particulier') return 'Individuel';
    return type;
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Clients</h1>

        {isLoading ? (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-4xl">
            <p>{error}</p>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg shadow-sm w-full max-w-4xl">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-gray-200 font-semibold p-4">
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Nom Entreprise</div>
              <div className="col-span-2">Nom</div>
              <div className="col-span-2">Prénom</div>
              <div className="col-span-3 text-center">Actions</div>
            </div>

            {/* Table Content */}
            {clients.length > 0 ? (
              clients.map((client) => (
                <div key={client.cli_id} className="grid grid-cols-12 p-4 border-b border-gray-200">
                  <div className="col-span-2">{formatClientType(client.cli_type)}</div>
                  <div className="col-span-3">{displayValue(client.cli_nom_entreprise)}</div>
                  <div className="col-span-2">{displayValue(client.cli_nom)}</div>
                  <div className="col-span-2">{displayValue(client.cli_prenom)}</div>
                  <div className="col-span-3 flex justify-center items-center space-x-2">
                    <Link
                      href={client.cli_id ? `/clients/${client.cli_id}` : '#'}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm text-center min-w-[80px]"
                    >
                      Voir
                    </Link>
                    <Link
                      href={client.cli_id ? `/clients/edit/${client.cli_id}` : '#'}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm text-center min-w-[80px]"
                    >
                      Modifier
                    </Link>
                    <button
                    onClick={async () => {
                      const clientName = [client.cli_nom, client.cli_prenom, client.cli_nom_entreprise]
                        .filter(Boolean)
                        .join(' ');

                      if (!client.cli_id) {
                        setError("Impossible de supprimer ce client (ID manquant)");
                        return;
                      }

                      if (confirm(`Êtes-vous sûr de vouloir supprimer ${clientName} ?`)) {
                        try {
                          await deleteClient(client.cli_id);
                          setClients(clients.filter((c) => c.cli_id !== client.cli_id));
                        } catch (err) {
                          console.error('Failed to delete client:', err);
                          const error = err as {data?: {message?: string}, status?: number};
                          if (error.data && error.data.message) {
                            setError(`Erreur: ${error.data.message}`);
                          } else {
                            setError('Une erreur est survenue lors de la suppression du client');
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
                Aucun client trouvé
              </div>
            )}

            {/* Add New Client Button */}
            <div className="p-4 flex justify-center">
              <Link
              href="/clients/new"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-center w-[264px]">
                Créer un nouveau client
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
