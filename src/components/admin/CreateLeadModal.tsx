import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Building, MessageSquare, Loader2, Phone, DollarSign, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase, KanbanStatus } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

// Componente para input de moeda
const CurrencyInput: React.FC<{
  register: any;
  name: string;
  defaultValue?: number | null;
  className?: string;
}> = ({ register, name, defaultValue, className }) => {
  const [displayValue, setDisplayValue] = useState('');
  const [realValue, setRealValue] = useState('');

  useEffect(() => {
    if (defaultValue) {
      const formatted = formatCurrency(defaultValue.toString());
      setDisplayValue(formatted);
      setRealValue(defaultValue.toString());
    }
  }, [defaultValue]);

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    if (isNaN(amount)) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatCurrency(inputValue);
    const numbers = inputValue.replace(/\D/g, '');
    const numericValue = parseFloat(numbers) / 100;
    
    setDisplayValue(formatted);
    setRealValue(isNaN(numericValue) ? '' : numericValue.toString());
  };

  return (
    <>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder="R$ 0,00"
        className={className || "w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"}
      />
      <input
        type="hidden"
        {...register(name)}
        value={realValue}
      />
    </>
  );
};

type FormData = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  status: KanbanStatus;
  source?: string;
  value?: string;
  probability?: number;
  expected_close_date?: string;
  next_follow_up?: string;
};

const schema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
  email: yup.string().email('Digite um e-mail válido').required('O e-mail é obrigatório'),
  phone: yup.string().optional(),
  company: yup.string().optional(),
  message: yup.string().required('A mensagem é obrigatória').min(10, 'A mensagem deve ter pelo menos 10 caracteres'),
  status: yup.string().oneOf(['Nova Lead', 'Em Atendimento', 'Reunião', 'Ganho', 'Perca'] as const).required('Selecione um status'),
  source: yup.string().optional(),
  value: yup.string().optional(),
  probability: yup.number().min(0).max(100).optional(),
  expected_close_date: yup.string().optional(),
  next_follow_up: yup.string().optional(),
}) as yup.ObjectSchema<FormData>;

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: () => void;
}

const CreateLeadModal: React.FC<CreateLeadModalProps> = ({ isOpen, onClose, onLeadCreated }) => {
  const [loading, setLoading] = useState(false);
  const { profile } = useAuthContext();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      status: 'Nova Lead'
    }
  });

  const onSubmit = async (data: FormData) => {
    if (!profile) {
      toast.error('Perfil não encontrado');
      return;
    }

    setLoading(true);
    try {
      const leadData = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        message: data.message,
        status: data.status,
        source: data.source || null,
        value: data.value ? parseFloat(data.value) : null,
        probability: data.probability || 0,
        expected_close_date: data.expected_close_date || null,
        next_follow_up: data.next_follow_up || null,
        profile_id: profile.id,
      };

      const { error } = await supabase
        .from('leads')
        .insert([leadData]);

      if (error) throw error;

      toast.success('Lead criado com sucesso!');
      reset();
      onLeadCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating lead:', error);
      toast.error(error.message || 'Erro ao criar lead');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      onClose();
    }
  };

  const statusOptions: { value: KanbanStatus; label: string }[] = [
    { value: 'Nova Lead', label: 'Nova Lead' },
    { value: 'Em Atendimento', label: 'Em Atendimento' },
    { value: 'Reunião', label: 'Reunião' },
    { value: 'Ganho', label: 'Ganho' },
    { value: 'Perca', label: 'Perca' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-4xl border border-gray-200 dark:border-gray-700 mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                Criar Nova Lead
              </h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nome *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register('name')}
                      id="name"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome do lead"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register('email')}
                      id="email"
                      type="email"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register('phone')}
                      id="phone"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Empresa
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register('company')}
                      id="company"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    {...register('status')}
                    id="status"
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

                <div>
                  <label htmlFor="source" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Fonte
                  </label>
                  <input
                    {...register('source')}
                    id="source"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Website, Indicação, LinkedIn"
                  />
                </div>

                <div>
                  <label htmlFor="value" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Valor Estimado
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <div className="pl-10">
                      <CurrencyInput
                        register={register}
                        name="value"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="probability" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Probabilidade (%)
                  </label>
                  <input
                    {...register('probability')}
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="expected_close_date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Data Esperada de Fechamento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register('expected_close_date')}
                      id="expected_close_date"
                      type="date"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="next_follow_up" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Próximo Follow-up
                  </label>
                  <input
                    {...register('next_follow_up')}
                    id="next_follow_up"
                    type="datetime-local"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mensagem *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    {...register('message')}
                    id="message"
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Descreva o interesse do lead..."
                  />
                </div>
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
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
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      <span>Criando...</span>
                    </>
                  ) : (
                    <span>Criar Lead</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateLeadModal;