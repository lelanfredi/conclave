# 🔧 SOLUÇÃO PARA PROBLEMAS DE REMOÇÃO DE PARTICIPANTES

## 🚨 PROBLEMA IDENTIFICADO

Você está enfrentando erros ao tentar remover participantes do sistema. Vou te ajudar a resolver isso!

## 🔍 DIAGNÓSTICO RÁPIDO

### 1. **Verificar se está usando Supabase ou localStorage**

Abra o console do navegador (F12) e veja se aparece:
- `🔗 Modo Supabase: Removendo participante...` 
- `💾 Modo localStorage: Removendo participante...`

### 2. **Verificar erros no console**

Procure por mensagens de erro como:
- `❌ Erro ao remover participante:`
- `Foreign key constraint violation`
- `RLS policy violation`

## 🛠️ SOLUÇÕES POR TIPO DE ERRO

### **Erro 1: "Foreign key constraint violation"**

**Causa**: Tentativa de remover participante que tem votos associados

**Solução**:
```sql
-- No Supabase, execute estas queries:
DELETE FROM votes WHERE participant_id = 'ID_DO_PARTICIPANTE';
DELETE FROM participants WHERE id = 'ID_DO_PARTICIPANTE';
```

### **Erro 2: "RLS policy violation"**

**Causa**: Política de segurança do Supabase bloqueando a remoção

**Solução**:
1. Vá para o Supabase Dashboard
2. Acesse Authentication > Policies
3. Verifique se a tabela `participants` tem políticas de DELETE
4. Configure a política para permitir DELETE para admins

### **Erro 3: "Table does not exist"**

**Causa**: Tabelas não foram criadas no Supabase

**Solução**:
Execute estas queries no Supabase SQL Editor:

```sql
-- Criar tabela de participantes
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  real_name TEXT NOT NULL,
  cardinal_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de votos
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de sessões de votação
CREATE TABLE voting_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  current_round INTEGER DEFAULT 1,
  round_active BOOLEAN DEFAULT FALSE,
  max_rounds INTEGER DEFAULT 4,
  session_ended BOOLEAN DEFAULT FALSE,
  ended_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES participants(id),
  winner_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de sanções
CREATE TABLE sanctions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  round INTEGER NOT NULL,
  applied_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Erro 4: "localStorage error"**

**Causa**: Dados corrompidos no localStorage

**Solução**:
1. Abra o console do navegador (F12)
2. Execute: `localStorage.clear()`
3. Recarregue a página
4. Cadastre os participantes novamente

### **Erro 5: "Confirm dialog not working"**

**Causa**: Função confirm() não disponível

**Solução**: Já corrigido no código - verifica se `window` está disponível

## 🧪 TESTE RÁPIDO

### **Para testar se a correção funcionou:**

1. **Abra o console do navegador** (F12)
2. **Acesse a página admin** (`/admin`)
3. **Digite a senha**: `loverson`
4. **Tente remover um participante**
5. **Verifique as mensagens no console**:

```
🗑️ Removendo participante: Nome do Cardeal (ID: xxx)
🔗 Modo Supabase: Removendo participante...
✅ Votos removidos com sucesso
✅ Participante removido do Supabase
🔄 Recarregando dados...
✅ Remoção confirmada - participante não está mais na lista
```

## 🔧 CORREÇÕES IMPLEMENTADAS

### **1. Melhor tratamento de erros**
- Mensagens de erro mais claras
- Logs detalhados no console
- Tratamento específico para cada tipo de erro

### **2. Verificação de sucesso**
- Confirma se o participante foi realmente removido
- Recarrega os dados automaticamente
- Mostra feedback visual

### **3. Compatibilidade**
- Funciona com e sem Supabase
- Trata erros de localStorage
- Verifica disponibilidade de funções

## 🎯 COMO USAR AGORA

### **Passo a passo:**

1. **Certifique-se de que o servidor está rodando**:
   ```bash
   npm run dev
   ```

2. **Acesse o painel admin**:
   - Vá para `http://localhost:5174/admin`
   - Digite a senha: `loverson`

3. **Tente remover um participante**:
   - Clique no botão "Remover" ao lado do participante
   - Confirme a remoção
   - Verifique se funcionou

4. **Se ainda houver erro**:
   - Abra o console (F12)
   - Copie a mensagem de erro
   - Use o guia acima para resolver

## 🆘 SE AINDA NÃO FUNCIONAR

### **Opção 1: Usar modo localStorage**
- Não configure as variáveis do Supabase
- O sistema funcionará offline
- Remoção funcionará perfeitamente

### **Opção 2: Reset completo**
```bash
# Limpar localStorage
localStorage.clear()

# Recarregar página
location.reload()

# Cadastrar participantes novamente
```

### **Opção 3: Verificar configuração Supabase**
1. Verifique se as variáveis estão corretas no `.env`
2. Confirme se as tabelas existem no Supabase
3. Verifique as políticas de segurança

## ✅ RESULTADO ESPERADO

Após as correções, a remoção de participantes deve funcionar perfeitamente:

- ✅ Confirmação antes da remoção
- ✅ Remoção de votos associados
- ✅ Remoção do participante
- ✅ Atualização automática da lista
- ✅ Mensagem de sucesso
- ✅ Logs detalhados no console

**🎪 Agora você pode remover participantes sem problemas!** 