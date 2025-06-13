
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LegalNotice = () => {
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
        <h1 className="text-4xl font-bold text-black mb-8">Aviso Legal</h1>
        <p className="text-gray-600 mb-8">Última actualización: 1 de enero de 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">1. Datos Identificativos</h2>
            <p className="text-gray-700 mb-4">
              En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad 
              de la Información y de Comercio Electrónico, se informa que:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><strong>Denominación social:</strong> Capittal S.L.</li>
              <li><strong>CIF:</strong> B-12345678</li>
              <li><strong>Domicilio social:</strong> Calle Ejemplo, 123, 28001 Madrid, España</li>
              <li><strong>Teléfono:</strong> +34 900 123 456</li>
              <li><strong>Email:</strong> info@capittal.com</li>
              <li><strong>Registro Mercantil:</strong> Madrid, Tomo XXX, Folio XXX, Hoja M-XXXXXX</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">2. Objeto y Actividad</h2>
            <p className="text-gray-700 mb-4">
              Capittal es una plataforma digital especializada en la intermediación de oportunidades de inversión 
              y adquisición empresarial. Nuestros servicios incluyen:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Presentación y promoción de oportunidades de inversión</li>
              <li>Servicios de consultoría e intermediación empresarial</li>
              <li>Facilitación de contactos entre inversores y empresarios</li>
              <li>Análisis y evaluación de empresas e inversiones</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">3. Condiciones de Uso</h2>
            <p className="text-gray-700 mb-4">
              El acceso y uso de este sitio web implica la aceptación expresa de los presentes términos y condiciones. 
              El usuario se compromete a hacer un uso correcto del sitio web conforme a la ley y a las buenas costumbres.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">4. Propiedad Intelectual e Industrial</h2>
            <p className="text-gray-700 mb-4">
              Todos los contenidos del sitio web, incluyendo textos, fotografías, gráficos, imágenes, iconos, 
              tecnología, software, links y demás contenidos audiovisuales o sonoros, así como su diseño gráfico 
              y códigos fuente, son propiedad intelectual de Capittal S.L.
            </p>
            <p className="text-gray-700 mb-4">
              Queda expresamente prohibida la reproducción total o parcial de este sitio web, ni siquiera mediante 
              un hiperenlace, sin la autorización expresa de Capittal S.L.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">5. Responsabilidad</h2>
            <p className="text-gray-700 mb-4">
              Capittal S.L. no se hace responsable de la información y contenidos almacenados en foros, chats, 
              blogs o cualquier otro medio que permita a terceros publicar contenidos de forma independiente.
            </p>
            <p className="text-gray-700 mb-4">
              Capittal actúa como intermediario y no garantiza el éxito de las operaciones de inversión. 
              Toda decisión de inversión es responsabilidad exclusiva del inversor.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">6. Modificaciones</h2>
            <p className="text-gray-700 mb-4">
              Capittal S.L. se reserva el derecho de efectuar sin previo aviso las modificaciones que considere 
              oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que 
              se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">7. Enlaces</h2>
            <p className="text-gray-700 mb-4">
              En el caso de que en el sitio web se dispusiesen enlaces o hipervínculos hacia otros sitios de Internet, 
              Capittal S.L. no ejercerá ningún tipo de control sobre dichos sitios y contenidos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">8. Derecho de Exclusión</h2>
            <p className="text-gray-700 mb-4">
              Capittal S.L. se reserva el derecho a denegar o retirar el acceso al portal y/o los servicios 
              ofrecidos sin necesidad de preaviso, a instancia propia o de un tercero, a aquellos usuarios 
              que incumplan las presentes Condiciones Generales de Uso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">9. Generalidades</h2>
            <p className="text-gray-700 mb-4">
              Capittal S.L. perseguirá el incumplimiento de las presentes condiciones así como cualquier 
              utilización indebida de su portal ejerciendo todas las acciones civiles y penales que le 
              puedan corresponder en derecho.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">10. Legislación Aplicable y Jurisdicción</h2>
            <p className="text-gray-700 mb-4">
              La relación entre Capittal S.L. y el usuario se regirá por la normativa española vigente y 
              cualquier controversia se someterá a los Juzgados y Tribunales de Madrid.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LegalNotice;
