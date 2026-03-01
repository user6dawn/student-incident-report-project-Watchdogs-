'use client'

import { ReactNode, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from '@/components/ui/drawer'

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'All Reports',
    href: '/admin/reports',
    icon: FileText,
  },
  {
    label: 'Students',
    href: '/admin/students',
    icon: Users,
  },
  {
    label: 'Stats',
    href: '/admin/stats',
    icon: BarChart3,
  },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleNavigate = (href: string) => {
    if (pathname !== href) {
      router.push(href)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/admin/login')
    } catch {
      // Auth context already handles toast errors
    }
  }

  // Hide sidebar on login/signup pages
  const isAuthPage = pathname === '/admin/login'

  // On small screens (portrait), we show a drawer triggered by a menu icon

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {!isAuthPage && (
        <>
          {/* desktop/landscape sidebar */}
          <aside
            className={`${
              collapsed ? 'w-20' : 'w-64'
            } hidden md:flex portrait:hidden bg-white/90 dark:bg-gray-900/90 border-r border-gray-200 dark:border-gray-800 shadow-sm flex-col transition-all duration-200 ease-in-out h-screen sticky top-0`}
          >
        <div className="px-3 py-4 border-b border-gray-100 dark:border-gray-800 flex items-start gap-2">
          <div className="flex-1">
            <div className="rounded-xl bg-blue-700 text-white px-3 py-4 flex flex-col items-center gap-2">
              <Avatar className="h-14 w-14 border-2 border-white/40">
                {profile?.image_url ? (
                  <AvatarImage
                    src={profile.image_url}
                    alt={profile?.name ?? 'Administrator'}
                  />
                ) : (
                  <AvatarFallback className="bg-blue-700 text-sm font-semibold">
                    {(profile?.name || 'AD')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                )}
              </Avatar>
              {!collapsed && (
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold leading-tight">
                    {profile?.name ?? 'Administrator'}
                  </p>
                  {profile?.email && (
                    <p className="text-[11px] text-blue-100/90 break-words">
                      {profile.email}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin/dashboard' &&
                pathname.startsWith(item.href))

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavigate(item.href)}
                className={`w-full flex items-center  ${
                  collapsed ? 'justify-center' : 'justify-start'
                } gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className={`w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950 ${
              collapsed ? 'justify-center px-0' : 'justify-center'
            }`}
          >
            <LogOut className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
            {!collapsed && 'Logout'}
          </Button>
        </div>
      </aside>
          {/* mobile header with menu button */}
          <header className="md:hidden portrait:flex flex items-center justify-between px-4 py-2 bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="text-lg font-semibold">Admin</div>
            <div className="w-6" /> {/* placeholder for spacing */}
          </header>

          {/* drawer for small screens */}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent className="w-64">
              <div className="flex flex-col h-full">
                {/* replicate sidebar contents for mobile */}
                <div className="px-3 py-4 border-b border-gray-100 dark:border-gray-800 flex items-start gap-2">
                  <div className="flex-1">
                    <div className="rounded-xl bg-blue-700 text-white px-3 py-4 flex flex-col items-center gap-2">
                      <Avatar className="h-14 w-14 border-2 border-white/40">
                        {profile?.image_url ? (
                          <AvatarImage
                            src={profile.image_url}
                            alt={profile?.name ?? 'Administrator'}
                          />
                        ) : (
                          <AvatarFallback className="bg-blue-700 text-sm font-semibold">
                            {(profile?.name || 'AD')
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-semibold leading-tight">
                          {profile?.name ?? 'Administrator'}
                        </p>
                        {profile?.email && (
                          <p className="text-[11px] text-blue-100/90 break-words">
                            {profile.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <DrawerClose asChild>
                    <button
                      type="button"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      aria-label="Close menu"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </DrawerClose>
                </div>

                <nav className="flex-1 px-2 py-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/admin/dashboard' &&
                        pathname.startsWith(item.href))

                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => {
                          handleNavigate(item.href)
                          setDrawerOpen(false)
                        }}
                        className={`w-full flex items-center  ${
                          collapsed ? 'justify-center' : 'justify-start'
                        } gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-700 text-white shadow-sm'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    )
                  })}
                </nav>

                <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleLogout()
                      setDrawerOpen(false)
                    }}
                    className={`w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950 ${
                      collapsed ? 'justify-center px-0' : 'justify-center'
                    }`}
                  >
                    <LogOut className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
                    {!collapsed && 'Logout'}
                  </Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      )}

      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  )
}  
