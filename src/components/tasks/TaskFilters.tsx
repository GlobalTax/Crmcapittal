import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'pending' | 'completed';

interface TaskFiltersProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  allTags: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pendingCount: number;
  completedCount: number;
}

export const TaskFilters = ({
  filter,
  onFilterChange,
  selectedTag,
  onTagSelect,
  allTags,
  searchQuery,
  onSearchChange,
  pendingCount,
  completedCount,
}: TaskFiltersProps) => {
  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Todas', count: pendingCount + completedCount },
    { value: 'pending', label: 'Pendientes', count: pendingCount },
    { value: 'completed', label: 'Completadas', count: completedCount },
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tareas..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9 bg-card"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-muted rounded-full p-1 transition-colors"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                "hover:scale-105",
                filter === f.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <>
            <div className="h-6 w-px bg-border" />
            <div className="flex flex-wrap items-center gap-1.5">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-transform hover:scale-105",
                    selectedTag === tag && "shadow-sm"
                  )}
                  onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
