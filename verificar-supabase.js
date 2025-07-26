// 🔍 VERIFICADOR E CORRETOR DE PROBLEMAS SUPABASE
// Verifica e corrige problemas com sessões de votação

console.log("🔍 VERIFICADOR DE PROBLEMAS SUPABASE");
console.log("=" .repeat(50));

// Simular problemas comuns do Supabase
const problemasComuns = [
  {
    nome: "Tabela voting_sessions não existe",
    sintoma: "Error: relation \"voting_sessions\" does not exist",
    solucao: "Criar tabela voting_sessions"
  },
  {
    nome: "Sessão não encontrada (PGRST116)",
    sintoma: "JSON object requested, multiple (or no) rows returned",
    solucao: "Criar nova sessão ou usar fallback"
  },
  {
    nome: "Política RLS bloqueando",
    sintoma: "new row violates row-level security policy",
    solucao: "Configurar políticas RLS"
  },
  {
    nome: "Foreign key constraint",
    sintoma: "insert or update on table violates foreign key constraint",
    solucao: "Verificar referências antes de inserir"
  },
  {
    nome: "Permissões insuficientes",
    sintoma: "permission denied for table",
    solucao: "Verificar permissões do usuário"
  }
];

// Scripts SQL para corrigir problemas
const scriptsCorrecao = {
  criarTabelas: `
-- Criar tabela de sessões de votação
CREATE TABLE IF NOT EXISTS voting_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  current_round INTEGER DEFAULT 1,
  round_active BOOLEAN DEFAULT FALSE,
  max_rounds INTEGER DEFAULT 4,
  session_ended BOOLEAN DEFAULT FALSE,
  ended_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID,
  winner_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de participantes
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  real_name TEXT NOT NULL,
  cardinal_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de votos
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de sanções
CREATE TABLE IF NOT EXISTS sanctions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  round INTEGER NOT NULL,
  applied_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
  `,
  
  configurarRLS: `
-- Habilitar RLS
ALTER TABLE voting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir todas as operações (para desenvolvimento)
CREATE POLICY "Allow all operations on voting_sessions" ON voting_sessions
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on participants" ON participants
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on votes" ON votes
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on sanctions" ON sanctions
  FOR ALL USING (true);
  `,
  
  inserirSessaoInicial: `
-- Inserir sessão inicial se não existir
INSERT INTO voting_sessions (current_round, round_active, max_rounds)
SELECT 1, false, 4
WHERE NOT EXISTS (SELECT 1 FROM voting_sessions);
  `,
  
  limparDados: `
-- Limpar dados para reset (CUIDADO!)
DELETE FROM votes;
DELETE FROM sanctions;
DELETE FROM participants;
DELETE FROM voting_sessions;
  `
};

// Função para diagnosticar problemas
function diagnosticarProblemas() {
  console.log("🔍 DIAGNÓSTICO DE PROBLEMAS:");
  console.log("-".repeat(40));
  
  problemasComuns.forEach((problema, index) => {
    console.log(`\n${index + 1}. ${problema.nome}`);
    console.log(`   Sintoma: ${problema.sintoma}`);
    console.log(`   Solução: ${problema.solucao}`);
  });
}

// Função para mostrar scripts de correção
function mostrarScriptsCorrecao() {
  console.log("\n🛠️ SCRIPTS DE CORREÇÃO:");
  console.log("-".repeat(40));
  
  console.log("\n📋 1. CRIAR TABELAS:");
  console.log(scriptsCorrecao.criarTabelas);
  
  console.log("\n📋 2. CONFIGURAR RLS:");
  console.log(scriptsCorrecao.configurarRLS);
  
  console.log("\n📋 3. INSERIR SESSÃO INICIAL:");
  console.log(scriptsCorrecao.inserirSessaoInicial);
  
  console.log("\n📋 4. LIMPAR DADOS (RESET):");
  console.log(scriptsCorrecao.limparDados);
}

// Função para simular teste de conexão
function simularTesteConexao() {
  console.log("\n🌐 TESTE DE CONEXÃO SUPABASE:");
  console.log("-".repeat(40));
  
  const testes = [
    "✅ Verificando URL do Supabase...",
    "✅ Verificando chave anônima...",
    "✅ Testando conexão...",
    "✅ Verificando tabelas...",
    "✅ Testando permissões..."
  ];
  
  testes.forEach((teste, index) => {
    setTimeout(() => {
      console.log(teste);
      if (index === testes.length - 1) {
        console.log("\n✅ Conexão Supabase OK!");
      }
    }, index * 500);
  });
}

// Função para mostrar passos de correção
function mostrarPassosCorrecao() {
  console.log("\n🎯 PASSOS PARA CORRIGIR:");
  console.log("-".repeat(40));
  
  const passos = [
    "1. Acesse o Supabase Dashboard",
    "2. Vá para SQL Editor",
    "3. Execute o script 'CRIAR TABELAS'",
    "4. Execute o script 'CONFIGURAR RLS'",
    "5. Execute o script 'INSERIR SESSÃO INICIAL'",
    "6. Verifique as variáveis de ambiente (.env)",
    "7. Teste o sistema novamente"
  ];
  
  passos.forEach((passo, index) => {
    console.log(`${passo}`);
  });
}

// Função para verificar variáveis de ambiente
function verificarVariaveisAmbiente() {
  console.log("\n🔧 VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE:");
  console.log("-".repeat(40));
  
  const variaveis = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY"
  ];
  
  variaveis.forEach(variavel => {
    console.log(`${variavel}: ${process.env[variavel] ? "✅ Configurada" : "❌ Não configurada"}`);
  });
  
  console.log("\n💡 Para configurar, crie um arquivo .env com:");
  console.log("VITE_SUPABASE_URL=sua_url_do_supabase");
  console.log("VITE_SUPABASE_ANON_KEY=sua_chave_anonima");
}

// Executar verificações
function executarVerificacoes() {
  console.log("🚀 Iniciando verificações...\n");
  
  diagnosticarProblemas();
  mostrarScriptsCorrecao();
  mostrarPassosCorrecao();
  verificarVariaveisAmbiente();
  
  console.log("\n" + "=".repeat(50));
  console.log("🔍 VERIFICAÇÕES CONCLUÍDAS!");
  console.log("💡 Use os scripts acima para corrigir problemas");
  console.log("🎯 Siga os passos para resolver o erro PGRST116");
  console.log("=".repeat(50));
}

// Executar
executarVerificacoes(); 