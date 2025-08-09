import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactTagEditorProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
}

const COMMON_CONTACT_TAGS = [
  'decision-maker',
  'influencer',
  'technical',
  'financial',
  'legal',
  'procurement',
  'c-level',
  'manager',
  'director',
  'vp',
  'founder',
  'ceo',
  'cfo',
  'cto',
  'marketing',
  'sales',
  'operations',
  'hr',
  'warm-lead',
  'cold-lead',
  'qualified',
  'champion',
  'blocker',
  'budget-holder',
  'user',
  'buyer',
  'recommender'
];

export function ContactTagEditor({
  tags,
  onTagsChange,
  suggestions = COMMON_CONTACT_TAGS,
  placeholder = "Añadir tag...",
  maxTags = 10
}: ContactTagEditorProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue) {
      const filtered = suggestions
        .filter(suggestion => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(suggestion)
        )
        .slice(0, 8);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, tags, suggestions]);

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < maxTags) {
      onTagsChange([...tags, normalizedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[0]);
      } else if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Tags</span>
        <Badge variant="outline" className="text-xs">
          {tags.length}/{maxTags}
        </Badge>
      </div>

      {/* Tags existentes */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs px-2 py-1 hover:bg-secondary/80 transition-colors"
            >
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input para nuevos tags */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (filteredSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            className="text-sm"
            disabled={tags.length >= maxTags}
          />
          {inputValue && (
            <Button
              onClick={() => addTag(inputValue)}
              size="sm"
              variant="outline"
              disabled={tags.length >= maxTags}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Sugerencias */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => addTag(suggestion)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors",
                  "border-b last:border-b-0"
                )}
              >
                <Tag className="h-3 w-3 inline mr-2 text-muted-foreground" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sugerencias comunes (cuando no hay input) */}
      {!inputValue && tags.length < maxTags && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Sugerencias comunes:</span>
          <div className="flex flex-wrap gap-1">
            {suggestions
              .filter(suggestion => !tags.includes(suggestion))
              .slice(0, 6)
              .map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => addTag(suggestion)}
                  className="text-xs h-7 px-2"
                >
                  <Plus className="h-2 w-2 mr-1" />
                  {suggestion}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}