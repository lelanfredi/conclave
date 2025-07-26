# 🎪 INSTRUÇÕES RÁPIDAS - CONCLAVE JUNINO

## 🚀 COMO RODAR AGORA

1. **Instale as dependências** (se ainda não fez):
   ```bash
   npm install
   ```

2. **Inicie o servidor**:
   ```bash
   npm run dev
   ```

3. **Acesse no navegador**:
   - http://localhost:5173

## 📱 PÁGINAS PRINCIPAIS

- **`/`** - Página principal (inscrição)
- **`/admin`** - Painel administrativo (senha: `loverson`)
- **`/tv`** - Painel para TV (tela grande)

## 🎮 COMO USAR O SISTEMA

### 1. INSCRIÇÃO DOS PARTICIPANTES
- Acesse a página principal
- Digite nome real e "nome de cardeal" criativo
- Clique em "Entrar no Conclave"

### 2. ADMINISTRAÇÃO
- Acesse `/admin`
- Digite a senha: `loverson`
- **Iniciar Rodada**: Clique no botão verde para começar votação
- **Aplicar Sanção**: Use o botão vermelho para aplicar penalidades
- **Remover Participante**: Use o botão "Remover" na lista

### 3. VOTAÇÃO
- Quando a rodada for iniciada, todos veem a tela de votação
- Vote secretamente (anônimo)
- Resultados aparecem automaticamente

### 4. PAINEL TV
- Acesse `/tv` em um computador conectado à TV
- Mostra resultados em tempo real
- Atualiza automaticamente a cada 3 segundos

## 🏆 REGRAS DA ELEIÇÃO

- **Vencedor**: Quem conseguir mais de 50% dos votos
- **Rodadas**: Máximo de 4
- **4ª rodada**: Quem tiver mais votos vence
- **Sanções**: Aplicadas entre rodadas pelo admin

## ⚡ FUNCIONAMENTO

- **Sem Supabase**: Funciona perfeitamente offline (localStorage)
- **Com Supabase**: Para persistência de dados (opcional)
- **Tempo Real**: Atualizações automáticas
- **Anonimato**: Votos são secretos, só rastreia participação

## 🔧 CONFIGURAÇÃO SUPABASE (OPCIONAL)

1. Crie projeto no [supabase.com](https://supabase.com)
2. Configure as tabelas:
   - `participants`
   - `votes` 
   - `voting_sessions`
   - `sanctions`
3. Adicione no arquivo `.env`:
   ```
   VITE_SUPABASE_URL=sua_url
   VITE_SUPABASE_ANON_KEY=sua_chave
   ```

## 🎪 PRONTO PARA USAR!

O sistema está **100% funcional** e pronto para a festa junina! 

**🎪 "Habemus Papa do Arraiá!" 🎪** 