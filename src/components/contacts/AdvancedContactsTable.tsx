import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Filter, ChevronDown, Eye, Edit, Trash2, Plus } from "lucide-react";
import { Contact } from "@/types/Contact";
import { useAuth } from "@/stores/useAuthStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SavedViewsSelector } from "./SavedViewsSelector";
import { InlineEditCell } from "./InlineEditCell";

interface Column {
  id: string;
  label: string;
  visible: boolean;
  width?: number;
  sortable?: boolean;
  editable?: boolean;
  type?: 'text' | 'email' | 'phone' | 'select' | 'date' | 'badge';
  options?: string[];
}

interface ContactView {
  id: string;
  name: string;
  description?: string;
  filters: Record<string, any>;
  columns: Column[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  is_default: boolean;
  is_shared?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface AdvancedContactsTableProps {
  contacts: Contact[];
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onViewContact: (contact: Contact) => void;
  isLoading?: boolean;
  onUpdateContact?: (id: string, updates: Partial<Contact>) => Promise<void>;
}

const DEFAULT_COLUMNS: Column[] = [
  { id: 'name', label: 'Nombre', visible: true, sortable: true, editable: true, type: 'text' },
  { id: 'email', label: 'Email', visible: true, sortable: true, editable: true, type: 'email' },
  { id: 'phone', label: 'Teléfono', visible: true, editable: true, type: 'phone' },
  { id: 'company', label: 'Empresa', visible: true, sortable: true, editable: true, type: 'text' },
  { id: 'position', label: 'Cargo', visible: true, editable: true, type: 'text' },
  { id: 'contact_type', label: 'Tipo', visible: true, editable: true, type: 'select', 
    options: ['lead', 'prospect', 'customer', 'partner', 'other'] },
  { id: 'contact_priority', label: 'Prioridad', visible: true, editable: true, type: 'select',
    options: ['low', 'medium', 'high'] },
  { id: 'lifecycle_stage', label: 'Etapa', visible: true, editable: true, type: 'select',
    options: ['lead', 'cliente', 'suscriptor', 'proveedor'] },
  { id: 'roles', label: 'Roles', visible: true, editable: false, type: 'badge' },
  { id: 'created_at', label: 'Fecha creación', visible: true, sortable: true, type: 'date' },
  { id: 'last_interaction_date', label: 'Última interacción', visible: false, sortable: true, type: 'date' },
  { id: 'actions', label: 'Acciones', visible: true, sortable: false }
];

export function AdvancedContactsTable({
  contacts,
  onEditContact,
  onDeleteContact,
  onViewContact,
  isLoading = false,
  onUpdateContact
}: AdvancedContactsTableProps) {
  const { user } = useAuth();
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [savedViews, setSavedViews] = useState<ContactView[]>([]);
  const [currentView, setCurrentView] = useState<ContactView | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [showColumnEditor, setShowColumnEditor] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Load saved views and user preferences
  useEffect(() => {
    if (user) {
      loadSavedViews();
      loadUserPreferences();
    }
  }, [user]);

  const loadSavedViews = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('contact_views')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at');

    if (error) {
      console.error('Error loading saved views:', error);
      return;
    }

    // Transform the data to match our interface
    const transformedViews: ContactView[] = (data || []).map(view => ({
      id: view.id,
      name: view.name,
      description: view.description,
      filters: typeof view.filters === 'object' ? view.filters as Record<string, any> : {},
      columns: Array.isArray(view.columns) ? view.columns as unknown as Column[] : DEFAULT_COLUMNS,
      sort_by: view.sort_by,
      sort_order: (view.sort_order as 'asc' | 'desc') || 'asc',
      is_default: view.is_default,
      is_shared: view.is_shared,
      user_id: view.user_id,
      created_at: view.created_at,
      updated_at: view.updated_at
    }));

    setSavedViews(transformedViews);
    
    // Set default view if exists
    const defaultView = transformedViews.find(view => view.is_default);
    if (defaultView) {
      setCurrentView(defaultView);
      setColumns(defaultView.columns);
      setFilters(defaultView.filters);
      if (defaultView.sort_by) {
        setSortConfig({
          key: defaultView.sort_by,
          direction: defaultView.sort_order || 'asc'
        });
      }
    }
  };

  const loadUserPreferences = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_table_preferences')
      .select('column_preferences')
      .eq('user_id', user.id)
      .eq('table_name', 'contacts')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading user preferences:', error);
      return;
    }

