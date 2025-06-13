
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header simplificado */}
      <header className="bg-white" style={{ borderBottom: '0.5px solid black' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-xl font-bold text-black">Capittal</h1>
            </Link>
            <Link to="/">
              <Button variant="outline" size="default" className="text-sm px-6 py-3 h-auto border-black text-black hover:bg-gray-100">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-black mb-8">Política de Privacidad</h1>
        <p className="text-gray-600 mb-8">Última actualización: 1 de enero de 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">1. Responsable del Tratamiento</h2>
            <p className="text-gray-700 mb-4">
              El responsable del tratamiento de sus datos personales es Capittal S.L., con domicilio social en España 
              y correo electrónico privacy@capittal.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">2. Datos que Recopilamos</h2>
            <p className="text-gray-700 mb-4">Recopilamos los siguientes tipos de información:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><strong>Datos de registro:</strong> Nombre, apellidos, email, teléfono, empresa</li>
              <li><strong>Datos de navegación:</strong> IP, tipo de navegador, páginas visitadas, tiempo de permanencia</li>
              <li><strong>Datos de interacción:</strong> Operaciones favoritas, consultas realizadas, preferencias</li>
              <li><strong>Datos profesionales:</strong> Experiencia inversora, capacidad financiera, sector de interés</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">3. Finalidad del Tratamiento</h2>
            <p className="text-gray-700 mb-4">Utilizamos sus datos para:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Gestionar su cuenta de usuario y proporcionar nuestros servicios</li>
              <li>Facilitar el contacto entre inversores y empresarios</li>
              <li>Enviar comunicaciones comerciales y newsletters (con su consentimiento)</li>
              <li>Mejorar nuestros servicios y personalizar su experiencia</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
              <li>Realizar análisis estadísticos y de mercado</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">4. Base Legal</h2>
            <p className="text-gray-700 mb-4">El tratamiento de sus datos se basa en:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><strong>Ejecución de contrato:</strong> Para prestar nuestros servicios</li>
              <li><strong>Interés legítimo:</strong> Para mejorar servicios y realizar análisis</li>
              <li><strong>Consentimiento:</strong> Para comunicaciones comerciales</li>
              <li><strong>Obligación legal:</strong> Para cumplir con normativas aplicables</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">5. Compartir Información</h2>
            <p className="text-gray-700 mb-4">
              Podemos compartir su información con terceros en los siguientes casos:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Con empresarios e inversores para facilitar contactos (con su consentimiento)</li>
              <li>Con proveedores de servicios que nos ayudan a operar la plataforma</li>
              <li>Cuando sea requerido por ley o autoridades competentes</li>
              <li>En caso de fusión, adquisición o venta de activos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">6. Retención de Datos</h2>
            <p className="text-gray-700 mb-4">
              Conservamos sus datos personales durante el tiempo necesario para cumplir con las finalidades descritas, 
              y posteriormente durante los plazos de prescripción legales aplicables.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">7. Sus Derechos</h2>
            <p className="text-gray-700 mb-4">Tiene derecho a:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><strong>Acceso:</strong> Solicitar información sobre sus datos personales</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos</li>
              <li><strong>Limitación:</strong> Restringir el tratamiento en ciertos casos</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
              <li><strong>Oposición:</strong> Oponerse al tratamiento basado en interés legítimo</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Para ejercer estos derechos, contacte con nosotros en privacy@capittal.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">8. Seguridad</h2>
            <p className="text-gray-700 mb-4">
              Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales 
              contra acceso no autorizado, pérdida, destrucción o alteración.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">9. Cookies</h2>
            <p className="text-gray-700 mb-4">
              Utilizamos cookies y tecnologías similares para mejorar su experiencia. 
              Consulte nuestra Política de Cookies para más información.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">10. Cambios en esta Política</h2>
            <p className="text-gray-700 mb-4">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos los cambios 
              significativos por email o mediante aviso en nuestra plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">11. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Para cualquier consulta sobre esta Política de Privacidad:
            </p>
            <p className="text-gray-700">
              Email: privacy@capittal.com<br />
              Teléfono: +34 900 123 456<br />
              Delegado de Protección de Datos: dpo@capittal.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
