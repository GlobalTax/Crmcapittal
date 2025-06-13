
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CookiesPolicy = () => {
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
        <h1 className="text-4xl font-bold text-black mb-8">Política de Cookies</h1>
        <p className="text-gray-600 mb-8">Última actualización: 1 de enero de 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">1. ¿Qué son las Cookies?</h2>
            <p className="text-gray-700 mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. 
              Permiten que el sitio web recuerde sus acciones y preferencias durante un período de tiempo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">2. ¿Cómo Utilizamos las Cookies?</h2>
            <p className="text-gray-700 mb-4">
              En Capittal utilizamos cookies para:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Mantener su sesión iniciada mientras navega por el sitio</li>
              <li>Recordar sus preferencias y configuraciones</li>
              <li>Analizar el uso del sitio web y mejorar nuestros servicios</li>
              <li>Personalizar el contenido que se le muestra</li>
              <li>Proporcionarle funcionalidades de redes sociales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">3. Tipos de Cookies que Utilizamos</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-black mb-3">3.1 Cookies Estrictamente Necesarias</h3>
              <p className="text-gray-700 mb-2">
                Estas cookies son esenciales para el funcionamiento del sitio web:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Cookies de sesión de usuario</li>
                <li>Cookies de seguridad</li>
                <li>Cookies de funcionalidad básica</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-black mb-3">3.2 Cookies de Rendimiento</h3>
              <p className="text-gray-700 mb-2">
                Recopilan información sobre cómo utiliza el sitio web:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Google Analytics</li>
                <li>Cookies de análisis de uso</li>
                <li>Cookies de optimización</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-black mb-3">3.3 Cookies de Funcionalidad</h3>
              <p className="text-gray-700 mb-2">
                Permiten recordar sus elecciones y personalizar su experiencia:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Preferencias de idioma</li>
                <li>Configuraciones de visualización</li>
                <li>Operaciones favoritas</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-black mb-3">3.4 Cookies de Marketing</h3>
              <p className="text-gray-700 mb-2">
                Se utilizan para mostrar anuncios relevantes:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Cookies de remarketing</li>
                <li>Cookies de redes sociales</li>
                <li>Cookies de terceros para publicidad</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">4. Cookies de Terceros</h2>
            <p className="text-gray-700 mb-4">
              Algunos de nuestros socios pueden establecer cookies en su dispositivo:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><strong>Google Analytics:</strong> Para análisis de tráfico web</li>
              <li><strong>LinkedIn:</strong> Para funcionalidades de red social</li>
              <li><strong>Facebook:</strong> Para integración con redes sociales</li>
              <li><strong>Hotjar:</strong> Para análisis de comportamiento de usuario</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">5. Gestión de Cookies</h2>
            <p className="text-gray-700 mb-4">
              Puede controlar y/o eliminar las cookies como desee. Puede eliminar todas las cookies que ya están 
              en su ordenador y puede configurar la mayoría de navegadores para evitar que se instalen.
            </p>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-black mb-3">Configuración del Navegador:</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Chrome:</strong> Configuración &gt; Avanzada &gt; Privacidad y seguridad &gt; Configuración de sitios &gt; Cookies</li>
                <li><strong>Firefox:</strong> Preferencias &gt; Privacidad y seguridad &gt; Cookies y datos del sitio</li>
                <li><strong>Safari:</strong> Preferencias &gt; Privacidad &gt; Cookies y datos de sitios web</li>
                <li><strong>Edge:</strong> Configuración &gt; Cookies y permisos del sitio &gt; Cookies y datos del sitio</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">6. Consecuencias de Deshabilitar Cookies</h2>
            <p className="text-gray-700 mb-4">
              Si decide deshabilitar las cookies, algunas funcionalidades del sitio web pueden no funcionar correctamente:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Puede que tenga que iniciar sesión repetidamente</li>
              <li>Sus preferencias no se recordarán</li>
              <li>Algunas funciones personalizadas pueden no estar disponibles</li>
              <li>La experiencia de usuario puede verse reducida</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">7. Consentimiento</h2>
            <p className="text-gray-700 mb-4">
              Al continuar navegando por nuestro sitio web, acepta el uso de cookies según se describe en esta política. 
              Puede retirar su consentimiento en cualquier momento modificando la configuración de su navegador.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">8. Actualizaciones de esta Política</h2>
            <p className="text-gray-700 mb-4">
              Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios en las cookies que utilizamos 
              o por razones operativas, legales o regulatorias.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">9. Más Información</h2>
            <p className="text-gray-700 mb-4">
              Para más información sobre las cookies y cómo gestionarlas, visite:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li><a href="https://www.allaboutcookies.org" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a></li>
              <li><a href="https://www.youronlinechoices.eu" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.youronlinechoices.eu</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">10. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Si tiene alguna pregunta sobre nuestra Política de Cookies:
            </p>
            <p className="text-gray-700">
              Email: privacy@capittal.com<br />
              Teléfono: +34 900 123 456
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicy;
