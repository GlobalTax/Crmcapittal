
import { ArrowLeft, Search, Bell, Settings, MoreHorizontal, Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface PipedriveHeaderProps {
  currentStage?: string;
  onCreateFromLead?: () => void;
}

export const PipedriveHeader = ({ currentStage = "Pipeline", onCreateFromLead }: PipedriveHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-gray-100 bg-white px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left side - Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/leads')}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => navigate('/leads')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Leads
            </button>
            <span className="text-gray-400">{'>'}</span>
            <Badge variant="secondary" className="font-medium text-xs">
              {currentStage}
            </Badge>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              className="pl-10 border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={onCreateFromLead}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear desde lead
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
          >
            <Star className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
