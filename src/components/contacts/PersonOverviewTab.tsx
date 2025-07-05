import { User, Users, TrendingUp, Calendar, Mail, Phone } from 'lucide-react';
import { DealHighlightCard } from '@/components/deals/DealHighlightCard';
import { Contact } from '@/types/Contact';

interface PersonOverviewTabProps {
  contact: Contact;
}

export const PersonOverviewTab = ({ contact }: PersonOverviewTabProps) => {
  const getConnectionStrength = () => {
    // Calculate connection strength based on available data
    let strength = 0;
    if (contact.email) strength += 25;
    if (contact.phone) strength += 25;
    if (contact.last_interaction_date) strength += 30;
    if (contact.company) strength += 20;
    
    if (strength >= 80) return { label: 'Strong', color: 'text-green-600' };
    if (strength >= 60) return { label: 'Medium', color: 'text-yellow-600' };
    if (strength >= 40) return { label: 'Weak', color: 'text-orange-600' };
    return { label: 'Very weak', color: 'text-red-600' };
  };

  const connectionStrength = getConnectionStrength();

  const getEmailAddresses = () => {
    const emails = [];
    if (contact.email) emails.push(contact.email);
    return emails.length > 0 ? emails.join(', ') : 'No email addresses';
  };

  const getPhoneNumbers = () => {
    const phones = [];
    if (contact.phone) phones.push(contact.phone);
    return phones.length > 0 ? phones.join(', ') : 'No phone numbers';
  };

  const getPrimaryLocation = () => {
    // This would come from contact data in a real implementation
    return 'Not set';
  };

  return (
    <div className="space-y-6">
      {/* Highlight Cards Grid 3x2 */}
      <div className="grid grid-cols-3 gap-4">
        <DealHighlightCard
          title="Connection strength"
          icon={User}
          value={
            <span className={connectionStrength.color}>
              {connectionStrength.label}
            </span>
          }
          subtitle="Based on interactions"
        />

        <DealHighlightCard
          title="Next calendar interaction"
          icon={Calendar}
          value="No meetings scheduled"
          subtitle="Schedule a meeting"
        />

        <DealHighlightCard
          title="Company"
          icon={Users}
          value={contact.company || 'No company'}
          subtitle={contact.position || 'No position'}
        />

        <DealHighlightCard
          title="Email addresses"
          icon={Mail}
          value={getEmailAddresses()}
          subtitle={`${contact.email ? '1' : '0'} email address`}
        />

        <DealHighlightCard
          title="Phone numbers"
          icon={Phone}
          value={getPhoneNumbers()}
          subtitle={`${contact.phone ? '1' : '0'} phone number`}
        />

        <DealHighlightCard
          title="Primary location"
          icon={TrendingUp}
          value={getPrimaryLocation()}
          subtitle="Location not specified"
        />
      </div>

      {/* Recent Activity Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <div className="flex-1">
              <p className="text-sm">Contact created</p>
              <p className="text-xs text-muted-foreground">
                {new Date(contact.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {contact.updated_at !== contact.created_at && (
            <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">Contact updated</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(contact.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {contact.last_interaction_date && (
            <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">Last interaction</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(contact.last_interaction_date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {(!contact.last_interaction_date && contact.updated_at === contact.created_at) && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground">Activity will appear here as it happens</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};