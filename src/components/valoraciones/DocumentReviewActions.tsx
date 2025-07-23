import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle, XCircle, AlertCircle, Clock, MessageSquare } from 'lucide-react';
import { ValoracionDocument, DocumentReviewStatus } from '@/types/Valoracion';
import { 
  getReviewStatusIcon, 
  getReviewStatusColor, 
  getReviewStatusBadgeVariant,
  getReviewStatusLabel 
} from '@/utils/documentIcons';

interface DocumentReviewActionsProps {
  document: ValoracionDocument;
  onStatusChange: (documentId: string, status: DocumentReviewStatus, notes?: string) => void;
  canReview: boolean;
}

export const DocumentReviewActions = ({ 
  document, 
  onStatusChange, 
  canReview 
}: DocumentReviewActionsProps) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const StatusIcon = getReviewStatusIcon(document.review_status);
  const statusColor = getReviewStatusColor(document.review_status);
  const badgeVariant = getReviewStatusBadgeVariant(document.review_status);
  const statusLabel = getReviewStatusLabel(document.review_status);

  const handleStatusChange = (newStatus: DocumentReviewStatus) => {
    onStatusChange(document.id, newStatus, reviewNotes);
    setReviewNotes('');
    setIsPopoverOpen(false);
  };

  const getActionButtons = () => {
    if (!canReview) return null;

    const buttons = [];

    if (document.review_status !== 'approved') {
      buttons.push(
        <Button
          key="approve"
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange('approved')}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Aprobar
        </Button>
      );
    }

    if (document.review_status !== 'rejected') {
      buttons.push(
        <Button
          key="reject"
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange('rejected')}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <XCircle className="w-3 h-3 mr-1" />
          Rechazar
        </Button>
      );
    }

    if (document.review_status !== 'under_review') {
      buttons.push(
        <Button
          key="review"
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange('under_review')}
          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
        >
          <AlertCircle className="w-3 h-3 mr-1" />
          En Revisión
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status Badge */}
      <Badge variant={badgeVariant} className="flex items-center gap-1">
        <StatusIcon className={`w-3 h-3 ${statusColor}`} />
        {statusLabel}
      </Badge>

      {/* Review Actions */}
      {canReview && (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <Card className="border-0 shadow-none">
              <CardContent className="p-4 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Revisar Documento</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {document.file_name}
                  </p>
                  
                  <Textarea
                    placeholder="Agregar notas de revisión (opcional)..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="min-h-[60px] mb-3"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {getActionButtons()}
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};