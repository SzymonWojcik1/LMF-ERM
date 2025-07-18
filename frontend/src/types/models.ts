'use client';

export interface ClientDB {
  cli_id: number;
  cli_type: 'particulier' | 'entreprise';
  cli_nom_entreprise: string | null;
  cli_nom: string | null;
  cli_prenom: string | null;
  cli_email: string | null;
  cli_adresse: string | null;
  cli_npa: number;
  cli_ville: string;
  cli_created_at?: string;
  cli_updated_at?: string;
}

export interface SiteDB {
  sit_id: number;
  sit_client_id: number;
  sit_nom: string;
  sit_heure: string;
  sit_nb_personne: number;
  sit_statut: 'terminé' | 'actif';
  sit_adresse: string;
  sit_npa: number;
  sit_ville: string;
  sit_created_by: number;
  sit_updated_by: number;
  sit_created_at?: string;
  sit_updated_at?: string;
}

// User interface
export interface User {
  id: number;
  usr_nom: string;
  usr_prenom: string;
  usr_email?: string;
  // Add other user properties as needed
}


// Client model for API responses
export interface Client {
  cli_id?: number;
  cli_type: 'entreprise' | 'particulier';
  cli_nom_entreprise?: string | null;
  cli_nom?: string | null;
  cli_prenom?: string | null;
  cli_email?: string | null;
  cli_adresse?: string | null;
  cli_npa?: number;
  cli_ville?: string;
  cli_created_at?: string;
  cli_updated_at?: string;
}

// Site model for API responses
export interface Site {
  sit_id?: number;
  sit_client_id: number;
  sit_nom: string;
  sit_heure: string;
  sit_nb_personne: number;
  sit_statut: 'ACTIF' | 'TERMINE';
  sit_adresse: string;
  sit_npa?: number;
  sit_ville?: string;
  sit_created_by?: number;
  sit_updated_by?: number;
  sit_created_at?: string;
  sit_updated_at?: string;

  // Relationships
  client?: Client;
  createdBy?: {
    id: number;
    usr_nom: string;
    usr_prenom: string;
  };
  updatedBy?: {
    id: number;
    usr_nom: string;
    usr_prenom: string;
  };
}
