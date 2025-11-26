import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function PricingPage() {
  return (
    <div className="space-y-6">
      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>Energy pricing controls</CardTitle>
          <CardDescription style={{ color: 'var(--text-secondary)' }}>
            Manage electricity and gas rate updates that drive the public price tracker.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Publish new market rates, adjust insights, and monitor active variants of the price tracker widgets.
          </div>
          <Button 
            size="sm"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            View latest rate change
          </Button>
        </CardContent>
      </Card>

      <Card 
        className="border-dashed"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>Coming soon</CardTitle>
          <CardDescription style={{ color: 'var(--text-secondary)' }}>
            Integrate forms and tables for publishing rate changes and viewing history.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          This page is ready for pricing forms, approval workflows, and market summaries.
        </CardContent>
      </Card>
    </div>
  )
}

export default PricingPage
