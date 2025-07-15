'use client';

// Define the Client interface
export interface Client {
  cli_id?: number;
  cli_type: 'entreprise' | 'particulier';
  cli_nom_entreprise?: string;
  cli_nom?: string;
  cli_prenom?: string;
  cli_email?: string;
  cli_adresse?: string;
  cli_npa: string;
  cli_ville: string;
  cli_created_at?: string;
  cli_updated_at?: string;
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

// Client API service
export const clientService = {
  // Get all clients
  getClients: async (): Promise<Client[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/clients`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });
    return handleResponse<Client[]>(response);
  },

  // Get a client by ID
  getClient: async (id: number): Promise<Client> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/clients/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });
    return handleResponse<Client>(response);
  },

  // Create a new client
  createClient: async (client: Client): Promise<Client> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(client),
    });
    return handleResponse<Client>(response);
  },

  // Update a client
  updateClient: async (id: number, client: Client): Promise<Client> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(client),
    });
    return handleResponse<Client>(response);
  },

  // Delete a client
  deleteClient: async (id: number): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });
    return handleResponse<void>(response);
  }
};

// Export delete function for clients page
export const deleteClient = async (id: number): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    }
  });

  return handleResponse<void>(response);
};
