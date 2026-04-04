-- 1. Criar a função master para atualizar planos ignorando cache de esquema do PostgREST
CREATE OR REPLACE FUNCTION update_plan_direct(
  p_id INT,
  p_name TEXT,
  p_months INT,
  p_price TEXT,
  p_description TEXT,
  p_features TEXT,
  p_billing_cycle TEXT,
  p_is_popular BOOLEAN,
  p_discount INT DEFAULT 0
) RETURNS VOID AS $$
BEGIN
  UPDATE plans 
  SET 
    name = p_name,
    months = p_months,
    price = p_price,
    description = p_description,
    features = p_features,
    billing_cycle = p_billing_cycle,
    is_popular = p_is_popular,
    discount = p_discount,
    updated_at = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Garantir que a tabela plans tenha a coluna discount se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'plans' AND COLUMN_NAME = 'discount') THEN
    ALTER TABLE plans ADD COLUMN discount INT DEFAULT 0;
  END IF;
END $$;

-- 3. Habilitar permissões para a função
GRANT EXECUTE ON FUNCTION update_plan_direct TO service_role;
GRANT EXECUTE ON FUNCTION update_plan_direct TO authenticated;
GRANT EXECUTE ON FUNCTION update_plan_direct TO anon;

-- 4. Notificar o cache (opcional mas recomendado)
NOTIFY pgrst, 'reload schema';
