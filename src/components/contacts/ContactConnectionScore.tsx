import React from 'react';
import { Contact } from '@/types/Contact';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ContactConnectionScoreProps {
  contact: Contact;
  showTooltip?: boolean;
}

export const ContactConnectionScore = ({ 
  contact, 
  showTooltip = true 
}: ContactConnectionScoreProps) => {
  const calculateScore = (contact: Contact): number => {
    let score = 0;
    
    // Basic info (20 points)
    if (contact.email) score += 10;
    if (contact.phone) score += 10;
    
    // Professional info (30 points)
    if (contact.company) score += 15;
    if (contact.position) score += 15;
    
    // Interaction history (30 points)
    if (contact.last_contact_date) {
      const daysSinceContact = Math.floor(
        (Date.now() - new Date(contact.last_contact_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceContact <= 7) score += 30;
      else if (daysSinceContact <= 30) score += 20;
      else if (daysSinceContact <= 90) score += 10;
    }
    
    // Engagement metrics (20 points)
    if (contact.email_opens && contact.email_opens > 0) score += 5;
    if (contact.email_clicks && contact.email_clicks > 0) score += 5;
    if (contact.website_visits && contact.website_visits > 0) score += 5;
    if (contact.follow_up_count && contact.follow_up_count > 0) score += 5;
    
    return Math.min(score, 100);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-gray-400';
  };

  const getTooltipContent = (contact: Contact): string => {
    const details = [];
    
    if (contact.last_contact_date) {
      const daysSince = Math.floor(
        (Date.now() - new Date(contact.last_contact_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      details.push(`Último contacto: hace ${daysSince} día${daysSince !== 1 ? 's' : ''}`);
    } else {
      details.push('Sin contacto previo');
    }
    
    if (contact.email_opens) {
      details.push(`Emails abiertos: ${contact.email_opens}`);
    }
    
    if (contact.email_clicks) {
      details.push(`Enlaces clickeados: ${contact.email_clicks}`);
    }
    
    if (contact.website_visits) {
      details.push(`Visitas web: ${contact.website_visits}`);
    }
    
    return details.join('\n');
  };

  const score = calculateScore(contact);
  const scoreColor = getScoreColor(score);
  
  const ScoreDisplay = () => (
    <div className="flex items-center gap-2">
      <span className={`font-medium text-sm ${scoreColor}`}>
        {score}
      </span>
      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            score >= 80 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-gray-400'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  if (!showTooltip) {
    return <ScoreDisplay />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <ScoreDisplay />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs whitespace-pre-line">
            {getTooltipContent(contact)}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};