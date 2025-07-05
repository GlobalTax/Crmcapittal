import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SettingSection } from '@/components/settings/SettingSection';
import { Upload, Trash2 } from 'lucide-react';

interface ProfileData {
  name: string;
  jobTitle: string;
  phone: string;
  timezone: string;
  locale: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    name: 'John Doe',
    jobTitle: 'Sales Manager',
    phone: '+1 (555) 123-4567',
    timezone: 'America/New_York',
    locale: 'en-US',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasChanges(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and preferences.
        </p>
      </div>

      <SettingSection 
        title="Personal Information"
        description="Update your personal details and contact information."
      >
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button size="sm" className="h-8">
                <Upload className="h-4 w-4 mr-2" />
                Upload photo
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, GIF or PNG. Max size 1MB.
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input
                id="jobTitle"
                value={profile.jobTitle}
                onChange={(e) => handleChange('jobTitle', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={profile.timezone} onValueChange={(value) => handleChange('timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="locale">Locale</Label>
              <Select value={profile.locale} onValueChange={(value) => handleChange('locale', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                  <SelectItem value="fr-FR">Français</SelectItem>
                  <SelectItem value="de-DE">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </SettingSection>

      <SettingSection 
        title="Danger Zone"
        description="Irreversible and destructive actions."
      >
        <div className="space-y-4">
          <div className="p-4 border border-destructive/20 rounded-md bg-destructive/5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back.
                </p>
              </div>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete my account
              </Button>
            </div>
          </div>
        </div>
      </SettingSection>
    </div>
  );
}