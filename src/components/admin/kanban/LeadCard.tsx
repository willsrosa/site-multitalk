import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Lead } from '../../../lib/supabase';
import { GripVertical } from 'lucide-react';
import CompleteLeadModal from './CompletLeadModal';

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
  } = useDraggable({ 
    id: lead.id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 1000 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    position: 'relative',
    transition: isDragging ? 'none' : 'all 0.2s ease',
  } as React.CSSProperties;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Card clicked for lead:', lead.name);
    setShowDetails(true);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onDoubleClick={handleClick}
        className={`bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-0.5 cursor-grab min-h-[80px] relative ${
          isDragging 
            ? 'drag-ghost border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 cursor-grabbing scale-105' 
            : 'transition-all duration-200 ease-out'
        }`}
      >


        {/* Nome do lead */}
        <div className="mb-3">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
            {lead.name}
          </h3>
        </div>

        {/* Valor e Status na mesma linha */}
        <div className="flex items-center justify-between gap-2">
          {lead.value ? (
            <div className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-xs font-bold">
              R$ {parseFloat(lead.value.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          ) : (
            <div></div>
          )}
          
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex-shrink-0">
            {lead.status}
          </span>
        </div>

        {/* Indicador visual de drag */}
        <div className="absolute bottom-2 right-2 opacity-30 hover:opacity-60 transition-opacity">
          <GripVertical className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      {/* Modal de Detalhes */}
      <CompleteLeadModal
        lead={lead}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default LeadCard;
