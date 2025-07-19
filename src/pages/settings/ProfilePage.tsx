
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SettingSection } from '@/components/settings/SettingSection';
import { useToast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';

export default function ProfilePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Guardado ✓",
        description: "Tu perfil ha sido actualizado correctamente."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el perfil.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tu información personal y preferencias de cuenta.
        </p>
      </div>

      <SettingSection
        title="Foto de perfil"
        description="Actualiza tu foto de perfil que se mostrará en el sistema."
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Cambiar foto
          </Button>
        </div>
      </SettingSection>

      <SettingSection
        title="Información personal"
        description="Actualiza tu información básica de contacto."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Apellidos</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Tus apellidos"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+34 600 000 000"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="bio">Biografía</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Cuéntanos sobre ti..."
            rows={3}
          />
        </div>
        <Button onClick={handleSave}>
          Guardar cambios
        </Button>
      </SettingSection>
    </div>
  );
}
