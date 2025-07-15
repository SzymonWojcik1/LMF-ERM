'use client';

import React, { useState, useEffect } from 'react';
import { Client } from '@/services/clientService';

interface ClientFormProps {
  client?: Client;
  isEditMode?: boolean;
  onSubmit: (client: Client) => Promise<void>;
  onCancel: () => void;
}

const defaultClient: Client = {
  cli_type: 'particulier',
  cli_nom_entreprise: '',
  cli_nom: '',
  cli_prenom: '',
  cli_email: '',
  cli_adresse: '',
  cli_npa: '',
  cli_ville: '',
};

export default function ClientForm({ client = defaultClient, isEditMode = false, onSubmit, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState<Client>(client);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(client);
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

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
    if (!formData.cli_type) {
      newErrors.cli_type = 'Le type de client est requis';
    }

    if (formData.cli_type === 'entreprise' && !formData.cli_nom_entreprise) {
      newErrors.cli_nom_entreprise = 'Le nom d&apos;entreprise est requis pour un client entreprise';
    }

    if (formData.cli_type === 'particulier' && !formData.cli_nom) {
      newErrors.cli_nom = 'Le nom est requis pour un client particulier';
    }

    if (formData.cli_type === 'particulier' && !formData.cli_prenom) {
      newErrors.cli_prenom = 'Le prénom est requis pour un client particulier';
    }

    if (!formData.cli_npa) {
      newErrors.cli_npa = 'Le NPA est requis';
    } else if (!/^\d{4}$/.test(formData.cli_npa)) {
      newErrors.cli_npa = 'Le NPA doit contenir 4 chiffres';
    }

    if (!formData.cli_ville) {
      newErrors.cli_ville = 'La ville est requise';
    }

    if (formData.cli_email && !/\S+@\S+\.\S+/.test(formData.cli_email)) {
      newErrors.cli_email = 'L&apos;adresse e-mail n&apos;est pas valide';
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle API errors - assuming the API returns errors in a specific format
      const apiError = error as { response?: { data?: { errors?: Record<string, string> } } };
      if (apiError.response?.data?.errors) {
        setErrors(apiError.response.data.errors);
      } else {
        setErrors({ form: 'Une erreur est survenue lors de l\'enregistrement du client' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 p-8 rounded-md shadow max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {isEditMode ? 'Modifier le client' : 'Créer un client'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type */}
        <div>
          <label htmlFor="cli_type" className="block text-gray-700 font-medium mb-1">Type</label>
          <select
            id="cli_type"
            name="cli_type"
            value={formData.cli_type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="particulier">Particulier</option>
            <option value="entreprise">Entreprise</option>
          </select>
          {errors.cli_type && <p className="text-red-500 text-sm mt-1">{errors.cli_type}</p>}
        </div>

        {/* Nom d'entreprise - only show if type is 'entreprise' */}
        {formData.cli_type === 'entreprise' && (
          <div>
            <label htmlFor="cli_nom_entreprise" className="block text-gray-700 font-medium mb-1">Nom d&apos;entreprise</label>
            <input
              type="text"
              id="cli_nom_entreprise"
              name="cli_nom_entreprise"
              value={formData.cli_nom_entreprise || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entreprise"
            />
            {errors.cli_nom_entreprise && <p className="text-red-500 text-sm mt-1">{errors.cli_nom_entreprise}</p>}
          </div>
        )}

        {/* Nom */}
        <div>
          <label htmlFor="cli_nom" className="block text-gray-700 font-medium mb-1">Nom</label>
          <input
            type="text"
            id="cli_nom"
            name="cli_nom"
            value={formData.cli_nom || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nom"
          />
          {errors.cli_nom && <p className="text-red-500 text-sm mt-1">{errors.cli_nom}</p>}
        </div>

        {/* Prénom */}
        <div>
          <label htmlFor="cli_prenom" className="block text-gray-700 font-medium mb-1">Prénom</label>
          <input
            type="text"
            id="cli_prenom"
            name="cli_prenom"
            value={formData.cli_prenom || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Prénom"
          />
          {errors.cli_prenom && <p className="text-red-500 text-sm mt-1">{errors.cli_prenom}</p>}
        </div>

        {/* E-Mail */}
        <div>
          <label htmlFor="cli_email" className="block text-gray-700 font-medium mb-1">E-Mail</label>
          <input
            type="email"
            id="cli_email"
            name="cli_email"
            value={formData.cli_email || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="email@mail.com"
          />
          {errors.cli_email && <p className="text-red-500 text-sm mt-1">{errors.cli_email}</p>}
        </div>

        {/* Adresse */}
        <div>
          <label htmlFor="cli_adresse" className="block text-gray-700 font-medium mb-1">Adresse</label>
          <input
            type="text"
            id="cli_adresse"
            name="cli_adresse"
            value={formData.cli_adresse || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="22 Avenue Rive"
          />
          {errors.cli_adresse && <p className="text-red-500 text-sm mt-1">{errors.cli_adresse}</p>}
        </div>

        {/* NPA */}
        <div>
          <label htmlFor="cli_npa" className="block text-gray-700 font-medium mb-1">NPA</label>
          <input
            type="text"
            id="cli_npa"
            name="cli_npa"
            value={formData.cli_npa || ''}
            onChange={handleChange}
            maxLength={4}
            pattern="[0-9]{4}"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1200"
          />
          {errors.cli_npa && <p className="text-red-500 text-sm mt-1">{errors.cli_npa}</p>}
        </div>

        {/* Ville */}
        <div>
          <label htmlFor="cli_ville" className="block text-gray-700 font-medium mb-1">Ville</label>
          <input
            type="text"
            id="cli_ville"
            name="cli_ville"
            value={formData.cli_ville || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Genève"
          />
          {errors.cli_ville && <p className="text-red-500 text-sm mt-1">{errors.cli_ville}</p>}
        </div>

        {/* General form error message */}
        {errors.form && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errors.form}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
            disabled={isSubmitting}
          >
            Annuler la création de client
          </button>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Traitement en cours...'
              : isEditMode
                ? 'Mettre à jour le client'
                : 'Créer le client'}
          </button>
        </div>
      </form>
    </div>
  );
}
