import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  member_count: number;
  creator_name: string;
}

export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  added_by: string | null;
  added_at: string;
  user_name?: string;
  user_email?: string;
}

export const useTeams = () => {
  const queryClient = useQueryClient();

  const {
    data: teams = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_teams_with_member_count');
      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }
      return (data || []) as Team[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createTeamMutation = useMutation({
    mutationFn: async (teamData: CreateTeamData) => {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          ...teamData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Equipo creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating team:', error);
      toast.error('Error al crear el equipo');
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Team> & { id: string }) => {
      const { data, error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Equipo actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating team:', error);
      toast.error('Error al actualizar el equipo');
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Equipo eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting team:', error);
      toast.error('Error al eliminar el equipo');
    },
  });

  return {
    teams,
    isLoading,
    error,
    refetch,
    createTeam: createTeamMutation.mutate,
    updateTeam: updateTeamMutation.mutate,
    deleteTeam: deleteTeamMutation.mutate,
    isCreating: createTeamMutation.isPending,
    isUpdating: updateTeamMutation.isPending,
    isDeleting: deleteTeamMutation.isPending,
  };
};

export const useTeamMembers = (teamId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: members = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          team_id,
          user_id,
          role,
          added_by,
          added_at
        `)
        .eq('team_id', teamId);

      if (error) {
        console.error('Error fetching team members:', error);
        throw error;
      }

      // Get user details separately using the RPC function
      const userIds = (data || []).map(member => member.user_id);
      const { data: usersData, error: usersError } = await supabase.rpc('get_users_with_roles');
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      return (data || []).map(member => {
        const user = (usersData || []).find((u: any) => u.user_id === member.user_id);
        return {
          ...member,
          user_name: user 
            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
            : 'Usuario',
          user_email: user?.email || ''
        };
      }) as TeamMember[];
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });

  const addMemberMutation = useMutation({
    mutationFn: async ({ teamId, userId, role = 'member' }: { teamId: string; userId: string; role?: string }) => {
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role,
          added_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Miembro agregado al equipo');
    },
    onError: (error) => {
      console.error('Error adding team member:', error);
      toast.error('Error al agregar miembro al equipo');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Miembro removido del equipo');
    },
    onError: (error) => {
      console.error('Error removing team member:', error);
      toast.error('Error al remover miembro del equipo');
    },
  });

  return {
    members,
    isLoading,
    error,
    refetch,
    addMember: addMemberMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    isAdding: addMemberMutation.isPending,
    isRemoving: removeMemberMutation.isPending,
  };
};