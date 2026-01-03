import { ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Calendar,
  Package,
  Crown,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { title: 'Orders', icon: ShoppingCart, path: '/orders' },
  { title: 'Customers', icon: Users, path: '/customers' },
  { title: 'Production', icon: Calendar, path: '/production' },
  { title: 'Inventory', icon: Package, path: '/inventory' },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-sidebar-border">
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg gradient-primary">
                <Crown className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-sidebar-foreground">King Cakes</h1>
                <p className="text-xs text-muted-foreground">Order Management</p>
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.path}
                        className={cn(
                          location.pathname === item.path && 'bg-sidebar-accent text-sidebar-accent-foreground'
                        )}
                      >
                        <Link to={item.path}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-sidebar-foreground">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4 md:hidden">
            <SidebarTrigger />
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
