import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminPosts from '../components/admin/AdminPosts';
import AdminPostForm from '../components/admin/AdminPostForm';
import { useAuth } from '../hooks/useAuth';

const Admin: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-100 dark:bg-gray-900">
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/posts" element={<AdminPosts />} />
        <Route path="/posts/new" element={<AdminPostForm />} />
        <Route path="/posts/edit/:id" element={<AdminPostForm />} />
      </Routes>
    </div>
  );
};

export default Admin;
