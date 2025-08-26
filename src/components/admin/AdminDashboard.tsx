import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Eye, TrendingUp, Plus, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user, isSuperAdmin } = useAuthContext();
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    wonLeads: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total leads
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      // Get new leads
      const { count: newLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Nova Lead');

      // Get won leads
      const { count: wonLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Ganho');

      // Get total value from won leads
      const { data: valueData } = await supabase
        .from('leads')
        .select('value')
        .eq('status', 'Ganho');

      const totalValue = valueData?.reduce((sum, lead) => sum + (lead.value || 0), 0) || 0;

      setStats({
        totalLeads: totalLeads || 0,
        newLeads: newLeads || 0,
        wonLeads: wonLeads || 0,
        totalValue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statsCards = [
    {
      title: 'Total de Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
    },
    {
      title: 'Novas Leads',
      value: stats.newLeads,
      icon: FileText,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20'
    },
    {
      title: 'Leads Ganhas',
      value: stats.wonLeads,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
    },
    {
      title: 'Valor Total Ganho',
      value: `R$ ${stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Eye,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      isValue: true
    }
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
              Painel Administrativo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Bem-vindo, {user?.email}
            </p>
          </div>
          
          {isSuperAdmin && (
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Link
                to="/admin/posts/new"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Post
              </Link>
            </div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {card.isValue ? card.value : card.value.toLocaleString()}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {card.title}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-heading">
            Ações Rápidas
          </h2>
          
          <div className={`grid grid-cols-1 ${isSuperAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
            <Link
              to="/admin/kanban"
              className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Kanban de Leads
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gerenciar pipeline de vendas
                </p>
              </div>
            </Link>

            <Link
              to="/admin/perfil"
              className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Settings className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Meu Perfil
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gerenciar perfil e configurações
                </p>
              </div>
            </Link>

            {isSuperAdmin && (
              <Link
                to="/admin/posts"
                className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <FileText className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Gerenciar Posts
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Visualizar e editar posts do blog
                  </p>
                </div>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
