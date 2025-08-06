
import { ArrowLeft, Search, Bell, Settings, MoreHorizontal, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface PipedriveHeaderProps {
  currentStage?: string;
}

export const PipedriveHeader = ({ currentStage = "Pipeline" }: PipedriveHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left side - Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/leads')}
            className="h-8 w-8 p-0 hover:bg-muted transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => navigate('/leads')}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Leads
            </button>
            <span className="text-muted-foreground">{'>'}</span>
            <Badge variant="secondary" className="font-medium animate-fade-in">
              {currentStage}
            </Badge>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar deals, personas, organizaciones..."
              className="pl-10 bg-muted/50 border-0 focus:bg-background transition-all duration-200"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-muted transition-colors duration-200"
          >
            <Star className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-muted transition-colors duration-200"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-muted transition-colors duration-200"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-muted transition-colors duration-200"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
