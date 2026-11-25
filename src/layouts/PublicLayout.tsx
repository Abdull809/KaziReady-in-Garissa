import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FA] text-[#10243A]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
