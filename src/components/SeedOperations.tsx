import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOperations } from "@/hooks/useOperations";
import { useToast } from "@/hooks/use-toast";
import { Operation } from "@/types/Operation";

const sampleOperations: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">[] = [
  {
    company_name: "Innovate Solutions SL",
    cif: "B87654321",
    sector: "Tecnología",
    operation_type: "sale",
    amount: 12000000,
    currency: "EUR",
    date: "2023-11-20",
    buyer: "Global Software Corp",
    seller: "Inversores Privados",
    status: "available",
    description: "Adquisición de empresa de software B2B especializada en automatización",
    location: "Barcelona",
    contact_email: "info@innovate.es",
    contact_phone: "+34 930 123 456",
    revenue: 8000000,
    ebitda: 1500000,
    annual_growth_rate: 30.0
  },
  {
    company_name: "Saludable Foods SA",
    cif: "A12345679",
    sector: "Alimentación",
    operation_type: "sale",
    amount: 7500000,
    currency: "EUR",
    date: "2024-03-10",
    buyer: "NutriVida Group",
    seller: "Familia fundadora",
    status: "available",
    description: "Venta de productor de alimentos orgánicos con certificación europea",
    location: "Valencia",
    contact_email: "contacto@saludablefoods.es",
    contact_phone: "+34 960 987 654",
    revenue: 10000000,
    ebitda: 1200000,
    annual_growth_rate: 15.5
  },
  {
    company_name: "EcoEnergía Renovables",
    cif: "B98765432",
    sector: "Energía",
    operation_type: "partial_sale",
    amount: 25000000,
    currency: "EUR",
    date: "2023-09-05",
    buyer: "Green Ventures Capital",
    seller: "EcoEnergía Renovables",
    status: "available",
    description: "Ronda de financiación para expansión en energía solar",
    location: "Sevilla",
    contact_email: "invest@ecoenergia.com",
    contact_phone: "+34 950 112 233",
    revenue: 15000000,
    ebitda: 3000000,
    annual_growth_rate: 45.0
  },
  {
    company_name: "Moda Global Retail",
    cif: "A23456789",
    sector: "Retail",
    operation_type: "merger",
    amount: 85000000,
    currency: "EUR",
    date: "2024-05-22",
    buyer: "Urban Style Co",
    seller: "Moda Global Retail",
    status: "pending_review",
    description: "Fusión para crear líder en moda joven con presencia internacional",
    location: "Madrid",
    contact_email: "press@modaglobal.com",
    contact_phone: "+34 910 334 455",
    revenue: 50000000,
    ebitda: 7500000,
    annual_growth_rate: 12.0
  },
  {
    company_name: "Logística Express 24h",
    cif: "B34567890",
    sector: "Logística",
    operation_type: "sale",
    amount: 3000000,
    currency: "USD",
    date: "2023-12-18",
    buyer: "Rapid Delivery Inc",
    seller: "Fundadores",
    status: "available",
    description: "Compra de startup de última milla con tecnología propia",
    location: "Zaragoza",
    contact_email: "admin@logisticaexpress.es",
    contact_phone: "+34 976 556 677",
    revenue: 4000000,
    ebitda: 400000,
    annual_growth_rate: 35.2
  },
  {
    company_name: "CiberSeguridad Total",
    cif: "B45678901",
    sector: "Tecnología",
    operation_type: "sale",
    amount: 22000000,
    currency: "EUR",
    date: "2024-02-28",
    buyer: "SecureNet Holdings",
    seller: "Capital Riesgo Tech",
    status: "available",
    description: "Venta de empresa de ciberseguridad con clientes corporativos",
    location: "Málaga",
    contact_email: "ventas@ciberseguridadtotal.com",
    contact_phone: "+34 952 778 899",
    revenue: 12000000,
    ebitda: 4000000,
    annual_growth_rate: 50.1
  },
  {
    company_name: "Construcciones Norte",
    cif: "A56789012",
    sector: "Construcción",
    operation_type: "sale",
    amount: 15000000,
    currency: "EUR",
    date: "2023-10-01",
    buyer: "Grupo Obrasur",
    seller: "Familia García",
    status: "available",
    description: "Venta de constructora con 30 años de experiencia en obra civil",
    location: "Bilbao",
    contact_email: "direccion@construccionesnorte.com",
    contact_phone: "+34 940 121 314",
    revenue: 25000000,
    ebitda: 2500000,
    annual_growth_rate: 8.5
  },
  {
    company_name: "PharmaInvest I+D",
    cif: "B67890123",
    sector: "Salud",
    operation_type: "partial_sale",
    amount: 18000000,
    currency: "EUR",
    date: "2024-01-30",
    buyer: "BioMed Capital",
    seller: "PharmaInvest I+D",
    status: "available",
    description: "Ronda de inversión para ensayos clínicos fase III",
    location: "Barcelona",
    contact_email: "rd@pharmainvest.es",
    contact_phone: "+34 930 989 796",
    revenue: 5000000,
    ebitda: -500000,
    annual_growth_rate: null
  },
  {
    company_name: "Viajes Mundo SL",
    cif: "B78901234",
    sector: "Turismo",
    operation_type: "sale",
    amount: 4500000,
    currency: "EUR",
    date: "2023-08-15",
    buyer: "Global Tours SA",
    seller: "Fundadores",
    status: "available",
    description: "Adquisición de agencia de viajes online especializada en destinos exóticos",
    location: "Palma de Mallorca",
    contact_email: "booking@viajesmundo.es",
    contact_phone: "+34 971 454 647",
    revenue: 6000000,
    ebitda: 700000,
    annual_growth_rate: 18.0
  },
  {
    company_name: "AgroTech del Sur",
    cif: "A89012345",
    sector: "Agricultura",
    operation_type: "sale",
    amount: 9800000,
    currency: "EUR",
    date: "2024-04-12",
    buyer: "Campo Fértil Corp",
    seller: "Cooperativa Agraria",
    status: "pending_review",
    description: "Venta de empresa de tecnología agrícola y sistemas de riego inteligente",
    location: "Murcia",
    contact_email: "info@agrotechsur.com",
    contact_phone: "+34 968 321 654",
    revenue: 13000000,
    ebitda: 2200000,
    annual_growth_rate: 22.3
  },
  {
    company_name: "Fintech Futuro",
    cif: "B90123456",
    sector: "Fintech",
    operation_type: "partial_sale",
    amount: 35000000,
    currency: "USD",
    date: "2024-06-01",
    buyer: "Dynamic Ventures",
    seller: "Fintech Futuro",
    status: "pending_review",
    description: "Ronda Serie C para expansión internacional en pagos digitales",
    location: "Madrid",
    contact_email: "ir@fintechfuturo.com",
    contact_phone: "+34 910 789 123",
    revenue: 18000000,
    ebitda: 2000000,
    annual_growth_rate: 60.0
  },
  {
    company_name: "AutoParts Premium",
    cif: "A01234567",
    sector: "Automoción",
    operation_type: "sale",
    amount: 28000000,
    currency: "EUR",
    date: "2024-03-15",
    buyer: "European Auto Group",
    seller: "Inversores Institucionales",
    status: "available",
    description: "Fabricante de componentes premium para vehículos de lujo",
    location: "Valladolid",
    contact_email: "sales@autopartspremium.es",
    contact_phone: "+34 983 445 667",
    revenue: 35000000,
    ebitda: 8500000,
    annual_growth_rate: 14.2
  },
  {
    company_name: "Digital Marketing Pro",
    cif: "B11223344",
    sector: "Marketing Digital",
    operation_type: "merger",
    amount: 6500000,
    currency: "EUR",
    date: "2024-01-20",
    buyer: "Creative Agency Network",
    seller: "Socios fundadores",
    status: "available",
    description: "Fusión de agencias digitales para crear grupo líder nacional",
    location: "Valencia",
    contact_email: "hello@digitalmarketingpro.es",
    contact_phone: "+34 961 123 789",
    revenue: 8000000,
    ebitda: 1200000,
    annual_growth_rate: 28.5
  },
  {
    company_name: "CleanTech Innovación",
    cif: "B55667788",
    sector: "Tecnología Limpia",
    operation_type: "partial_sale",
    amount: 45000000,
    currency: "EUR",
    date: "2024-02-10",
    buyer: "Sustainability Ventures",
    seller: "CleanTech Innovación",
    status: "available",
    description: "Ronda de crecimiento para tecnologías de reciclaje avanzado",
    location: "Bilbao",
    contact_email: "invest@cleantech.es",
    contact_phone: "+34 944 567 890",
    revenue: 22000000,
    ebitda: 5500000,
    annual_growth_rate: 67.8
  },
  {
    company_name: "Educación Online Plus",
    cif: "A99887766",
    sector: "Educación",
    operation_type: "sale",
    amount: 16500000,
    currency: "EUR",
    date: "2023-11-30",
    buyer: "Global Education Corp",
    seller: "Fundadores",
    status: "available",
    description: "Plataforma de educación online con IA para personalización",
    location: "Barcelona",
    contact_email: "contact@educaciononline.es",
    contact_phone: "+34 932 456 123",
    revenue: 12500000,
    ebitda: 3200000,
    annual_growth_rate: 42.1
  },
  {
    company_name: "Inmobiliaria Digital",
    cif: "B33445566",
    sector: "Inmobiliario",
    operation_type: "merger",
    amount: 55000000,
    currency: "EUR",
    date: "2024-04-05",
    buyer: "PropTech Holdings",
    seller: "Inmobiliaria Digital",
    status: "pending_review",
    description: "Fusión para crear la mayor plataforma inmobiliaria digital de España",
    location: "Madrid",
    contact_email: "investors@inmobiliariadigital.es",
    contact_phone: "+34 915 678 901",
    revenue: 45000000,
    ebitda: 12000000,
    annual_growth_rate: 25.3
  },
  {
    company_name: "Robótica Industrial",
    cif: "B77889900",
    sector: "Robótica",
    operation_type: "sale",
    amount: 32000000,
    currency: "EUR",
    date: "2024-01-15",
    buyer: "Tech Automation Ltd",
    seller: "Familia propietaria",
    status: "available",
    description: "Fabricante de robots industriales para automatización de procesos",
    location: "Zaragoza",
    contact_email: "ventas@roboticaindustrial.es",
    contact_phone: "+34 976 234 567",
    revenue: 28000000,
    ebitda: 7200000,
    annual_growth_rate: 19.4
  },
  {
    company_name: "Biotecnología Avanzada",
    cif: "A44556677",
    sector: "Biotecnología",
    operation_type: "partial_sale",
    amount: 75000000,
    currency: "EUR",
    date: "2024-05-12",
    buyer: "BioVentures International",
    seller: "Biotecnología Avanzada",
    status: "available",
    description: "Ronda Serie B para desarrollo de terapias génicas innovadoras",
    location: "Barcelona",
    contact_email: "bd@biotecnologia.es",
    contact_phone: "+34 934 567 234",
    revenue: 15000000,
    ebitda: 1500000,
    annual_growth_rate: 85.2
  },
  {
    company_name: "Logística Verde",
    cif: "B22334455",
    sector: "Logística Sostenible",
    operation_type: "sale",
    amount: 18500000,
    currency: "EUR",
    date: "2023-12-08",
    buyer: "EcoLogistics Europe",
    seller: "Inversores privados",
    status: "available",
    description: "Operadora logística especializada en transporte eléctrico y sostenible",
    location: "Sevilla",
    contact_email: "info@logisticaverde.es",
    contact_phone: "+34 954 789 012",
    revenue: 24000000,
    ebitda: 3600000,
    annual_growth_rate: 31.7
  },
  {
    company_name: "Gaming Studio Elite",
    cif: "B66778899",
    sector: "Videojuegos",
    operation_type: "sale",
    amount: 42000000,
    currency: "USD",
    date: "2024-03-22",
    buyer: "Global Gaming Corp",
    seller: "Equipo fundador",
    status: "available",
    description: "Estudio de desarrollo de videojuegos móviles con títulos top-grossing",
    location: "Madrid",
    contact_email: "business@gamingstudio.es",
    contact_phone: "+34 911 345 678",
    revenue: 28000000,
    ebitda: 11200000,
    annual_growth_rate: 78.3
  }
];

export const SeedOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addBulkOperations } = useOperations();
  const { toast } = useToast();

  const handleSeedOperations = async () => {
    setIsLoading(true);
    try {
      const result = await addBulkOperations(sampleOperations);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Operaciones creadas",
          description: `Se han creado ${sampleOperations.length} operaciones de ejemplo correctamente`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error inesperado al crear las operaciones",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSeedOperations}
      disabled={isLoading}
      variant="outline"
      className="border-black text-black hover:bg-gray-100"
    >
      {isLoading ? "Creando operaciones..." : "Crear 20 Operaciones de Ejemplo"}
    </Button>
  );
};
