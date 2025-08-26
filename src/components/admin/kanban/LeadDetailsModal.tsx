import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Building, Clock, MessageSquare, User, Edit, Trash2, Save, Settings, DollarSign, Calendar, Phone } from 'lucide-react';
import { Lead, KanbanStatus, LeadCustomField, supabase } from '../../../lib/supabase';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import CustomFieldsModal from './CustomFieldsModal';

interface LeadDetailsModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ lead, isOpen, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [customFields, setCustomFields] = useState<LeadCustomField[]>([]);

  // Buscar campos personalizados
  useEffect(() => {
    const fetchCustomFields = async () => {
      if (!isOpen) return;
      
      try {
        console.log('Buscando campos personalizados para lead:', lead.id);
        const { data, error } = await supabase
          .from('lead_custom_fields')
          .select('*')
          .eq('lead_id', lead.id);

        if (error) throw error;
        console.log('Campos personalizados encontrados:', data);
        setCustomFields(data || []);
        console.log('Estado customFields atualizado para:', data || []);
      } catch (error) {
        console.error('Erro ao buscar campos personalizados:', error);
      }
    };

    fetchCustomFields();
  }, [lead.id, isOpen]);

  // Debug log
  React.useEffect(() => {
    console.log('Modal state changed:', { isOpen, leadName: lead.name });
    if (isOpen) {
      console.log('Modal should be visible now!');
      // Force a small delay to ensure DOM is ready
      setTimeout(() => {
        const modalElement = document.querySelector('[data-modal-content]');
        console.log('Modal element found:', !!modalElement);
      }, 100);
    }
  }, [isOpen, lead.name]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: lead.name,
      email: lead.email,
      company: lead.company || '',
      message: lead.message,
      status: lead.status,
    }
  });

  const statusOptions: { value: KanbanStatus; label: string; color: string }[] = [
    { value: 'Nova Lead', label: 'Nova Lead', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    { value: 'Em Atendimento', label: 'Em Atendimento', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    { value: 'Reunião', label: 'Reunião', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
    { value: 'Ganho', label: 'Ganho', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    { value: 'Perca', label: 'Perca', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  ];

  const currentStatus = statusOptions.find(s => s.value === lead.status);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          name: data.name,
          email: data.email,
          company: data.company || null,
          message: data.message,
          status: data.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id);

      if (error) throw error;

      toast.success('Lead atualizado com sucesso!');
      setIsEditing(false);
      onUpdate?.();
    } catch (error: any) {
      console.error('Error updating lead:', error);
      toast.error('Erro ao atualizar lead');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', lead.id);

      if (error) throw error;

      toast.success('Lead excluído com sucesso!');
      onUpdate?.();
      onClose();
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      toast.error('Erro ao excluir lead');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setIsEditing(false);
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div
        data-modal-content
        className="relative bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto mx-4"
        style={{ zIndex: 100000 }}
      >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                  Detalhes do Lead
                </h2>
                {currentStatus && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
                    {currentStatus.label}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => setShowCustomFields(true)}
                      className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      title="Campos Personalizados"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nome *
                    </label>
                    <input
                      {...register('name', { required: 'Nome é obrigatório' })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      E-mail *
                    </label>
                    <input
                      {...register('email', { 
                        required: 'E-mail é obrigatório',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'E-mail inválido'
                        }
                      })}
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Empresa
                    </label>
                    <input
                      {...register('company')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Status *
                    </label>
                    <select
                      {...register('status', { required: 'Status é obrigatório' })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    {...register('message', { required: 'Mensagem é obrigatória' })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70"
                  >
                    <Save className="w-5 h-5" />
                    <span>{loading ? 'Salvando...' : 'Salvar'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{lead.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">E-mail</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{lead.email}</p>
                      </div>
                    </div>

                    {lead.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Telefone</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{lead.phone}</p>
                        </div>
                      </div>
                    )}

                    {lead.company && (
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Empresa</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{lead.company}</p>
                        </div>
                      </div>
                    )}

                    {lead.source && (
                      <div className="flex items-center space-x-3">
                        <span className="w-5 h-5 text-gray-400 text-center">🔗</span>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Fonte</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{lead.source}</p>
                        </div>
                      </div>
                    )}

                    {/* Campos Personalizados na primeira coluna */}
                    {customFields.slice(0, Math.ceil(customFields.length / 2)).map((field) => (
                      <div key={field.id} className="flex items-center space-x-3">
                        <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <p className="text-sm text-purple-600 dark:text-purple-400 capitalize">{field.field_name}</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{field.field_value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {lead.value && (
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Valor Estimado</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            R$ {parseFloat(lead.value.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    )}

                    {lead.probability !== undefined && lead.probability > 0 && (
                      <div className="flex items-center space-x-3">
                        <span className="w-5 h-5 text-gray-400 text-center">%</span>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Probabilidade</p>
                          <p className="font-semibold text-blue-600 dark:text-blue-400">{lead.probability}%</p>
                        </div>
                      </div>
                    )}

                    {lead.expected_close_date && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Data Esperada</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(lead.expected_close_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Criado em</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(lead.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Atualizado em</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(lead.updated_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {/* Campos Personalizados na segunda coluna */}
                    {customFields.slice(Math.ceil(customFields.length / 2)).map((field) => (
                      <div key={field.id} className="flex items-center space-x-3">
                        <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <p className="text-sm text-purple-600 dark:text-purple-400 capitalize">{field.field_name}</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{field.field_value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>



                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Mensagem</p>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{lead.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Campos Personalizados */}
            <CustomFieldsModal
              isOpen={showCustomFields}
              onClose={() => setShowCustomFields(false)}
              leadId={lead.id}
              onUpdate={onUpdate}
            />
      </div>
    </div>
  );

  // Render modal in a portal to ensure it's on top
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

export default LeadDetailsModal;