import { Building2, User, Calendar, Mail, Phone } from 'lucide-react';
import { Company } from '@/types/Company';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CompanyActivityTabProps {
  company: Company;
}

interface ActivityItem {
  id: string;
  type: 'created' | 'updated' | 'contacted' | 'meeting' | 'email';
  title: string;
  description?: string;
  date: string;
  icon: any;
  color: string;
}

export const CompanyActivityTab = ({ company }: CompanyActivityTabProps) => {
  // Generate activity timeline from company data
  const activities: ActivityItem[] = [];

  // Company creation
  activities.push({
    id: 'created',
    type: 'created',
    title: 'Company created',
    description: `${company.name} was added to the system`,
    date: company.created_at,
    icon: Building2,
    color: 'bg-blue-500'
  });

  // Company updates
  if (company.updated_at !== company.created_at) {
    activities.push({
      id: 'updated',
      type: 'updated',
      title: 'Company updated',
      description: 'Company information was modified',
      date: company.updated_at,
      icon: User,
      color: 'bg-green-500'
    });
  }

  // Last activity
  if (company.last_activity_date) {
    activities.push({
      id: 'activity',
      type: 'contacted',
      title: 'Last activity',
      description: 'Latest interaction recorded',
      date: company.last_activity_date,
      icon: Calendar,
      color: 'bg-purple-500'
    });
  }

  // Sort activities by date (newest first)
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getRelativeTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es
    });
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No activity yet
        </h3>
        <p className="text-muted-foreground">
          Activity will appear here as interactions happen
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Activity Timeline</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          const isLast = index === activities.length - 1;
          
          return (
            <div key={activity.id} className="relative flex items-start gap-4">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-4 top-8 w-px h-full bg-border"></div>
              )}
              
              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${activity.color} flex items-center justify-center`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getRelativeTime(activity.date)}
                  </p>
                </div>
                
                {activity.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(activity.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more placeholder */}
      <div className="text-center pt-4">
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Load more activity
        </button>
      </div>
    </div>
  );
};