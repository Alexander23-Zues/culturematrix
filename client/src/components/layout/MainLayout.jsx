import React from 'react';
import Sidebar from './Sidebar';

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-ivory-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
