
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone } from "lucide-react";

interface ContactRowInfoProps {
  name: string;
  email?: string;
  phone?: string;
}

export const ContactRowInfo = ({ name, email, phone }: ContactRowInfoProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium text-gray-900">
          {name}
        </div>
        {email && (
          <div className="text-sm text-gray-500 flex items-center">
            <Mail className="h-3 w-3 mr-1" />
            {email}
          </div>
        )}
        {phone && (
          <div className="text-sm text-gray-500 flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            {phone}
          </div>
        )}
      </div>
    </div>
  );
};
