'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [sitesDropdownOpen, setSitesDropdownOpen] = useState(false);
  const [clientsDropdownOpen, setClientsDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const sitesDropdownRef = useRef<HTMLDivElement>(null);
  const clientsDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
      if (sitesDropdownRef.current && !sitesDropdownRef.current.contains(event.target as Node)) {
        setSitesDropdownOpen(false);
      }
      if (clientsDropdownRef.current && !clientsDropdownRef.current.contains(event.target as Node)) {
        setClientsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

        // Call the backend logout endpoint
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and redirect, even if the API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  return (
    <>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-blue-500 text-3xl font-bold">
                LMF Services
              </Link>
            </div>

            {/* Navigation links */}
            <div className="ml-6 flex space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full ${
                  pathname === '/'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Accueil
              </Link>

              {/* Sites dropdown */}
              <div className="relative" ref={sitesDropdownRef}>
                <button
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full ${
                    pathname.startsWith('/sites') || sitesDropdownOpen
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setSitesDropdownOpen(!sitesDropdownOpen)}
                  onMouseEnter={() => setSitesDropdownOpen(true)}
                >
                  Sites <span className="ml-1">▾</span>
                </button>

                {/* Sites dropdown panel */}
                {sitesDropdownOpen && (
                  <div
                    className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                    onMouseLeave={() => setSitesDropdownOpen(false)}
                  >
                    <Link
                      href="/sites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Liste
                    </Link>

                    <Link
                      href="/sites/new"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Créer
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/factures"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full ${
                  pathname.startsWith('/factures')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Factures
              </Link>

              {/* Clients dropdown */}
              <div className="relative" ref={clientsDropdownRef}>
                <button
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full ${
                    pathname.startsWith('/clients') || clientsDropdownOpen
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setClientsDropdownOpen(!clientsDropdownOpen)}
                  onMouseEnter={() => setClientsDropdownOpen(true)}
                >
                  Clients <span className="ml-1">▾</span>
                </button>

                {/* Clients dropdown panel */}
                {clientsDropdownOpen && (
                  <div
                    className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                    onMouseLeave={() => setClientsDropdownOpen(false)}
                  >
                    <Link
                      href="/clients"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Liste
                    </Link>

                    <Link
                      href="/clients/new"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Créer
                    </Link>
                  </div>
                )}
              </div>

              {/* Account dropdown */}
              <div className="relative" ref={accountDropdownRef}>
                <button
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full ${
                    pathname.startsWith('/compte') || accountDropdownOpen
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  onMouseEnter={() => setAccountDropdownOpen(true)}
                >
                  Compte <span className="ml-1">▾</span>
                </button>

                {/* Account dropdown panel */}
                {accountDropdownOpen && (
                  <div
                    className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                    onMouseLeave={() => setAccountDropdownOpen(false)}
                  >
                    <Link
                      href="/compte"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Mon compte
                    </Link>

                    <Link
                      href="/compte/gestion"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Gérer les comptes
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Thin line below navbar */}
      <div className="h-px bg-gray-200"></div>
    </>
  );
}