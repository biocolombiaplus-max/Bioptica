ALTER TABLE opticas
  ALTER COLUMN logo_url TYPE TEXT;

ALTER TABLE productos
  ADD COLUMN imagen_url TEXT;
