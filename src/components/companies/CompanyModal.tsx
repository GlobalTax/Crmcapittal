import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateCompanyData, CompanySize, CompanyType, CompanyStatus } from '@/types/Company';

interface CompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCompany: (data: CreateCompanyData) => void;
  isCreating?: boolean;
}

const companySizes: { value: CompanySize; label: string }[] = [
  { value: '1-10', label: '1-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-500', label: '201-500' },
  { value: '500+', label: '500+' }
];

export const CompanyModal = ({
  open,
  onOpenChange,
  onCreateCompany,
  isCreating
}: CompanyModalProps) => {
  const [formData, setFormData] = useState<Partial<CreateCompanyData>>({
    name: '',
    domain: '',
    company_status: 'prospecto',
    company_type: 'prospect',
    company_size: '11-50',
    lifecycle_stage: 'lead',
    annual_revenue: undefined,
    is_target_account: false,
    is_key_account: false,
    is_franquicia: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Company form submitted with data:", formData);
    
    if (!formData.name?.trim()) {
      console.error("❌ Company name is required");
      return;
    }

    // Simplified company data - only send essential fields with explicit defaults
    const companyPayload: CreateCompanyData = {
      // Required fields
      name: formData.name.trim(),
      company_size: formData.company_size || '11-50',
      company_type: formData.company_type || 'prospect',
      company_status: formData.company_status || 'prospecto',
      lifecycle_stage: formData.lifecycle_stage || 'lead',
      is_target_account: formData.is_target_account || false,
      is_key_account: formData.is_key_account || false,
      is_franquicia: formData.is_franquicia || false,
      
      // Optional fields - only include non-empty values
      ...(formData.domain?.trim() && { domain: formData.domain.trim() }),
      ...(formData.annual_revenue && { annual_revenue: formData.annual_revenue }),
      country: 'España',
      lead_score: 0
    };

    console.log("🚀 Sending company payload:", companyPayload);
    onCreateCompany(companyPayload);

    // Reset form
    setFormData({
      name: '',
      domain: '',
      company_status: 'prospecto',
      company_type: 'prospect',
      company_size: '11-50',
      lifecycle_stage: 'lead',
      annual_revenue: undefined,
      is_target_account: false,
      is_key_account: false,
      is_franquicia: false
    });
    onOpenChange(false);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Create company</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="templates">Create templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 mt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Company name"
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    placeholder="example.com"
                    value={formData.domain || ''}
                    onChange={(e) => updateField('domain', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="stage">Stage</Label>
                  <Select 
                    value={formData.company_status || 'prospecto'} 
                    onValueChange={(value) => updateField('company_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospecto">Prospect</SelectItem>
                      <SelectItem value="cliente">Customer</SelectItem>
                      <SelectItem value="perdida">Churned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="owner">Owner</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="arr">ARR</Label>
                  <Input
                    id="arr"
                    type="number"
                    placeholder="0"
                    value={formData.annual_revenue || ''}
                    onChange={(e) => updateField('annual_revenue', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>

                <div>
                  <Label htmlFor="employees">Employee range</Label>
                  <Select 
                    value={formData.company_size || '11-50'} 
                    onValueChange={(value) => updateField('company_size', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map(size => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !formData.name?.trim()}
                  className="relative"
                >
                  {isCreating ? "Creando..." : "Create company"}
                  <span className="ml-2 text-xs text-muted opacity-60">⌘⇧↩</span>
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Create templates for faster company creation</p>
              <Button variant="outline" className="mt-4">
                + Create template
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};