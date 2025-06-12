
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProjectNameGeneratorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

const generateRandomProjectName = () => {
  const adjectives = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Nova', 'Apex', 'Prime', 'Elite', 'Ultra'];
  const nouns = ['Ventures', 'Capital', 'Holdings', 'Group', 'Partners', 'Corp', 'Industries', 'Solutions', 'Tech', 'Labs'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 999) + 1;
  
  return `${randomAdjective} ${randomNoun} ${randomNumber}`;
};

export const ProjectNameGenerator = ({ 
  value, 
  onChange, 
  label = "Nombre del Proyecto",
  required = false 
}: ProjectNameGeneratorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="project_name">{label} {required && '*'}</Label>
      <div className="flex space-x-2">
        <Input
          id="project_name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Proyecto Alpha"
          required={required}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange(generateRandomProjectName())}
          className="shrink-0"
        >
          Generar
        </Button>
      </div>
    </div>
  );
};
