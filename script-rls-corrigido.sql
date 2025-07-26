-- Script corrigido para configurar RLS sem erros de duplicação

-- Habilitar RLS nas tabelas
ALTER TABLE voting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;

-- Criar políticas apenas se não existirem
DO $$
BEGIN
    -- Política para voting_sessions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'voting_sessions' 
        AND policyname = 'Allow all operations on voting_sessions'
    ) THEN
        CREATE POLICY "Allow all operations on voting_sessions" ON voting_sessions
        FOR ALL USING (true);
    END IF;

    -- Política para participants
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'participants' 
        AND policyname = 'Allow all operations on participants'
    ) THEN
        CREATE POLICY "Allow all operations on participants" ON participants
        FOR ALL USING (true);
    END IF;

    -- Política para votes
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'votes' 
        AND policyname = 'Allow all operations on votes'
    ) THEN
        CREATE POLICY "Allow all operations on votes" ON votes
        FOR ALL USING (true);
    END IF;

    -- Política para sanctions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sanctions' 
        AND policyname = 'Allow all operations on sanctions'
    ) THEN
        CREATE POLICY "Allow all operations on sanctions" ON sanctions
        FOR ALL USING (true);
    END IF;
END $$;

-- Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('voting_sessions', 'participants', 'votes', 'sanctions')
ORDER BY tablename, policyname; 