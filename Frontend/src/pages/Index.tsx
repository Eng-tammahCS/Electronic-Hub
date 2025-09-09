import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService } from "@/services/apiService";
import { API_CONFIG } from "@/config/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Eye,
  BarChart3,
  Calendar
} from "lucide-react";

// Interface for sales statistics
interface SalesStatistics {
  totalInvoices: number;
  totalSales: number;
  totalDiscounts: number;
}

// Mock data for demonstrations
const salesData = [
  { name: 'السبت', مبيعات: 12000, مشتريات: 8000 },
  { name: 'الأحد', مبيعات: 15000, مشتريات: 6000 },
  { name: 'الاثنين', مبيعات: 18000, مشتريات: 9000 },
  { name: 'الثلاثاء', مبيعات: 22000, مشتريات: 7000 },
  { name: 'الأربعاء', مبيعات: 20000, مشتريات: 8500 },
  { name: 'الخميس', مبيعات: 25000, مشتريات: 9500 },
  { name: 'الجمعة', مبيعات: 28000, مشتريات: 11000 },
];

const categoryData = [
  { name: 'لابتوبات', value: 35, color: 'hsl(var(--primary))' },
  { name: 'هواتف ذكية', value: 28, color: 'hsl(var(--secondary))' },
  { name: 'اكسسوارات', value: 20, color: 'hsl(var(--accent))' },
  { name: 'أجهزة منزلية', value: 17, color: 'hsl(var(--muted))' },
];

const monthlyTrend = [
  { month: 'يناير', revenue: 85000 },
  { month: 'فبراير', revenue: 92000 },
  { month: 'مارس', revenue: 98000 },
  { month: 'أبريل', revenue: 105000 },
  { month: 'مايو', revenue: 115000 },
  { month: 'يونيو', revenue: 128000 },
];

const Index = () => {
  const { user } = useAuth();

  // Fetch sales statistics from API
  const { data: statistics, isLoading: statisticsLoading, error: statisticsError } = useQuery<SalesStatistics>({
    queryKey: ['salesStatistics'],
    queryFn: async () => {
      try {
        const response = await apiService.get<SalesStatistics>(API_CONFIG.ENDPOINTS.SALES_STATISTICS);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to fetch statistics');
      } catch (error) {
        console.error('Failed to fetch sales statistics:', error);
        // Return default values on error
        return {
          totalInvoices: 0,
          totalSales: 0,
          totalDiscounts: 0
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const stats = [
    {
      title: "إجمالي المبيعات",
      value: statisticsLoading ? "..." : `${statistics?.totalSales?.toLocaleString() || 0} ر.س`,
      change: statisticsLoading ? "جاري التحميل..." : "من قاعدة البيانات",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "عدد الفواتير",
      value: statisticsLoading ? "..." : statistics?.totalInvoices?.toString() || "0",
      change: statisticsLoading ? "جاري التحميل..." : "فواتير مبيعات",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600"
    },
    {
      title: "إجمالي الخصومات",
      value: statisticsLoading ? "..." : `${statistics?.totalDiscounts?.toLocaleString() || 0} ر.س`,
      change: statisticsLoading ? "جاري التحميل..." : "خصومات مطبقة",
      trend: "up",
      icon: Package,
      color: "text-orange-600"
    },
    {
      title: "العملاء النشطين",
      value: "456",
      change: "+23 عميل جديد",
      trend: "up",
      icon: Users,
      color: "text-purple-600"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "sale",
      title: "فاتورة بيع جديدة",
      description: "فاتورة رقم #INV-2024-001 بمبلغ 2,450 ر.س",
      time: "منذ دقيقتين",
      icon: ShoppingCart,
      color: "text-green-600"
    },
    {
      id: 2,
      type: "inventory",
      title: "تحديث المخزون",
      description: "تم إضافة 50 جهاز iPhone 15 Pro",
      time: "منذ 5 دقائق",
      icon: Package,
      color: "text-blue-600"
    },
    {
      id: 3,
      type: "alert",
      title: "تنبيه مخزون منخفض",
      description: "لابتوب Dell XPS 13 - متبقي 3 قطع فقط",
      time: "منذ 10 دقائق",
      icon: AlertTriangle,
      color: "text-orange-600"
    },
    {
      id: 4,
      type: "user",
      title: "مستخدم جديد",
      description: "تم إنشاء حساب موظف جديد - أحمد محمد",
      time: "منذ 15 دقيقة",
      icon: Users,
      color: "text-purple-600"
    }
  ];

  const alerts = [
    {
      id: 1,
      type: "critical",
      title: "نفاد مخزون",
      description: "5 منتجات نفدت من المخزون",
      action: "عرض المنتجات"
    },
    {
      id: 2,
      type: "warning",
      title: "مخزون منخفض",
      description: "12 منتج يحتاج إعادة تموين",
      action: "إدارة المخزون"
    },
    {
      id: 3,
      type: "info",
      title: "تقرير شهري",
      description: "تقرير المبيعات الشهري جاهز",
      action: "عرض التقرير"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-8 p-6 rounded-xl glass-effect animate-scale-in">
        <div>
          <h1 className="text-3xl font-bold gradient-text animate-pulse">
            مرحباً، {user?.fullName}
          </h1>
          <p className="text-muted-foreground mt-2">
            لوحة التحكم الرئيسية - نظام إدارة متجر الإلكترونيات الذكي
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 ml-2" />
            اليوم: {new Date().toLocaleDateString('ar-SA')}
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover-lift transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {statisticsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : stat.trend === "down" ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              اتجاه المبيعات والمشتريات (آخر 7 أيام)
            </CardTitle>
            <CardDescription>
              مقارنة بين المبيعات والمشتريات اليومية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  labelStyle={{ direction: 'rtl' }}
                  formatter={(value, name) => [`${value.toLocaleString()} ر.س`, name]}
                />
                <Bar dataKey="مبيعات" fill="hsl(var(--primary))" />
                <Bar dataKey="مشتريات" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              توزيع المبيعات حسب الفئة
            </CardTitle>
            <CardDescription>
              نسبة مبيعات كل فئة من المنتجات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'النسبة']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            الاتجاه الشهري للإيرادات
          </CardTitle>
          <CardDescription>
            نمو الإيرادات على مدار آخر 6 أشهر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip 
                formatter={(value) => [`${value.toLocaleString()} ر.س`, 'الإيرادات']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activities and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              الأنشطة الأخيرة
            </CardTitle>
            <CardDescription>
              آخر الأحداث والعمليات في النظام
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <activity.icon className={`h-5 w-5 ${activity.color} mt-0.5`} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full">
              عرض جميع الأنشطة
            </Button>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              التنبيهات والإشعارات
            </CardTitle>
            <CardDescription>
              تنبيهات مهمة تحتاج إلى اهتمام
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    alert.type === 'critical' ? 'bg-red-500' :
                    alert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 ml-1" />
                  {alert.action}
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              إدارة جميع التنبيهات
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            الإجراءات السريعة
          </CardTitle>
          <CardDescription>
            الوظائف الأكثر استخداماً في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <ShoppingCart className="h-6 w-6" />
              فاتورة بيع جديدة
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Package className="h-6 w-6" />
              إضافة منتج
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              عميل جديد
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              تقرير سريع
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
