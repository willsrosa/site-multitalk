import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { LeadCustomField, supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface CustomFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  onUpdate?: () => void;
}

const CustomFieldsModal: React.FC<CustomFieldsModalProps> = ({ 
  isOpen, 
  onClose, 
  leadId, 
  onUpdate 
}) => {
  const [customFields, setCustomFields] = useState<LeadCustomField[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newField, setNewField] = useState({ name: '', value: '' });

  // Buscar campos personalizados
  useEffect(() => {
    if (isOpen && leadId) {
      console.log('CustomFieldsModal opened for lead:', leadId);
      fetchCustomFields();
    }
  }, [isOpen, leadId]);

  const fetchCustomFields = async () => {
    setLoading(true);
    try {
      console.log('Fetching custom fields for lead:', leadId);
      
      const { data, error } = await supabase
        .from('lead_custom_fields')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });

      console.log('Custom fields response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setCustomFields(data || []);
      console.log('Custom fields loaded:', data?.length || 0);
    } catch (error: any) {
      console.error('Erro ao buscar campos personalizados:', error);
      toast.error(`Erro ao carregar campos personalizados: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async () => {
    if (!newField.name.trim()) {
      toast.error('Nome do campo é obrigatório');
      return;
    }

    console.log('Adding custom field:', { leadId, name: newField.name, value: newField.value });

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('lead_custom_fields')
        .insert([{
          lead_id: leadId,
          field_name: newField.name.trim(),
          field_value: newField.value.trim() || null
        }])
        .select()
        .single();

      console.log('Insert response:', { data, error });

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      setCustomFields(prev => [...prev, data]);
      setNewField({ name: '', value: '' });
      toast.success('Campo adicionado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar campo:', error);
      if (error.code === '23505') {
        toast.error('Já existe um campo com este nome');
      } else if (error.code === '42501') {
        toast.error('Sem permissão para adicionar campos personalizados');
      } else {
        toast.error(`Erro ao adicionar campo: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateField = async (fieldId: string, newValue: string) => {
    try {
      const { error } = await supabase
        .from('lead_custom_fields')
        .update({ field_value: newValue.trim() || null })
        .eq('id', fieldId);

      if (error) throw error;

      setCustomFields(prev => 
        prev.map(field => 
          field.id === fieldId 
            ? { ...field, field_value: newValue.trim() || null }
            : field
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar campo:', error);
      toast.error('Erro ao atualizar campo');
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      const { error } = await supabase
        .from('lead_custom_fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;

      setCustomFields(prev => prev.filter(field => field.id !== fieldId));
      toast.success('Campo removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover campo:', error);
      toast.error('Erro ao remover campo');
    }
  };

  const handleClose = () => {
    setNewField({ name: '', value: '' });
    onUpdate?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl border border-gray-200 dark:border-gray-700 mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Campos Personalizados
              </h2>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Campos existentes */}
                {customFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        {field.field_name}
                      </div>
                      <input
                        type="text"
                        value={field.field_value || ''}
                        onChange={(e) => handleUpdateField(field.id, e.target.value)}
                        placeholder="Valor do campo"
                        className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      title="Remover campo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Adicionar novo campo */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Adicionar Novo Campo
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newField.name}
                      onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do campo"
                      className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={newField.value}
                      onChange={(e) => setNewField(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="Valor do campo"
                      className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddField}
                      disabled={saving || !newField.name.trim()}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4" />
                          <span>Adicionando...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Adicionar Campo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {customFields.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Nenhum campo personalizado encontrado.</p>
                    <p className="text-sm">Adicione campos para armazenar informações específicas deste lead.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={async () => {
                  console.log('=== DEBUG CUSTOM FIELDS ===');
                  console.log('Lead ID:', leadId);
                  
                  try {
                    // Testar conexão básica
                    const { data: testData, error: testError } = await supabase
                      .from('lead_custom_fields')
                      .select('count(*)')
                      .limit(1);
                    
                    console.log('Connection test:', { testData, testError });
                    
                    // Testar permissões
                    const { data: userData, error: userError } = await supabase.auth.getUser();
                    console.log('Current user:', { userData, userError });
                    
                    // Testar se o lead existe
                    const { data: leadData, error: leadError } = await supabase
                      .from('leads')
                      .select('id, name')
                      .eq('id', leadId)
                      .single();
                    
                    console.log('Lead exists:', { leadData, leadError });
                    
                    toast.success('Debug info logged to console');
                  } catch (error) {
                    console.error('Debug error:', error);
                    toast.error('Debug failed');
                  }
                }}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Debug
              </button>
              
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CustomFieldsModal;