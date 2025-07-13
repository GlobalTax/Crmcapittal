import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types/Lead';
import { LeadStatusBadge } from './LeadStatusBadge';
import { 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Clock, 
  MessageSquare, 
  User, 
  ArrowRight,
  Plus,
  Edit,
  Activity
} from 'lucide-react';

interface LeadOverviewTabProps {
  lead: Lead;
}

export const LeadOverviewTab = ({ lead }: LeadOverviewTabProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysAgo = (dateString?: string) => {
    if (!dateString) return null;
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const lastContactDays = getDaysAgo(lead.last_contact_date);
  const nextFollowUpDays = lead.next_follow_up_date ? 
    Math.ceil((new Date(lead.next_follow_up_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="space-y-6">
      {/* Lead Header Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{lead.name || lead.email}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              {lead.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{lead.phone}</span>
                </div>
              )}
              {lead.company_name && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">{lead.company_name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeadStatusBadge status={lead.status} />
            <span className={`text-sm font-medium ${getLeadScoreColor(lead.lead_score)}`}>
              Score: {lead.lead_score}/100
            </span>
          </div>
        </div>
      </div>

      {/* Next Activity Section */}
      <Card className="border-l-4 border-l-primary bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium">Next Follow-up</h3>
                <p className="text-sm text-muted-foreground">
                  {lead.next_follow_up_date ? (
                    <>
                      {formatDate(lead.next_follow_up_date)}
                      {nextFollowUpDays !== null && (
                        <span className={`ml-2 ${nextFollowUpDays < 0 ? 'text-red-600' : nextFollowUpDays <= 2 ? 'text-orange-600' : 'text-green-600'}`}>
                          ({nextFollowUpDays < 0 ? `${Math.abs(nextFollowUpDays)} days overdue` : 
                            nextFollowUpDays === 0 ? 'Today' : 
                            `in ${nextFollowUpDays} days`})
                        </span>
                      )}
                    </>
                  ) : (
                    'No follow-up scheduled'
                  )}
                </p>
              </div>
            </div>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule Activity
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Communications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Communications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lead.last_contact_date ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-sm font-medium">Last Contact</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(lead.last_contact_date)}
                      {lastContactDays !== null && (
                        <span className="ml-2">
                          ({lastContactDays === 0 ? 'Today' : `${lastContactDays} days ago`})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No communications yet</p>
              </div>
            )}
            
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Log Communication
            </Button>
          </CardContent>
        </Card>

        {/* Lead Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Lead Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Owner</label>
                <p className="text-sm mt-1">{lead.assigned_to?.first_name && lead.assigned_to?.last_name ? `${lead.assigned_to.first_name} ${lead.assigned_to.last_name}` : 'Unassigned'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</label>
                <p className="text-sm mt-1">{lead.priority || 'Medium'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Source</label>
                <p className="text-sm mt-1 capitalize">{lead.source?.replace('_', ' ') || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quality</label>
                <p className="text-sm mt-1">{lead.quality || 'Not rated'}</p>
              </div>
              {lead.job_title && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Position</label>
                  <p className="text-sm mt-1">{lead.job_title}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Lead Creation */}
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Lead Created</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(lead.created_at)}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getDaysAgo(lead.created_at) === 0 ? 'Today' : `${getDaysAgo(lead.created_at)} days ago`}
                  </Badge>
                </div>
              </div>
            </div>

            {/* First Contact */}
            {lead.first_contact_date && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">First Contact</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(lead.first_contact_date)}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getDaysAgo(lead.first_contact_date) === 0 ? 'Today' : `${getDaysAgo(lead.first_contact_date)} days ago`}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Last Contact */}
            {lead.last_contact_date && lead.last_contact_date !== lead.first_contact_date && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Last Contact</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(lead.last_contact_date)}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getDaysAgo(lead.last_contact_date) === 0 ? 'Today' : `${getDaysAgo(lead.last_contact_date)} days ago`}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Conversion */}
            {lead.conversion_date && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Lead Converted</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(lead.conversion_date)}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getDaysAgo(lead.conversion_date) === 0 ? 'Today' : `${getDaysAgo(lead.conversion_date)} days ago`}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!lead.first_contact_date && !lead.last_contact_date && !lead.conversion_date && (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <Button variant="outline" size="sm" className="mt-3">
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Engagement Stats */}
      {(lead.email_opens || lead.email_clicks || lead.website_visits || lead.content_downloads) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Engagement Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lead.email_opens && (
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{lead.email_opens}</p>
                  <p className="text-sm text-muted-foreground">Email Opens</p>
                </div>
              )}
              {lead.email_clicks && (
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{lead.email_clicks}</p>
                  <p className="text-sm text-muted-foreground">Email Clicks</p>
                </div>
              )}
              {lead.website_visits && (
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{lead.website_visits}</p>
                  <p className="text-sm text-muted-foreground">Website Visits</p>
                </div>
              )}
              {lead.content_downloads && (
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{lead.content_downloads}</p>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Initial Message */}
      {lead.message && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Initial Message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50 border-l-4 border-l-primary">
              <p className="text-sm whitespace-pre-wrap italic">{lead.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
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