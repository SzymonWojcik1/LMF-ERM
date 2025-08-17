'use client';

import { CompteBancaire } from '@/types/models';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (errorData) {
      throw { status: response.status, data: errorData };
    } else {
      throw { status: response.status, statusText: response.statusText };
    }
  }

  return await response.json() as T;
}

export const compteBancaireService = {
  getComptesBancaires: async (): Promise<CompteBancaire[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/comptes_bancaires`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });
    return handleResponse<CompteBancaire[]>(response);
  },

  // Get a bank account by ID
  getCompteBancaire: async (id: number): Promise<CompteBancaire> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/comptes_bancaires/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });
    return handleResponse<CompteBancaire>(response);
  },

  // Create a new bank account
  createCompteBancaire: async (compteBancaire: CompteBancaire): Promise<CompteBancaire> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/comptes_bancaires`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(compteBancaire),
    });
    return handleResponse<CompteBancaire>(response);
  },

  // Update a bank account
  updateCompteBancaire: async (id: number, compteBancaire: CompteBancaire): Promise<CompteBancaire> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/comptes_bancaires/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(compteBancaire),
    });
    return handleResponse<CompteBancaire>(response);
  },

  // Delete a bank account
  deleteCompteBancaire: async (id: number): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/comptes_bancaires/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });
    return handleResponse<void>(response);
  }
};

// Export delete function for bank accounts page
export const deleteCompteBancaire = async (id: number): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/comptes_bancaires/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    }
  });

  return handleResponse<void>(response);
};
