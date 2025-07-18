'use client';

import { Site } from '@/types/models';

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

    // Ensure numeric values are actually numbers, not strings
    const preparedSite = {
      ...site,
      sit_client_id: Number(site.sit_client_id),
      sit_nb_personne: Number(site.sit_nb_personne),
      sit_npa: Number(site.sit_npa),
      sit_created_by: Number(site.sit_created_by),
      sit_updated_by: Number(site.sit_updated_by)
    };

    console.log('Creating site with data:', preparedSite);
    console.log('JSON payload:', JSON.stringify(preparedSite));

    const response = await fetch(`${API_URL}/sites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(preparedSite),
    });
    return handleResponse<Site>(response);
  },

  // Update a site
  updateSite: async (id: number, site: Site): Promise<Site> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    // Ensure numeric values not strings
    const preparedSite = {
      ...site,
      sit_client_id: Number(site.sit_client_id),
      sit_nb_personne: Number(site.sit_nb_personne),
      sit_npa: site.sit_npa ? Number(site.sit_npa) : undefined,
      sit_created_by: site.sit_created_by ? Number(site.sit_created_by) : undefined,
      sit_updated_by: Number(site.sit_updated_by)
    };

    // Log
    console.log('Updating site with data:', preparedSite);
    console.log('JSON payload:', JSON.stringify(preparedSite));

    const response = await fetch(`${API_URL}/sites/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(preparedSite),
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
