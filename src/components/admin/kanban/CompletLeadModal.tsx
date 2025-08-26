import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Building, Clock, MessageSquare, User, Edit, Trash2, Save, Plus, CheckSquare, Activity, Settings, Phone, DollarSign, Calendar } from 'lucide-react';
import { Lead, KanbanStatus, supabase, Task, Note, Activity as ActivityType } from '../../../lib/supabase';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthContext } from '../../../contexts/AuthContext';
import CustomFieldsModal from './CustomFieldsModal';

 

interface CompleteLeadModalProps {
    lead: Lead;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
}

type TabType = 'details' | 'tasks' | 'notes' | 'activities' | 'followup';

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

const CompleteLeadModal: React.FC<CompleteLeadModalProps> = ({ lead, isOpen, onClose, onUpdate }) => {
    const { profile } = useAuthContext();
    const [activeTab, setActiveTab] = useState<TabType>('details');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showCustomFields, setShowCustomFields] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [activities, setActivities] = useState<ActivityType[]>([]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: lead.name,
            email: lead.email,
            company: lead.company || '',
            phone: lead.phone || '',
            message: lead.message,
            status: lead.status,
            source: lead.source || '',
            value: lead.value || '',
            probability: lead.probability || 0,
            expected_close_date: lead.expected_close_date || '',
            next_follow_up: lead.next_follow_up || '',
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

    // Carregar dados relacionados
    useEffect(() => {
        if (isOpen && profile) {
            loadRelatedData();
        }
    }, [isOpen, profile, lead.id]);

    const loadRelatedData = async () => {
        try {
            const [tasksData, notesData, activitiesData] = await Promise.all([
                supabase.from('tasks').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false }),
                supabase.from('notes').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false }),
                supabase.from('activities').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false })
            ]);

            setTasks(tasksData.data || []);
            setNotes(notesData.data || []);
            setActivities(activitiesData.data || []);
        } catch (error) {
            console.error('Error loading related data:', error);
        }
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('leads')
                .update({
                    name: data.name,
                    email: data.email,
                    company: data.company || null,
                    phone: data.phone || null,
                    message: data.message,
                    status: data.status,
                    source: data.source || null,
                    value: data.value ? parseFloat(data.value) : null,
                    probability: parseInt(data.probability) || 0,
                    expected_close_date: data.expected_close_date || null,
                    next_follow_up: data.next_follow_up || null,
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
        if (!confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) return;

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
            setActiveTab('details');
            reset();
            onClose();
        }
    };

    const addTask = async (title: string, description: string, dueDate?: string) => {
        if (!profile) return;

        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    title,
                    description,
                    due_date: dueDate || null,
                    lead_id: lead.id,
                    profile_id: profile.id,
                    status: 'pending',
                    priority: 'medium'
                })
                .select()
                .single();

            if (error) throw error;

            setTasks(prev => [data, ...prev]);
            toast.success('Tarefa adicionada!');
        } catch (error) {
            console.error('Error adding task:', error);
            toast.error('Erro ao adicionar tarefa');
        }
    };

    const addNote = async (content: string) => {
        if (!profile) return;

        try {
            const { data, error } = await supabase
                .from('notes')
                .insert({
                    content,
                    lead_id: lead.id,
                    profile_id: profile.id
                })
                .select()
                .single();

            if (error) throw error;

            setNotes(prev => [data, ...prev]);
            toast.success('Nota adicionada!');
        } catch (error) {
            console.error('Error adding note:', error);
            toast.error('Erro ao adicionar nota');
        }
    };

    const addActivity = async (type: string, title: string, description: string) => {
        if (!profile) return;

        try {
            const { data, error } = await supabase
                .from('activities')
                .insert({
                    type,
                    title,
                    description,
                    lead_id: lead.id,
                    profile_id: profile.id
                })
                .select()
                .single();

            if (error) throw error;

            setActivities(prev => [data, ...prev]);
            toast.success('Atividade adicionada!');
        } catch (error) {
            console.error('Error adding activity:', error);
            toast.error('Erro ao adicionar atividade');
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'details', label: 'Detalhes', icon: User },
        { id: 'tasks', label: 'Tarefas', icon: CheckSquare, count: tasks.length },
        { id: 'notes', label: 'Notas', icon: MessageSquare, count: notes.length },
        { id: 'activities', label: 'Atividades', icon: Activity, count: activities.length },
        { id: 'followup', label: 'Follow-up', icon: Calendar },
    ];

    const modalContent = (
        <div className="fixed inset-0 z-[99999] bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {lead.name}
                        </h2>
                        {currentStatus && (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
                                {currentStatus.label}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {activeTab === 'details' && !isEditing && (
                            <>
                                <button
                                    onClick={() => {
                                        console.log('Opening custom fields modal');
                                        setShowCustomFields(true);
                                    }}
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

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'details' && (
                        <DetailsTab
                            lead={lead}
                            isEditing={isEditing}
                            loading={loading}
                            register={register}
                            handleSubmit={handleSubmit}
                            onSubmit={onSubmit}
                            errors={errors}
                            statusOptions={statusOptions}
                            setIsEditing={setIsEditing}
                            reset={reset}
                        />
                    )}

                    {activeTab === 'tasks' && (
                        <TasksTab tasks={tasks} onAddTask={addTask} />
                    )}

                    {activeTab === 'notes' && (
                        <NotesTab notes={notes} onAddNote={addNote} />
                    )}

                    {activeTab === 'activities' && (
                        <ActivitiesTab activities={activities} onAddActivity={addActivity} />
                    )}

                    {activeTab === 'followup' && (
                        <FollowupTab lead={lead} onUpdate={onUpdate} />
                    )}
                </div>

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

    return createPortal(modalContent, document.body);
};

// Componente para a aba de detalhes
const DetailsTab: React.FC<any> = ({
    lead, isEditing, loading, register, handleSubmit, onSubmit, errors,
    statusOptions, setIsEditing, reset
}) => {
    if (isEditing) {
        return (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            Telefone
                        </label>
                        <input
                            {...register('phone')}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
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
                            {statusOptions.map((option: any) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Fonte
                        </label>
                        <input
                            {...register('source')}
                            placeholder="Ex: Website, Indicação, LinkedIn"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Valor Estimado
                        </label>
                        <CurrencyInput
                            register={register}
                            name="value"
                            defaultValue={lead.value}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Probabilidade (%)
                        </label>
                        <input
                            {...register('probability')}
                            type="number"
                            min="0"
                            max="100"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Data Esperada de Fechamento
                        </label>
                        <input
                            {...register('expected_close_date')}
                            type="date"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Próximo Follow-up
                        </label>
                        <input
                            {...register('next_follow_up')}
                            type="datetime-local"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
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
        );
    }

    return (
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
                </div>

                <div className="space-y-4">
                    {lead.source && (
                        <div className="flex items-center space-x-3">
                            <span className="w-5 h-5 text-gray-400 text-center">🔗</span>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Fonte</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{lead.source}</p>
                            </div>
                        </div>
                    )}

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
    );
};

// Componente para a aba de tarefas
const TasksTab: React.FC<{ tasks: Task[]; onAddTask: (title: string, description: string, dueDate?: string) => void }> = ({ tasks, onAddTask }) => {
    const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTask.title.trim()) {
            onAddTask(newTask.title, newTask.description, newTask.dueDate);
            setNewTask({ title: '', description: '', dueDate: '' });
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nova Tarefa</h3>
                <div className="space-y-3">
                    <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Título da tarefa"
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        required
                    />
                    <textarea
                        value={newTask.description}
                        onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição (opcional)"
                        rows={2}
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    />
                    <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <button
                        type="submit"
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Tarefa</span>
                    </button>
                </div>
            </form>

            <div className="space-y-3">
                {tasks.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhuma tarefa encontrada.</p>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                                    {task.description && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{task.description}</p>
                                    )}
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span className={`px-2 py-1 rounded ${task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                            task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {task.status === 'completed' ? 'Concluída' :
                                                task.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                                        </span>
                                        {task.due_date && (
                                            <span className="flex items-center space-x-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
                                            </span>
                                        )}
                                        <span>Criada: {new Date(task.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Componente para a aba de notas
const NotesTab: React.FC<{ notes: Note[]; onAddNote: (content: string) => void }> = ({ notes, onAddNote }) => {
    const [newNote, setNewNote] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newNote.trim()) {
            onAddNote(newNote);
            setNewNote('');
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nova Nota</h3>
                <div className="space-y-3">
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Escreva sua nota aqui..."
                        rows={3}
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                        required
                    />
                    <button
                        type="submit"
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Nota</span>
                    </button>
                </div>
            </form>

            <div className="space-y-3">
                {notes.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhuma nota encontrada.</p>
                ) : (
                    notes.map((note) => (
                        <div key={note.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{note.content}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {new Date(note.created_at).toLocaleString('pt-BR')}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Componente para a aba de atividades
const ActivitiesTab: React.FC<{ activities: ActivityType[]; onAddActivity: (type: string, title: string, description: string) => void }> = ({ activities, onAddActivity }) => {
    const [newActivity, setNewActivity] = useState({ type: 'call', title: '', description: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newActivity.title.trim()) {
            onAddActivity(newActivity.type, newActivity.title, newActivity.description);
            setNewActivity({ type: 'call', title: '', description: '' });
        }
    };

    const activityTypes = [
        { value: 'call', label: 'Ligação', icon: '📞' },
        { value: 'email', label: 'E-mail', icon: '📧' },
        { value: 'meeting', label: 'Reunião', icon: '🤝' },
        { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
        { value: 'other', label: 'Outro', icon: '📝' },
    ];

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nova Atividade</h3>
                <div className="space-y-3">
                    <select
                        value={newActivity.type}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        {activityTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.icon} {type.label}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={newActivity.title}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Título da atividade"
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        required
                    />
                    <textarea
                        value={newActivity.description}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição (opcional)"
                        rows={2}
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    />
                    <button
                        type="submit"
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Atividade</span>
                    </button>
                </div>
            </form>

            <div className="space-y-3">
                {activities.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhuma atividade encontrada.</p>
                ) : (
                    activities.map((activity) => {
                        const activityType = activityTypes.find(t => t.value === activity.type);
                        return (
                            <div key={activity.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start space-x-3">
                                    <span className="text-2xl">{activityType?.icon || '📝'}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{activity.title}</h4>
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                                {activityType?.label || 'Outro'}
                                            </span>
                                        </div>
                                        {activity.description && (
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{activity.description}</p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            {new Date(activity.created_at).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// Componente para a aba de follow-up
const FollowupTab: React.FC<{ lead: Lead; onUpdate?: () => void }> = ({ lead, onUpdate }) => {
    const { profile } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [followupDate, setFollowupDate] = useState(lead.next_follow_up || '');
    const [followupNote, setFollowupNote] = useState('');

    const handleUpdateFollowup = async () => {
        if (!profile) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('leads')
                .update({
                    next_follow_up: followupDate || null,
                    last_contact_date: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', lead.id);

            if (error) throw error;

            // Se há uma nota, adicionar como nota do lead
            if (followupNote.trim()) {
                const { error: noteError } = await supabase
                    .from('notes')
                    .insert({
                        content: `Follow-up agendado: ${followupNote}`,
                        lead_id: lead.id,
                        profile_id: profile.id
                    });

                if (noteError) throw noteError;
            }

            toast.success('Follow-up atualizado com sucesso!');
            setFollowupNote('');
            onUpdate?.();
        } catch (error: any) {
            console.error('Error updating follow-up:', error);
            toast.error('Erro ao atualizar follow-up');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsContacted = async () => {
        if (!profile) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('leads')
                .update({
                    last_contact_date: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', lead.id);

            if (error) throw error;

            // Adicionar atividade de contato
            const { error: activityError } = await supabase
                .from('activities')
                .insert({
                    type: 'other',
                    title: 'Contato realizado',
                    description: 'Lead contatado via follow-up',
                    lead_id: lead.id,
                    profile_id: profile.id,
                    completed_at: new Date().toISOString()
                });

            if (activityError) throw activityError;

            toast.success('Contato registrado com sucesso!');
            onUpdate?.();
        } catch (error: any) {
            console.error('Error marking as contacted:', error);
            toast.error('Erro ao registrar contato');
        } finally {
            setLoading(false);
        }
    };

    const getFollowupStatus = () => {
        if (!lead.next_follow_up) return null;

        const now = new Date();
        const followupDate = new Date(lead.next_follow_up);
        const diffTime = followupDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { status: 'overdue', message: `Atrasado há ${Math.abs(diffDays)} dia(s)`, color: 'text-red-600 bg-red-50' };
        } else if (diffDays === 0) {
            return { status: 'today', message: 'Hoje', color: 'text-orange-600 bg-orange-50' };
        } else if (diffDays === 1) {
            return { status: 'tomorrow', message: 'Amanhã', color: 'text-yellow-600 bg-yellow-50' };
        } else {
            return { status: 'future', message: `Em ${diffDays} dia(s)`, color: 'text-green-600 bg-green-50' };
        }
    };

    const followupStatus = getFollowupStatus();

    return (
        <div className="space-y-6">
            {/* Status atual do follow-up */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status do Follow-up</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Próximo Follow-up</p>
                        {lead.next_follow_up ? (
                            <div className="flex items-center space-x-2">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(lead.next_follow_up).toLocaleString('pt-BR')}
                                </p>
                                {followupStatus && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${followupStatus.color}`}>
                                        {followupStatus.message}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">Não agendado</p>
                        )}
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Último Contato</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {lead.last_contact_date 
                                ? new Date(lead.last_contact_date).toLocaleString('pt-BR')
                                : 'Nunca'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Agendar novo follow-up */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agendar Follow-up</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Data e Hora do Follow-up
                        </label>
                        <input
                            type="datetime-local"
                            value={followupDate}
                            onChange={(e) => setFollowupDate(e.target.value)}
                            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Observações (opcional)
                        </label>
                        <textarea
                            value={followupNote}
                            onChange={(e) => setFollowupNote(e.target.value)}
                            placeholder="Adicione observações sobre este follow-up..."
                            rows={3}
                            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={handleUpdateFollowup}
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            <Calendar className="w-4 h-4" />
                            <span>{loading ? 'Salvando...' : 'Agendar Follow-up'}</span>
                        </button>

                        <button
                            onClick={handleMarkAsContacted}
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            <CheckSquare className="w-4 h-4" />
                            <span>{loading ? 'Salvando...' : 'Marcar como Contatado'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Histórico de follow-ups */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dicas de Follow-up</h3>
                
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-start space-x-2">
                        <span className="text-blue-500">💡</span>
                        <p>Agende follow-ups regulares para manter o lead engajado</p>
                    </div>
                    <div className="flex items-start space-x-2">
                        <span className="text-green-500">📞</span>
                        <p>Varie os canais de contato: telefone, email, WhatsApp</p>
                    </div>
                    <div className="flex items-start space-x-2">
                        <span className="text-purple-500">📝</span>
                        <p>Sempre adicione observações sobre o que foi discutido</p>
                    </div>
                    <div className="flex items-start space-x-2">
                        <span className="text-orange-500">⏰</span>
                        <p>Respeite os horários preferenciais do lead</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteLeadModal;