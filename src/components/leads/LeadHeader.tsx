import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, StarOff, Mail, Edit2, ChevronLeft, ChevronRight, User, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/Lead';
import { LeadStatusBadge } from './LeadStatusBadge';
import { toast } from 'sonner';

interface LeadHeaderProps {
  lead: Lead;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const LeadHeader = ({ 
  lead, 
  onPrevious, 
  onNext, 
  hasPrevious, 
  hasNext 
}: LeadHeaderProps) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showComposeEmail, setShowComposeEmail] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const handleComposeEmail = () => {
    setShowComposeEmail(true);
  };

  const handleBackToLeads = () => {
    navigate('/leads');
  };

  const handleQuickConvert = (type: 'contact' | 'company' | 'full') => {
    const messages = {
      contact: 'Quick convert to contact',
      company: 'Quick convert to contact + company',
      full: 'Full conversion (contact + company + deal)'
    };
    toast.info(messages[type] + ' - Feature coming soon');
  };

  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToLeads}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-muted text-sm">
                {getInitials(lead.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{lead.name}</h1>
                <LeadStatusBadge status={lead.status} />
              </div>
              {lead.company_name && (
                <p className="text-sm text-muted-foreground">
                  {lead.job_title ? `${lead.job_title} at ${lead.company_name}` : lead.company_name}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFavorite(!isFavorite)}
            className="h-8 w-8 p-0"
          >
            {isFavorite ? (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation arrows */}
          {(hasPrevious || hasNext) && (
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                disabled={!hasNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Quick conversion actions */}
          {lead.status !== 'CONVERTED' && lead.status !== 'QUALIFIED' && (
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickConvert('contact')}
                title="Convert to contact only"
                className="px-2"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickConvert('company')}
                title="Convert to contact + company"
                className="px-2"
              >
                <Building2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickConvert('full')}
                title="Full conversion"
                className="px-2"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={handleComposeEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Compose email
          </Button>
        </div>
      </div>

      {/* Compose Email Modal */}
      {showComposeEmail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Compose Email</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowComposeEmail(false)}>
                ×
              </Button>
            </div>
            <p className="text-muted-foreground mb-4">
              Email integration coming soon. This will open your default email client to compose an email to {lead.email}.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowComposeEmail(false)}>
                Close
              </Button>
              <Button onClick={() => {
                if (lead.email) {
                  window.location.href = `mailto:${lead.email}`;
                }
                setShowComposeEmail(false);
              }}>
                Open Email Client
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};