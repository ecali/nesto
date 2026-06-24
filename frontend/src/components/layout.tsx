import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  Calendar,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
  Moon,
  Sun,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'
import { useTranslation } from '@/i18n'
import { useStore } from '@/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function Layout() {
  const { user, logout } = useAuth()
  const { t, locale } = useTranslation()
  const { resolvedTheme, setTheme } = useTheme()
  const { spaces, activeSpace, fetchSpaces, setActiveSpace } = useStore()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchSpaces()
  }, [fetchSpaces])

  const navItems = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/expenses', label: t.nav.expenses, icon: Wallet },
    { href: '/calendar', label: t.nav.calendar, icon: Calendar },
    { href: '/reminders', label: t.nav.reminders, icon: Bell },
    { href: '/spaces', label: t.common.selectSpace, icon: Layers },
    { href: '/settings', label: t.nav.settings, icon: Settings },
  ]

  const localeMap: Record<string, string> = { en: 'en-US', it: 'it-IT', es: 'es-ES' }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
            <span className="size-3 rounded-full bg-primary" />
            Nesto
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="size-5" />
          </button>
        </div>

        <div className="px-4 py-2 border-b">
          <Select value={activeSpace ?? '_none'} onValueChange={(v) => setActiveSpace(v === '_none' ? null : v)}>
            <SelectTrigger className="w-full text-sm">
              <SelectValue placeholder={t.common.selectSpace} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">{t.common.noSpace}</SelectItem>
              {spaces.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="size-5" />
                {item.label}
                {active && <ChevronRight className="size-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="size-5" />
          </button>
          <div className="flex-1" />
          {spaces.find((s) => s.id === activeSpace) && (
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline mr-2">
              {spaces.find((s) => s.id === activeSpace)?.name}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(localeMap[locale], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
