import { NavLink, useLocation } from "react-router-dom";
import {
  Calculator,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  Home,
  ShoppingBag,
  Truck,
  RotateCcw,
  FolderOpen,
  DollarSign,
  Shield,
  FileText,
  AlertTriangle,
  ChevronDown,
  Store
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MenuItem {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

// POS Role Menu Items
const posMenuItems: MenuItem[] = [
  {
    title: "نقاط البيع",
    url: "/pos",
    icon: Calculator,
  },
  {
    title: "إدارة المبيعات",
    icon: ShoppingCart,
    items: [
      { title: "فواتير المبيعات", url: "/sales/invoices" },
      { title: "العملاء", url: "/customers" }
    ]
  },
  {
    title: "إدارة المخزون", 
    icon: Package,
    items: [
      { title: "لوحة تحكم المخزون", url: "/inventory/dashboard" },
      { title: "المنتجات", url: "/inventory/products" },
      { title: "الفئات", url: "/categories" }
    ]
  },
  {
    title: "إدارة المشتريات",
    icon: ShoppingBag,
    items: [
      { title: "فواتير الشراء", url: "/purchase-invoices" },
      { title: "الموردين", url: "/suppliers" }
    ]
  },
  {
    title: "المرتجعات",
    url: "/returns",
    icon: RotateCcw,
  }
];

// Admin Role Menu Items  
const adminMenuItems: MenuItem[] = [
  {
    title: "لوحة التحكم الرئيسية",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "نقاط البيع",
    url: "/pos", 
    icon: Calculator,
  },
  {
    title: "إدارة المبيعات",
    icon: ShoppingCart,
    items: [
      { title: "فواتير المبيعات", url: "/sales/invoices" },
      { title: "المرتجعات", url: "/returns" }
    ]
  },
  {
    title: "إدارة المخزون",
    icon: Package,
    items: [
      { title: "لوحة تحكم المخزون", url: "/inventory/dashboard" },
      { title: "المنتجات", url: "/inventory/products" },
      { title: "الفئات", url: "/categories" }
    ]
  },
  {
    title: "إدارة المشتريات",
    icon: ShoppingBag,
    items: [
      { title: "فواتير الشراء", url: "/purchase-invoices" },
      { title: "الموردين", url: "/suppliers" }
    ]
  },
  {
    title: "الإدارة المالية",
    icon: DollarSign,
    items: [
      { title: "المصروفات", url: "/expenses" },
      { title: "التقارير الشاملة", url: "/reports" }
    ]
  },
  {
    title: "إدارة النظام",
    icon: Settings,
    items: [
      { title: "إدارة المستخدمين", url: "/users" },
      { title: "الإعدادات العامة", url: "/settings" },
      { title: "سجل التدقيق", url: "/audit" }
    ]
  }
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();

  const menuItems = user?.roleName?.toLowerCase() === 'admin' ? adminMenuItems : posMenuItems;
  const isCollapsed = state === 'collapsed';

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (fullName: string) => {
    return fullName.split(' ').map(name => name[0]).join('').toUpperCase();
  };

  // Animation variants
  const menuItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  };

  const iconVariants = {
    hover: { scale: 1.1, rotate: 5 },
    tap: { scale: 0.95 }
  };

  return (
    <Sidebar className="border-l border-sidebar-border/30 bg-sidebar sidebar-rtl shadow-sidebar-glow backdrop-blur-sm" dir="rtl" side="right">
      <SidebarContent className="bg-sidebar-gradient relative">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/3 via-transparent to-sidebar-primary/2 opacity-50" />

        {/* Header */}
        <motion.div
          className="px-4 py-6 relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Enhanced background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/8 to-transparent rounded-lg backdrop-blur-sm" />

          <motion.div
            className="flex items-center gap-3 relative z-10"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-lg relative overflow-hidden"
              whileHover={{
                scale: 1.1,
                boxShadow: "0 0 25px hsl(var(--sidebar-primary) / 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/20 to-transparent" />
              <Store className="h-6 w-6 relative z-10" />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  className="flex flex-col text-right"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.h1
                    className="text-lg font-bold text-sidebar-foreground"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    متجر الإلكترونيات
                  </motion.h1>
                  <motion.p
                    className="text-sm text-sidebar-foreground/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    النظام الذكي
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <Separator className="bg-sidebar-border" />

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-medium px-4 py-2">
            القائمة الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <motion.div
              initial="hidden"
              animate="visible"
            >
              <SidebarMenu>
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.title}
                    variants={menuItemVariants}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <SidebarMenuItem>
                      {item.items ? (
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              className="w-full justify-between text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-primary/15 hover:to-sidebar-primary/5 hover:text-sidebar-primary transition-all duration-300 group relative overflow-hidden rounded-lg"
                            >
                              {/* Enhanced hover background effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/5 to-sidebar-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg backdrop-blur-sm" />

                              {/* Subtle glow effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/0 via-sidebar-primary/3 to-sidebar-primary/0 opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-sm rounded-lg" />

                              <motion.div
                                className="flex items-center gap-3 relative z-10"
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                <motion.div
                                  variants={iconVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                  className="relative"
                                >
                                  <item.icon className="h-5 w-5 group-hover:text-sidebar-primary transition-colors duration-300 relative z-10" />
                                  {/* Icon glow on hover */}
                                  <div className="absolute inset-0 bg-sidebar-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                                </motion.div>
                                <AnimatePresence>
                                  {!isCollapsed && (
                                    <motion.span
                                      className="text-right"
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 10 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      {item.title}
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                              <AnimatePresence>
                                {!isCollapsed && (
                                  <motion.div
                                    initial={{ opacity: 0, rotate: -90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: -90 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronDown className="h-4 w-4 group-hover:text-primary transition-colors duration-300" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <AnimatePresence>
                            {!isCollapsed && (
                              <CollapsibleContent>
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                  <SidebarMenuSub>
                                    {item.items.map((subItem, subIndex) => (
                                      <motion.div
                                        key={subItem.url}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                          delay: subIndex * 0.1,
                                          duration: 0.3,
                                          ease: "easeOut"
                                        }}
                                      >
                                        <SidebarMenuSubItem>
                                          <SidebarMenuSubButton
                                            asChild
                                            isActive={location.pathname === subItem.url}
                                          >
                                            <NavLink
                                              to={subItem.url}
                                              className="hover:text-primary transition-colors duration-300"
                                            >
                                              {subItem.title}
                                            </NavLink>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      </motion.div>
                                    ))}
                                  </SidebarMenuSub>
                                </motion.div>
                              </CollapsibleContent>
                            )}
                          </AnimatePresence>
                        </Collapsible>
                      ) : (
                        <SidebarMenuButton 
                          asChild
                          isActive={location.pathname === item.url}
                        >
                          <NavLink 
                            to={item.url!}
                            className="flex items-center gap-3 text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-primary/15 hover:to-sidebar-primary/5 hover:text-sidebar-primary transition-all duration-300 group relative overflow-hidden rounded-lg"
                          >
                            {/* Active state enhanced indicator */}
                            {location.pathname === item.url && (
                              <motion.div
                                className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sidebar-primary via-sidebar-primary/80 to-sidebar-primary/60 rounded-r-full shadow-lg"
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                            )}

                            {/* Enhanced hover background effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/5 to-sidebar-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg backdrop-blur-sm" />

                            {/* Subtle inner glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/0 via-sidebar-primary/3 to-sidebar-primary/0 opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-sm rounded-lg" />

                            <motion.div
                              className="flex items-center gap-3 relative z-10"
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <motion.div
                                variants={iconVariants}
                                whileHover="hover"
                                whileTap="tap"
                                className="relative"
                              >
                                <item.icon className={`h-5 w-5 transition-colors duration-300 relative z-10 ${
                                  location.pathname === item.url
                                    ? 'text-sidebar-primary'
                                    : 'group-hover:text-sidebar-primary'
                                }`} />
                                {/* Icon glow on hover or active */}
                                <div className={`absolute inset-0 rounded-full opacity-0 blur-sm transition-opacity duration-300 ${
                                  location.pathname === item.url
                                    ? 'bg-sidebar-primary/30 opacity-100'
                                    : 'bg-sidebar-primary/20 group-hover:opacity-100'
                                }`} />
                              </motion.div>
                              <AnimatePresence>
                                {!isCollapsed && (
                                  <motion.span
                                    className="text-right"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {item.title}
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          </NavLink>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </SidebarMenu>
            </motion.div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t border-sidebar-border/30 relative z-10">
        {/* Footer background effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar-background/80 to-transparent backdrop-blur-sm" />

        {user && (
          <motion.div
            className="space-y-4 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-sidebar-accent/20 to-sidebar-accent/10 hover:from-sidebar-accent/30 hover:to-sidebar-accent/20 transition-all duration-300 border border-sidebar-border/20 relative overflow-hidden group backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Enhanced user card background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative z-10"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-sidebar-primary/20 group-hover:ring-sidebar-primary/40 transition-all duration-300">
                      <AvatarFallback className="bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground font-medium shadow-lg">
                        {getUserInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div className="flex-1 min-w-0 text-right">
                    <motion.p
                      className="text-sm font-medium text-sidebar-foreground truncate"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {user.fullName}
                    </motion.p>
                    <motion.p
                      className="text-xs text-sidebar-foreground/60 truncate"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {user.roleName?.toLowerCase() === 'admin' ? 'مدير النظام' : 'موظف نقاط البيع'}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              <Button
                variant="ghost"
                size={isCollapsed ? "icon" : "default"}
                onClick={handleLogout}
                className="w-full text-sidebar-foreground hover:bg-gradient-to-r hover:from-red-500/15 hover:to-red-600/8 hover:text-red-400 transition-all duration-300 group relative overflow-hidden border border-transparent hover:border-red-500/20 rounded-lg backdrop-blur-sm"
              >
                {/* Enhanced logout button background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />

                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="flex items-center gap-2 relative z-10"
                >
                  <LogOut className="h-4 w-4 group-hover:rotate-12 group-hover:text-red-400 transition-all duration-300" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        className="mr-2 group-hover:text-red-400 transition-colors duration-300"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        تسجيل الخروج
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Enhanced logout button glow effect */}
                <div className="absolute inset-0 bg-red-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg rounded-lg" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Sidebar Toggle */}
        <motion.div
          className="flex justify-center pt-2 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 20px hsl(var(--sidebar-primary) / 0.25)"
            }}
            whileTap={{ scale: 0.9 }}
            className="relative"
          >
            <SidebarTrigger className="text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent/30 hover:to-sidebar-primary/10 hover:text-sidebar-primary transition-all duration-300 rounded-lg p-2 border border-transparent hover:border-sidebar-primary/20 relative overflow-hidden group backdrop-blur-sm" />

            {/* Enhanced toggle button glow effect */}
            <div className="absolute inset-0 bg-sidebar-primary/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md rounded-lg" />
          </motion.div>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
}