
import { useState } from "react";
import { Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactType } from "@/types/Contact";

interface ContactsSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: ContactType | "all";
  setFilterType: (type: ContactType | "all") => void;
}

export const ContactsSearchBar = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType
}: ContactsSearchBarProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar contactos por nombre, email o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ContactType | "all")}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todos los tipos</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Ventas</option>
              <option value="franquicia">Franquicia</option>
              <option value="cliente">Cliente</option>
              <option value="prospect">Prospect</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
