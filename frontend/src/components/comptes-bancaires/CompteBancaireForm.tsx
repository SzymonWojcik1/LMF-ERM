'use client';

import React, { useState, useEffect } from 'react';
import { CompteBancaire } from '@/types/models';

interface CompteBancaireFormProps {
  compteBancaire?: CompteBancaire;
  isEditMode?: boolean;
  onSubmit: (compteBancaire: CompteBancaire) => Promise<void>;
  onCancel: () => void;
}

const defaultCompteBancaire: CompteBancaire = {
  ban_nom_affichage: '',
  ban_banque: '',
  ban_devise: 'CHF',
  ban_iban: '',
  ban_adresse: '',
  ban_numero_batiment: 0,
  ban_ville: '',
  ban_pays: 'CH',
  ban_nom_entreprise: '',
  ban_npa: 0,
  ban_actif: true,
};

export default function CompteBancaireForm({
  compteBancaire = defaultCompteBancaire,
  isEditMode = false,
  onSubmit,
  onCancel
}: CompteBancaireFormProps) {
  const [formData, setFormData] = useState<CompteBancaire>(compteBancaire);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Format IBAN for display when loading existing data
    const formattedData = {
      ...compteBancaire,
      ban_iban: compteBancaire.ban_iban ? formatIban(compteBancaire.ban_iban) : ''
    };
    setFormData(formattedData);
  }, [compteBancaire]);

  // Function to format IBAN with spaces every 4 characters
  const formatIban = (value: string): string => {
    // Remove all spaces and convert to uppercase
    const cleanValue = value.replace(/\s/g, '').toUpperCase();
    // Limit to maximum 34 characters
    const limitedValue = cleanValue.substring(0, 34);
    // Add spaces every 4 characters
    return limitedValue.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'ban_numero_batiment' || name === 'ban_npa') {
      const numValue = parseInt(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else if (name === 'ban_iban') {
      // Format IBAN with spaces as user types
      const formattedIban = formatIban(value);
      setFormData(prev => ({ ...prev, [name]: formattedIban }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

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

    if (!formData.ban_nom_affichage) {
      newErrors.ban_nom_affichage = 'Le nom d\'affichage est requis';
    }

    if (!formData.ban_banque) {
      newErrors.ban_banque = 'Le nom de la banque est requis';
    }

    if (!formData.ban_devise) {
      newErrors.ban_devise = 'La devise est requise';
    }

    if (!formData.ban_iban) {
      newErrors.ban_iban = 'L\'IBAN est requis';
    } else if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/.test(formData.ban_iban.replace(/\s/g, ''))) {
      newErrors.ban_iban = 'L\'IBAN n\'est pas valide';
    }

    if (!formData.ban_adresse) {
      newErrors.ban_adresse = 'L\'adresse est requise';
    }

    if (!formData.ban_numero_batiment || formData.ban_numero_batiment <= 0) {
      newErrors.ban_numero_batiment = 'Le numéro de bâtiment est requis';
    }

    if (!formData.ban_ville) {
      newErrors.ban_ville = 'La ville est requise';
    }

    if (!formData.ban_pays) {
      newErrors.ban_pays = 'Le pays est requis';
    }

    if (!formData.ban_nom_entreprise) {
      newErrors.ban_nom_entreprise = 'Le nom de l\'entreprise est requis';
    }

    if (!formData.ban_npa || formData.ban_npa <= 0) {
      newErrors.ban_npa = 'Le NPA est requis';
    } else if (!/^\d{4}$/.test(formData.ban_npa.toString())) {
      newErrors.ban_npa = 'Le NPA doit contenir 4 chiffres';
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
      // Clean IBAN (remove spaces) before submitting
      const cleanedFormData = {
        ...formData,
        ban_iban: formData.ban_iban.replace(/\s/g, ''),
      };
      await onSubmit(cleanedFormData);
    } catch (error) {
      console.error('Error submitting form:', error);
      const apiError = error as { response?: { data?: { errors?: Record<string, string> } } };
      if (apiError.response?.data?.errors) {
        setErrors(apiError.response.data.errors);
      } else {
        setErrors({ form: 'Une erreur est survenue lors de l\'enregistrement du compte bancaire' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 p-8 rounded-md shadow max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {isEditMode ? 'Modifier le compte bancaire' : 'Créer un compte bancaire'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom d'affichage */}
        <div>
          <label htmlFor="ban_nom_affichage" className="block text-gray-700 font-medium mb-1">Nom d&apos;affichage</label>
          <input
            type="text"
            id="ban_nom_affichage"
            name="ban_nom_affichage"
            value={formData.ban_nom_affichage || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Compte principal UBS"
          />
          {errors.ban_nom_affichage && <p className="text-red-500 text-sm mt-1">{errors.ban_nom_affichage}</p>}
        </div>

        {/* Banque */}
        <div>
          <label htmlFor="ban_banque" className="block text-gray-700 font-medium mb-1">Banque</label>
          <input
            type="text"
            id="ban_banque"
            name="ban_banque"
            value={formData.ban_banque || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="UBS SA"
          />
          {errors.ban_banque && <p className="text-red-500 text-sm mt-1">{errors.ban_banque}</p>}
        </div>

        {/* Devise */}
        <div>
          <label htmlFor="ban_devise" className="block text-gray-700 font-medium mb-1">Devise</label>
          <select
            id="ban_devise"
            name="ban_devise"
            value={formData.ban_devise}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="CHF">CHF</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
          {errors.ban_devise && <p className="text-red-500 text-sm mt-1">{errors.ban_devise}</p>}
        </div>

        {/* IBAN */}
        <div>
          <label htmlFor="ban_iban" className="block text-gray-700 font-medium mb-1">IBAN</label>
          <input
            type="text"
            id="ban_iban"
            name="ban_iban"
            value={formData.ban_iban || ''}
            onChange={handleChange}
            maxLength={42}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="CH93 0076 2011 6238 5295 7"
          />
          {errors.ban_iban && <p className="text-red-500 text-sm mt-1">{errors.ban_iban}</p>}
        </div>

        {/* Adresse */}
        <div>
          <label htmlFor="ban_adresse" className="block text-gray-700 font-medium mb-1">Adresse</label>
          <input
            type="text"
            id="ban_adresse"
            name="ban_adresse"
            value={formData.ban_adresse || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Rue du Commerce"
          />
          {errors.ban_adresse && <p className="text-red-500 text-sm mt-1">{errors.ban_adresse}</p>}
        </div>

        {/* Numéro de bâtiment */}
        <div>
          <label htmlFor="ban_numero_batiment" className="block text-gray-700 font-medium mb-1">Numéro de bâtiment</label>
          <input
            type="number"
            id="ban_numero_batiment"
            name="ban_numero_batiment"
            value={formData.ban_numero_batiment || ''}
            onChange={handleChange}
            min="1"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="22"
          />
          {errors.ban_numero_batiment && <p className="text-red-500 text-sm mt-1">{errors.ban_numero_batiment}</p>}
        </div>

        {/* Ville */}
        <div>
          <label htmlFor="ban_ville" className="block text-gray-700 font-medium mb-1">Ville</label>
          <input
            type="text"
            id="ban_ville"
            name="ban_ville"
            value={formData.ban_ville || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Genève"
          />
          {errors.ban_ville && <p className="text-red-500 text-sm mt-1">{errors.ban_ville}</p>}
        </div>

        {/* NPA */}
        <div>
          <label htmlFor="ban_npa" className="block text-gray-700 font-medium mb-1">NPA</label>
          <input
            type="number"
            id="ban_npa"
            name="ban_npa"
            value={formData.ban_npa || ''}
            onChange={handleChange}
            min="1000"
            max="9999"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1200"
          />
          {errors.ban_npa && <p className="text-red-500 text-sm mt-1">{errors.ban_npa}</p>}
        </div>

        {/* Pays */}
        <div>
          <label htmlFor="ban_pays" className="block text-gray-700 font-medium mb-1">Pays</label>
          <select
            id="ban_pays"
            name="ban_pays"
            value={formData.ban_pays}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="CH">Suisse</option>
            <option value="FR">France</option>
            <option value="DE">Allemagne</option>
            <option value="IT">Italie</option>
            <option value="AT">Autriche</option>
          </select>
          {errors.ban_pays && <p className="text-red-500 text-sm mt-1">{errors.ban_pays}</p>}
        </div>

        {/* Nom de l'entreprise */}
        <div>
          <label htmlFor="ban_nom_entreprise" className="block text-gray-700 font-medium mb-1">Nom de l&apos;entreprise</label>
          <input
            type="text"
            id="ban_nom_entreprise"
            name="ban_nom_entreprise"
            value={formData.ban_nom_entreprise || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="LMF Services Sàrl"
          />
          {errors.ban_nom_entreprise && <p className="text-red-500 text-sm mt-1">{errors.ban_nom_entreprise}</p>}
        </div>

        {/* Statut actif */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="ban_actif"
              checked={formData.ban_actif}
              onChange={(e) => setFormData(prev => ({ ...prev, ban_actif: e.target.checked }))}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="text-gray-700 font-medium">Compte actif</span>
          </label>
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
            Annuler la création de compte bancaire
          </button>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Traitement en cours...'
              : isEditMode
                ? 'Mettre à jour le compte bancaire'
                : 'Créer le compte bancaire'}
          </button>
        </div>
      </form>
    </div>
  );
}
