import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useDarkMode } from '@/hooks/useDarkMode'
import apiService from '@/services/api'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setLoading, setError, loginSuccess, clearError } from '@/store/authSlice'

function Login() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { darkMode, toggleDarkMode } = useDarkMode()
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())
    dispatch(setLoading(true))

    try {
      const response = await apiService.login({ email, password })
      
      if (response.data.success) {
        const token = response.data.data?.token || response.data.token
        const user = response.data.data?.user || null
        
        dispatch(loginSuccess({ token, user }))
        navigate('/dashboard')
      } else {
        dispatch(setError(response.data.message || 'Login failed. Please try again.'))
      }
    } catch (err) {
      dispatch(setError(
        err.response?.data?.message ||
        err.message ||
        'An error occurred. Please try again.'
      ))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Dark Mode Toggle - Top Right */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className="absolute top-4 right-4"
        aria-label="Toggle dark mode"
      >
        <Sun
          className={`size-5 transition-all duration-200 ${
            darkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        <Moon
          className={`absolute size-5 transition-all duration-200 ${
            darkMode ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </Button>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logo/bu-logo.svg"
              alt="Bristol Utilities"
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access the Admin Control Center
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@bristolutilities.co.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 pr-9"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Bristol Utilities Admin Portal</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
