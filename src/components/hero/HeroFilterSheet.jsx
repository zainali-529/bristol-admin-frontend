import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const HeroFilterSheet = ({ open, onOpenChange, filters, onFilterChange, onApply, onReset }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  const handleApply = () => {
    onFilterChange(localFilters);
    if (onApply) {
      onApply();
    }
    onOpenChange(false);
  };

  const handleReset = () => {
    const defaultFilters = {
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setLocalFilters(defaultFilters);
    onReset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>Filter Hero Templates</SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            Filter and sort hero section templates
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6">
          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy" style={{ color: 'var(--text-primary)' }}>Sort By</Label>
            <Select
              value={localFilters.sortBy}
              onValueChange={(value) => setLocalFilters(prev => ({ ...prev, sortBy: value }))}
            >
              <SelectTrigger
                id="sortBy"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="Select sort field" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Updated Date</SelectItem>
                <SelectItem value="templateName">Template Name</SelectItem>
                <SelectItem value="headline">Headline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sortOrder" style={{ color: 'var(--text-primary)' }}>Sort Order</Label>
            <Select
              value={localFilters.sortOrder}
              onValueChange={(value) => setLocalFilters(prev => ({ ...prev, sortOrder: value }))}
            >
              <SelectTrigger
                id="sortOrder"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="Select sort order" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="mt-4 p-4 border-t">
          <div className="flex gap-3 w-full">
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default HeroFilterSheet;

