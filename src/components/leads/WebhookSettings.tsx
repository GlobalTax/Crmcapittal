
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Eye, EyeOff, TestTube } from "lucide-react";
import { toast } from "sonner";

const WebhookSettings = () => {
  const [showWebhookKey, setShowWebhookKey] = useState(false);
  const [testData, setTestData] = useState(JSON.stringify({
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    phone: "+34 600 123 456",
    company: "Tech Solutions SL",
    message: "Interesado en sus servicios",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "lead_generation"
  }, null, 2));

  const webhookUrl = `https://nbvvdaprcecaqvvkqcto.supabase.co/functions/v1/lead-webhook`;
  const mockWebhookKey = "webhook-key-12345"; // This should come from environment

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const testWebhook = async () => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'website_form',
          webhook_key: mockWebhookKey,
          data: JSON.parse(testData)
        })
      });

      if (response.ok) {
        toast.success("Webhook test exitoso");
      } else {
        toast.error("Error en el webhook test");
      }
    } catch (error) {
      toast.error("Error conectando con el webhook");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Webhooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>URL del Webhook</Label>
            <div className="flex items-center space-x-2">
              <Input value={webhookUrl} readOnly className="flex-1" />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(webhookUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Clave del Webhook</Label>
            <div className="flex items-center space-x-2">
              <Input 
                type={showWebhookKey ? "text" : "password"}
                value={mockWebhookKey} 
                readOnly 
                className="flex-1" 
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowWebhookKey(!showWebhookKey)}
              >
                {showWebhookKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(mockWebhookKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fuentes de Leads Compatibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Formularios Web</h4>
                <p className="text-sm text-gray-600">Captura desde formularios de contacto</p>
              </div>
              <Badge variant="outline">Activo</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Capital Market</h4>
                <p className="text-sm text-gray-600">Integración con plataforma Capital Market</p>
              </div>
              <Badge variant="outline">Activo</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Campañas de Email</h4>
                <p className="text-sm text-gray-600">Leads desde campañas de email marketing</p>
              </div>
              <Badge variant="secondary">Próximamente</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Probar Webhook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Datos de Prueba (JSON)</Label>
            <Textarea
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              className="font-mono text-sm"
              rows={8}
            />
          </div>

          <Button onClick={testWebhook} className="w-full">
            <TestTube className="h-4 w-4 mr-2" />
            Probar Webhook
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formato de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">POST Request Format:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "source": "website_form" | "capital_market",
  "webhook_key": "your-webhook-key",
  "data": {
    "name": "Nombre del lead",
    "email": "email@example.com",
    "phone": "+34 600 123 456",
    "company": "Nombre de la empresa",
    "message": "Mensaje del lead",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "lead_generation",
    "referrer": "https://referrer.com",
    "landing_page": "https://landing.com"
  }
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookSettings;
