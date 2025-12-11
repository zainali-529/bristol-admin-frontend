import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import apiService from '@/services/api'
import { toast } from 'sonner'

function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.getAdminProfile()
        if (res.data?.success) {
          const admin = res.data.admin || {}
          setProfile({ name: admin.name || '', email: admin.email || '' })
        }
      } catch (err) {
        // silently ignore
      }
    })()
  }, [])

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      const res = await apiService.updateAdminProfile({ name: profile.name })
      if (res.data?.success) {
        toast.success('Profile updated')
      } else {
        toast.error(res.data?.message || 'Failed to update profile')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) return toast.error('Enter current and new password')
    if (newPassword.length < 6) return toast.error('New password must be at least 6 characters')
    setLoading(true)
    try {
      const res = await apiService.updateAdminProfile({ currentPassword, newPassword })
      if (res.data?.success) {
        toast.success('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
      } else {
        toast.error(res.data?.message || 'Failed to change password')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your admin profile settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled />
            </div>
          </div>
          <Button onClick={handleProfileSave} disabled={loading}>Save changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Change your admin password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => {
              setCurrentPassword('');
              setNewPassword('');
            }}>Clear</Button>
            <Button onClick={handlePasswordChange} disabled={loading}>Update password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
