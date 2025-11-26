import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>Admin settings</CardTitle>
          <CardDescription style={{ color: 'var(--text-secondary)' }}>
            Configure notification preferences, teams, and integrations.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Populate this space with forms for account settings, security policies, and environment toggles.
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
