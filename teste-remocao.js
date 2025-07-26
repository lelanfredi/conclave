// 🧪 TESTE ESPECÍFICO - REMOÇÃO DE PARTICIPANTES
// Simula o processo de remoção para identificar problemas

console.log("🧪 TESTE DE REMOÇÃO DE PARTICIPANTES");
console.log("=" .repeat(50));

// Simular dados de participantes
const participantes = [
  { id: "1", real_name: "João Silva", cardinal_name: "Cardeal Zé da Pamonha", created_at: "2025-01-26T10:00:00Z" },
  { id: "2", real_name: "Maria Santos", cardinal_name: "Cardeal Maria do Milho", created_at: "2025-01-26T10:01:00Z" },
  { id: "3", real_name: "Pedro Costa", cardinal_name: "Cardeal Pedro do Quentão", created_at: "2025-01-26T10:02:00Z" }
];

// Simular votos
const votos = [
  { id: "1", participant_id: "1", candidate_id: "2", round: 1, created_at: "2025-01-26T10:05:00Z" },
  { id: "2", participant_id: "2", candidate_id: "1", round: 1, created_at: "2025-01-26T10:06:00Z" },
  { id: "3", participant_id: "3", candidate_id: "1", round: 1, created_at: "2025-01-26T10:07:00Z" }
];

// Simular localStorage
const localStorage = {
  data: {
    participants: JSON.stringify(participantes),
    votes: JSON.stringify(votos)
  },
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
    console.log(`💾 localStorage.setItem("${key}", ${value})`);
  }
};

// Função para simular remoção (modo localStorage)
function simularRemocaoLocalStorage(participantId) {
  console.log(`\n🗑️ Removendo participante ID: ${participantId}`);
  
  try {
    // 1. Verificar se participante existe
    const storedParticipants = localStorage.getItem("participants");
    if (!storedParticipants) {
      throw new Error("Nenhum participante encontrado no localStorage");
    }
    
    const participants = JSON.parse(storedParticipants);
    const participantToRemove = participants.find(p => p.id === participantId);
    
    if (!participantToRemove) {
      throw new Error(`Participante com ID ${participantId} não encontrado`);
    }
    
    console.log(`✅ Participante encontrado: ${participantToRemove.cardinal_name}`);
    
    // 2. Remover participante
    const filteredParticipants = participants.filter(p => p.id !== participantId);
    localStorage.setItem("participants", JSON.stringify(filteredParticipants));
    console.log(`✅ Participante removido da lista`);
    
    // 3. Remover votos do participante
    const storedVotes = localStorage.getItem("votes");
    if (storedVotes) {
      const votes = JSON.parse(storedVotes);
      const filteredVotes = votes.filter(v => v.participant_id !== participantId);
      localStorage.setItem("votes", JSON.stringify(filteredVotes));
      console.log(`✅ Votos do participante removidos`);
    }
    
    // 4. Verificar resultado
    const newParticipants = JSON.parse(localStorage.getItem("participants"));
    const newVotes = JSON.parse(localStorage.getItem("votes"));
    
    console.log(`\n📊 RESULTADO DA REMOÇÃO:`);
    console.log(`Participantes restantes: ${newParticipants.length}`);
    console.log(`Votos restantes: ${newVotes.length}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Erro na remoção: ${error.message}`);
    return false;
  }
}

// Função para simular remoção (modo Supabase)
function simularRemocaoSupabase(participantId) {
  console.log(`\n🗑️ Removendo participante ID: ${participantId} (modo Supabase)`);
  
  try {
    // Simular operações do Supabase
    console.log(`1. Removendo votos do participante ${participantId}...`);
    console.log(`2. Removendo participante ${participantId} da tabela...`);
    
    // Simular erro comum do Supabase
    const possiveisErros = [
      "Foreign key constraint violation",
      "Row Level Security (RLS) policy violation", 
      "Table does not exist",
      "Permission denied",
      "Connection timeout"
    ];
    
    // Simular erro aleatório (para teste)
    if (Math.random() < 0.3) {
      const erro = possiveisErros[Math.floor(Math.random() * possiveisErros.length)];
      throw new Error(`Erro do Supabase: ${erro}`);
    }
    
    console.log(`✅ Participante removido com sucesso do Supabase`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erro do Supabase: ${error.message}`);
    return false;
  }
}

// Testar diferentes cenários
function testarCenariosRemocao() {
  console.log("🧪 TESTANDO CENÁRIOS DE REMOÇÃO:");
  console.log("-".repeat(40));
  
  // Cenário 1: Remoção normal
  console.log("\n🎯 Cenário 1: Remoção normal");
  simularRemocaoLocalStorage("2");
  
  // Cenário 2: Remoção de participante inexistente
  console.log("\n🎯 Cenário 2: Participante inexistente");
  simularRemocaoLocalStorage("999");
  
  // Cenário 3: Remoção com Supabase
  console.log("\n🎯 Cenário 3: Modo Supabase");
  simularRemocaoSupabase("1");
  
  // Cenário 4: Remoção de último participante
  console.log("\n🎯 Cenário 4: Último participante");
  simularRemocaoLocalStorage("1");
  simularRemocaoLocalStorage("3");
}

// Verificar problemas comuns
function verificarProblemasComuns() {
  console.log("\n🔍 VERIFICANDO PROBLEMAS COMUNS:");
  console.log("-".repeat(40));
  
  const problemas = [
    {
      problema: "Erro de Foreign Key no Supabase",
      causa: "Tentativa de remover participante com votos ativos",
      solucao: "Remover votos antes do participante"
    },
    {
      problema: "Erro de RLS (Row Level Security)",
      causa: "Política de segurança bloqueando remoção",
      solucao: "Configurar RLS policies corretamente"
    },
    {
      problema: "Erro de localStorage",
      causa: "Dados corrompidos ou formato inválido",
      solucao: "Validar dados antes de salvar"
    },
    {
      problema: "Erro de estado React",
      causa: "Estado não atualizado após remoção",
      solucao: "Chamar loadData() após remoção"
    },
    {
      problema: "Erro de confirmação",
      causa: "Confirm dialog não funcionando",
      solucao: "Verificar se confirm() está disponível"
    }
  ];
  
  problemas.forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.problema}`);
    console.log(`   Causa: ${item.causa}`);
    console.log(`   Solução: ${item.solucao}`);
  });
}

// Executar testes
function executarTestesRemocao() {
  console.log("🚀 Iniciando testes de remoção...\n");
  
  testarCenariosRemocao();
  verificarProblemasComuns();
  
  console.log("\n" + "=".repeat(50));
  console.log("🧪 TESTES DE REMOÇÃO CONCLUÍDOS!");
  console.log("💡 Verifique o console do navegador para erros específicos");
  console.log("🔧 Problemas comuns identificados acima");
  console.log("=".repeat(50));
}

// Executar
executarTestesRemocao(); 