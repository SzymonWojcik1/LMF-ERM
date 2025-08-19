'use client';

import React, { useState, useEffect } from 'react';
import { CompteBancaire, Site, Client } from '@/types/models';
import { compteBancaireService } from '@/services/compteBancaireService';
import { siteService } from '@/services/siteService';
import { clientService } from '@/services/clientService';

interface FactureItem {
  id: string;
  position: string;
  heures: string;
  designation: string;
  prixHeure: number;
  total: number;
}

interface FactureData {
  // Invoice basic info
  numeroFacture: string;
  dateFacture: string;

  // Creditor
  creditorName: string;
  creditorAddress: string;
  creditorBuildingNumber: number;
  creditorCity: string;
  creditorZip: number;
  creditorCountry: string;
  creditorAccount: string;

  // Debtor
  debtorName: string;
  debtorAddress: string;
  debtorBuildingNumber: number;
  debtorCity: string;
  debtorZip: number;
  debtorCountry: string;

  // Invoice details
  currency: string;
  items: FactureItem[];
  montantHT: number;
  tva: number;
  montantTTC: number;
  reference: string;

  // Optional fields
  proRata: number;
  rabais: number;
  showProRataRabais: boolean;
}

interface FactureFormProps {
  facture?: FactureData;
  isEditMode?: boolean;
  onSubmit: (facture: FactureData) => Promise<void>;
  onCancel: () => void;
}

const defaultFacture: FactureData = {
  numeroFacture: '',
  dateFacture: new Date().toISOString().split('T')[0],

  creditorName: '',
  creditorAddress: '',
  creditorBuildingNumber: 0,
  creditorCity: '',
  creditorZip: 0,
  creditorCountry: 'CH',
  creditorAccount: '',

  debtorName: '',
  debtorAddress: '',
  debtorBuildingNumber: 0,
  debtorCity: '',
  debtorZip: 0,
  debtorCountry: 'CH',

  currency: 'CHF',
  items: [],
  montantHT: 0,
  tva: 8.1,
  montantTTC: 0,
  reference: '',

  // Optional fields
  proRata: 0,
  rabais: 0,
  showProRataRabais: false,
};

