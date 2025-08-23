import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanStatus, Lead } from '../../../lib/supabase';
import LeadCard from './LeadCard';
import { motion } from 'framer-motion';

interface KanbanColumnProps {
  status: KanbanStatus;
  leads: Lead[];
}

const columnColors: Record<KanbanStatus, string> = {
  'Nova Lead': 'border-blue-500',
  'Em Atendimento': 'border-yellow-500',
  'Reunião': 'border-purple-500',
  'Ganho': 'border-green-500',
  'Perca': 'border-red-500',
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, leads }) => {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      ref={setNodeRef}
      className={`bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 flex flex-col border-t-4 ${columnColors[status]}`}
    >
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">{status}</h2>
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm font-semibold px-2 py-1 rounded-full">
          {leads.length}
        </span>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
          {leads.length === 0 && (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
              Nenhum lead nesta etapa.
            </div>
          )}
        </SortableContext>
      </div>
    </motion.div>
  );
};

export default KanbanColumn;
