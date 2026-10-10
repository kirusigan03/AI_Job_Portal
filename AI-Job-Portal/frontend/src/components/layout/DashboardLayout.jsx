import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Bell,
  Briefcase,
  Building2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  UserCircle,
  X,
} from 'lucide-react'
import { Logo } from './Logo'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/dropdown'
import { useAuth } from '@/hooks/useAuth'
import { fetchMyProfile, logout } from '@/store/authSlice'
import { clearNotifications, fetchNotifications, selectUnreadCount } from '@/store/notificationSlice'
import { ROLES, ROLE_LABELS } from '@/utils/constants'
import { initialsFrom } from '@/utils/format'
import { cn } from '@/lib/utils'

const NAV_BY_ROLE = {
  [ROLES.JOB_SEEKER]: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/jobs', label: 'Find jobs', icon: Search },
    { to: '/applications', label: 'Applications', icon: Briefcase },
    { to: '/resumes', label: 'My resumes', icon: FileText },
    { to: '/ai-analysis', label: 'AI analysis', icon: Sparkles },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: UserCircle },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
  [ROLES.EMPLOYER]: [
    { to: '/employer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/employer/jobs', label: 'My jobs', icon: Briefcase, end: true },
    { to: '/employer/jobs/create', label: 'Post a job', icon: PlusCircle },
    { to: '/employer/applications', label: 'Applications', icon: FileText },
    { to: '/employer/candidates', label: 'Candidates', icon: Users },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: Building2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/admin/applications', label: 'Applications', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
}

function SidebarNav({ items, onNavigate, unreadCount }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Sidebar">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-soft text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-primary')}
                aria-hidden="true"
              />
              <span className="flex-1">{item.label}</span>
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { role, email, profile, profileLoaded, userId } = useAuth()
  const unreadCount = useSelector(selectUnreadCount)

  const items = NAV_BY_ROLE[role] || NAV_BY_ROLE[ROLES.JOB_SEEKER]

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (userId && !profileLoaded) dispatch(fetchMyProfile())
  }, [dispatch, userId, profileLoaded])

  useEffect(() => {
    if (!userId) return undefined

    dispatch(fetchNotifications())

    // Notifications arrive through Kafka after the fact, so the bell polls.
    const timer = setInterval(() => dispatch(fetchNotifications()), 60000)
    return () => clearInterval(timer)
  }, [dispatch, userId])

  function onSignOut() {
    dispatch(clearNotifications())
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || email || 'Account'

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo />
        </div>
        <SidebarNav items={items} unreadCount={unreadCount} />
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive"
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative flex h-full w-72 max-w-[85%] flex-col border-r border-border bg-white">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <Logo />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarNav
              items={items}
              unreadCount={unreadCount}
              onNavigate={() => setMobileOpen(false)}
            />
            <div className="border-t border-border p-3">
              <button
                type="button"
                onClick={onSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive"
              >
                <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <Link
            to="/notifications"
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={
              unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
            }
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <Dropdown
            trigger={
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-muted"
              >
                <Avatar
                  size="sm"
                  src={profile?.profileImageUrl}
                  name={displayName}
                  initials={initialsFrom(profile?.firstName, profile?.lastName) || 'U'}
                />
                <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:block">
                  {displayName}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </button>
            }
          >
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                {ROLE_LABELS[role] || role}
              </span>
            </div>
            <DropdownSeparator />
            <DropdownItem icon={UserCircle} onClick={() => navigate('/profile')}>
              Profile
            </DropdownItem>
            <DropdownItem icon={Settings} onClick={() => navigate('/settings')}>
              Settings
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem icon={LogOut} destructive onClick={onSignOut}>
              Log out
            </DropdownItem>
          </Dropdown>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
