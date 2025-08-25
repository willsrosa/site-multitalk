# Instruções para Implementar o Sistema de Usuários e Afiliados

## 1. Executar a Migration no Supabase

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para **SQL Editor** no menu lateral
4. Abra o arquivo `migrations/001_create_user_affiliate_system_fixed.sql` (versão corrigida)
5. Copie todo o conteúdo do arquivo
6. Cole no SQL Editor do Supabase
7. **IMPORTANTE**: Antes de executar, encontre esta linha comentada no final do arquivo:

```sql
/*
INSERT INTO profiles (user_id, username, full_name, role)
SELECT 
    id,
    'admin',
    'Super Admin',
    'superadmin'
FROM auth.users 
WHERE email = 'your-admin-email@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';
*/
```

8. Descomente essas linhas e substitua `'your-admin-email@example.com'` pelo seu email de admin
9. Execute o SQL clicando em **Run**

## 2. Verificar se as Tabelas foram Criadas

Após executar a migration, verifique se as seguintes tabelas foram criadas:

- `profiles` - Perfis dos usuários
- `contacts` - Contatos gerais do site
- `leads` - Leads rastreados por afiliados

## 3. Configurar Permissões no Supabase

**IMPORTANTE**: Para que o sistema funcione corretamente, você precisa configurar:

1. Vá para **Authentication > Settings**
2. **Desabilite** "Enable email confirmations" (para facilitar testes)
3. **Desabilite** "Enable phone confirmations"
4. Em **Authentication > URL Configuration**, certifique-se de que as URLs estão corretas

**Nota**: O sistema usa `signUp` normal em vez de `admin.createUser` porque este último requer service role key.

## 4. Testar o Sistema

1. Faça login no painel admin: `/admin/login`
2. Acesse **Usuários** no menu lateral (só aparece para superadmins)
3. Teste criar um novo usuário afiliado
4. Teste o link de afiliado: `/v/username_do_afiliado`
5. Teste enviar um lead através do formulário de contato na página do afiliado

## 5. Funcionalidades Implementadas

### Para Superadmins:
- ✅ Visualizar todos os usuários
- ✅ Criar novos usuários (afiliados ou superadmins)
- ✅ Promover/rebaixar usuários
- ✅ Excluir usuários
- ✅ Copiar links de afiliados
- ✅ Visualizar todos os leads no Kanban

### Para Afiliados:
- ✅ Visualizar seu próprio perfil
- ✅ Copiar seu link de afiliado
- ✅ Visualizar apenas seus próprios leads no Kanban
- ✅ Gerenciar status dos seus leads

### Sistema de Rastreamento:
- ✅ Links de afiliado únicos: `/v/username`
- ✅ Leads são automaticamente associados ao afiliado
- ✅ Formulário de contato diferencia leads de afiliados vs contatos gerais

## 6. Estrutura das Tabelas Criadas

### profiles
- `id` - UUID único
- `user_id` - Referência ao usuário do Supabase Auth
- `username` - Username único para links de afiliado
- `full_name` - Nome completo
- `avatar_url` - URL do avatar
- `role` - 'superadmin' ou 'affiliate'

### leads
- `id` - UUID único
- `name` - Nome do lead
- `email` - Email do lead
- `company` - Empresa (opcional)
- `message` - Mensagem do lead
- `status` - Status no Kanban
- `profile_id` - ID do afiliado responsável

### contacts
- `id` - UUID único
- `name` - Nome do contato
- `email` - Email do contato
- `company` - Empresa (opcional)
- `message` - Mensagem do contato

## 7. Próximos Passos (Opcionais)

- [ ] Implementar dashboard de estatísticas para afiliados
- [ ] Sistema de comissões/recompensas
- [ ] Notificações por email para novos leads
- [ ] Relatórios de performance por afiliado
- [ ] Integração com WhatsApp Business API

## Problemas Comuns

### Erro de Permissão
Se você receber erros de permissão, certifique-se de que:
1. Você está logado como superadmin
2. As políticas RLS foram criadas corretamente
3. Seu usuário tem a role 'superadmin' na tabela profiles

### Username já existe
Se tentar criar um usuário com username que já existe, o sistema mostrará erro. Usernames devem ser únicos.

### Trigger não funcionando
Se o perfil não for criado automaticamente ao criar um usuário, execute manualmente:

```sql
SELECT handle_new_user();
```