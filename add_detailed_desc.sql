-- Adicionar coluna de descrição detalhada se não existir
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_detailed TEXT;

-- Garantir que as colunas is_highlighted e has_liberacred existem (elas devem existir baseado no setup)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_liberacred BOOLEAN DEFAULT FALSE;
