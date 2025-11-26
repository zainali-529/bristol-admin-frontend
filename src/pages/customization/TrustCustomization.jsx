import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck } from 'lucide-react'

function TrustCustomizationPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Trust & Why Us content</CardTitle>
            <CardDescription>Manage testimonials, compliance badges, and trust pillars on the public site.</CardDescription>
          </div>
          <ShieldCheck className="size-6 text-primary" />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Hook this page to your CMS or API to edit the messaging that appears in the Why Trust Us section.
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Content blocks</CardTitle>
          <CardDescription>Design drag-and-drop cards for audits, certifications, and partner badges.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use this canvas for future integrations with the existing public site components.
        </CardContent>
      </Card>
    </div>
  )
}

export default TrustCustomizationPage
