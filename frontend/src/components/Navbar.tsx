'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
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

              <Link
                href="/sites"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full ${
                  pathname.startsWith('/sites')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Sites
              </Link>

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

              <Link
                href="/clients"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full ${
                  pathname.startsWith('/clients')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Clients
              </Link>

              {/* Dropdown menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full ${
                    pathname.startsWith('/compte') || dropdownOpen
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onMouseEnter={() => setDropdownOpen(true)}
                >
                  Compte
                </button>

                {/* Dropdown panel */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                    onMouseLeave={() => setDropdownOpen(false)}
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