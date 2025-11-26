import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card 
        className="border-primary/10"
        style={{ 
          backgroundColor: 'var(--primary-5)',
          borderColor: 'var(--primary-10)'
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle 
            className="text-lg font-semibold"
            style={{ color: 'var(--primary)' }}
          >
            Welcome back
          </CardTitle>
          <Button 
            size="sm" 
            className="gap-2"
            style={{ 
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            <Sparkles className="size-4" />
            Create quick action
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-3">
          <div>
            <p 
              className="font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Live energy feeds
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              12 supplier integrations are currently active.
            </p>
          </div>
          <div>
            <p 
              className="font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Pending approvals
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              4 customer pricing requests require review.
            </p>
          </div>
          <div>
            <p 
              className="font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Theme variants
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              3 hero layouts are published on the site.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>
              Today's overview
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Review activity across pricing, supplier updates, and customization modules.
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>
              Getting started
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Use the sidebar to navigate between pricing, suppliers, and site customization tools.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