export default function FactureForm({
  facture = defaultFacture,
  isEditMode = false,
  onSubmit,
  onCancel
}: FactureFormProps) {
  const [formData, setFormData] = useState<FactureData>(facture);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compteBancaires, setCompteBancaires] = useState<CompteBancaire[]>([]);
  const [selectedCompteId, setSelectedCompteId] = useState<string>('');
  const [loadingComptes, setLoadingComptes] = useState(true);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [loadingSites, setLoadingSites] = useState(true);

  useEffect(() => {
    const loadCompteBancaires = async () => {
      try {
        const comptes = await compteBancaireService.getComptesBancaires();
        // Filter active accounts with valid IBANs
        const validComptes = comptes.filter(compte =>
          compte.ban_actif && validateIBAN(compte.ban_iban)
        );
        setCompteBancaires(validComptes);
        setLoadingComptes(false);

        // Log invalid accounts for debugging
        const invalidComptes = comptes.filter(compte =>
          compte.ban_actif && !validateIBAN(compte.ban_iban)
        );
        if (invalidComptes.length > 0) {
          console.warn('Found bank accounts with invalid IBANs:', invalidComptes.map(c => ({
            id: c.ban_id,
            name: c.ban_nom_affichage,
            iban: c.ban_iban
          })));
        }
      } catch (error) {
        console.error('Failed to load bank accounts:', error);
        setLoadingComptes(false);
      }
    };

    loadCompteBancaires();
  }, []);

  // Load sites on component mount
  useEffect(() => {
    const loadSites = async () => {
      try {
        const sitesData = await siteService.getSites();
        // Only show active sites
        const activeSites = sitesData.filter(site => site.sit_statut === 'actif');
        setSites(activeSites);
        setLoadingSites(false);
      } catch (error) {
        console.error('Failed to load sites:', error);
        setLoadingSites(false);
      }
    };

    loadSites();
  }, []);

  // Generate unique ID for new items
  const generateItemId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle bank account selection
  const handleBankAccountSelect = (compteBancaireId: string) => {
    setSelectedCompteId(compteBancaireId);

    if (compteBancaireId) {
      const selectedCompte = compteBancaires.find(compte => compte.ban_id?.toString() === compteBancaireId);
      if (selectedCompte) {
        setFormData(prev => ({
          ...prev,
          creditorAccount: selectedCompte.ban_iban,
          creditorName: selectedCompte.ban_nom_entreprise,
          creditorAddress: selectedCompte.ban_adresse,
          creditorBuildingNumber: selectedCompte.ban_numero_batiment,
          creditorCity: selectedCompte.ban_ville,
          creditorZip: selectedCompte.ban_npa,
          creditorCountry: selectedCompte.ban_pays,
        }));
      }
    }
  };

  // Handle site selection
  const handleSiteSelect = (siteId: string) => {
    setSelectedSiteId(siteId);

    if (siteId) {
      const selectedSite = sites.find(site => site.sit_id?.toString() === siteId);
      if (selectedSite) {
        // Get client information from the site's client relationship
        const client = selectedSite.client;

        // Determine the debtor name based on client type
        let debtorName = '';
        if (client) {
          if (client.cli_type === 'entreprise') {
            debtorName = client.cli_nom_entreprise || '';
          } else {
            debtorName = `${client.cli_prenom || ''} ${client.cli_nom || ''}`.trim();
          }
        }

        setFormData(prev => ({
          ...prev,
          debtorName: debtorName,
          debtorAddress: selectedSite.sit_adresse,
          debtorBuildingNumber: 0, // Sites don't have building numbers typically
          debtorCity: selectedSite.sit_ville || '',
          debtorZip: selectedSite.sit_npa || 0,
          debtorCountry: 'CH', // Default to Switzerland
        }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'creditorBuildingNumber' || name === 'creditorZip' || name === 'debtorBuildingNumber' || name === 'debtorZip') {
      const numValue = parseInt(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else if (name === 'tva' || name === 'proRata' || name === 'rabais') {
      const numValue = parseFloat(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
      calculateTotals();
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleItemChange = (itemId: string, field: keyof FactureItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };

          // Auto-calculate total when heures or prixHeure changes
          if (field === 'heures' || field === 'prixHeure') {
            const heures = field === 'heures' ? parseFloat(value.toString()) || 0 : parseFloat(item.heures) || 0;
            const prix = field === 'prixHeure' ? parseFloat(value.toString()) || 0 : item.prixHeure;
            updatedItem.total = heures * prix;
          }

          return updatedItem;
        }
        return item;
      })
    }));

    // Recalculate totals after item change
    setTimeout(calculateTotals, 0);
  };

  const addItem = () => {
    const newItem: FactureItem = {
      id: generateItemId(),
      position: '•',
      heures: '',
      designation: '',
      prixHeure: 35.00,
      total: 0
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
    setTimeout(calculateTotals, 0);
  };

  const calculateTotals = () => {
    setFormData(prev => {
      let montantHT = prev.items.reduce((sum, item) => sum + item.total, 0);

      // Apply pro rata discount if specified (subtract percentage)
      if (prev.proRata > 0) {
        montantHT = montantHT - (montantHT * (prev.proRata / 100));
      }

      // Apply rabais (discount) if specified (subtract percentage)
      if (prev.rabais > 0) {
        montantHT = montantHT - (montantHT * (prev.rabais / 100));
      }

      const montantTVA = montantHT * (prev.tva / 100);
      const montantTTC = montantHT + montantTVA;

      return {
        ...prev,
        montantHT,
        montantTTC
      };
    });
  };

  // Simple IBAN validation for Swiss IBANs
  const validateIBAN = (iban: string): boolean => {
    // Remove spaces and convert to uppercase
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();

    // Check if it's a Swiss IBAN (starts with CH and is 21 characters)
    if (!cleanIban.startsWith('CH') || cleanIban.length !== 21) {
      return false;
    }

    // Basic format check: CH + 2 digits + 17 alphanumeric characters
    const pattern = /^CH\d{2}[A-Z0-9]{17}$/;
    if (!pattern.test(cleanIban)) {
      return false;
    }

    // Basic IBAN checksum validation (simplified)
    try {
      // Move the first 4 characters to the end
      const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);

      // Replace letters with numbers (A=10, B=11, ..., Z=35)
      let numString = '';
      for (let char of rearranged) {
        if (char >= 'A' && char <= 'Z') {
          numString += (char.charCodeAt(0) - 55).toString();
        } else {
          numString += char;
        }
      }

      // Calculate mod 97
      let remainder = 0;
      for (let i = 0; i < numString.length; i++) {
        remainder = (remainder * 10 + parseInt(numString[i])) % 97;
      }

      return remainder === 1;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.numeroFacture) {
      newErrors.numeroFacture = 'Le numéro de facture est requis';
    }

    if (!formData.dateFacture) {
      newErrors.dateFacture = 'La date de facture est requise';
    }

    if (!formData.creditorAccount || !selectedCompteId) {
      newErrors.creditorAccount = 'Veuillez sélectionner un compte bancaire';
    } else if (!validateIBAN(formData.creditorAccount)) {
      newErrors.creditorAccount = 'L\'IBAN n\'est pas valide (format: CH + 2 chiffres + 17 caractères)';
    }

    if (!selectedSiteId) {
      newErrors.debtorName = 'Veuillez sélectionner un site';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Au moins un élément de facture est requis';
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
      setErrors({ form: 'Une erreur est survenue lors de l\'enregistrement de la facture' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 p-8 rounded-md shadow max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {isEditMode ? 'Modifier la facture' : 'Créer une facture'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Invoice Basic Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Informations de base</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="numeroFacture" className="block text-gray-700 font-medium mb-1">Numéro de facture</label>
              <input
                type="text"
                id="numeroFacture"
                name="numeroFacture"
                value={formData.numeroFacture}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="N.010111"
              />
              {errors.numeroFacture && <p className="text-red-500 text-sm mt-1">{errors.numeroFacture}</p>}
            </div>

            <div>
              <label htmlFor="dateFacture" className="block text-gray-700 font-medium mb-1">Date de facture</label>
              <input
                type="date"
                id="dateFacture"
                name="dateFacture"
                value={formData.dateFacture}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.dateFacture && <p className="text-red-500 text-sm mt-1">{errors.dateFacture}</p>}
            </div>
          </div>
        </div>

        {/* Creditor Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Informations créancier (LMF Services)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="creditorName" className="block text-gray-700 font-medium mb-1">Nom</label>
              <input
                type="text"
                id="creditorName"
                name="creditorName"
                value={formData.creditorName}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                placeholder="Sélectionnez un compte bancaire"
              />
            </div>

            <div>
              <label htmlFor="creditorAddress" className="block text-gray-700 font-medium mb-1">Adresse</label>
              <input
                type="text"
                id="creditorAddress"
                name="creditorAddress"
                value={formData.creditorAddress}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                placeholder="Sélectionnez un compte bancaire"
              />
            </div>

            <div>
              <label htmlFor="creditorBuildingNumber" className="block text-gray-700 font-medium mb-1">Numéro</label>
              <input
                type="number"
                id="creditorBuildingNumber"
                name="creditorBuildingNumber"
                value={formData.creditorBuildingNumber || ''}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                placeholder="Auto"
              />
            </div>

            <div>
              <label htmlFor="creditorZip" className="block text-gray-700 font-medium mb-1">NPA</label>
              <input
                type="number"
                id="creditorZip"
                name="creditorZip"
                value={formData.creditorZip || ''}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                placeholder="Auto"
              />
            </div>

            <div>
              <label htmlFor="creditorCity" className="block text-gray-700 font-medium mb-1">Ville</label>
              <input
                type="text"
                id="creditorCity"
                name="creditorCity"
                value={formData.creditorCity}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                placeholder="Sélectionnez un compte bancaire"
              />
            </div>

            <div>
              <label htmlFor="compteBancaire" className="block text-gray-700 font-medium mb-1">Compte bancaire</label>
              {loadingComptes ? (
                <div className="w-full border border-gray-300 rounded px-3 py-2 text-gray-500">
                  Chargement des comptes bancaires...
                </div>
              ) : compteBancaires.length === 0 ? (
                <div className="w-full border border-red-300 rounded px-3 py-2 bg-red-50 text-red-700">
                  Aucun compte bancaire valide trouvé. Veuillez créer un compte bancaire avec un IBAN valide.
                </div>
              ) : (
                <select
                  id="compteBancaire"
                  name="compteBancaire"
                  value={selectedCompteId}
                  onChange={(e) => handleBankAccountSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un compte bancaire</option>
                  {compteBancaires.map((compte) => (
                    <option key={compte.ban_id} value={compte.ban_id?.toString()}>
                      {compte.ban_nom_affichage} - {compte.ban_iban}
                    </option>
                  ))}
                </select>
              )}
              {errors.creditorAccount && <p className="text-red-500 text-sm mt-1">{errors.creditorAccount}</p>}

              {/* Show selected account details */}
              {selectedCompteId && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <strong>IBAN:</strong> {formData.creditorAccount}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Debtor Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Informations client (Débiteur)</h2>

          {/* Site Selection */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <label htmlFor="siteSelector" className="block text-gray-700 font-medium mb-2">
              Sélectionner un site (chantier)
            </label>
            {loadingSites ? (
              <div className="w-full border border-gray-300 rounded px-3 py-2 text-gray-500">
                Chargement des sites...
              </div>
            ) : sites.length === 0 ? (
              <div className="w-full border border-yellow-300 rounded px-3 py-2 bg-yellow-50 text-yellow-700">
                Aucun site actif trouvé. Veuillez créer un site pour pouvoir facturer.
              </div>
            ) : (
              <select
                id="siteSelector"
                name="siteSelector"
                value={selectedSiteId}
                onChange={(e) => handleSiteSelect(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un site</option>
                {sites.map((site) => (
                  <option key={site.sit_id} value={site.sit_id?.toString()}>
                    {site.sit_nom} - {site.sit_ville} ({site.client?.cli_type === 'entreprise'
                      ? site.client?.cli_nom_entreprise
                      : `${site.client?.cli_prenom} ${site.client?.cli_nom}`})
                  </option>
                ))}
              </select>
            )}

            {/* Show selected site details */}
            {selectedSiteId && (
              <div className="mt-2 p-2 bg-white rounded text-sm border">
                <strong>Site sélectionné:</strong> {sites.find(s => s.sit_id?.toString() === selectedSiteId)?.sit_nom}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="debtorName" className="block text-gray-700 font-medium mb-1">Nom</label>
              <input
                type="text"
                id="debtorName"
                name="debtorName"
                value={formData.debtorName}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                placeholder="Sélectionnez un site"
              />
              {errors.debtorName && <p className="text-red-500 text-sm mt-1">{errors.debtorName}</p>}
            </div>

            <div>
              <label htmlFor="debtorAddress" className="block text-gray-700 font-medium mb-1">Adresse</label>
              <input
                type="text"
                id="debtorAddress"
                name="debtorAddress"
                value={formData.debtorAddress}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                placeholder="Sélectionnez un site"
              />
              {errors.debtorAddress && <p className="text-red-500 text-sm mt-1">{errors.debtorAddress}</p>}
            </div>

            <div>
              <label htmlFor="debtorBuildingNumber" className="block text-gray-700 font-medium mb-1">Numéro</label>
              <input
                type="number"
                id="debtorBuildingNumber"
                name="debtorBuildingNumber"
                value={formData.debtorBuildingNumber || ''}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                placeholder="Auto"
              />
            </div>

            <div>
              <label htmlFor="debtorZip" className="block text-gray-700 font-medium mb-1">NPA</label>
              <input
                type="number"
                id="debtorZip"
                name="debtorZip"
                value={formData.debtorZip || ''}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                placeholder="Auto"
              />
            </div>

            <div>
              <label htmlFor="debtorCity" className="block text-gray-700 font-medium mb-1">Ville</label>
              <input
                type="text"
                id="debtorCity"
                name="debtorCity"
                value={formData.debtorCity}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                placeholder="Sélectionnez un site"
              />
              {errors.debtorCity && <p className="text-red-500 text-sm mt-1">{errors.debtorCity}</p>}
            </div>

            <div>
              <label htmlFor="debtorCountry" className="block text-gray-700 font-medium mb-1">Pays</label>
              <select
                id="debtorCountry"
                name="debtorCountry"
                value={formData.debtorCountry}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CH">Suisse</option>
                <option value="FR">France</option>
                <option value="DE">Allemagne</option>
                <option value="IT">Italie</option>
                <option value="AT">Autriche</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Éléments de facturation</h2>
            <button
              type="button"
              onClick={addItem}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              + Ajouter un élément
            </button>
          </div>

          {errors.items && <p className="text-red-500 text-sm mb-4">{errors.items}</p>}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">Position</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Heures</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Désignation</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Prix/h</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Total</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={item.position}
                        onChange={(e) => handleItemChange(item.id, 'position', e.target.value)}
                        className="w-full border-0 focus:outline-none"
                        placeholder="•"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={item.heures}
                        onChange={(e) => handleItemChange(item.id, 'heures', e.target.value)}
                        className="w-full border-0 focus:outline-none"
                        placeholder="8 h."
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={item.designation}
                        onChange={(e) => handleItemChange(item.id, 'designation', e.target.value)}
                        className="w-full border-0 focus:outline-none"
                        placeholder="Description du service"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.prixHeure}
                        onChange={(e) => handleItemChange(item.id, 'prixHeure', parseFloat(e.target.value) || 0)}
                        className="w-full border-0 focus:outline-none"
                        placeholder="35.00"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      CHF {item.total.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pro Rata and Rabais Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Ajustements</h2>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, showProRataRabais: !prev.showProRataRabais }))}
              className={`px-4 py-2 rounded transition-colors ${
                formData.showProRataRabais
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {formData.showProRataRabais ? 'Masquer' : 'Ajouter'} Pro Rata et Rabais
            </button>
          </div>

          {/* Pro Rata and Rabais Fields */}
          {formData.showProRataRabais && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="proRata" className="block text-gray-700 font-medium mb-1">
                    Pro Rata (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="proRata"
                    name="proRata"
                    value={formData.proRata}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="0.00"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Pourcentage du montant à facturer (ex: 50% = 50)
                  </p>
                </div>

                <div>
                  <label htmlFor="rabais" className="block text-gray-700 font-medium mb-1">
                    Rabais (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="rabais"
                    name="rabais"
                    value={formData.rabais}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="0.00"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Pourcentage de réduction (ex: 10% = 10)
                  </p>
                </div>
              </div>

              {/* Show calculation details if either field has a value */}
              {(formData.proRata > 0 || formData.rabais > 0) && (
                <div className="mt-3 p-3 bg-white rounded border text-sm">
                  <strong>Détail du calcul :</strong><br />
                  Sous-total des éléments : CHF {formData.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}<br />
                  {formData.proRata > 0 && (
                    <>Pro Rata ({formData.proRata}%) : -CHF {(formData.items.reduce((sum, item) => sum + item.total, 0) * (formData.proRata / 100)).toFixed(2)}<br /></>
                  )}
                  {formData.rabais > 0 && (
                    <>Rabais ({formData.rabais}%) : -CHF {(formData.items.reduce((sum, item) => sum + item.total, 0) * (formData.rabais / 100)).toFixed(2)}<br /></>
                  )}
                  <strong>Montant HT final : CHF {formData.montantHT.toFixed(2)}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Totaux</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Montant HT</label>
              <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50">
                CHF {formData.montantHT.toFixed(2)}
              </div>
            </div>

            <div>
              <label htmlFor="tva" className="block text-gray-700 font-medium mb-1">TVA (%)</label>
              <input
                type="number"
                step="0.1"
                id="tva"
                name="tva"
                value={formData.tva}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Montant TTC</label>
              <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 font-bold">
                CHF {formData.montantTTC.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="reference" className="block text-gray-700 font-medium mb-1">Référence</label>
            <input
              type="text"
              id="reference"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="21 00000 00003 13947 14300 09017"
            />
          </div>
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
            Annuler la création de facture
          </button>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Traitement en cours...'
              : isEditMode
                ? 'Mettre à jour la facture'
                : 'Créer la facture'}
          </button>
        </div>
      </form>
    </div>
  );
}
