'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FactureForm from '@/components/factures/FactureForm';
import Navbar from '@/components/Navbar';
import { siteService } from '@/services/siteService';
import { Site } from '@/types/models';

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

export default function NewFacturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get('siteId');

  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingSite, setIsLoadingSite] = useState(false);
  const [prefilledSite, setPrefilledSite] = useState<Site | null>(null);

  // Load site data if siteId is provided
  useEffect(() => {
    const loadSite = async () => {
      if (siteId) {
        setIsLoadingSite(true);
        try {
          const site = await siteService.getSite(parseInt(siteId));
          setPrefilledSite(site);
        } catch (err) {
          console.error('Failed to load site:', err);
          setError('Impossible de charger les informations du site');
        } finally {
          setIsLoadingSite(false);
        }
      }
    };

    loadSite();
  }, [siteId]);

  const handleSubmit = async (factureData: FactureData) => {
    try {
      setIsGenerating(true);

      // Transform the form data to match the API format
      const apiData = {
        amount: factureData.montantTTC,
        creditor: {
          account: factureData.creditorAccount.replace(/\s/g, ''), // Remove spaces for API
          address: factureData.creditorAddress,
          buildingNumber: factureData.creditorBuildingNumber,
          city: factureData.creditorCity,
          country: factureData.creditorCountry,
          name: factureData.creditorName,
          zip: factureData.creditorZip
        },
        currency: factureData.currency as "CHF" | "EUR" | "USD",
        debtor: {
          address: factureData.debtorAddress,
          buildingNumber: factureData.debtorBuildingNumber,
          city: factureData.debtorCity,
          country: factureData.debtorCountry,
          name: factureData.debtorName,
          zip: factureData.debtorZip
        },
        reference: factureData.reference,
        invoiceNumber: factureData.numeroFacture,
        invoiceDate: factureData.dateFacture,
        items: factureData.items.map(item => ({
          position: item.position,
          hours: item.heures,
          description: item.designation,
          pricePerHour: item.prixHeure,
          total: item.total
        })),
        subtotal: factureData.montantHT,
        vatRate: factureData.tva,
        vatAmount: factureData.montantHT * (factureData.tva / 100),
        totalAmount: factureData.montantTTC,

        // Optional adjustments
        proRata: factureData.proRata,
        rabais: factureData.rabais,
        showProRataRabais: factureData.showProRataRabais
      };

      console.log('Sending invoice data to API:', apiData);

      const response = await fetch('/api/generate-qrbill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle the PDF response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${factureData.numeroFacture}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      alert('Facture générée avec succès!');

    } catch (error) {
      console.error('Failed to generate invoice:', error);
      setError('Une erreur est survenue lors de la génération de la facture');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-6xl mb-6">
          <h1 className="text-3xl font-bold">
            {prefilledSite ? `Nouvelle Facture - ${prefilledSite.sit_nom}` : 'Nouvelle Facture'}
          </h1>
          {prefilledSite && (
            <p className="text-gray-600 mt-2">
              Les informations du site "{prefilledSite.sit_nom}" ont été pré-remplies automatiquement.
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-6xl">
            {error}
          </div>
        )}

        {isGenerating && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 w-full max-w-6xl">
            Génération de la facture en cours...
          </div>
        )}

        {isLoadingSite ? (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <FactureForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            prefilledSite={prefilledSite}
          />
        )}
      </div>
    </>
  );
}