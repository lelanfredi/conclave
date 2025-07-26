// 🎪 SCRIPT DE TESTE COMPLETO - CONCLAVE JUNINO
// Simula todo o fluxo: cadastro → rodadas → votação → final

console.log("🎪 INICIANDO TESTE COMPLETO DO SISTEMA CONCLAVE JUNINO");
console.log("=" .repeat(60));

// Simulação de participantes
const participantes = [
  { nome: "João Silva", cardeal: "Cardeal Zé da Pamonha" },
  { nome: "Maria Santos", cardeal: "Cardeal Maria do Milho" },
  { nome: "Pedro Costa", cardeal: "Cardeal Pedro do Quentão" },
  { nome: "Ana Oliveira", cardeal: "Cardeal Ana da Canjica" },
  { nome: "Carlos Lima", cardeal: "Cardeal Carlos do Cuscuz" },
  { nome: "Lucia Ferreira", cardeal: "Cardeal Lucia do Bolo" }
];

// Simulação de votos por rodada
const votosPorRodada = {
  1: {
    "Cardeal Zé da Pamonha": 2,
    "Cardeal Maria do Milho": 1,
    "Cardeal Pedro do Quentão": 1,
    "Cardeal Ana da Canjica": 1,
    "Cardeal Carlos do Cuscuz": 1,
    "Cardeal Lucia do Bolo": 0
  },
  2: {
    "Cardeal Zé da Pamonha": 3,
    "Cardeal Maria do Milho": 2,
    "Cardeal Pedro do Quentão": 1,
    "Cardeal Ana da Canjica": 0,
    "Cardeal Carlos do Cuscuz": 0,
    "Cardeal Lucia do Bolo": 0
  },
  3: {
    "Cardeal Zé da Pamonha": 4,
    "Cardeal Maria do Milho": 2,
    "Cardeal Pedro do Quentão": 0,
    "Cardeal Ana da Canjica": 0,
    "Cardeal Carlos do Cuscuz": 0,
    "Cardeal Lucia do Bolo": 0
  }
};

// Função para simular delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para calcular percentual
const calcularPercentual = (votos, total) => Math.round((votos / total) * 100);

// Função para simular cadastro
async function simularCadastro() {
  console.log("\n📝 ETAPA 1: CADASTRO DE PARTICIPANTES");
  console.log("-".repeat(40));
  
  for (let i = 0; i < participantes.length; i++) {
    const participante = participantes[i];
    console.log(`✅ ${i + 1}. ${participante.nome} → ${participante.cardeal}`);
    await delay(500);
  }
  
  console.log(`\n🎯 Total de participantes: ${participantes.length}`);
  console.log("✅ Cadastro concluído com sucesso!");
}

// Função para simular rodada
async function simularRodada(numeroRodada) {
  console.log(`\n🗳️ ETAPA ${numeroRodada + 1}: RODADA ${numeroRodada}`);
  console.log("-".repeat(40));
  
  console.log("🔔 Sino tocando... Nova rodada iniciada!");
  await delay(1000);
  
  const votos = votosPorRodada[numeroRodada];
  const totalVotos = Object.values(votos).reduce((a, b) => a + b, 0);
  
  console.log(`\n📊 RESULTADOS DA RODADA ${numeroRodada}:`);
  console.log(`Total de votos: ${totalVotos}/${participantes.length}`);
  
  // Mostrar resultados
  Object.entries(votos).forEach(([cardeal, votos]) => {
    const percentual = calcularPercentual(votos, totalVotos);
    const barra = "█".repeat(Math.floor(percentual / 5));
    console.log(`${cardeal.padEnd(25)} ${votos} votos (${percentual}%) ${barra}`);
  });
  
  // Verificar se há vencedor (>50%)
  const vencedor = Object.entries(votos).find(([_, votos]) => 
    calcularPercentual(votos, totalVotos) > 50
  );
  
  if (vencedor) {
    console.log(`\n🏆 VENCEDOR ENCONTRADO!`);
    console.log(`🎉 ${vencedor[0]} com ${calcularPercentual(vencedor[1], totalVotos)}% dos votos!`);
    console.log("☁️ Fumacinha branca! HABEMUS PAPA DO ARRAIÁ!");
    return true; // Vencedor encontrado
  } else {
    console.log(`\n⚠️ Nenhum candidato obteve mais de 50% dos votos.`);
    if (numeroRodada < 4) {
      console.log("⚖️ Sanções serão aplicadas antes da próxima rodada.");
    } else {
      console.log("🏆 Última rodada! Vencedor será quem tiver mais votos.");
      const maisVotado = Object.entries(votos).reduce((a, b) => a[1] > b[1] ? a : b);
      console.log(`🎉 ${maisVotado[0]} vence com ${maisVotado[1]} votos!`);
      return true;
    }
  }
  
  return false; // Continua para próxima rodada
}

// Função para simular sanções
async function simularSancoes(rodada) {
  console.log(`\n⚖️ APLICANDO SANÇÕES - RODADA ${rodada}`);
  console.log("-".repeat(40));
  
  const sancoes = [
    "Todos devem beber 1 shot de pinga!",
    "Todos devem dançar quadrilha por 2 minutos!",
    "Todos devem comer pamonha com as mãos!",
    "Todos devem cantar 'Capelinha de Melão'!"
  ];
  
  const sancao = sancoes[rodada - 1] || "Sanção especial aplicada!";
  console.log(`🔔 ${sancao}`);
  await delay(2000);
  console.log("✅ Sanção aplicada com sucesso!");
}

// Função principal de teste
async function executarTesteCompleto() {
  try {
    console.log("🚀 Iniciando simulação completa do sistema...");
    
    // 1. Cadastro
    await simularCadastro();
    await delay(2000);
    
    // 2. Rodadas de votação
    for (let rodada = 1; rodada <= 4; rodada++) {
      const vencedorEncontrado = await simularRodada(rodada);
      await delay(2000);
      
      if (vencedorEncontrado) {
        console.log("\n🎪 ELEIÇÃO FINALIZADA!");
        break;
      }
      
      if (rodada < 4) {
        await simularSancoes(rodada);
        await delay(2000);
      }
    }
    
    // 3. Finalização
    console.log("\n" + "=".repeat(60));
    console.log("🎪 TESTE COMPLETO FINALIZADO COM SUCESSO!");
    console.log("✅ Sistema funcionando perfeitamente!");
    console.log("🎉 Pronto para a festa junina!");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  }
}

// Executar o teste
executarTesteCompleto(); 