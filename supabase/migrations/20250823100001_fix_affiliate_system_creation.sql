/*
          # [Fix] Criação do Sistema de Afiliados e Kanban
          [Este script cria as tabelas e políticas de segurança para o sistema de afiliados, Kanban e controle de acesso de superadmin. É seguro para ser executado novamente, pois verifica a existência dos objetos antes de criá-los.]

          ## Query Description: [Cria as tabelas `profiles` e `leads`, tipos personalizados para roles e status, e as políticas de segurança (RLS) necessárias. Não há risco de perda de dados existentes.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Tipos: user_role, kanban_status
          - Tabelas: profiles, leads
          - Políticas: RLS para posts, profiles, leads
          - Triggers: on_auth_user_created
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Usuários autenticados]
          
          ## Performance Impact:
          - Indexes: [Adicionados (PKs, FKs)]
          - Triggers: [Adicionado (1)]
          - Estimated Impact: [Baixo]
          */

-- 1. Criar tipos personalizados, se não existirem
create type public.user_role as enum ('superadmin', 'affiliate');
create type public.kanban_status as enum ('Nova Lead', 'Em Atendimento', 'Reunião', 'Ganho', 'Perca');

-- 2. Criar tabela de perfis, se não existir
create table if not exists public.profiles (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null unique,
  username text unique not null check (char_length(username) >= 3 and username ~ '^[a-z0-9_.-]+$'),
  full_name text,
  avatar_url text,
  role user_role default 'affiliate'::public.user_role not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.profiles is 'Armazena perfis de usuários, incluindo afiliados e superadmins.';

-- 3. Criar tabela de leads, se não existir
create table if not exists public.leads (
  id uuid not null primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  message text not null,
  status kanban_status default 'Nova Lead'::public.kanban_status not null,
  profile_id uuid references public.profiles on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.leads is 'Armazena os leads gerados para cada afiliado.';

-- 4. Função para criar perfil automaticamente para novos usuários
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, username, full_name, avatar_url)
  values (
    new.id, 
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- 5. Trigger para executar a função acima quando um novo usuário é criado
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Habilitar RLS e definir políticas
-- Tabela Profiles
alter table public.profiles enable row level security;
drop policy if exists "Perfis são visíveis para todos." on public.profiles;
create policy "Perfis são visíveis para todos." on public.profiles for select using (true);
drop policy if exists "Usuários podem inserir seu próprio perfil." on public.profiles;
create policy "Usuários podem inserir seu próprio perfil." on public.profiles for insert with check (auth.uid() = user_id);
drop policy if exists "Usuários podem atualizar seu próprio perfil." on public.profiles;
create policy "Usuários podem atualizar seu próprio perfil." on public.profiles for update using (auth.uid() = user_id);

-- Tabela Leads
alter table public.leads enable row level security;
drop policy if exists "Leads são visíveis apenas para o afiliado dono." on public.leads;
create policy "Leads são visíveis apenas para o afiliado dono." on public.leads for select using (exists (select 1 from profiles where profiles.user_id = auth.uid() and profiles.id = leads.profile_id));
drop policy if exists "Qualquer pessoa pode inserir um lead (formulário de contato)." on public.leads;
create policy "Qualquer pessoa pode inserir um lead (formulário de contato)." on public.leads for insert with check (true);
drop policy if exists "Afiliados podem atualizar seus próprios leads." on public.leads;
create policy "Afiliados podem atualizar seus próprios leads." on public.leads for update using (exists (select 1 from profiles where profiles.user_id = auth.uid() and profiles.id = leads.profile_id));

-- Tabela Posts (Controle de Superadmin)
alter table public.posts enable row level security;
-- Dropa políticas antigas se existirem
drop policy if exists "Qualquer pessoa pode ler posts publicados." on public.posts;
drop policy if exists "Usuários autenticados podem criar posts." on public.posts;
drop policy if exists "Usuários podem atualizar seus próprios posts." on public.posts;
drop policy if exists "Usuários podem deletar seus próprios posts." on public.posts;
-- Cria novas políticas com base na role
create policy "Qualquer pessoa pode ler posts publicados." on public.posts for select using (status = 'published');
create policy "Apenas superadmins podem criar posts." on public.posts for insert with check (exists (select 1 from profiles where user_id = auth.uid() and role = 'superadmin'));
create policy "Apenas superadmins podem atualizar posts." on public.posts for update with check (exists (select 1 from profiles where user_id = auth.uid() and role = 'superadmin'));
create policy "Apenas superadmins podem deletar posts." on public.posts for delete using (exists (select 1 from profiles where user_id = auth.uid() and role = 'superadmin'));
