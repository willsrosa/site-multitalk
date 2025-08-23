import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { KanbanStatus, Lead, supabase } from '../../../lib/supabase';
import KanbanColumn from './KanbanColumn';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthContext } from '../../../contexts/AuthContext';

const KANBAN_COLUMNS: KanbanStatus[] = ['Nova Lead', 'Em Atendimento', 'Reunião', 'Ganho', 'Perca'];

const KanbanBoard: React.FC = () => {
  const { profile } = useAuthContext();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!profile) return;
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setLeads(data || []);
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast.error('Erro ao carregar leads.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
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
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeLeadId = active.id as string;
      const newStatus = over.id as KanbanStatus;

      const originalLeads = [...leads];
      
      // Optimistic UI update
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === activeLeadId ? { ...lead, status: newStatus } : lead
        )
      );

      // Update database
      try {
        const { error } = await supabase
          .from('leads')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', activeLeadId);

        if (error) throw error;
        toast.success('Status do lead atualizado!');
      } catch (error) {
        console.error('Error updating lead status:', error);
        toast.error('Falha ao atualizar o status.');
        // Revert UI on failure
        setLeads(originalLeads);
      }
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
    <div className="p-6 md:p-10 h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
          Kanban de Leads
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Gerencie seu funil de vendas.</p>
      </motion.div>
      
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={leadsByStatus[status]}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
