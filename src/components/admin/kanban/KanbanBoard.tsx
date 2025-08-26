import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { KanbanStatus, Lead, supabase } from '../../../lib/supabase';
import KanbanColumn from './KanbanColumn';
import CreateLeadModal from '../CreateLeadModal';
import QuickAddLeadModal from './QuickAddLeadModal';
import toast from 'react-hot-toast';
import { Loader2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthContext } from '../../../contexts/AuthContext';

const KANBAN_COLUMNS: KanbanStatus[] = ['Nova Lead', 'Em Atendimento', 'Reunião', 'Ganho', 'Perca'];

const KanbanBoard: React.FC = () => {
  const { profile } = useAuthContext();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddStatus, setQuickAddStatus] = useState<KanbanStatus>('Nova Lead');

  // Verificar sessão do usuário
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Sessão expirada. Faça login novamente.');
      }
    };
    
    checkSession();
  }, []);

  // Função simples para buscar leads
  const fetchLeads = async () => {
    if (!profile) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('❌ Error fetching leads:', error);
      toast.error('Erro ao carregar leads.');
    }
  };

  useEffect(() => {
    const loadLeads = async () => {
      setLoading(true);
      await fetchLeads();
      setLoading(false);
    };

    if (profile) {
      loadLeads();
    }
  }, [profile]);

  const leadsByStatus = useMemo(() => {
    const grouped = {} as Record<KanbanStatus, Lead[]>;
    KANBAN_COLUMNS.forEach(status => {
      grouped[status] = [];
    });
    leads.forEach(lead => {
      if (grouped[lead.status]) {
        grouped[lead.status].push(lead);
      }
    });
    return grouped;
  }, [leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 50,
        tolerance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const handleDragOver = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeLeadId = active.id as string;
      const newStatus = over.id as KanbanStatus;

      // Verificar se o newStatus é válido
      if (KANBAN_COLUMNS.includes(newStatus)) {
        // Atualizar UI imediatamente
        setLeads(prevLeads => {
          const currentLead = prevLeads.find(lead => lead.id === activeLeadId);
          if (currentLead && currentLead.status !== newStatus) {
            return prevLeads.map(lead =>
              lead.id === activeLeadId ? { ...lead, status: newStatus } : lead
            );
          }
          return prevLeads;
        });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    console.log('🎯 Drag End Event:', { active: active?.id, over: over?.id });

    if (!over || !active) {
      console.log('❌ No over or active element');
      return;
    }

    const activeLeadId = active.id as string;
    const newStatus = over.id as KanbanStatus;

    console.log('📋 Drag details:', { activeLeadId, newStatus, validColumns: KANBAN_COLUMNS });

    // Verificar se o newStatus é válido
    if (KANBAN_COLUMNS.includes(newStatus)) {
      try {
        // Verificar se temos profile_id
        if (!profile?.id) {
          throw new Error('Profile ID não encontrado');
        }

        console.log('🔐 Profile info:', { profileId: profile.id, role: profile.role });

        // Primeiro, buscar o lead atual do banco de dados (não do estado local)
        const { data: leadCheck, error: checkError } = await supabase
          .from('leads')
          .select('id, name, status, profile_id')
          .eq('id', activeLeadId)
          .eq('profile_id', profile.id)
          .single();

        console.log('🔍 Lead check result:', { leadCheck, checkError });

        if (checkError) {
          throw new Error(`Erro ao verificar lead: ${checkError.message}`);
        }

        if (!leadCheck) {
          throw new Error('Lead não encontrado ou sem permissão de acesso');
        }

        // Verificar se o status realmente mudou
        if (leadCheck.status === newStatus) {
          console.log('⚠️ Lead já está no status correto:', leadCheck.status);
          return;
        }

        console.log('🔄 Updating lead status from', leadCheck.status, 'to', newStatus);

        // Fazer a atualização
        const { data, error } = await supabase
          .from('leads')
          .update({ 
            status: newStatus, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', activeLeadId)
          .eq('profile_id', profile.id)
          .select();

        console.log('💾 Database update result:', { data, error });

        if (error) {
          console.error('💥 Supabase error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        if (!data || data.length === 0) {
          throw new Error('Nenhum registro foi atualizado. Verifique as permissões.');
        }

        console.log('✅ Update successful:', data);
        toast.success(`Lead "${leadCheck.name}" movido para "${newStatus}"!`);
        
        // Recarregar dados
        await fetchLeads();
      } catch (error: any) {
        console.error('❌ Error updating lead status:', error);
        
        // Reverter mudança na UI buscando dados atualizados
        await fetchLeads();
        
        toast.error(`Falha ao atualizar: ${error.message || 'Erro desconhecido'}`);
      }
    } else {
      console.log('❌ Invalid status:', newStatus);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" />
        <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando Kanban...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 min-h-screen flex flex-col">


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
      >
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading">
            Kanban de Leads
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Gerencie seu funil de vendas.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex-shrink-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Lead
        </button>
      </motion.div>

      <DndContext sensors={sensors} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto kanban-horizontal-scroll">
          <div className="flex gap-6 pb-4 min-w-max" style={{ minWidth: '1400px' }}>
            {KANBAN_COLUMNS.map((status) => (
              <div key={status} className="flex-shrink-0" style={{ width: '280px' }}>
                <KanbanColumn
                  status={status}
                  leads={leadsByStatus[status]}
                  onUpdate={fetchLeads}
                  onQuickAdd={() => {
                    setQuickAddStatus(status);
                    setShowQuickAddModal(true);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </DndContext>

      {/* Create Lead Modal */}
      <CreateLeadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onLeadCreated={fetchLeads}
      />

      {/* Quick Add Lead Modal */}
      <QuickAddLeadModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onLeadCreated={fetchLeads}
        initialStatus={quickAddStatus}
      />
    </div>
  );
};

export default KanbanBoard;
