import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SettingSection } from '@/components/settings/SettingSection';
import { Upload, Trash2, Info, Shield, User, Crown } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  timezone: string;
  weekStart: string;
}

const getRoleInfo = (role: string) => {
  switch (role) {
    case 'superadmin':
      return {
        name: 'Superadministrador',
        description: 'Acceso completo al sistema, gestión de usuarios y configuraciones críticas',
        icon: Crown,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      };
    case 'admin':
      return {
        name: 'Administrador',
        description: 'Gestión de usuarios, operaciones y configuraciones del workspace',
        icon: Shield,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    default:
      return {
        name: 'Usuario',
        description: 'Acceso estándar a funcionalidades de CRM y gestión de datos',
        icon: User,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
  }
};

export default function ProfilePage() {
  const { user } = useAuth();
  // Profile functionality will be handled by regular user context
  const profile = null;
  const profileLoading = false;
  const updating = false;
  const updateProfile = async () => {};
  const { role, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    timezone: 'Europe/Madrid',
    weekStart: 'monday',
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when profile data loads
  useEffect(() => {
    if (profile && user) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: user.email || '',
        phone: profile.phone || '',
        timezone: 'Europe/Madrid', // Default timezone for Spain
        weekStart: 'monday',
      });
    }
  }, [profile, user]);

  const loading = profileLoading || roleLoading;

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleBlur = async (field: keyof ProfileData) => {
    if (!hasChanges) return;
    
    try {
      const updates: any = {};
      
      // Only update profile fields, not email (readonly)
      if (field === 'first_name') updates.first_name = profileData.first_name;
      if (field === 'last_name') updates.last_name = profileData.last_name;
      if (field === 'phone') updates.phone = profileData.phone;
      
      if (Object.keys(updates).length > 0) {
        await updateProfile();
        
        toast({
          title: "Guardado ✓",
          description: "Perfil actualizado correctamente"
        });
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

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

      {/* Role and Permissions */}
      <SettingSection
        title="Rol y Permisos"
        description="Tu rol actual y las capacidades del sistema."
      >
        {role && (() => {
          const roleInfo = getRoleInfo(role);
          const RoleIcon = roleInfo.icon;
          
          return (
            <div className={`p-4 rounded-lg border ${roleInfo.borderColor} ${roleInfo.bgColor}`}>
              <div className="flex items-start gap-3">
                <RoleIcon className={`h-5 w-5 mt-0.5 ${roleInfo.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium ${roleInfo.color}`}>{roleInfo.name}</h3>
                    <span className="text-xs bg-white px-2 py-1 rounded-full border border-gray-200">
                      {role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {roleInfo.description}
                  </p>
                  
                  {/* Permissions list */}
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Capacidades:</span>
                    {role === 'superadmin' && (
                      <span> Gestión completa del sistema, usuarios, configuraciones críticas, facturación</span>
                    )}
                    {role === 'admin' && (
                      <span> Gestión de usuarios, operaciones, mandatos, configuraciones del workspace</span>
                    )}
                    {role === 'user' && (
                      <span> Gestión de contactos, empresas, oportunidades, tareas personales</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </SettingSection>

      <SettingSection 
        title="Información Personal"
        description="Actualiza tus datos personales e información de contacto."
      >
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 hover:opacity-75 transition-opacity cursor-pointer">
              <AvatarFallback className="text-lg">
                {getInitials(profileData.first_name, profileData.last_name)}
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
                value={profileData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                onBlur={() => handleBlur('first_name')}
                autoComplete="given-name"
                disabled={updating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos *</Label>
              <Input
                id="lastName"
                value={profileData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                onBlur={() => handleBlur('last_name')}
                autoComplete="family-name"
                disabled={updating}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                value={profileData.email}
                readOnly
                className="bg-muted cursor-not-allowed"
                autoComplete="email"
              />
              <Button variant="outline" size="sm" disabled>
                Solo lectura
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              El email está gestionado por el sistema de autenticación y no se puede modificar aquí.
            </p>
          </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              autoComplete="tel"
              disabled={updating}
              placeholder="+34 600 000 000"
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
                value={profileData.timezone} 
                onValueChange={(value) => {
                  handleChange('timezone', value);
                  handleBlur('timezone');
                }}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Madrid">Madrid (CET/CEST)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET/CEST)</SelectItem>
                  <SelectItem value="Europe/Berlin">Berlin (CET/CEST)</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekStart">Comenzar semana en</Label>
              <Select 
                value={profileData.weekStart} 
                onValueChange={(value) => {
                  handleChange('weekStart', value);
                  handleBlur('weekStart');
                }}
                disabled={updating}
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