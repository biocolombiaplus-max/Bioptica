CREATE TABLE cie10_oftalmologia (
  codigo VARCHAR(10) PRIMARY KEY,
  descripcion VARCHAR(255) NOT NULL
);

INSERT INTO cie10_oftalmologia (codigo, descripcion) VALUES
  ('H52.1', 'Miopía'),
  ('H52.0', 'Hipermetropía'),
  ('H52.2', 'Astigmatismo'),
  ('H52.4', 'Presbicia'),
  ('H52.3', 'Anisometropía y aniseiconía'),
  ('H10.9', 'Conjuntivitis, no especificada'),
  ('H10.1', 'Conjuntivitis atópica aguda'),
  ('H01.0', 'Blefaritis'),
  ('H04.1', 'Otros trastornos de la glándula lagrimal (ojo seco)'),
  ('H11.0', 'Pterigión'),
  ('H25.9', 'Catarata senil, no especificada'),
  ('H26.9', 'Catarata, no especificada'),
  ('H40.9', 'Glaucoma, no especificado'),
  ('H35.0', 'Retinopatía de fondo y cambios vasculares retinianos'),
  ('H35.3', 'Degeneración macular y del polo posterior'),
  ('H53.1', 'Alteraciones subjetivas de la visión'),
  ('H53.2', 'Diplopía'),
  ('H50.4', 'Otras heteroforias (foria)'),
  ('H49.9', 'Estrabismo paralítico, no especificado'),
  ('H54.7', 'Baja visión, no especificada'),
  ('Z01.0', 'Examen de ojos y de la visión')
ON CONFLICT DO NOTHING;
