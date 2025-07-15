'use client';

import { useState, useEffect } from 'react';
// import Link from 'next/link';
import { deleteClient } from '@/services/clientService';
import Navbar from '@/components/Navbar';

interface Client {
  cli_id: number;
  cli_type: 'particulier' | 'entreprise';
  cli_nom_entreprise: string | null;
  cli_nom: string | null;
  cli_prenom: string | null;
  cli_email: string | null;
  cli_adresse: string | null;
  cli_npa: number;
  cli_ville: string;
}

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

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_URL}/clients`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des clients');
        }

        const data = await response.json();
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
  const displayValue = (value: string | null) => value || '-';

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
            <div className="grid grid-cols-5 bg-gray-200 font-semibold p-4">
              <div>Type</div>
              <div>Nom Entreprise</div>
              <div>Nom</div>
              <div>Prénom</div>
              <div className="text-center">Actions</div>
            </div>

            {/* Table Content */}
            {clients.length > 0 ? (
              clients.map((client) => (
                <div key={client.cli_id} className="grid grid-cols-5 p-4 border-b border-gray-200">
                  <div>{formatClientType(client.cli_type)}</div>
                  <div>{displayValue(client.cli_nom_entreprise)}</div>
                  <div>{displayValue(client.cli_nom)}</div>
                  <div>{displayValue(client.cli_prenom)}</div>
                  <div className="flex justify-center space-x-2">
                    <a
                      href={`/clients/edit/${client.cli_id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Modifier
                    </a>
                    <button
                    onClick={async () => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer '+client.cli_nom+' '+client.cli_prenom+' '+ client.cli_nom_entreprise+ ' ?')) {
                        try {
                          await deleteClient(client.cli_id);
                          setClients(clients.filter((c) => c.cli_id !== client.cli_id));
                        } catch (err) {
                          console.error('Failed to delete client:', err);
                          setError('Une erreur est survenue lors de la suppression du client');
                        }
                      }
                    }}
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
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
              <a
              href="/clients/new"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-center">
                Créer un nouveau client
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
