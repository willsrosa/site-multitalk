# Guia de Debug do Kanban

## Problema
O Kanban está movendo os cards visualmente, mas não está salvando as mudanças no banco de dados.

## Arquivos de Debug Criados

### 1. `test_kanban_permissions.sql`
Script para testar permissões básicas do usuário e verificar se consegue acessar os dados.

### 2. `debug_kanban_update.sql`
Script mais detalhado para debugar especificamente o problema de atualização.

### 3. `simple_update_test.sql`
Teste simples e direto para verificar se consegue fazer UPDATE na tabela leads.

### 4. `fix_kanban_policies.sql`
Script para corrigir as políticas RLS que podem estar causando o problema.

## Modificações no Código

### KanbanBoard.tsx
- Adicionados logs detalhados no console
- Verificação de sessão do usuário
- Validação do profile_id antes da atualização
- Verificação se o lead existe antes de tentar atualizar
- Melhor tratamento de erros
- Informações de debug na interface

## Como Debugar

### Passo 1: Verificar Console do Navegador
1. Abra o DevTools (F12)
2. Vá para a aba Console
3. Tente mover um card no Kanban
4. Observe os logs que começam com emojis (🎯, 📋, 👤, etc.)

### Passo 2: Testar Permissões no Supabase
1. Vá para o Supabase Dashboard
2. Abra o SQL Editor
3. Execute o script `simple_update_test.sql`
4. Substitua 'SEU_LEAD_ID_AQUI' por um ID real de lead
5. Veja se a atualização funciona

### Passo 3: Corrigir Políticas (se necessário)
Se o teste SQL não funcionar, execute o script `fix_kanban_policies.sql`

### Passo 4: Verificar Dados na Interface
Observe as informações de debug que aparecem abaixo do título "Kanban de Leads":
- Profile ID
- Número de leads
- Role do usuário

## Possíveis Causas

1. **Políticas RLS muito restritivas**
2. **Sessão expirada**
3. **Profile_id incorreto ou ausente**
4. **Permissões insuficientes na tabela**
5. **Erro na estrutura da query**

## Próximos Passos

1. Execute os scripts SQL na ordem sugerida
2. Verifique os logs no console
3. Se ainda não funcionar, compartilhe os logs do console e resultados dos scripts SQL