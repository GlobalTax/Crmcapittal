
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
    // Navegar a la página de proyectos con filtros para este usuario
    const searchParams = new URLSearchParams();
    if (isManager) {
      searchParams.set('manager', userId);
    } else {
      searchParams.set('creator', userId);
    }
    navigate(`/projects?${searchParams.toString()}`);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleViewProjects}>
      <List className="h-4 w-4 mr-1" />
      Proyectos
    </Button>
  );
};

export default UserProjectsList;
