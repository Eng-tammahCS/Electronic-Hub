import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, FileText, Calendar } from "lucide-react";

const salesData = [
  { month: "يناير", sales: 45000, profit: 12000, expenses: 8000 },
  { month: "فبراير", sales: 52000, profit: 15000, expenses: 9000 },
  { month: "مارس", sales: 48000, profit: 13500, expenses: 8500 },
  { month: "أبريل", sales: 61000, profit: 18000, expenses: 10000 },
  { month: "مايو", sales: 55000, profit: 16500, expenses: 9500 },
  { month: "يونيو", sales: 67000, profit: 21000, expenses: 11000 }
];

const categoryDistribution = [
  { name: "هواتف ذكية", value: 45, fill: "hsl(var(--primary))" },
  { name: "أجهزة كمبيوتر", value: 30, fill: "hsl(var(--secondary))" },
  { name: "إكسسوارات", value: 25, fill: "hsl(var(--accent))" }
];

const topProducts = [
  { name: "iPhone 15 Pro", sales: 156, revenue: 234000 },
  { name: "Samsung Galaxy S24", sales: 134, revenue: 187600 },
  { name: "MacBook Pro M3", sales: 89, revenue: 267000 },
  { name: "iPad Air", sales: 112, revenue: 156800 }
];

export function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in rtl-layout">
      {/* Header */}
      <div className="flex justify-between items-center" dir="rtl">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground">التقارير الشاملة</h1>
          <p className="text-muted-foreground mt-2">
            تحليلات مفصلة لأداء المبيعات والأرباح والمخزون
          </p>
        </div>
        <div className="flex items-center gap-4" dir="rtl">
          <Button variant="outline" className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
            <Calendar className="h-4 w-4" />
            اختيار الفترة
          </Button>
          <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" dir="rtl">
        <Card className="border-r-4 border-r-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" dir="rtl">
            <CardTitle className="text-sm font-medium text-right">إجمالي المبيعات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">328,000 ر.س</div>
            <p className="text-xs text-muted-foreground text-right flex items-center gap-1 justify-end">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+12.5%</span> من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" dir="rtl">
            <CardTitle className="text-sm font-medium text-right">صافي الربح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">96,000 ر.س</div>
            <p className="text-xs text-muted-foreground text-right flex items-center gap-1 justify-end">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+8.2%</span> من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" dir="rtl">
            <CardTitle className="text-sm font-medium text-right">عدد الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">1,247</div>
            <p className="text-xs text-muted-foreground text-right flex items-center gap-1 justify-end">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+15.3%</span> من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" dir="rtl">
            <CardTitle className="text-sm font-medium text-right">العملاء الجدد</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">89</div>
            <p className="text-xs text-muted-foreground text-right flex items-center gap-1 justify-end">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-red-600">-2.1%</span> من الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" dir="rtl">
        {/* Sales Trend */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-right">اتجاه المبيعات والأرباح</CardTitle>
            <CardDescription className="text-right">
              مقارنة أداء المبيعات والأرباح على مدار الأشهر الستة الماضية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="المبيعات"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="الأرباح"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-right">توزيع المبيعات حسب الفئة</CardTitle>
            <CardDescription className="text-right">
              نسبة مساهمة كل فئة في إجمالي المبيعات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" dir="rtl">
        {/* Monthly Performance */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-right">الأداء الشهري المقارن</CardTitle>
            <CardDescription className="text-right">
              مقارنة المبيعات والمصروفات والأرباح
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="hsl(var(--primary))" name="المبيعات" />
                <Bar dataKey="profit" fill="hsl(var(--secondary))" name="الأرباح" />
                <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="المصروفات" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2 justify-end">
              <Package className="h-5 w-5" />
              أفضل المنتجات مبيعاً
            </CardTitle>
            <CardDescription className="text-right">
              المنتجات الأكثر مبيعاً وإيراداً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1" dir="rtl">
                    <div className="text-right flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <div className="flex items-center gap-4 mt-1 justify-end">
                        <Badge variant="outline" className="font-medium">
                          {product.sales} مبيعة
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {product.revenue.toLocaleString()} ر.س
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 font-medium">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Actions */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-right flex items-center gap-2 justify-end">
            <FileText className="h-5 w-5" />
            تصدير التقارير
          </CardTitle>
          <CardDescription className="text-right">
            تصدير التقارير بصيغ مختلفة للمراجعة والأرشفة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 justify-end flex-wrap" dir="rtl">
            <Button variant="outline" className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
              <Download className="h-4 w-4" />
              تقرير المبيعات PDF
            </Button>
            <Button variant="outline" className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
              <Download className="h-4 w-4" />
              تقرير الأرباح Excel
            </Button>
            <Button variant="outline" className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
              <Download className="h-4 w-4" />
              تقرير المخزون CSV
            </Button>
            <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
              <Download className="h-4 w-4" />
              التقرير الشامل
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}