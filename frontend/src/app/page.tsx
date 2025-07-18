'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{
    usr_id?: number;
    usr_prenom?: string;
    usr_nom?: string;
    usr_role?: string;
    usr_login?: string;
  } | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Get user data
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        {user && (
          <h1 className="text-3xl font-semibold mb-12">Bienvenue, {user.usr_prenom} {user.usr_nom}</h1>
        )}

        <div className="bg-gray-100 rounded-lg p-8 shadow-sm w-full max-w-md">
          <div className="space-y-4">
            {/* Create invoice button */}
            <a href="/factures/creer" className="flex items-center bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md w-full transition-colors duration-200">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>Créer une facture</span>
            </a>
            {/* Manage clients button */}
            <Link href="/clients" className="flex items-center bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md w-full transition-colors duration-200">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span>Gérer les clients</span>
            </Link>

            {/* Manage sites button */}
            <Link href="/sites" className="flex items-center bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md w-full transition-colors duration-200">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Gérer les sites</span>
            </Link>

            {/* View invoices button */}
            <a href="/factures" className="flex items-center bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md w-full transition-colors duration-200">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              <span>Voir les factures existantes</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
