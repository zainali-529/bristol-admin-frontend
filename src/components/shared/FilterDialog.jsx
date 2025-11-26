import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function FilterSheet({ open, onOpenChange, filters, onFilterChange, onReset, onApply }) {
  const [localFilters, setLocalFilters] = useState(filters)

  // Update local filters when dialog opens or filters prop changes
  useEffect(() => {
    if (open) {
      setLocalFilters(filters)
    }
  }, [open, filters])

  const handleApply = () => {
    // Apply local filters to Redux state
    onFilterChange(localFilters)
    if (onApply) {
      onApply()
    }
    onOpenChange(false)
  }

  const handleReset = () => {
    const defaultFilters = {
      status: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }
    setLocalFilters(defaultFilters)
    onReset()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Contacts</SheetTitle>
          <SheetDescription>
            Filter contacts by status, date range, and sort options
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-4 space-y-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={localFilters.status || 'all'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, status: value === 'all' ? '' : value })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="dateFrom" className="text-xs">From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={localFilters.dateFrom || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo" className="text-xs">To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={localFilters.dateTo || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort By</Label>
            <Select
              value={localFilters.sortBy || 'createdAt'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, sortBy: value })}
            >
              <SelectTrigger id="sortBy">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Select
              value={localFilters.sortOrder || 'desc'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, sortOrder: value })}
            >
              <SelectTrigger id="sortOrder">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>
        </div>
        
        <SheetFooter className="px-4 py-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default FilterSheet

