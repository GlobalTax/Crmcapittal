import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Building2, MapPin, Tag, Edit, Check, X } from 'lucide-react';
import { MandateTarget } from '@/types/BuyingMandate';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { logger } from '@/utils/productionLogger';

interface TargetHeaderProps {
  target: MandateTarget;
  onUpdate: (target: MandateTarget) => void;
}

export const TargetHeader = ({ target, onUpdate }: TargetHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    company_name: target.company_name,
    sector: target.sector || '',
    location: target.location || '',
    status: target.status,
  });
  
  const { updateTarget } = useBuyingMandates();

  const handleSave = async () => {
    try {
      await updateTarget(target.id, editData);
      setIsEditing(false);
      onUpdate({ ...target, ...editData });
    } catch (error) {
      logger.error('Error updating target header', { error, targetId: target.id }, 'TargetHeader');
    }
  };

  const handleCancel = () => {
    setEditData({
      company_name: target.company_name,
      sector: target.sector || '',
      location: target.location || '',
      status: target.status,
    });
    setIsEditing(false);
  };

  const getStatusColor = (status: MandateTarget['status']) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      contacted: 'bg-blue-100 text-blue-800',
      in_analysis: 'bg-yellow-100 text-yellow-800',
      interested: 'bg-green-100 text-green-800',
      nda_signed: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status: MandateTarget['status']) => {
    const texts = {
      pending: 'Pendiente',
      contacted: 'En Contacto',
      in_analysis: 'En Análisis',
      interested: 'Interesado',
      nda_signed: 'NDA Firmado',
      rejected: 'Rechazado',
      closed: 'Cerrado',
    };
    return texts[status] || status;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          {/* Company Name */}
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            {isEditing ? (
              <Input
                value={editData.company_name}
                onChange={(e) => setEditData(prev => ({ ...prev, company_name: e.target.value }))}
                className="text-2xl font-bold border-0 bg-white/50 focus:bg-white"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">{target.company_name}</h1>
            )}
          </div>

          {/* Details Row */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Sector */}
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-500" />
              {isEditing ? (
                <Input
                  placeholder="Sector"
                  value={editData.sector}
                  onChange={(e) => setEditData(prev => ({ ...prev, sector: e.target.value }))}
                  className="w-32 h-8 border-0 bg-white/50 focus:bg-white"
                />
              ) : (
                <span className="text-gray-600">{target.sector || 'Sin sector'}</span>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              {isEditing ? (
                <Input
                  placeholder="Ubicación"
                  value={editData.location}
                  onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-32 h-8 border-0 bg-white/50 focus:bg-white"
                />
              ) : (
                <span className="text-gray-600">{target.location || 'Sin ubicación'}</span>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Select
                  value={editData.status}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, status: value as MandateTarget['status'] }))}
                >
                  <SelectTrigger className="w-40 h-8 border-0 bg-white/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="contacted">En Contacto</SelectItem>
                    <SelectItem value="in_analysis">En Análisis</SelectItem>
                    <SelectItem value="interested">Interesado</SelectItem>
                    <SelectItem value="nda_signed">NDA Firmado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getStatusColor(target.status)}>
                  {getStatusText(target.status)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Edit Controls */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave}>
                <Check className="h-4 w-4 mr-2" />
                Guardar
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};