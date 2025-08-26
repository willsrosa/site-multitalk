import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Lead, LeadCustomField, supabase } from '../../../lib/supabase';
import { GripVertical, Mail, Building, Clock, Calendar, AlertTriangle } from 'lucide-react';
import CompleteLeadModal from './CompletLeadModal';

interface LeadCardProps {
  lead: Lead;
  onUpdate?: () => void;
}

// Função para calcular a cor baseada na data limite
const getDateColor = (expectedCloseDate?: string) => {
  if (!expectedCloseDate) return 'text-gray-500';
  
  const today = new Date();
  const closeDate = new Date(expectedCloseDate);
  const diffTime = closeDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'text-red-600 dark:text-red-400'; // Vencido
  if (diffDays <= 3) return 'text-orange-600 dark:text-orange-400'; // Próximo do vencimento
  if (diffDays <= 7) return 'text-yellow-600 dark:text-yellow-400'; // Uma semana
  return 'text-green-600 dark:text-green-400'; // Mais de uma semana
};

// Função para obter o ícone de urgência
const getUrgencyIcon = (expectedCloseDate?: string) => {
  if (!expectedCloseDate) return null;
  
  const today = new Date();
  const closeDate = new Date(expectedCloseDate);
  const diffTime = closeDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0 || diffDays <= 3) {
    return <AlertTriangle className="w-3 h-3 text-red-500" />;
  }
  return null;
};

const LeadCard: React.FC<LeadCardProps> = ({ lead, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [customFields, setCustomFields] = useState<LeadCustomField[]>([]);

  // Buscar campos personalizados
  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        const { data, error } = await supabase
          .from('lead_custom_fields')
          .select('*')
          .eq('lead_id', lead.id);

        if (error) throw error;
        setCustomFields(data || []);
      } catch (error) {
        console.error('Erro ao buscar campos personalizados:', error);
      }
    };

    fetchCustomFields();
  }, [lead.id]);
  
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
        className={`bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 cursor-grab ${
          isDragging 
            ? 'drag-ghost border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 cursor-grabbing scale-105' 
            : 'transition-all duration-300 ease-out'
        }`}
      >


        {/* Header com nome do lead */}
        <div className="mb-3">
          <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
            {lead.name}
          </h3>
        </div>

        {/* Linha com valor e status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {lead.value && (
              <div className="inline-flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md text-xs font-bold">
                R$ {parseFloat(lead.value.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            )}
            
            {lead.expected_close_date && (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-gray-800 ${getDateColor(lead.expected_close_date)}`}>
                <Calendar className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {new Date(lead.expected_close_date).toLocaleDateString('pt-BR')}
                </span>
                {getUrgencyIcon(lead.expected_close_date)}
              </div>
            )}
          </div>

          {/* Status badge */}
          <div className="flex items-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {lead.status}
            </span>
          </div>
        </div>
        
        <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate text-xs sm:text-sm">{lead.email}</span>
          </div>
          
          {lead.phone && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-xs">📱</span>
              <span className="truncate text-xs sm:text-sm">{lead.phone}</span>
            </div>
          )}
          
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

          {/* Probabilidade */}
          {lead.probability !== undefined && lead.probability > 0 && (
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Probabilidade:</span>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                {lead.probability}%
              </span>
            </div>
          )}

          {/* Campos personalizados */}
          {customFields.length > 0 && (
            <div className="mt-2 space-y-1 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-md">
              {customFields.slice(0, 2).map((field) => (
                <div key={field.id} className="flex items-center justify-between">
                  <span className="text-xs text-purple-600 dark:text-purple-400 capitalize font-medium">
                    {field.field_name}:
                  </span>
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300 truncate max-w-20">
                    {field.field_value}
                  </span>
                </div>
              ))}
              {customFields.length > 2 && (
                <div className="text-xs text-purple-500 dark:text-purple-400 text-center font-medium">
                  +{customFields.length - 2} campos
                </div>
              )}
            </div>
          )}
          
          {/* Preview da mensagem */}
          <div className="mt-2 sm:mt-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg relative border border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {lead.message}
            </p>
            {/* Indicador visual de drag */}
            <div className="absolute bottom-2 right-2 opacity-40 hover:opacity-70 transition-opacity">
              <GripVertical className="w-3 h-3 text-gray-400" />
            </div>
          </div>
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
