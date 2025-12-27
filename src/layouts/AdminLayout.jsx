import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useMemo, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/authSlice'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  LineChart,
  Palette,
  Settings,
  Users,
  LayoutDashboard,
  Sparkles,
  ShieldCheck,
  BarChart3,
  LifeBuoy,
  LogOut,
  Search,
  Moon,
  Sun,
  Mail,
  Briefcase,
  HelpCircle,
  Newspaper,
  UserCircle,
  FileText,
  Receipt,
  Building2,
  MessageSquare,
  Lock,
  Ticket,
} from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import apiService from '@/services/api'

const mainNavigation = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { title: 'Energy Pricing', icon: LineChart, href: '/pricing' },
  { title: 'Suppliers', icon: Users, href: '/suppliers' },
  { title: 'Services', icon: Briefcase, href: '/services' },
  { title: 'Industries', icon: Building2, href: '/industries' },
  { title: 'Testimonials', icon: MessageSquare, href: '/testimonials' },
  { title: 'FAQs', icon: HelpCircle, href: '/faqs' },
  { title: 'News', icon: Newspaper, href: '/news' },
  { title: 'Team Members', icon: UserCircle, href: '/team-members' },
  { title: 'Contacts', icon: Mail, href: '/contacts' },
  { title: 'Quote Requests', icon: Receipt, href: '/quotes' },
  { title: 'Why Trust Us', icon: ShieldCheck, href: '/customization/why-trust-us' },
  { title: 'How We Work', icon: Briefcase, href: '/customization/how-we-work' },
]

const advancePaidFeatures = [
  { title: 'Theme', icon: Palette, href: '/customization/theme' },
  { title: 'Hero Section', icon: Sparkles, href: '/customization/hero' },
  { title: 'Documents', icon: FileText, href: '/documents' },

  // { title: 'Trust & Why Us', icon: ShieldCheck, href: '/customization/trust' },
  // { title: 'Settings', icon: Settings, href: '/settings' },
]

const supportNavigation = [
  { title: 'Tickets', icon: Ticket, href: '/tickets' },
  // { title: 'Support', icon: LifeBuoy, href: '/support' },
]

function SidebarContentInner() {
  const location = useLocation()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const [featureStatus, setFeatureStatus] = useState({})
  const [demoStatus, setDemoStatus] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const entries = await Promise.all(
          advancePaidFeatures.map(async (item) => {
            const key = item.href.split('/').pop()
            const res = await apiService.getFeatureAccessStatus(key)
            const unlocked = !!res.data?.data?.isUnlocked
            return [key, unlocked]
          })
        )
        setFeatureStatus(Object.fromEntries(entries))
      } catch (e) {}
    }
    load()
  }, [])

  useEffect(() => {
    const computeDemo = () => {
      const entries = advancePaidFeatures.map((item) => {
        const key = item.href.split('/').pop()
        const endRaw = localStorage.getItem(`demo:${key}:endAt`)
        const endAt = endRaw ? Number(endRaw) : 0
        const active = endAt && Date.now() < endAt
        return [key, !!active]
      })
      setDemoStatus(Object.fromEntries(entries))
    }
    computeDemo()
    const id = setInterval(computeDemo, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
        <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className={`flex items-center gap-2 px-2 py-4 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground shrink-0">
              <Sparkles className="size-5" />
            </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">Bristol Utilities</span>
              <span className="text-xs text-sidebar-foreground/60 leading-tight">Admin Control Center</span>
            </div>
          )}
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={location.pathname.startsWith(item.href)}>
                      <Link to={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="bg-sidebar-accent text-sidebar-accent-foreground">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Advance Paid Features</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {advancePaidFeatures.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={location.pathname.startsWith(item.href)}>
                      <Link to={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {featureStatus[item.href.split('/').pop()] ? (
                      <SidebarMenuBadge className="bg-sidebar-accent text-sidebar-accent-foreground">
                        Purchased
                      </SidebarMenuBadge>
                    ) : demoStatus[item.href.split('/').pop()] ? (
                      <SidebarMenuBadge className="bg-sidebar-accent text-sidebar-accent-foreground">
                        Demo
                      </SidebarMenuBadge>
                    ) : (
                      <SidebarMenuBadge className="bg-sidebar-accent text-sidebar-accent-foreground">
                        <Lock className="size-4" />
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        <SidebarSeparator />

           <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={location.pathname.startsWith(item.href)}>
                    <Link to={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        </SidebarContent>


       

        {/* <SidebarFooter className="border-t border-sidebar-border">
          <div className="p-2">
          <Button variant="outline" className={`w-full gap-2 ${isCollapsed ? 'justify-center px-2' : 'justify-start'}`}>
            <LifeBuoy className="size-4 shrink-0" />
            {!isCollapsed && <span>Support Center</span>}
            </Button>
          </div>
        </SidebarFooter> */}
    </>
  )
}

function AdminLayout() {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { darkMode, toggleDarkMode } = useDarkMode()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [user, setUser] = useState({ name: '', email: '' })
  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.getAdminProfile()
        const admin = res.data?.admin || {}
        setUser({ name: admin.name || '', email: admin.email || '' })
      } catch (e) {}
    })()
  }, [])
  const navItems = [...mainNavigation, ...advancePaidFeatures, ...supportNavigation]

  const activeItem = useMemo(() => {
    const match = navItems.find((item) => location.pathname.startsWith(item.href))
    return match ?? navItems[0]
  }, [location.pathname, navItems])

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarContentInner />
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-background">
        <header className="flex h-16 items-center gap-4 border-b border-border px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-muted-foreground" />
            <Separator orientation="vertical" className="h-6" />
            <div className="hidden items-center gap-2 sm:flex">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">{activeItem.title}</h1>
              {activeItem.badge && (
                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                  {activeItem.badge}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="hidden md:flex">
              {/* <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search or jump to…" className="w-full pl-9" />
              </div> */}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="relative"
              aria-label="Toggle dark mode"
            >
              <Sun
                className={`size-4 transition-all duration-200 ${
                  darkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`}
              />
              <Moon
                className={`absolute size-4 transition-all duration-200 ${
                  darkMode ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                }`}
              />
              <span className="sr-only">Toggle dark mode</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="size-8">
                    <AvatarImage src={''} alt={user.name} />
                    <AvatarFallback>{(user.name || 'AD').slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left md:flex md:flex-col">
                    <span className="text-sm font-medium leading-tight">{user.name || 'Admin'}</span>
                    <span className="text-xs text-muted-foreground leading-tight">{user.email || 'admin@bristolutilities.co.uk'}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">My Account</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={async () => {
                    try {
                      await apiService.logout()
                    } catch (err) {
                      console.error('Logout error:', err)
                    } finally {
                      dispatch(logout())
                      window.location.href = '/login'
                    }
                  }}
                >
                  <LogOut className="mr-2 size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 space-y-6 p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AdminLayout
