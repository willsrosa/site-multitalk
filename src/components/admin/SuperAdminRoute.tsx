import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const SuperAdminRoute: React.FC = () => {
  const { isSuperAdmin, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    toast.error('Acesso negado. Você não tem permissão para acessar esta página.');
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default SuperAdminRoute;
