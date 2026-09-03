CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  optica_id UUID NOT NULL REFERENCES opticas(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL,
  categoria VARCHAR(20) NOT NULL DEFAULT 'montura' CHECK (categoria IN ('montura', 'lente', 'accesorio', 'otro')),
  sku VARCHAR(100),
  cantidad_disponible INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_disponible >= 0),
  precio_venta NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_productos_optica_id ON productos(optica_id);
