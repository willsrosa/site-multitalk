# Troubleshooting - Campos Personalizados

## 🔍 Diagnóstico do Problema

### 1. Verificar se as tabelas foram criadas
Execute o script `debug_custom_fields.sql` no SQL Editor do Supabase para verificar:
- Se a tabela `lead_custom_fields` existe
- Se as políticas RLS estão configuradas
- Se as permissões estão corretas

### 2. Verificar no Console do Navegador
1. Abra o DevTools (F12)
2. Vá para a aba Console
3. Tente abrir o modal de campos personalizados
4. Clique no botão "Debug" no modal
5. Verifique os logs no console

### 3. Possíveis Problemas e Soluções

#### ❌ Problema: "Erro ao carregar campos personalizados"
**Possíveis causas:**
- Tabela não foi criada
- Políticas RLS bloqueando acesso
- Usuário não tem permissão

**Solução:**
```sql
-- Execute no SQL Editor do Supabase
-- 1. Verificar se a tabela existe
SELECT * FROM information_schema.tables WHERE table_name = 'lead_custom_fields';

-- 2. Se não existir, execute o script reset_crm_tables.sql
```

#### ❌ Problema: "Sem permissão para adicionar campos personalizados"
**Possíveis causas:**
- Políticas RLS muito restritivas
- Usuário não está autenticado corretamente

**Solução:**
```sql
-- Verificar usuário atual
SELECT auth.uid(), (SELECT role FROM profiles WHERE user_id = auth.uid());

-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'lead_custom_fields';
```

#### ❌ Problema: Modal não abre
**Possíveis causas:**
- JavaScript error
- Componente não está sendo renderizado

**Solução:**
1. Verificar console do navegador para erros
2. Verificar se o botão está visível (ícone de engrenagem)
3. Verificar se está na aba "Detalhes" do modal do lead

#### ❌ Problema: "Já existe um campo com este nome"
**Causa:** Tentando criar campo duplicado para o mesmo lead

**Solução:** Use nomes únicos para cada campo do lead

### 4. Passos para Testar

#### Teste Manual:
1. Abra um lead no kanban
2. Clique no ícone de engrenagem (⚙️) no cabeçalho do modal
3. O modal de campos personalizados deve abrir
4. Tente adicionar um campo de teste
5. Verifique se aparece na lista

#### Teste via SQL:
```sql
-- 1. Buscar um lead existente
SELECT id, name FROM leads LIMIT 1;

-- 2. Inserir campo manualmente (substitua o ID)
INSERT INTO lead_custom_fields (lead_id, field_name, field_value)
VALUES ('SEU_LEAD_ID_AQUI', 'Teste Manual', 'Valor Teste');

-- 3. Verificar se foi inserido
SELECT * FROM lead_custom_fields WHERE field_name = 'Teste Manual';
```

### 5. Logs de Debug

Quando você clicar no botão "Debug" no modal, verifique estas informações no console:

```javascript
// Deve aparecer algo assim:
=== DEBUG CUSTOM FIELDS ===
Lead ID: uuid-do-lead
Connection test: { testData: [...], testError: null }
Current user: { userData: {...}, userError: null }
Lead exists: { leadData: {...}, leadError: null }
```

### 6. Soluções Rápidas

#### Reset Completo:
1. Execute `reset_crm_tables.sql` no Supabase
2. Recarregue a página
3. Teste novamente

#### Verificar Permissões:
```sql
-- Verificar se o usuário tem acesso aos leads
SELECT COUNT(*) FROM leads;

-- Verificar se pode acessar campos personalizados
SELECT COUNT(*) FROM lead_custom_fields;
```

#### Limpar Cache:
1. Ctrl+Shift+R (hard refresh)
2. Limpar localStorage: `localStorage.clear()`
3. Recarregar página

### 7. Contato para Suporte

Se nenhuma das soluções acima funcionar:

1. Execute `debug_custom_fields.sql` e copie os resultados
2. Abra o console do navegador e copie os logs de erro
3. Anote os passos exatos que está seguindo
4. Informe qual navegador está usando

### 8. Funcionalidades Esperadas

Quando funcionando corretamente, você deve conseguir:

✅ Abrir o modal clicando no ícone ⚙️  
✅ Ver campos existentes (se houver)  
✅ Adicionar novos campos com nome e valor  
✅ Editar valores de campos existentes  
✅ Remover campos  
✅ Ver os campos no card do lead (até 2 campos)  

### 9. Estrutura da Tabela

A tabela `lead_custom_fields` deve ter esta estrutura:

```sql
CREATE TABLE lead_custom_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    field_name TEXT NOT NULL,
    field_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lead_id, field_name)
);
```

### 10. Próximos Passos

Se tudo estiver funcionando:
- Teste com diferentes tipos de dados
- Verifique se os campos aparecem no card do lead
- Teste a edição e remoção de campos
- Verifique se os dados persistem após recarregar a página