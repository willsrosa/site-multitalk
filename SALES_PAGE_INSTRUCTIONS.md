# Página de Vendas - Instruções de Implementação

## Resumo das Alterações

Foi criada uma nova página de vendas elegante e moderna que será acessada através da URL `/v/admin` (ou qualquer slug de afiliado). Esta página substitui a página de afiliado anterior com um design focado em conversão.

## Principais Funcionalidades

### 1. Página de Vendas Elegante
- **URL**: `/v/{username}` (ex: `/v/admin`)
- Design moderno inspirado em sites de vendas profissionais
- Seções otimizadas para conversão:
  - Hero section com call-to-action
  - Benefícios e diferenciais
  - Prova social com números
  - Formulário de contato
  - Seção dedicada ao WhatsApp

### 2. Campo WhatsApp no Perfil
- Adicionado campo `whatsapp` na tabela `profiles`
- Interface de edição no painel administrativo
- Integração automática com a página de vendas

### 3. Formulário de Leads
- Captura leads diretamente na página de vendas
- Campos: Nome, Email, Empresa, Mensagem
- Leads são automaticamente associadas ao afiliado
- Status inicial: "Nova Lead"

### 4. Integração WhatsApp
- Botão do WhatsApp na página de vendas
- Mensagem pré-definida para facilitar o contato
- Funciona apenas se o afiliado tiver WhatsApp cadastrado

## Arquivos Criados/Modificados

### Novos Arquivos
- `src/pages/SalesPage.tsx` - Página de vendas principal
- `migrations/003_add_whatsapp_to_profiles.sql` - Migração para WhatsApp
- `run_all_migrations.sql` - Script para executar todas as migrações

### Arquivos Modificados
- `src/App.tsx` - Adicionada nova rota para página de vendas
- `src/lib/supabase.ts` - Adicionado campo `whatsapp` ao tipo `Profile`
- `src/components/admin/ProfilePage.tsx` - Adicionado formulário de edição com WhatsApp
- `src/contexts/AuthContext.tsx` - Adicionada função `refreshProfile`

## Como Executar

### 1. Executar Migrações
Execute o seguinte SQL no Supabase SQL Editor:

```sql
-- Adicionar campo WhatsApp à tabela profiles
ALTER TABLE profiles ADD COLUMN whatsapp TEXT;
CREATE INDEX idx_profiles_whatsapp ON profiles(whatsapp);
UPDATE profiles SET updated_at = NOW() WHERE whatsapp IS NULL;
```

### 2. Testar a Implementação
1. Acesse o painel administrativo
2. Vá em "Perfil" e adicione um número de WhatsApp
3. Copie o link da página de vendas
4. Acesse o link em uma nova aba
5. Teste o formulário de contato e o botão do WhatsApp

## Funcionalidades da Página de Vendas

### Design Responsivo
- Otimizada para desktop e mobile
- Gradientes modernos e animações suaves
- Tipografia hierárquica e legível

### Seções Principais
1. **Hero Section**: Apresentação do afiliado com CTAs principais
2. **Benefícios**: Cards com ícones destacando diferenciais
3. **Prova Social**: Números e estatísticas de credibilidade
4. **Formulário**: Captura de leads com validação
5. **WhatsApp CTA**: Seção dedicada para contato direto

### Integração com CRM
- Leads capturadas aparecem automaticamente no Kanban
- Status inicial: "Nova Lead"
- Associação automática com o afiliado correto

## Próximos Passos Sugeridos

1. **Personalização**: Permitir que afiliados personalizem textos e cores
2. **Analytics**: Adicionar tracking de conversões e visualizações
3. **A/B Testing**: Implementar testes para otimizar conversão
4. **SEO**: Adicionar meta tags dinâmicas por afiliado
5. **Integração Email**: Envio automático de emails para leads

## Troubleshooting

### Problema: WhatsApp não funciona
- Verificar se o número está no formato correto
- Testar com e sem código do país
- Verificar se o campo não está vazio

### Problema: Formulário não envia
- Verificar conexão com Supabase
- Verificar políticas RLS da tabela `leads`
- Verificar se o `profile_id` está correto

### Problema: Página não carrega
- Verificar se o username existe na tabela `profiles`
- Verificar se a rota está configurada corretamente
- Verificar console do navegador para erros

## Suporte

Para dúvidas ou problemas, verifique:
1. Console do navegador para erros JavaScript
2. Logs do Supabase para erros de banco
3. Network tab para problemas de API
4. Este arquivo de documentação para referência