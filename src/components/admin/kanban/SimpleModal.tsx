import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Lead } from '../../../lib/supabase';

interface SimpleModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ lead, isOpen, onClose }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Detalhes do Lead
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome:</label>
            <p className="text-gray-900 dark:text-white">{lead.name}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</label>
            <p className="text-gray-900 dark:text-white">{lead.email}</p>
          </div>
          
          {lead.company && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Empresa:</label>
              <p className="text-gray-900 dark:text-white">{lead.company}</p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
            <p className="text-gray-900 dark:text-white">{lead.status}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mensagem:</label>
            <p className="text-gray-900 dark:text-white text-sm">{lead.message}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Criado em:</label>
            <p className="text-gray-900 dark:text-white text-sm">
              {new Date(lead.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SimpleModal;