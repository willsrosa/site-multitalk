import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { KanbanStatus, Lead } from '../../../lib/supabase';
import LeadCard from './LeadCard';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  status: KanbanStatus;
  leads: Lead[];
  onUpdate?: () => void;
  onQuickAdd?: () => void;
}

const columnColors: Record<KanbanStatus, string> = {
  'Nova Lead': 'border-blue-500',
  'Em Atendimento': 'border-yellow-500',
  'Reunião': 'border-purple-500',
  'Ganho': 'border-green-500',
  'Perca': 'border-red-500',
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, leads, onUpdate, onQuickAdd }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      ref={setNodeRef}
      className={`bg-gray-100 dark:bg-gray-800 rounded-2xl p-3 sm:p-4 flex flex-col border-t-4 transition-all duration-200 w-full min-h-[600px] max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] relative ${columnColors[status]} ${
        isOver ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-300 dark:ring-blue-600' : ''
      }`}
    >
      <div className="flex flex-col mb-3 sm:mb-4 px-1 sm:px-2">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-200 truncate pr-2">{status}</h2>
          <div className="flex items-center gap-2">
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-semibold px-2 py-1 rounded-full flex-shrink-0">
              {leads.length}
            </span>
            {onQuickAdd && (
              <button
                onClick={onQuickAdd}
                className="w-6 h-6 flex items-center justify-center bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 rounded-full transition-colors duration-200 flex-shrink-0"
                title="Adicionar lead"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        
        {/* Resumo de valores - compacto */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 border border-green-200 dark:border-green-700">
          <div className="text-center">
            <div className="text-sm font-bold text-green-700 dark:text-green-300">
              R$ {leads
                .filter(lead => lead.value && lead.value > 0)
                .reduce((sum, lead) => sum + parseFloat(lead.value!.toString()), 0)
                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              {leads.filter(lead => lead.value && lead.value > 0).length} de {leads.length} com valor
            </div>
          </div>
        </div>

      </div>
      
      {/* Conteúdo da coluna */}
      <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden pr-1 min-h-[200px] kanban-column scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
        {leads.map(lead => (
          <LeadCard key={lead.id} lead={lead} onUpdate={onUpdate} />
        ))}
        {leads.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
            Nenhum lead nesta etapa.
          </div>
        )}
        
        {/* Área invisível para garantir que o drop funcione em qualquer lugar da coluna */}
        <div className="min-h-[100px] w-full" />
      </div>
      
      {/* Overlay visual quando está sendo usado como drop zone */}
      {isOver && (
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/30 to-blue-200/50 dark:from-blue-900/20 dark:to-blue-800/40 rounded-2xl border-2 border-dashed border-blue-400 dark:border-blue-500 flex items-center justify-center pointer-events-none z-10 animate-pulse">
          <div className="text-blue-600 dark:text-blue-400 font-semibold text-sm bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-blue-200 dark:border-blue-600">
            ✨ Solte aqui
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default KanbanColumn;
