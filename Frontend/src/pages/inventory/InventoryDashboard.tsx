import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Package, TrendingUp, AlertTriangle, DollarSign, Box, ShoppingCart } from "lucide-react";

const inventoryData = [
  { name: "هواتف ذكية", quantity: 145, minStock: 20 },
  { name: "أجهزة كمبيوتر", quantity: 32, minStock: 10 },
  { name: "سماعات", quantity: 78, minStock: 15 },
  { name: "شواحن", quantity: 203, minStock: 50 },
  { name: "كابلات", quantity: 156, minStock: 30 }
];

const categoryData = [
  { name: "هواتف", value: 35, fill: "hsl(var(--primary))" },
  { name: "كمبيوتر", value: 25, fill: "hsl(var(--secondary))" },
  { name: "إكسسوارات", value: 40, fill: "hsl(var(--accent))" }
];

const lowStockItems = [
  { name: "iPhone 15 Pro", current: 5, minimum: 10, status: "critical" },
  { name: "Samsung Galaxy S24", current: 8, minimum: 15, status: "warning" },
  { name: "MacBook Pro M3", current: 3, minimum: 5, status: "critical" }
];

export function InventoryDashboard() {
  return (
    <div className="space-y-6 animate-fade-in rtl-layout">
      {/* Header */}
      <div className="text-right">
        <h1 className="text-3xl font-bold text-foreground">لوحة تحكم المخزون</h1>
        <p className="text-muted-foreground mt-2">
          نظرة شاملة على حالة المخزون والمنتجات
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-row-reverse">
            <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">1,247</div>
            <p className="text-xs text-muted-foreground text-right">
              <span className="text-green-600">+12%</span> من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-row-reverse">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">458,950 ر.س</div>
            <p className="text-xs text-muted-foreground text-right">
              <span className="text-green-600">+8.5%</span> من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-row-reverse">
            <CardTitle className="text-sm font-medium">منتجات قليلة المخزون</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">23</div>
            <p className="text-xs text-muted-foreground text-right">
              <span className="text-red-600">تحتاج إعادة تموين</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-row-reverse">
            <CardTitle className="text-sm font-medium">منتجات نفدت</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">7</div>
            <p className="text-xs text-muted-foreground text-right">
              <span className="text-red-600">غير متوفرة</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Levels Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-right">مستويات المخزون حسب الفئة</CardTitle>
            <CardDescription className="text-right">
              كمية المنتجات المتاحة في كل فئة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-right">توزيع المنتجات حسب الفئة</CardTitle>
            <CardDescription className="text-right">
              نسبة المنتجات في كل فئة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.fill }}
                  ></div>
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right flex items-center gap-2 justify-end">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            تنبيهات المخزون المنخفض
          </CardTitle>
          <CardDescription className="text-right">
            المنتجات التي تحتاج إعادة تموين عاجل
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lowStockItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4 flex-row-reverse flex-1">
                  <div className="text-right flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      متوفر: {item.current} | الحد الأدنى: {item.minimum}
                    </p>
                  </div>
                  <div className="w-32">
                    <Progress 
                      value={(item.current / item.minimum) * 100} 
                      className={`h-2 ${item.status === 'critical' ? 'bg-red-100' : 'bg-yellow-100'}`}
                    />
                  </div>
                  <Badge 
                    variant={item.status === 'critical' ? 'destructive' : 'secondary'}
                  >
                    {item.status === 'critical' ? 'حرج' : 'تحذير'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}