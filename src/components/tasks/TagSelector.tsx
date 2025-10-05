import { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  allTags: string[];
}

export const TagSelector = ({ selectedTags, onTagsChange, allTags }: TagSelectorProps) => {
  const [newTag, setNewTag] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(newTag);
    }
  };

  const availableTags = allTags.filter(tag => !selectedTags.includes(tag));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Selected Tags */}
      {selectedTags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="pl-2 pr-1 py-1 gap-1 text-sm font-normal transition-transform hover:scale-105"
        >
          {tag}
          <button
            onClick={() => handleRemoveTag(tag)}
            className="ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Add Tag Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs gap-1 transition-transform hover:scale-105"
          >
            <Plus className="h-3 w-3" />
            Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Input to create new tag */}
            <div className="flex gap-2">
              <Input
                placeholder="Nuevo tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-sm h-8"
                autoFocus
              />
              <Button
                size="sm"
                onClick={() => handleAddTag(newTag)}
                disabled={!newTag.trim()}
                className="h-8 px-3"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Existing tags */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Tags existentes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary transition-colors text-xs"
                      onClick={() => {
                        handleAddTag(tag);
                        setIsOpen(false);
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
