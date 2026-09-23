'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Package, LogOut, Plus, LayoutDashboard, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-indigo-600 font-bold text-xl hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Package className="w-5 h-5" />
              </div>
              <span className="tracking-tight text-slate-900 font-extrabold">ProductIQ</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/dashboard"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Products
              </Link>
              <Link
                href="/dashboard/products/new"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/dashboard/products/new'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Product
              </Link>
            </nav>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/dashboard/products/new"
              className="md:hidden inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Link>

            {user && (
              <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
                <div className="flex items-center space-x-2.5">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.username}
                      width={34}
                      height={34}
                      className="rounded-full bg-slate-100 ring-2 ring-indigo-500/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase ring-2 ring-indigo-500/20">
                      {user.firstName ? user.firstName[0] : user.username[0]}
                    </div>
                  )}
                  <div className="hidden lg:block text-left text-xs leading-tight">
                    <div className="font-semibold text-slate-800">
                      {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                    </div>
                    <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      @{user.username}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Log out"
                  className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="sr-only">Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
