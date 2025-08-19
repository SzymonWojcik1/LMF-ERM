'use client';

import React, { useState, useEffect } from 'react';
import { Site, Client } from '@/types/models';
import { clientService } from '@/services/clientService';

interface SiteFormProps {
  site?: Partial<Site>;
  isEditMode?: boolean;
  onSubmit: (site: Site) => Promise<void>;
  onCancel: () => void;
  prefilledClient?: Client | null;
}

const defaultSite: Partial<Site> = {
  sit_nom: '',
  sit_heure: '',
  sit_nb_personne: 1,
  sit_statut: 'actif',
  sit_adresse: '',
  sit_npa: undefined,
  sit_ville: '',
};

export default function SiteForm({ site = defaultSite, isEditMode = false, onSubmit, onCancel, prefilledClient }: SiteFormProps) {
  const [formData, setFormData] = useState<Partial<Site>>(site);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await clientService.getClients();
        setClients(clientsData);
        setIsLoading(false);

        // If editing and we have a client_id, fetch the client details
        if (site?.sit_client_id) {
          const clientDetail = clientsData.find(c => c.cli_id === site.sit_client_id);
          if (clientDetail) {
            setSelectedClient(clientDetail);
          }
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [site?.sit_client_id]);

  useEffect(() => {
    setFormData(site);
  }, [site]);

  // Handle prefilled client when provided
  useEffect(() => {
    if (prefilledClient) {
      console.log('Prefilling with client:', prefilledClient);
      setSelectedClient(prefilledClient);
      setFormData(prev => ({
        ...prev,
        sit_client_id: prefilledClient.cli_id
      }));
    }
  }, [prefilledClient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    // Handle numeric values
    if (name === 'sit_nb_personne' || name === 'sit_npa') {
      parsedValue = value === '' ? 0 : Number(value);
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));

    // If changing client, update selectedClient
    if (name === 'sit_client_id') {
      const clientId = Number(value);
      const client = clients.find(c => c.cli_id === clientId);
      setSelectedClient(client || null);
    }

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.sit_client_id) {
      newErrors.sit_client_id = 'Le client est requis';
    }

    if (!formData.sit_nom) {
      newErrors.sit_nom = 'Le nom du site est requis';
    }

    if (!formData.sit_heure) {
      newErrors.sit_heure = 'L\'heure est requise';
    }

    if (!formData.sit_nb_personne) {
      newErrors.sit_nb_personne = 'Le nombre de personnes est requis';
    }

    if (!formData.sit_adresse) {
      newErrors.sit_adresse = 'L\'adresse est requise';
    }

    if (!formData.sit_npa) {
      newErrors.sit_npa = 'Le NPA est requis';
    } else if (!/^\d{4}$/.test(formData.sit_npa?.toString())) {
      newErrors.sit_npa = 'Le NPA doit contenir 4 chiffres';
    }

    if (!formData.sit_ville) {
      newErrors.sit_ville = 'La ville est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user from localStorage
      const userJson = localStorage.getItem('user');
      let userId = null;

      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          console.log('User object from localStorage:', user);
          userId = user.id || user.usr_id || user.user_id || 1;
          console.log('Using user ID:', userId);
        } catch (e) {
          console.error('Failed to parse user from localStorage:', e);
        }
      } else {
        console.log('No user found in localStorage');
      }

      if (!userId) {
        setErrors({ form: 'Utilisateur non authentifié. Veuillez vous reconnecter.' });
        return;
      }

      const completeFormData = {
        ...formData,
        sit_client_id: Number(formData.sit_client_id),
        sit_created_by: isEditMode ? Number(formData.sit_created_by) : Number(userId),
        sit_updated_by: Number(userId)
      };

      console.log('Sending form data to backend:', completeFormData);

      try {
        await onSubmit(completeFormData as Site);
      } catch (submitError) {
        throw submitError;
      }
    } catch (error) {
      console.error('Error in form processing:', error);
      // Handle API errors
      const apiError = error as { data?: { message?: string, errors?: Record<string, string> } };

      // Log the full error
      console.log('Full error object:', apiError);

      if (apiError.data?.errors) {
        setErrors(apiError.data.errors);
      } else if (apiError.data?.message) {
        setErrors({ form: apiError.data.message });
      } else {
        setErrors({ form: 'Une erreur s\'est produite. Veuillez réessayer.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      {errors.form && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errors.form}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Client Selection */}
        <div>
          <label htmlFor="sit_client_id" className="block text-sm font-medium text-gray-700">
            Client *
          </label>
          <select
            id="sit_client_id"
            name="sit_client_id"
            value={formData.sit_client_id || ''}
            onChange={handleChange}
            className={`mt-1 block w-full py-2 px-3 border ${
              errors.sit_client_id ? 'border-red-300' : 'border-gray-300'
            } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            required
          >
            <option value="">Sélectionnez un client</option>
            {clients.map((client) => (
              <option key={client.cli_id} value={client.cli_id}>
                {client.cli_type === 'entreprise'
                  ? client.cli_nom_entreprise
                  : `${client.cli_nom} ${client.cli_prenom}`}
              </option>
            ))}
          </select>
          {errors.sit_client_id && <p className="mt-2 text-sm text-red-600">{errors.sit_client_id}</p>}
        </div>

        {/* Client Details*/}
        {selectedClient && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Détails du client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedClient.cli_type === 'entreprise' ? (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Entreprise:</span>
                    <p className="text-sm">{selectedClient.cli_nom_entreprise}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Nom:</span>
                    <p className="text-sm">{selectedClient.cli_nom}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Prénom:</span>
                    <p className="text-sm">{selectedClient.cli_prenom}</p>
                  </div>
                </>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-sm">{selectedClient.cli_email || '-'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Adresse:</span>
                <p className="text-sm">{selectedClient.cli_adresse || '-'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">NPA:</span>
                <p className="text-sm">{selectedClient.cli_npa || '-'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Ville:</span>
                <p className="text-sm">{selectedClient.cli_ville || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Site Name */}
        <div>
          <label htmlFor="sit_nom" className="block text-sm font-medium text-gray-700">
            Nom du site *
          </label>
          <input
            type="text"
            id="sit_nom"
            name="sit_nom"
            value={formData.sit_nom || ''}
            onChange={handleChange}
            className={`mt-1 block w-full py-2 px-3 border ${
              errors.sit_nom ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            required
          />
          {errors.sit_nom && <p className="mt-2 text-sm text-red-600">{errors.sit_nom}</p>}
        </div>

        {/* Hours */}
        <div>
          <label htmlFor="sit_heure" className="block text-sm font-medium text-gray-700">
            Heure *
          </label>
          <input
            type="text"
            id="sit_heure"
            name="sit_heure"
            value={formData.sit_heure || ''}
            onChange={handleChange}
            placeholder="Nombre d'heures total"
            className={`mt-1 block w-full py-2 px-3 border ${
              errors.sit_heure ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            required
          />
          {errors.sit_heure && <p className="mt-2 text-sm text-red-600">{errors.sit_heure}</p>}
        </div>

        {/* Number of People */}
        <div>
          <label htmlFor="sit_nb_personne" className="block text-sm font-medium text-gray-700">
            Nombre de personnes *
          </label>
          <input
            type="number"
            id="sit_nb_personne"
            name="sit_nb_personne"
            value={formData.sit_nb_personne || ''}
            onChange={handleChange}
            min="1"
            className={`mt-1 block w-full py-2 px-3 border ${
              errors.sit_nb_personne ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            required
          />
          {errors.sit_nb_personne && <p className="mt-2 text-sm text-red-600">{errors.sit_nb_personne}</p>}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="sit_statut" className="block text-sm font-medium text-gray-700">
            Statut *
          </label>
          <select
            id="sit_statut"
            name="sit_statut"
            value={formData.sit_statut || 'actif'}
            onChange={handleChange}
            className={`mt-1 block w-full py-2 px-3 border ${
              errors.sit_statut ? 'border-red-300' : 'border-gray-300'
            } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            required
          >
            <option value="actif">Actif</option>
            <option value="terminé">Terminé</option>
          </select>
          {errors.sit_statut && <p className="mt-2 text-sm text-red-600">{errors.sit_statut}</p>}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="sit_adresse" className="block text-sm font-medium text-gray-700">
            Adresse *
          </label>
          <input
            type="text"
            id="sit_adresse"
            name="sit_adresse"
            value={formData.sit_adresse || ''}
            onChange={handleChange}
            className={`mt-1 block w-full py-2 px-3 border ${
              errors.sit_adresse ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            required
          />
          {errors.sit_adresse && <p className="mt-2 text-sm text-red-600">{errors.sit_adresse}</p>}
        </div>

        {/* NPA */}
        <div>
          <label htmlFor="sit_npa" className="block text-sm font-medium text-gray-700">
            NPA *
          </label>
          <input
            type="number"
            id="sit_npa"
            name="sit_npa"
            value={formData.sit_npa || ''}
            onChange={handleChange}
            className={`mt-1 block w-full py-2 px-3 border ${
              errors.sit_npa ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            required
          />
          {errors.sit_npa && <p className="mt-2 text-sm text-red-600">{errors.sit_npa}</p>}
        </div>

        {/* City */}
        <div>
          <label htmlFor="sit_ville" className="block text-sm font-medium text-gray-700">
            Ville *
          </label>
          <input
            type="text"
            id="sit_ville"
            name="sit_ville"
            value={formData.sit_ville || ''}
            onChange={handleChange}
            className={`mt-1 block w-full py-2 px-3 border ${
              errors.sit_ville ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            required
          />
          {errors.sit_ville && <p className="mt-2 text-sm text-red-600">{errors.sit_ville}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enregistrement...' : isEditMode ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}
