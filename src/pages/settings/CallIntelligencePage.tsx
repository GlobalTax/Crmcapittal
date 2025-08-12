import { useState } from 'react';
import { SettingSection } from '@/components/settings/SettingSection';
import { CardRadio } from '@/components/settings/CardRadio';
import { RadioGroup } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Brain } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function CallIntelligencePage() {
  const [autoRecord, setAutoRecord] = useState('external');
  const [insightsTemplate, setInsightsTemplate] = useState('none');
  const { toast } = useToast();

  const handleAutoRecordChange = async (value: string) => {
    setAutoRecord(value);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Saved ✓",
        description: "Auto-record preference updated"
      });
    } catch (error) {
      // Rollback on error
      setAutoRecord(autoRecord);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    }
  };

  const handleInsightsTemplateChange = async (value: string) => {
    setInsightsTemplate(value);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      toast({
        title: "Saved ✓",
        description: "Insights template updated"
      });
    } catch (error) {
      setInsightsTemplate(insightsTemplate);
      toast({
        title: "Error", 
        description: "Failed to save changes",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl space-y-6">

      <SettingSection
        title="Auto-record meetings"
        description="Choose which types of meetings should be automatically recorded for analysis."
      >
        <RadioGroup
          value={autoRecord}
          onValueChange={handleAutoRecordChange}
          className="grid grid-cols-1 gap-4"
        >
          <CardRadio
            value="external"
            label="External meetings"
            description="Record meetings with people outside your organization"
            icon={<Phone className="h-4 w-4" />}
            badge="Recommended"
            checked={autoRecord === 'external'}
          />
          <CardRadio
            value="none"
            label="None"
            description="Don't automatically record any meetings"
            icon={<Phone className="h-4 w-4" />}
            checked={autoRecord === 'none'}
          />
        </RadioGroup>
      </SettingSection>

      <SettingSection
        title="Default insights template"
        description="Select the default template for generating meeting insights and summaries."
      >
        <div className="flex items-center gap-4">
          <Brain className="h-4 w-4 text-muted-foreground" />
          <Select value={insightsTemplate} onValueChange={handleInsightsTemplateChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="sales-discovery">Sales Discovery</SelectItem>
              <SelectItem value="demo">Demo</SelectItem>
              <SelectItem value="retrospective">Retrospective</SelectItem>
              <SelectItem value="customer-interview">Customer Interview</SelectItem>
              <SelectItem value="team-meeting">Team Meeting</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingSection>
    </div>
  );
}