# Instruções de Configuração do Kanban CRM

## 1. Executar Migrações no Supabase

### Passo 1: Acessar o SQL Editor
1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para a seção **SQL Editor** no menu lateral
3. Clique em **New Query**

### Passo 2: Executar o Script de Migração
1. Copie todo o conteúdo do arquivo `run_migrations.sql`
2. Cole no SQL Editor do Supabase
3. Clique em **Run** para executar

### Passo 3: Verificar se as Tabelas foram Criadas
Execute esta query para verificar:

```sql
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'contacts', 'leads', 'tasks', 'notes', 'activities', 'lead_custom_fields')
ORDER BY tablename;
```

Você deve ver todas as 7 tabelas listadas.

## 2. Configurar Usuário Admin (Opcional)

Se você quiser ter um usuário superadmin, execute este comando substituindo o email:

```sql
-- Substitua 'seu-email@exemplo.com' pelo seu email real
INSERT INTO profiles (user_id, username, full_name, role)
SELECT 
    id,
    'admin',
    'Super Admin',
    'superadmin'
FROM auth.users 
WHERE email = 'seu-email@exemplo.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';
```

## 3. Funcionalidades Implementadas

### ✅ Kanban Board Melhorado
- **Layout em Grid**: Responsivo para diferentes tamanhos de tela
- **Resumo de Valores**: Cada coluna mostra o valor total dos leads
- **Botão de Inserção**: Cada coluna tem um botão para adicionar leads diretamente
- **Modal Rápido**: Modal simplificado para criação rápida de leads

### ✅ Campos Adicionais nos Leads
- `phone`: Telefone do lead
- `source`: Fonte do lead (website, redes sociais, etc.)
- `value`: Valor estimado do negócio
- `probability`: Probabilidade de fechamento (0-100%)
- `expected_close_date`: Data esperada de fechamento
- `last_contact_date`: Data do último contato
- `next_follow_up`: Data do próximo follow-up

### ✅ Tabelas CRM Completas
- **tasks**: Tarefas relacionadas aos leads
- **notes**: Anotações sobre os leads
- **activities**: Atividades (ligações, reuniões, emails)
- **lead_custom_fields**: Campos personalizados para leads

## 4. Como Usar

### Adicionar Lead Rapidamente
1. Clique no botão **"Adicionar Lead"** em qualquer coluna
2. Preencha os dados básicos no modal
3. O lead será criado diretamente na coluna escolhida

### Visualizar Resumo de Valores
- Cada coluna mostra automaticamente a soma dos valores dos leads
- Aparece destacado em verde no topo de cada coluna
- Mostra quantos leads têm valor definido

### Arrastar e Soltar
- Continue usando o drag & drop para mover leads entre colunas
- O sistema atualiza automaticamente o status no banco de dados

## 5. Layout Responsivo

- **Mobile**: 1 coluna por vez
- **Tablet**: 2 colunas
- **Desktop**: 3 colunas
- **Tela Grande**: 5 colunas (todas visíveis)

## 6. Próximos Passos (Opcional)

Se quiser expandir ainda mais o sistema, você pode:

1. **Implementar Filtros**: Por fonte, valor, data, etc.
2. **Relatórios**: Gráficos de conversão, pipeline de vendas
3. **Notificações**: Alertas para follow-ups
4. **Integração**: WhatsApp, email, calendário
5. **Campos Personalizados**: Interface para criar campos customizados

## 7. Troubleshooting

### Erro de Permissão
Se houver erro de permissão ao mover leads:
1. Verifique se o usuário está logado
2. Confirme se as políticas RLS foram criadas corretamente
3. Execute o script `debug_policies.sql` se necessário

### Tabelas não Criadas
Se as tabelas não foram criadas:
1. Verifique se você tem permissões de admin no Supabase
2. Execute as migrações uma por vez se houver erro
3. Verifique os logs de erro no Supabase

### Performance
Para melhor performance com muitos leads:
1. As migrações já incluem índices otimizados
2. Use filtros para limitar a quantidade de dados carregados
3. Considere paginação se tiver mais de 1000 leads