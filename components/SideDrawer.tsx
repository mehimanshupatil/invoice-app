'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Menu,
  Home,
  FileText,
  Plus,
  Users,
  Settings,
  BarChart3,
  CreditCard,
  Bell,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { config } from '@/lib/config';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
  allowedRoles?: string[];
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and statistics',
  },
  {
    title: 'Invoices',
    href: '/invoices',
    icon: FileText,
    description: 'Manage all invoices',
  },
  {
    title: 'Create Invoice',
    href: '/invoices/create',
    icon: Plus,
    description: 'Generate new invoice',
    allowedRoles: ['Admin', 'Accountant'],
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users,
    description: 'Customer management',
    badge: 'Soon',
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    description: 'Analytics and insights',
    badge: 'Soon',
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: CreditCard,
    description: 'Payment tracking',
    badge: 'Soon',
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    description: 'System alerts',
    badge: '3',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System configuration',
    allowedRoles: ['Admin'],
  },
  {
    title: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
    description: 'Get assistance',
  },
];

interface SideDrawerProps {
  children?: React.ReactNode;
}

export function SideDrawer({ children }: SideDrawerProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredItems = navigationItems.filter(item => {
    if (!item.allowedRoles) return true;
    return user?.role && item.allowedRoles.includes(user.role);
  });

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Invoice Manager</h2>
            <p className="text-blue-100 text-sm">v{config.appVersion}</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {user?.role}
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Main Menu
        </div>
        {filteredItems.slice(0, 3).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all duration-200 group hover:bg-accent hover:border-accent-foreground/20 border border-transparent",
                isActive && "bg-accent border-accent-foreground/20 shadow-sm"
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )} />
                <div>
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    isActive ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                  )}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground group-hover:text-primary">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {item.badge && (
                  <Badge 
                    variant={item.badge === 'Soon' ? 'secondary' : 'default'}
                    className="text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
                <ChevronRight className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isActive ? "text-primary transform rotate-90" : "text-muted-foreground group-hover:text-primary group-hover:translate-x-1"
                )} />
              </div>
            </Link>
          );
        })}

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6">
          Management
        </div>
        {filteredItems.slice(3, 6).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all duration-200 group hover:bg-accent hover:border-accent-foreground/20 border border-transparent",
                isActive && "bg-accent border-accent-foreground/20 shadow-sm"
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )} />
                <div>
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    isActive ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                  )}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground group-hover:text-primary">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {item.badge && (
                  <Badge 
                    variant={item.badge === 'Soon' ? 'secondary' : 'default'}
                    className="text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
                <ChevronRight className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isActive ? "text-primary transform rotate-90" : "text-muted-foreground group-hover:text-primary group-hover:translate-x-1"
                )} />
              </div>
            </Link>
          );
        })}

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6">
          System
        </div>
        {filteredItems.slice(6).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all duration-200 group hover:bg-accent hover:border-accent-foreground/20 border border-transparent",
                isActive && "bg-accent border-accent-foreground/20 shadow-sm"
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )} />
                <div>
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    isActive ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                  )}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground group-hover:text-primary">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {item.badge && (
                  <Badge 
                    variant={item.badge === 'Soon' ? 'secondary' : 'default'}
                    className="text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
                <ChevronRight className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isActive ? "text-primary transform rotate-90" : "text-muted-foreground group-hover:text-primary group-hover:translate-x-1"
                )} />
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {config.appName} v{config.appVersion}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            © 2024 Your Company • {config.env.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <NavigationContent />
      </SheetContent>
      {children}
    </Sheet>
  );
}