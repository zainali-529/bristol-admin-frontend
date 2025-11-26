import { useState, useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

function FAQFilterSheet({ open, onOpenChange, filters, onFilterChange, onApply, onReset }) {
  const { categories } = useAppSelector((state) => state.faqs)
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleLocalChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    onFilterChange(localFilters)
    onApply()
    onOpenChange(false)
  }

  const handleReset = () => {
    const defaultFilters = {
      status: '',
      category: '',
      search: '',
      sortBy: 'displayOrder',
      sortOrder: 'asc',
    }
    setLocalFilters(defaultFilters)
    onFilterChange(defaultFilters)
    onReset()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>Filter FAQs</SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            Filter and sort FAQs by various criteria
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" style={{ color: 'var(--text-primary)' }}>
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search question, answer, or category..."
              value={localFilters.search}
              onChange={(e) => handleLocalChange('search', e.target.value)}
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <Separator />

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status" style={{ color: 'var(--text-primary)' }}>
              Status
            </Label>
            <Select
              value={localFilters.status || 'all'}
              onValueChange={(value) => handleLocalChange('status', value === 'all' ? '' : value)}
            >
              <SelectTrigger
                id="status"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  color: 'var(--popover-foreground)',
                }}
              >
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category" style={{ color: 'var(--text-primary)' }}>
              Category
            </Label>
            <Select
              value={localFilters.category || 'all'}
              onValueChange={(value) => handleLocalChange('category', value === 'all' ? '' : value)}
            >
              <SelectTrigger
                id="category"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  color: 'var(--popover-foreground)',
                }}
              >
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy" style={{ color: 'var(--text-primary)' }}>
              Sort By
            </Label>
            <Select
              value={localFilters.sortBy}
              onValueChange={(value) => handleLocalChange('sortBy', value)}
            >
              <SelectTrigger
                id="sortBy"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  color: 'var(--popover-foreground)',
                }}
              >
                <SelectItem value="displayOrder">Display Order</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Updated Date</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sortOrder" style={{ color: 'var(--text-primary)' }}>
              Sort Order
            </Label>
            <Select
              value={localFilters.sortOrder}
              onValueChange={(value) => handleLocalChange('sortOrder', value)}
            >
              <SelectTrigger
                id="sortOrder"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  color: 'var(--popover-foreground)',
                }}
              >
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="flex-col gap-2 p-4 border-t">
          <Button
            onClick={handleApply}
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
              backgroundColor: 'transparent',
            }}
          >
            Reset Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default FAQFilterSheet

