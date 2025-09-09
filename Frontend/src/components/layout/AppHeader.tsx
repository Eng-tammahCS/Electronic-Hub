import { Bell, Moon, Sun, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  const { theme, setTheme } = useTheme();

  const notifications = [
    {
      id: 1,
      title: "مخزون منخفض",
      description: "5 منتجات تحتاج إلى إعادة تموين",
      time: "منذ دقيقتين",
      type: "warning"
    },
    {
      id: 2,
      title: "فاتورة جديدة",
      description: "تم إنشاء فاتورة بيع جديدة #1234",
      time: "منذ 5 دقائق",
      type: "info"
    },
    {
      id: 3,
      title: "نفاد مخزون",
      description: "لابتوب Dell نفد من المخزون",
      time: "منذ 10 دقائق",
      type: "error"
    }
  ];

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6 sticky top-0 z-40 backdrop-blur-sm rtl-layout" dir="rtl">
      {/* Right side - Sidebar trigger and search (RTL: appears on right) */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-foreground hover:bg-accent" />
        
        <div className="relative hidden md:block">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="البحث في النظام..."
            className="w-64 pr-10 bg-muted/50 border-border text-right"
          />
        </div>
      </div>

      {/* Left side - Actions (RTL: appears on left) */}
      <div className="flex items-center gap-3">
        {/* Search for mobile */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 p-0 bg-popover border border-border z-50">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-foreground">الإشعارات</h3>
              <Badge variant="secondary" className="text-xs">
                3 جديد
              </Badge>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start p-4 border-b last:border-b-0 cursor-pointer"
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-foreground">
                          {notification.title}
                        </h4>
                        <Badge
                          variant={
                            notification.type === 'warning' ? 'secondary' :
                            notification.type === 'error' ? 'destructive' : 'default'
                          }
                          className="text-xs"
                        >
                          {notification.type === 'warning' ? 'تحذير' :
                           notification.type === 'error' ? 'خطر' : 'معلومات'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <div className="p-2 border-t">
              <Button variant="ghost" className="w-full text-sm">
                عرض جميع الإشعارات
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">تبديل الوضع</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover border border-border z-50">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="ml-2 h-4 w-4" />
              <span>الوضع الفاتح</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="ml-2 h-4 w-4" />
              <span>الوضع الداكن</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <span className="ml-2">⚙️</span>
              <span>حسب النظام</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}