import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Users, Euro, Calendar, TrendingUp } from "lucide-react";

export const VentaMandatoView = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transacción #{id}</h1>
          <p className="text-muted-foreground">
            Mandato de venta - Seguimiento de la transacción
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-orange-100 text-orange-800">
            En Proceso
          </Badge>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generar Informe
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Transacción
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€2.5M</div>
            <p className="text-xs text-muted-foreground">
              Valoración inicial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compradores Interesados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              3 ofertas recibidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Días en Mercado
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground">
              Desde el lanzamiento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Progreso
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">60%</div>
            <p className="text-xs text-muted-foreground">
              Due diligence en curso
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Empresa</h4>
              <p className="text-sm text-muted-foreground">TechVentures S.L.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Sector</h4>
              <p className="text-sm text-muted-foreground">Software de gestión empresarial</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Facturación Anual</h4>
              <p className="text-sm text-muted-foreground">€4.2M (2023)</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">EBITDA</h4>
              <p className="text-sm text-muted-foreground">€850K (20.2%)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Teaser Ejecutivo</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Memorando de Información</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Estados Financieros</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cronología de la Transacción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
              <div>
                <p className="text-sm font-medium">Ofertas no vinculantes recibidas</p>
                <p className="text-xs text-muted-foreground">3 ofertas - Rango €2.2M - €2.8M</p>
                <p className="text-xs text-muted-foreground">Hace 5 días</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
              <div>
                <p className="text-sm font-medium">Inicio de due diligence</p>
                <p className="text-xs text-muted-foreground">Data room configurado - 2 compradores seleccionados</p>
                <p className="text-xs text-muted-foreground">Hace 2 semanas</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-gray-400 rounded-full mt-1"></div>
              <div>
                <p className="text-sm font-medium">Lanzamiento al mercado</p>
                <p className="text-xs text-muted-foreground">Teaser enviado a 25 compradores estratégicos</p>
                <p className="text-xs text-muted-foreground">Hace 3 meses</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};