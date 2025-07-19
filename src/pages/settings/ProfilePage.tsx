import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SettingSection } from '@/components/settings/SettingSection';
import { Upload, Trash2, Info } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  timezone: string;
  weekStart: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    timezone: 'America/New_York',
    weekStart: 'monday',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleBlur = async (field: keyof ProfileData) => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Saved ✓",
        description: "Profile updated successfully"
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tu información personal y preferencias.
        </p>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="h-4 w-4 text-blue-600" />
        <p className="text-sm text-neutral-600">
          Los cambios se guardan automáticamente al cambiar de campo.
        </p>
      </div>

      <SettingSection 
        title="Información Personal"
        description="Actualiza tus datos personales e información de contacto."
      >
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 hover:opacity-75 transition-opacity cursor-pointer">
              <AvatarFallback className="text-lg">
                {getInitials(profile.firstName, profile.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="secondary" size="sm" className="h-8">
                <Upload className="h-4 w-4 mr-2" />
                Subir imagen
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, GIF o PNG. Tamaño máximo 1MB.
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos *</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                value={profile.email}
                readOnly
                className="bg-muted cursor-not-allowed"
                autoComplete="email"
              />
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </div>
          </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              autoComplete="tel"
            />
          </div>

        </div>
      </SettingSection>

      <SettingSection
        title="Preferencias de Tiempo"
        description="Configura tu zona horaria y preferencias de calendario."
      >
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona Horaria Preferida</Label>
              <Select 
                value={profile.timezone} 
                onValueChange={(value) => {
                  handleChange('timezone', value);
                  handleBlur('timezone');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Europe/Berlin">Berlin (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekStart">Comenzar semana en</Label>
              <Select 
                value={profile.weekStart} 
                onValueChange={(value) => {
                  handleChange('weekStart', value);
                  handleBlur('weekStart');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Lunes</SelectItem>
                  <SelectItem value="sunday">Domingo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>
      </SettingSection>

      <SettingSection 
        title="Zona de Peligro"
        description="Acciones irreversibles y destructivas."
      >
        <div className="space-y-4">
          <div className="p-4 border border-destructive/20 rounded-md bg-destructive/5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-destructive">Eliminar Cuenta</h4>
                <p className="text-sm text-muted-foreground">
                  Una vez que elimines tu cuenta, no hay vuelta atrás.
                </p>
              </div>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar mi cuenta
              </Button>
            </div>
          </div>
        </div>
      </SettingSection>
    </div>
  );
}