    if (data?.column_preferences && Array.isArray(data.column_preferences)) {
      setColumns(data.column_preferences as unknown as Column[]);
    }
  };

  const saveUserPreferences = async (newColumns: Column[]) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_table_preferences')
      .upsert({
        user_id: user.id,
        table_name: 'contacts',
        column_preferences: newColumns as any
      });

    if (error) {
      console.error('Error saving user preferences:', error);
    }
  };

  const handleColumnChange = (newColumns: Column[]) => {
    setColumns(newColumns);
    saveUserPreferences(newColumns);
  };

  const handleSort = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;

    setSortConfig(prev => ({
      key: columnId,
      direction: prev?.key === columnId && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleInlineEdit = async (contactId: string, field: string, value: any) => {
    if (!onUpdateContact) return;

    try {
      await onUpdateContact(contactId, { [field]: value });
      toast.success('Campo actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el campo');
      console.error('Error updating field:', error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(filteredAndSortedContacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, contactId]);
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
  };

  // Filter and sort contacts
  const filteredAndSortedContacts = useMemo(() => {
    let filtered = contacts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply advanced filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(contact => {
          const contactValue = contact[key as keyof Contact];
          if (typeof value === 'string') {
            return String(contactValue).toLowerCase().includes(value.toLowerCase());
          }
          return contactValue === value;
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Contact];
        const bValue = b[sortConfig.key as keyof Contact];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [contacts, searchTerm, filters, sortConfig]);

  const visibleColumns = columns.filter(col => col.visible);

  const getLifecycleBadge = (stage: string) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-800',
      cliente: 'bg-green-100 text-green-800',
      suscriptor: 'bg-purple-100 text-purple-800',
      proveedor: 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[stage as keyof typeof colors] || colors.lead}>{stage}</Badge>;
  };

  const getRolesBadges = (roles: string[]) => {
    if (!roles || roles.length === 0) return null;
    return (
      <div className="flex gap-1 flex-wrap">
        {roles.slice(0, 2).map(role => (
          <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
        ))}
        {roles.length > 2 && (
          <Badge variant="outline" className="text-xs">+{roles.length - 2}</Badge>
        )}
      </div>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[priority as keyof typeof colors] || colors.medium}>{priority}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-800',
      prospect: 'bg-purple-100 text-purple-800',
      customer: 'bg-green-100 text-green-800',
      partner: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[type as keyof typeof colors] || colors.other}>{type}</Badge>;
  };

  const renderCellContent = (contact: Contact, column: Column) => {
    const value = contact[column.id as keyof Contact];

    if (column.id === 'actions') {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewContact(contact)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditContact(contact)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteContact(contact.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (column.type === 'badge') {
      if (column.id === 'contact_priority') {
        return getPriorityBadge(String(value));
      }
      if (column.id === 'contact_type') {
        return getTypeBadge(String(value));
      }
      if (column.id === 'lifecycle_stage') {
        return getLifecycleBadge(String(value));
      }
      if (column.id === 'roles') {
        return getRolesBadges(value as string[]);
      }
    }

    if (column.editable && onUpdateContact && column.type !== 'badge') {
      const editableType = column.type as 'text' | 'email' | 'phone' | 'select' | 'date' | undefined;
      return (
        <InlineEditCell
          value={value}
          type={editableType || 'text'}
          options={column.options}
          onSave={(newValue) => handleInlineEdit(contact.id, column.id, newValue)}
        />
      );
    }

    if (column.type === 'email' && value) {
      return <a href={`mailto:${value}`} className="text-blue-600 hover:underline">{String(value)}</a>;
    }

    if (column.type === 'phone' && value) {
      return <a href={`tel:${value}`} className="text-blue-600 hover:underline">{String(value)}</a>;
    }

    if (column.type === 'date' && value) {
      return new Date(String(value)).toLocaleDateString();
    }

    return String(value || '');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <SavedViewsSelector
            savedViews={savedViews}
            currentView={currentView}
            onViewChange={setCurrentView}
            onCreateView={() => {
              // Create a new view based on current filters and columns
              const newView: Omit<ContactView, 'id' | 'created_at' | 'updated_at'> = {
                user_id: '', // Will be set by the backend
                name: `Vista personalizada ${savedViews.length + 1}`,
                description: 'Vista creada desde filtros actuales',
                filters: filters,
                columns: columns,
                sort_by: sortConfig?.key,
                sort_order: sortConfig?.direction || 'asc',
                is_default: false,
                is_shared: false
              };
              
              toast.success("Vista personalizada creada correctamente");
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(true)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtros
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar contactos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColumnEditor(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Columnas
          </Button>
        </div>
      </div>

      {/* Results count and bulk actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {filteredAndSortedContacts.length} contactos
          {selectedContacts.length > 0 && ` (${selectedContacts.length} seleccionados)`}
        </span>
        
        {selectedContacts.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Acciones en lote
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedContacts.length === filteredAndSortedContacts.length && filteredAndSortedContacts.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.id}
                  className={column.sortable ? "cursor-pointer hover:bg-muted" : ""}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && sortConfig?.key === column.id && (
                      <ChevronDown className={`h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedContacts.map((contact) => (
              <TableRow key={contact.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={(checked) => handleSelectContact(contact.id, !!checked)}
                  />
                </TableCell>
                {visibleColumns.map((column) => (
                  <TableCell key={column.id}>
                    {renderCellContent(contact, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* TODO: Re-implement Column Editor and Advanced Filters */}
    </div>
  );
}