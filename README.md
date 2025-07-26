# 🎪 CONCLAVE JUNINO - Sistema de Eleição do Papa do Arraiá

Sistema web para gerenciar a eleição do "Papa Caipira" durante a festa junina, simulando um conclave católico de forma divertida e temática.

## 🎯 Funcionalidades

- **Inscrição de Participantes**: Registro com nomes reais e "nomes de cardeal" criativos
- **Votação Secreta**: Sistema de até 4 rodadas com anonimato total
- **Painel Administrativo**: Controle de rodadas, sanções e remoção de participantes
- **Painel TV**: Interface otimizada para transmissão em tela grande
- **Tempo Real**: Atualizações automáticas a cada 2-3 segundos
- **Animações Temáticas**: Sons de sino, fumacinha branca e celebrações juninas

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone [url-do-repositorio]
cd conclave

# Instale as dependências
npm install

# Configure as variáveis de ambiente (opcional)
cp env.example .env
# Edite o arquivo .env com suas configurações do Supabase
```

### Execução
```bash
# Modo desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

## 🔧 Configuração

### Supabase (Opcional)
O sistema funciona perfeitamente sem Supabase, usando localStorage local. Para usar com banco de dados:

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as tabelas necessárias:
   - `participants` (id, real_name, cardinal_name, created_at)
   - `votes` (id, participant_id, candidate_id, round, created_at)
   - `voting_sessions` (id, current_round, round_active, max_rounds, created_at, updated_at)
   - `sanctions` (id, message, round, applied_by, created_at)
3. Adicione as variáveis no arquivo `.env`:
   ```
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_chave_aqui
   ```

## 📱 Páginas do Sistema

- **`/`** - Página de inscrição e entrada no conclave
- **`/admin`** - Painel administrativo (senha: "loverson")
- **`/tv`** - Painel público para transmissão na TV

## 🎮 Como Usar

1. **Inscrição**: Acesse a página principal e registre-se com nome real e "nome de cardeal"
2. **Votação**: Quando a rodada for iniciada, vote secretamente pelo celular/computador
3. **Administração**: Use o painel admin para controlar rodadas e aplicar sanções
4. **TV**: Conecte um computador à TV e acesse `/tv` para transmissão pública

## 🏆 Regras da Eleição

- Vencedor precisa de **mais de 50% dos votos**
- Máximo de **4 rodadas**
- Na 4ª rodada, quem tiver **mais votos** vence
- **Sanções** são aplicadas entre rodadas
- **Anonimato total** dos votos garantido

## 🎨 Tecnologias

- **Frontend**: React + TypeScript + Vite
- **UI**: TailwindCSS + Radix UI + Framer Motion
- **Backend**: Supabase (opcional) / localStorage
- **Roteamento**: React Router
- **Animações**: Framer Motion

## 📝 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run lint` - Verificação de código

## 🔒 Segurança

- Senha do admin: "loverson"
- Votos são completamente anônimos
- Apenas rastreamento de participação
- Sistema funciona offline (localStorage)

---

**🎪 "Habemus Papa do Arraiá!" 🎪**
