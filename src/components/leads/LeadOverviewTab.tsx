import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/Lead';
import { LeadStatusBadge } from './LeadStatusBadge';
import { Mail, Phone, Building2, Calendar, Target, TrendingUp } from 'lucide-react';

interface LeadOverviewTabProps {
  lead: Lead;
}

export const LeadOverviewTab = ({ lead }: LeadOverviewTabProps) => {
  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(158, 100%, 38%)';
    if (score >= 60) return 'hsl(42, 100%, 50%)';
    if (score >= 40) return 'hsl(30, 100%, 50%)';
    return 'hsl(4, 86%, 63%)';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm mt-1">{lead.email}</p>
            </div>
            {lead.phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-sm mt-1">{lead.phone}</p>
              </div>
            )}
            {lead.company_name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company</label>
                <p className="text-sm mt-1">{lead.company_name}</p>
              </div>
            )}
            {lead.job_title && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Job Title</label>
                <p className="text-sm mt-1">{lead.job_title}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lead Status & Scoring */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lead Status & Scoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <LeadStatusBadge status={lead.status} />
              </div>
            </div>
            {lead.priority && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                <div className="mt-1">
                  <Badge variant="outline">{lead.priority}</Badge>
                </div>
              </div>
            )}
            {lead.quality && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Quality</label>
                <div className="mt-1">
                  <Badge variant="outline">{lead.quality}</Badge>
                </div>
              </div>
            )}
          </div>
          
          {/* Lead Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">Lead Score</label>
              <span className="text-sm font-medium" style={{ color: getLeadScoreColor(lead.lead_score) }}>
                {lead.lead_score}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${lead.lead_score}%`,
                  backgroundColor: getLeadScoreColor(lead.lead_score)
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source & Attribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Source & Attribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Source</label>
              <p className="text-sm mt-1 capitalize">{lead.source.replace('_', ' ')}</p>
            </div>
            {lead.form_data?.utm_source && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">UTM Source</label>
                <p className="text-sm mt-1">{lead.form_data.utm_source}</p>
              </div>
            )}
            {lead.form_data?.utm_campaign && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Campaign</label>
                <p className="text-sm mt-1">{lead.form_data.utm_campaign}</p>
              </div>
            )}
            {lead.form_data?.landing_page && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Landing Page</label>
                <p className="text-sm mt-1">{lead.form_data.landing_page}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-sm mt-1">{formatDate(lead.created_at)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm mt-1">{formatDate(lead.updated_at)}</p>
            </div>
            {lead.first_contact_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">First Contact</label>
                <p className="text-sm mt-1">{formatDate(lead.first_contact_date)}</p>
              </div>
            )}
            {lead.last_contact_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Contact</label>
                <p className="text-sm mt-1">{formatDate(lead.last_contact_date)}</p>
              </div>
            )}
            {lead.next_follow_up_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Next Follow-up</label>
                <p className="text-sm mt-1">{formatDate(lead.next_follow_up_date)}</p>
              </div>
            )}
            {lead.conversion_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Conversion Date</label>
                <p className="text-sm mt-1">{formatDate(lead.conversion_date)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Stats */}
      {(lead.email_opens || lead.email_clicks || lead.website_visits || lead.content_downloads) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Engagement Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lead.email_opens && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{lead.email_opens}</p>
                  <p className="text-sm text-muted-foreground">Email Opens</p>
                </div>
              )}
              {lead.email_clicks && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{lead.email_clicks}</p>
                  <p className="text-sm text-muted-foreground">Email Clicks</p>
                </div>
              )}
              {lead.website_visits && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{lead.website_visits}</p>
                  <p className="text-sm text-muted-foreground">Website Visits</p>
                </div>
              )}
              {lead.content_downloads && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{lead.content_downloads}</p>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message */}
      {lead.message && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Initial Message</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{lead.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lead.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};