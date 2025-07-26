// 🎯 TESTE DE NUMERAÇÃO DAS RODADAS - CONCLAVE JUNINO
// Verifica se a numeração das rodadas está correta

console.log("🎯 TESTE DE NUMERAÇÃO DAS RODADAS");
console.log("=" .repeat(50));

// Simular sessão de votação
let votingSession = {
  id: "test-session-1",
  current_round: 1,
  round_active: false,
  max_rounds: 4,
  session_ended: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Simular participantes
const participantes = [
  { id: "1", real_name: "João Silva", cardinal_name: "Cardeal Zé da Pamonha" },
  { id: "2", real_name: "Maria Santos", cardinal_name: "Cardeal Maria do Milho" },
  { id: "3", real_name: "Pedro Costa", cardinal_name: "Cardeal Pedro do Quentão" },
  { id: "4", real_name: "Ana Oliveira", cardinal_name: "Cardeal Ana da Canjica" }
];

// Simular votos por rodada
const votosPorRodada = {
  1: [
    { participant_id: "1", candidate_id: "2" },
    { participant_id: "2", candidate_id: "1" },
    { participant_id: "3", candidate_id: "1" },
    { participant_id: "4", candidate_id: "2" }
  ],
  2: [
    { participant_id: "1", candidate_id: "2" },
    { participant_id: "2", candidate_id: "2" },
    { participant_id: "3", candidate_id: "1" },
    { participant_id: "4", candidate_id: "2" }
  ],
  3: [
    { participant_id: "1", candidate_id: "2" },
    { participant_id: "2", candidate_id: "2" },
    { participant_id: "3", candidate_id: "2" },
    { participant_id: "4", candidate_id: "2" }
  ]
};

// Função para simular início de rodada
function simularInicioRodada(rodada) {
  console.log(`\n🚀 INICIANDO RODADA ${rodada}`);
  console.log("-".repeat(30));
  
  // Atualizar sessão
  votingSession.current_round = rodada;
  votingSession.round_active = true;
  votingSession.updated_at = new Date().toISOString();
  
  console.log(`✅ Rodada ${rodada} iniciada`);
  console.log(`📊 Participantes: ${participantes.length}`);
  console.log(`🗳️ Votos esperados: ${participantes.length}`);
  
  return votingSession;
}

// Função para simular votação
function simularVotacao(rodada) {
  console.log(`\n🗳️ SIMULANDO VOTAÇÃO - RODADA ${rodada}`);
  console.log("-".repeat(30));
  
  const votos = votosPorRodada[rodada] || [];
  const totalVotos = votos.length;
  
  console.log(`📊 Total de votos: ${totalVotos}`);
  
  // Contar votos por candidato
  const contagem = {};
  votos.forEach(voto => {
    contagem[voto.candidate_id] = (contagem[voto.candidate_id] || 0) + 1;
  });
  
  // Mostrar resultados
  Object.entries(contagem).forEach(([candidateId, votos]) => {
    const participante = participantes.find(p => p.id === candidateId);
    const percentual = Math.round((votos / totalVotos) * 100);
    console.log(`  ${participante.cardinal_name}: ${votos} votos (${percentual}%)`);
  });
  
  // Verificar se há vencedor (>50%)
  const vencedor = Object.entries(contagem).find(([_, votos]) => 
    (votos / totalVotos) > 0.5
  );
  
  if (vencedor) {
    const participante = participantes.find(p => p.id === vencedor[0]);
    console.log(`\n🏆 VENCEDOR: ${participante.cardinal_name} com ${Math.round((vencedor[1] / totalVotos) * 100)}% dos votos!`);
    return true; // Vencedor encontrado
  } else {
    console.log(`\n⚠️ Nenhum candidato obteve mais de 50% dos votos.`);
    return false; // Continua para próxima rodada
  }
}

// Função para simular fim de rodada
function simularFimRodada(rodada, temVencedor) {
  console.log(`\n🔚 FINALIZANDO RODADA ${rodada}`);
  console.log("-".repeat(30));
  
  votingSession.round_active = false;
  votingSession.updated_at = new Date().toISOString();
  
  if (temVencedor) {
    votingSession.session_ended = true;
    votingSession.ended_at = new Date().toISOString();
    console.log(`✅ Eleição finalizada! Vencedor encontrado na rodada ${rodada}`);
  } else if (rodada < 4) {
    votingSession.current_round = rodada + 1;
    console.log(`🔄 Preparando para rodada ${rodada + 1}`);
  } else {
    votingSession.session_ended = true;
    votingSession.ended_at = new Date().toISOString();
    console.log(`🏆 Última rodada! Vencedor será quem tiver mais votos.`);
  }
  
  return votingSession;
}

// Função para testar sequência completa
function testarSequenciaCompleta() {
  console.log("🎪 TESTANDO SEQUÊNCIA COMPLETA DE RODADAS");
  console.log("=" .repeat(50));
  
  for (let rodada = 1; rodada <= 4; rodada++) {
    // Iniciar rodada
    simularInicioRodada(rodada);
    
    // Simular votação
    const temVencedor = simularVotacao(rodada);
    
    // Finalizar rodada
    simularFimRodada(rodada, temVencedor);
    
    // Verificar se eleição terminou
    if (votingSession.session_ended) {
      console.log(`\n🎉 ELEIÇÃO FINALIZADA NA RODADA ${rodada}!`);
      break;
    }
    
    console.log("\n" + "─".repeat(40));
  }
  
  // Mostrar resumo final
  console.log("\n📋 RESUMO FINAL:");
  console.log(`  - Rodada final: ${votingSession.current_round}`);
  console.log(`  - Eleição finalizada: ${votingSession.session_ended ? "Sim" : "Não"}`);
  console.log(`  - Total de rodadas: ${votingSession.current_round}`);
}

// Função para verificar problemas comuns
function verificarProblemasComuns() {
  console.log("\n🔍 VERIFICANDO PROBLEMAS COMUNS:");
  console.log("-".repeat(40));
  
  const problemas = [
    {
      problema: "Rodada não incrementa",
      causa: "current_round não é atualizado no handleEndRound",
      solucao: "Verificar lógica de incremento"
    },
    {
      problema: "Rodada mostra número errado",
      causa: "Confusão entre currentRound (prop) e votingSession.current_round",
      solucao: "Usar apenas votingSession.current_round"
    },
    {
      problema: "Rodada volta para 1",
      causa: "Sessão sendo recriada com current_round: 1",
      solucao: "Manter rodada atual ao recriar sessão"
    },
    {
      problema: "Rodada não aparece na interface",
      causa: "actualCurrentRound não está sendo calculado corretamente",
      solucao: "Verificar cálculo de actualCurrentRound"
    }
  ];
  
  problemas.forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.problema}`);
    console.log(`   Causa: ${item.causa}`);
    console.log(`   Solução: ${item.solucao}`);
  });
}

// Executar testes
function executarTestes() {
  console.log("🚀 Iniciando testes de numeração...\n");
  
  testarSequenciaCompleta();
  verificarProblemasComuns();
  
  console.log("\n" + "=".repeat(50));
  console.log("🎯 TESTES DE NUMERAÇÃO CONCLUÍDOS!");
  console.log("💡 Verifique se as rodadas estão numeradas corretamente");
  console.log("🎯 Teste o sistema para confirmar a correção");
  console.log("=".repeat(50));
}

// Executar
executarTestes(); 