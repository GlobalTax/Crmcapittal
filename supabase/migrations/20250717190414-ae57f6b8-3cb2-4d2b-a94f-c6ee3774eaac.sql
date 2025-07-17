-- Insertar algunos suscriptores de prueba para la ROD
INSERT INTO public.subscribers (email, segment, verified, unsubscribed) VALUES
  ('investor1@example.com', 'investor', true, false),
  ('investor2@example.com', 'investor', true, false),
  ('investor3@example.com', 'investor', false, false),
  ('seller1@example.com', 'seller', true, false),
  ('seller2@example.com', 'seller', true, false),
  ('seller3@example.com', 'seller', true, false),
  ('general1@example.com', 'general', true, false),
  ('general2@example.com', 'general', false, false)
ON CONFLICT (email) DO NOTHING;