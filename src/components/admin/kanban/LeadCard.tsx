import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Lead } from '../../../lib/supabase';
import { GripVertical, Mail, Building, Clock, Eye } from 'lucide-react';
import LeadDetailsModal from './LeadDetailsModal';

interface LeadCardProps {
  lead: Lead;
  onUpdate?: () => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: lead.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 1000 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    position: 'relative',
    transition: isDragging ? 'none' : 'all 0.2s ease',
  } as React.CSSProperties;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if dragging or if clicking on the eye button
    if (isDragging || (e.target as HTMLElement).closest('[data-details-button]')) {
      return;
    }
    setShowDetails(true);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={handleCardClick}
        className={`bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 ${
          isDragging 
            ? 'drag-ghost border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'transition-all duration-200'
        }`}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-2 pr-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 flex-1">
            {lead.name}
          </h3>
          <button
            data-details-button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(true);
            }}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0 ml-2"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate text-xs sm:text-sm">{lead.email}</span>
          </div>
          {lead.company && (
            <div className="flex items-center space-x-2">
              <Building className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">{lead.company}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 pt-1">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          
          {/* Preview da mensagem */}
          <div className="mt-2 sm:mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg relative">
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {lead.message}
            </p>
            {/* Drag indicator */}
            <div className="absolute bottom-1 right-1 opacity-30">
              <GripVertical className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <LeadDetailsModal
        lead={lead}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default LeadCard;
