import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart } from 'lucide-react'

function InsightsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Insights & reports</CardTitle>
            <CardDescription>Monitor pricing performance, user engagement, and customization impact.</CardDescription>
          </div>
          <LineChart className="size-6 text-primary" />
        </CardHeader>
      </Card>

      <Tabs defaultValue="pricing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pricing">Pricing metrics</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
        </TabsList>
        <TabsContent value="pricing">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Pricing analytics</CardTitle>
              <CardDescription>Hook up charts to show market deltas and approval turnaround times.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              This space is ready for chart components backed by your analytics API.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engagement">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>User engagement</CardTitle>
              <CardDescription>Display hero variant A/B results or conversion summaries.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Integrate metrics from your analytics provider to evaluate performance.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="customization">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Customization impact</CardTitle>
              <CardDescription>Show which color themes and layouts are currently active.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Use this tab to summarize how admin changes affect the public site.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default InsightsPage
