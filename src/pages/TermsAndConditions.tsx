
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsAndConditions = () => {
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
        <h1 className="text-4xl font-bold text-black mb-8">Términos y Condiciones</h1>
        <p className="text-gray-600 mb-8">Última actualización: 1 de enero de 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">1. Información General</h2>
            <p className="text-gray-700 mb-4">
              Los presentes Términos y Condiciones regulan el uso del portal web Capittal (en adelante, "la Plataforma"), 
              operado por Capittal S.L., con domicilio social en España.
            </p>
            <p className="text-gray-700 mb-4">
              Al acceder y utilizar esta Plataforma, usted acepta estar sujeto a estos Términos y Condiciones. 
              Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">2. Descripción del Servicio</h2>
            <p className="text-gray-700 mb-4">
              Capittal es una plataforma digital que conecta inversores con oportunidades de inversión empresarial. 
              Nuestros servicios incluyen:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Presentación de oportunidades de inversión y adquisición empresarial</li>
              <li>Servicios de intermediación y consultoría</li>
              <li>Herramientas de análisis y evaluación de empresas</li>
              <li>Facilitación de contactos entre inversores y empresarios</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">3. Registro y Cuentas de Usuario</h2>
            <p className="text-gray-700 mb-4">
              Para acceder a determinadas funcionalidades, deberá crear una cuenta proporcionando información veraz y actualizada. 
              Es responsable de mantener la confidencialidad de sus credenciales de acceso.
            </p>
            <p className="text-gray-700 mb-4">
              Nos reservamos el derecho de suspender o cancelar cuentas que violen estos términos o proporcionen información falsa.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">4. Uso Aceptable</h2>
            <p className="text-gray-700 mb-4">Al utilizar la Plataforma, se compromete a:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Utilizar los servicios únicamente para fines legítimos</li>
              <li>No interferir con el funcionamiento de la Plataforma</li>
              <li>No intentar acceder a áreas restringidas o datos de otros usuarios</li>
              <li>Proporcionar información veraz en todas las comunicaciones</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">5. Limitación de Responsabilidad</h2>
            <p className="text-gray-700 mb-4">
              Capittal actúa como intermediario y no es responsable de las decisiones de inversión que realicen los usuarios. 
              Toda inversión conlleva riesgos y recomendamos consultar con asesores profesionales independientes.
            </p>
            <p className="text-gray-700 mb-4">
              No garantizamos la exactitud completa de toda la información presentada y no nos hacemos responsables 
              de pérdidas derivadas del uso de nuestros servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">6. Propiedad Intelectual</h2>
            <p className="text-gray-700 mb-4">
              Todos los contenidos, diseños, logotipos y materiales de la Plataforma están protegidos por derechos de 
              propiedad intelectual y son propiedad de Capittal o sus licenciantes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">7. Modificaciones</h2>
            <p className="text-gray-700 mb-4">
              Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. 
              Las modificaciones entrarán en vigor una vez publicadas en la Plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">8. Legislación Aplicable</h2>
            <p className="text-gray-700 mb-4">
              Estos Términos y Condiciones se rigen por la legislación española. Para cualquier controversia, 
              los tribunales de España tendrán jurisdicción exclusiva.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">9. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Para cualquier consulta sobre estos Términos y Condiciones, puede contactarnos en:
            </p>
            <p className="text-gray-700">
              Email: legal@capittal.com<br />
              Teléfono: +34 900 123 456
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
