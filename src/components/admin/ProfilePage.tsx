import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, User, Mail, Copy, ShieldCheck, Edit, Save, X, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const ProfilePage: React.FC = () => {
  const { user, profile, loading, refreshProfile } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    whatsapp: profile?.whatsapp || ''
  });

  const affiliateLink = `${window.location.origin}/v/${profile?.username}`;
  const salesLink = `${window.location.origin}/parceiro/${profile?.username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast.success('Link de afiliado copiado!');
  };

  const handleCopySalesLink = () => {
    navigator.clipboard.writeText(salesLink);
    toast.success('Link da página de vendas copiado!');
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          whatsapp: formData.whatsapp
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      refreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      whatsapp: profile?.whatsapp || ''
    });
    setIsEditing(false);
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
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col md:flex-row items-center md:space-x-8">
                <div className="relative mb-6 md:mb-0">
                  <img 
                    src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.full_name || user?.email}`} 
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                  />
                </div>
                <div className="text-center md:text-left">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          WhatsApp
                        </label>
                        <input
                          type="text"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="(11) 99999-9999"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Formato: (11) 99999-9999 ou 5511999999999
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile.full_name || 'Afiliado'}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center md:justify-start space-x-2 mt-1">
                        <Mail className="w-4 h-4" />
                        <span>{user?.email}</span>
                      </p>
                      {profile.whatsapp && (
                        <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center md:justify-start space-x-2 mt-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{profile.whatsapp}</span>
                        </p>
                      )}
                      {profile.role === 'superadmin' && (
                        <p className="inline-flex items-center space-x-2 mt-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Superadmin</span>
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-8"></div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
                  Sua Página de Vendas
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Compartilhe este link para direcionar clientes para sua página de vendas personalizada.
                </p>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-blue-600 dark:text-blue-400 font-mono truncate">
                      {salesLink}
                    </p>
                  </div>
                  <button 
                    onClick={handleCopySalesLink}
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="Copiar link da página de vendas"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
                  Link de Afiliado (Página Original)
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Link para a página original com header e footer.
                </p>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-green-600 dark:text-green-400 font-mono truncate">
                      {affiliateLink}
                    </p>
                  </div>
                  <button 
                    onClick={handleCopyLink}
                    className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    aria-label="Copiar link de afiliado"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
