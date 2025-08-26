# CRM Kanban System 🚀

Um sistema CRM moderno com Kanban Board para gerenciamento de leads, construído com React, TypeScript e Supabase.

## ✨ Funcionalidades

### 🎯 Kanban Board Avançado
- **Layout em Grid Responsivo**: Adapta-se automaticamente ao tamanho da tela
- **Resumo de Valores**: Cada coluna mostra o valor total dos leads em tempo real
- **Inserção Rápida**: Botão para adicionar leads diretamente em cada coluna
- **Drag & Drop**: Mova leads entre colunas com facilidade
- **Modal Otimizado**: Interface simplificada para criação rápida de leads

### 📊 Gestão Completa de Leads
- Campos essenciais: nome, email, telefone, empresa
- Campos de negócio: valor estimado, probabilidade, data de fechamento
- Rastreamento de fonte: website, redes sociais, indicação, etc.
- Status personalizáveis: Nova Lead → Em Atendimento → Reunião → Ganho/Perca

### 🔐 Sistema de Usuários
- Autenticação segura com Supabase Auth
- Perfis de usuário (Afiliado/Superadmin)
- Row Level Security (RLS) para proteção de dados
- Criação automática de perfil no cadastro

### 📱 Design Responsivo
- **Mobile**: 1 coluna (scroll vertical)
- **Tablet**: 2 colunas lado a lado
- **Desktop**: 3 colunas
- **Tela Grande**: 5 colunas (visão completa)

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Vite
- **Estilização**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Drag & Drop**: @dnd-kit/core
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Notificações**: React Hot Toast

## 🚀 Configuração Rápida

### 1. Pré-requisitos
- Node.js 18+
- Conta no Supabase
- npm ou yarn

### 2. Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd crm-system

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

### 3. Configurar Supabase
Edite o arquivo `.env` com suas credenciais:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 4. Executar Migrações
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **SQL Editor**
3. Execute o arquivo `run_migrations.sql` (copie e cole todo o conteúdo)
4. Execute `test_setup.sql` para verificar se tudo funcionou

### 5. Iniciar o Projeto
```bash
npm run dev
```

## 📋 Estrutura do Banco de Dados

### Tabelas Principais
- **profiles**: Perfis de usuário
- **leads**: Leads do sistema
- **contacts**: Contatos do formulário
- **tasks**: Tarefas relacionadas aos leads
- **notes**: Anotações sobre leads
- **activities**: Atividades (ligações, reuniões, emails)
- **lead_custom_fields**: Campos personalizados

### Campos dos Leads
```sql
- id, name, email, phone, company, message
- status (Nova Lead, Em Atendimento, Reunião, Ganho, Perca)
- source (website, social_media, referral, etc.)
- value (valor estimado em R$)
- probability (0-100%)
- expected_close_date, last_contact_date, next_follow_up
- profile_id, created_at, updated_at
```

## 🎨 Como Usar

### Adicionar Lead Rapidamente
1. Clique em **"Adicionar Lead"** em qualquer coluna
2. Preencha os dados no modal
3. O lead aparece imediatamente na coluna escolhida

### Mover Leads
- Arraste e solte leads entre colunas
- O status é atualizado automaticamente no banco

### Visualizar Resumo
- Cada coluna mostra o valor total dos leads
- Contador de leads com valor definido
- Atualização em tempo real

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── admin/
│   │   ├── kanban/          # Componentes do Kanban
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── LeadCard.tsx
│   │   │   └── QuickAddLeadModal.tsx
│   │   └── ...
│   └── common/              # Componentes compartilhados
├── contexts/                # Contextos React
├── hooks/                   # Hooks customizados
├── lib/                     # Configurações e utilitários
├── pages/                   # Páginas da aplicação
└── types/                   # Definições TypeScript
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Verificar código
```

## 📊 Arquivos de Migração

- `run_migrations.sql`: Script completo para configurar o banco
- `test_setup.sql`: Verificar se a configuração está correta
- `SETUP_INSTRUCTIONS.md`: Instruções detalhadas de configuração

## 🚀 Próximas Funcionalidades

- [ ] Filtros avançados (por fonte, valor, data)
- [ ] Relatórios e gráficos de conversão
- [ ] Notificações de follow-up
- [ ] Integração com WhatsApp/Email
- [ ] Campos personalizáveis via interface
- [ ] Exportação de dados
- [ ] API para integrações

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se encontrar problemas:

1. Verifique o arquivo `TROUBLESHOOTING.md`
2. Execute `test_setup.sql` para diagnosticar
3. Confira os logs do Supabase
4. Abra uma issue no GitHub

---

**Desenvolvido com ❤️ para otimizar seu processo de vendas!**