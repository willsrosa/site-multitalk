import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '../../../lib/supabase';
import { GripVertical, Mail, Building, Clock } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 10,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 cursor-grab"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 pr-4">{lead.name}</h3>
        <button {...listeners} {...attributes} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
          <GripVertical className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="truncate">{lead.email}</span>
        </div>
        {lead.company && (
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-gray-400" />
            <span className="truncate">{lead.company}</span>
          </div>
        )}
        <div className="flex items-center space-x-2 pt-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
