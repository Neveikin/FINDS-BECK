-- Расширение ключа позиции корзины: один товар может быть в нескольких вариантах (размер + цвет).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cart_items') THEN
    ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS size_code VARCHAR(32) NOT NULL DEFAULT '';
    ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS color VARCHAR(100) NOT NULL DEFAULT '';
    ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_pkey;
    ALTER TABLE cart_items ADD PRIMARY KEY (cart_id, product_id, size_code, color);
  END IF;
END $$;
