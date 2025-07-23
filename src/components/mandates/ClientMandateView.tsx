import { useParams } from 'react-router-dom';

export function ClientMandateView() {
  const { accessToken } = useParams();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Vista Cliente Mandato</h1>
      <p className="text-muted-foreground">
        Token de acceso: {accessToken}
      </p>
      <p className="text-muted-foreground mt-2">
        Vista de solo lectura para clientes
      </p>
    </div>
  );
}