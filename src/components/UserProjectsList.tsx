
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserProjectsListProps {
  userId: string;
  userName: string;
  isManager: boolean;
}

const UserProjectsList = ({ userId, userName, isManager }: UserProjectsListProps) => {
  const navigate = useNavigate();

  const handleViewProjects = () => {
    // Navegar a la página de proyectos
    navigate('/projects');
  };

  return (
    <Button variant="outline" size="sm" onClick={handleViewProjects}>
      <List className="h-4 w-4 mr-1" />
      Ver Proyectos
    </Button>
  );
};

export default UserProjectsList;
