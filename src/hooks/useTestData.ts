import { RODMandate, RODLead } from './useRODFormState';

export const useTestData = () => {
  const sampleMandates: Omit<RODMandate, 'id'>[] = [
    {
      companyName: "TechSolutions S.L.",
      sector: "Tecnología",
      location: "Madrid, España",
      salesAmount: 2500000,
      ebitda: 450000,
      description: "Empresa especializada en desarrollo de software empresarial con más de 50 empleados. Busca expansión internacional y cuenta con una cartera de clientes estable en el sector financiero.",
      status: "Disponible",
      contactName: "María González",
      contactEmail: "maria.gonzalez@techsolutions.es",
      contactPhone: "+34 91 123 4567"
    },
    {
      companyName: "Green Energy Iberia",
      sector: "Energía",
      location: "Barcelona, España",
      salesAmount: 5800000,
      ebitda: 980000,
      description: "Compañía líder en energías renovables con presencia en toda la península. Cuenta con parques eólicos y solares en operación y un pipeline de proyectos en desarrollo.",
      status: "En proceso",
      contactName: "Carlos Ruiz",
      contactEmail: "carlos.ruiz@greenenergy.es",
      contactPhone: "+34 93 987 6543"
    },
    {
      companyName: "Distribuciones del Norte",
      sector: "Retail",
      location: "Bilbao, España",
      salesAmount: 1800000,
      ebitda: 280000,
      description: "Red de distribución especializada en productos alimentarios con 25 años de experiencia. Opera en el norte de España con una sólida red logística.",
      status: "Pendiente revisión",
      contactName: "Ana Martínez",
      contactEmail: "ana.martinez@distriunorte.es",
      contactPhone: "+34 94 555 0123"
    },
    {
      companyName: "Innovación Médica Plus",
      sector: "Salud",
      location: "Valencia, España",
      salesAmount: 3200000,
      ebitda: 640000,
      description: "Empresa fabricante de dispositivos médicos con certificaciones internacionales. Exporta a más de 15 países y tiene un fuerte departamento de I+D.",
      status: "Aprobado",
      contactName: "Dr. Juan López",
      contactEmail: "juan.lopez@innomedplus.es",
      contactPhone: "+34 96 333 7890"
    }
  ];

  const sampleLeads: Omit<RODLead, 'id'>[] = [
    {
      companyName: "Digital Marketing Pro",
      sector: "Servicios",
      estimatedValue: 850000,
      leadScore: 85,
      leadSource: "LinkedIn",
      qualificationStatus: "Cualificado",
      contactName: "Patricia Vega",
      contactEmail: "patricia.vega@digitalmarketingpro.com",
      contactPhone: "+34 91 444 5566",
      notes: "Agencia digital en crecimiento con clientes premium. Interesados en fusión o venta para acelerar expansión internacional. Reunión programada para la próxima semana."
    },
    {
      companyName: "EcoPackaging Solutions",
      sector: "Manufactura",
      estimatedValue: 1200000,
      leadScore: 72,
      leadSource: "Referencia",
      qualificationStatus: "En proceso",
      contactName: "Miguel Fernández",
      contactEmail: "miguel.fernandez@ecopackaging.es",
      contactPhone: "+34 96 777 8899",
      notes: "Fabricante de packaging sostenible con tecnología propia. Buscan inversor estratégico para escalar producción y acceder a nuevos mercados europeos."
    },
    {
      companyName: "Smart Logistics Hub",
      sector: "Construcción",
      estimatedValue: 2100000,
      leadScore: 68,
      leadSource: "Web",
      qualificationStatus: "Contactado",
      contactName: "Elena Rodríguez",
      contactEmail: "elena.rodriguez@smartlogistics.es",
      contactPhone: "+34 95 111 2233",
      notes: "Centro logístico automatizado con ubicación estratégica cerca del puerto. Los propietarios consideran venta parcial o total para diversificar inversiones."
    },
    {
      companyName: "Fintech Innovators",
      sector: "Finanzas",
      estimatedValue: 4500000,
      leadScore: 92,
      leadSource: "Eventos",
      qualificationStatus: "Cualificado",
      contactName: "Roberto Silva",
      contactEmail: "roberto.silva@fintechinnovators.com",
      contactPhone: "+34 91 888 9900",
      notes: "Startup fintech con productos de pagos digitales y lending. Crecimiento exponencial y necesitan capital para expansión internacional. Ya tienen interés de varios fondos."
    },
    {
      companyName: "Wellness & Beauty Chain",
      sector: "Salud",
      estimatedValue: 750000,
      leadScore: 55,
      leadSource: "Telemarketing",
      qualificationStatus: "Nurturing",
      contactName: "Carmen Jiménez",
      contactEmail: "carmen.jimenez@wellnessbeauty.es",
      contactPhone: "+34 93 666 7788",
      notes: "Cadena de centros de bienestar con 8 ubicaciones. Propietarios mayores buscan sucesión empresarial. Necesita evaluación más detallada de la operación."
    }
  ];

  return {
    sampleMandates,
    sampleLeads
  };
};