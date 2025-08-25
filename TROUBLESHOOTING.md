# Troubleshooting - Erros de Carregamento

## Problemas Identificados

Você está enfrentando erros ao carregar perfil e leads. Isso geralmente acontece por:

1. **Políticas RLS muito restritivas**
2. **Tabelas não criadas corretamente**
3. **Usuário não tem perfil criado**
4. **Permissões insuficientes**

## Soluções Passo a Passo

### 1. Primeiro, execute o debug
Execute o arquivo `debug_policies.sql` no Supabase SQL Editor para identificar o problema:

```sql
-- Cole o conteúdo do arquivo debug_policies.sql no SQL Editor
```

### 2. Se as tabelas não existirem
Execute a migration corrigida:
```sql
-- Cole o conteúdo do arquivo migrations/001_create_user_affiliate_system_fixed.sql
```

### 3. Se o problema for RLS (mais provável)
Execute o arquivo `fix_policies.sql` para simplificar as políticas:

```sql
-- Cole o conteúdo do arquivo fix_policies.sql no SQL Editor
```

### 4. Verificar se seu usuário tem perfil
Execute no SQL Editor:
```sql
-- Verificar se você tem perfil
SELECT * FROM profiles WHERE user_id = auth.uid();

-- Se não tiver, criar manualmente (substitua os valores)
INSERT INTO profiles (user_id, username, full_name, role)
VALUES (
    auth.uid(),
    'seu_username',
    'Seu Nome',
    'superadmin'
);
```

### 5. Testar no Dashboard
1. Acesse `/admin` 
2. Verifique o componente Debug Info que foi adicionado temporariamente
3. Veja se há erros específicos nos dados retornados

### 6. Problemas Comuns e Soluções

#### Erro: "permission denied for table profiles"
**Solução**: Execute `fix_policies.sql`

#### Erro: "relation profiles does not exist"
**Solução**: Execute a migration `001_create_user_affiliate_system_fixed.sql`

#### Erro: "No profile found"
**Solução**: Crie o perfil manualmente ou verifique se o trigger está funcionando

#### Erro: "RLS policy violation"
**Solução**: Simplifique as políticas com `fix_policies.sql`

### 7. Verificação Final

Após aplicar as correções, teste:

1. **Login**: `/admin/login`
2. **Dashboard**: Deve mostrar dados sem erros
3. **Kanban**: Deve carregar (mesmo que vazio)
4. **Usuários**: Deve mostrar lista de usuários
5. **Perfil**: Deve mostrar seu perfil

### 8. Remover Debug

Após resolver, remova o componente DebugInfo do AdminDashboard:

```typescript
// Remover esta linha
import DebugInfo from './DebugInfo';

// Remover este bloco
<motion.div>
  <DebugInfo />
</motion.div>
```

## Ordem de Execução Recomendada

1. Execute `debug_policies.sql` - para diagnosticar
2. Execute `fix_policies.sql` - para corrigir políticas
3. Se necessário, execute a migration completa
4. Crie seu perfil de superadmin manualmente
5. Teste o sistema

## Contato para Suporte

Se ainda houver problemas, compartilhe:
1. Output do `debug_policies.sql`
2. Mensagens de erro específicas do console
3. Screenshots dos erros