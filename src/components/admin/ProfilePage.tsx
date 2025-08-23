import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, User, Mail, Copy, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthContext } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, profile, loading } = useAuthContext();

  const affiliateLink = `${window.location.origin}/v/${profile?.username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast.success('Link de afiliado copiado!');
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" />
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="p-6 text-center">
        <p>Perfil não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 font-heading">
            Meu Perfil
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-center md:space-x-8">
              <div className="relative mb-6 md:mb-0">
                <img 
                  src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.full_name || user?.email}`} 
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.full_name || 'Afiliado'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center md:justify-start space-x-2 mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </p>
                {profile.role === 'superadmin' && (
                  <p className="inline-flex items-center space-x-2 mt-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Superadmin</span>
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-8"></div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
                Seu Link de Afiliado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Compartilhe este link para registrar novos leads em seu nome.
              </p>
              <div className="flex items-center space-x-3">
                <div className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-blue-600 dark:text-blue-400 font-mono truncate">
                    {affiliateLink}
                  </p>
                </div>
                <button 
                  onClick={handleCopyLink}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label="Copiar link"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
