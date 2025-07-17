'use client';

// Define the Site interface
export interface Site {
  sit_id?: number;
  sit_nom: string;
  sit_client_id: number;
  sit_heure: string;
  sit_nb_personne: number;
  sit_adresse: string;
  sit_statut: 'ACTIF' | 'TERMINE';
  sit_modified_by?: number;
  sit_created_at?: string;
  sit_updated_at?: string;
  client?: {
    cli_id: number;
    cli_type: 'particulier' | 'entreprise';
    cli_nom_entreprise: string | null;
    cli_nom: string | null;
    cli_prenom: string | null;
  };
  user?: {
    id: number;
    usr_nom: string;
    usr_prenom: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Try to parse error response as JSON
    const errorData = await response.json().catch(() => null);
    if (errorData) {
      throw { status: response.status, data: errorData };
    } else {
      throw { status: response.status, statusText: response.statusText };
    }
  }

  return await response.json() as T;
}

// Site API service
export const siteService = {
  // Get all sites
  getSites: async (): Promise<Site[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/sites`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });
    return handleResponse<Site[]>(response);
  },

  // Get a site by ID
  getSite: async (id: number): Promise<Site> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/sites/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });
    return handleResponse<Site>(response);
  },

  // Create a new site
  createSite: async (site: Site): Promise<Site> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/sites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(site),
    });
    return handleResponse<Site>(response);
  },

  // Update a site
  updateSite: async (id: number, site: Site): Promise<Site> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/sites/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(site),
    });
    return handleResponse<Site>(response);
  },

  // Delete a site
  deleteSite: async (id: number): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/sites/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });
    return handleResponse<void>(response);
  }
};

// Export delete function for sites page
export const deleteSite = async (id: number): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/sites/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    }
  });

  return handleResponse<void>(response);
};
