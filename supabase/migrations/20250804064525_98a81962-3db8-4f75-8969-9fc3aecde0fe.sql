-- Insertar templates de winback en communication_templates
INSERT INTO public.communication_templates (
  name,
  template_type,
  subject,
  content,
  variables,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  'winback_email_1',
  'winback',
  '¿Sigues interesado en {servicio}?',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¿Sigues interesado?</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Hola {nombre_lead},</h2>
        
        <p>Hace un tiempo te contactamos sobre <strong>{servicio}</strong> y notamos que no pudimos conectar.</p>
        
        <p>¿Sigues interesado en explorar cómo podemos ayudarte con {servicio}?</p>
        
        <p>Si es así, me encantaría poder dedicarte 15 minutos para entender mejor tus necesidades y ver si hay una buena oportunidad de colaboración.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{calendly_link}" style="background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reservar 15 minutos gratis
            </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">Si ya no estás interesado, simplemente responde a este email y te sacaremos de nuestra lista.</p>
        
        <p>Saludos,<br>
        <strong>{nombre_consultor}</strong><br>
        {empresa}</p>
    </div>
</body>
</html>',
  '["nombre_lead", "servicio", "calendly_link", "nombre_consultor", "empresa"]'::jsonb,
  true,
  now(),
  now()
),
(
  'winback_email_2',
  'winback',
  'Caso de éxito: {servicio} - Oferta limitada',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Caso de éxito</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Hola {nombre_lead},</h2>
        
        <p>Quería compartir contigo un caso de éxito reciente que creo que te puede interesar:</p>
        
        <div style="background: white; padding: 20px; border-left: 4px solid #27ae60; margin: 20px 0;">
            <h3 style="color: #27ae60; margin-top: 0;">Caso de Éxito: {empresa_caso}</h3>
            <p><strong>Desafío:</strong> {desafio_caso}</p>
            <p><strong>Solución:</strong> Implementamos {servicio} que les permitió {solucion_caso}</p>
            <p><strong>Resultados:</strong> {resultados_caso}</p>
        </div>
        
        <p>Dado que habías mostrado interés en {servicio}, pensé que este caso podría resonar contigo.</p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #f39c12; margin-top: 0;">📅 Oferta limitada - Solo hasta {fecha_limite}</h3>
            <p>Si decides avanzar en las próximas 2 semanas, puedo ofrecerte:</p>
            <ul>
                <li>✅ Consultoría inicial gratuita (valor: €500)</li>
                <li>✅ {descuento_oferta}% de descuento en la primera fase</li>
                <li>✅ Análisis de viabilidad sin costo</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{calendly_link}" style="background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Aprovechar esta oferta
            </a>
        </div>
        
        <p>¿Te parece que podríamos tener una conversación de 15 minutos?</p>
        
        <p>Saludos,<br>
        <strong>{nombre_consultor}</strong><br>
        {empresa}</p>
    </div>
</body>
</html>',
  '["nombre_lead", "servicio", "empresa_caso", "desafio_caso", "solucion_caso", "resultados_caso", "fecha_limite", "descuento_oferta", "calendly_link", "nombre_consultor", "empresa"]'::jsonb,
  true,
  now(),
  now()
),
(
  'winback_email_final',
  'winback',
  'Cerrando tu expediente - ¿Algún feedback?',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cerrando expediente</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Hola {nombre_lead},</h2>
        
        <p>Hemos intentado contactarte varias veces sobre {servicio} pero no hemos logrado conectar.</p>
        
        <p>Voy a cerrar tu expediente por ahora, pero antes me gustaría pedirte un favor:</p>
        
        <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #8e44ad; margin-top: 0;">¿Podrías ayudarme con tu feedback?</h3>
            <p>Me ayudaría mucho saber qué fue lo que no encajó. Esto me permitirá mejorar mi enfoque para futuras conversaciones.</p>
            
            <p>Solo te tomará 2 minutos:</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <a href="{encuesta_link}" style="background: #9b59b6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Compartir mi feedback (2 min)
                </a>
            </div>
        </div>
        
        <p>Por supuesto, si en algún momento cambias de opinión sobre {servicio}, no dudes en contactarme. Estaré encantado de retomar la conversación.</p>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #27ae60;">
                <strong>💡 Última oportunidad:</strong> Si quieres que mantengamos el expediente abierto, simplemente responde a este email o <a href="{calendly_link}" style="color: #27ae60;">reserva una llamada aquí</a>.
            </p>
        </div>
        
        <p>Gracias por tu tiempo y consideración.</p>
        
        <p>Saludos cordiales,<br>
        <strong>{nombre_consultor}</strong><br>
        {empresa}</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">
            Este es nuestro último contacto sobre este tema. No recibirás más emails sobre {servicio}.
        </p>
    </div>
</body>
</html>',
  '["nombre_lead", "servicio", "encuesta_link", "calendly_link", "nombre_consultor", "empresa"]'::jsonb,
  true,
  now(),
  now()
);