// src/components/AdminLayout.jsx
import React from 'react';
import AdminMenu from './AdminMenu';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      <aside className="w-60 bg-white shadow-md">
        <AdminMenu />
      </aside>

      <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
        <div className="max-w-[1800px] mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
