import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search, Download, Shield, Eye, Filter } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  user: string;
  entity: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning';
  details: string;
}

const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    action: "تسجيل دخول",
    user: "أحمد محمد السالم",
    entity: "المستخدمين",
    entityId: "USER-001",
    timestamp: "2024-01-15 14:30:25",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome/120.0",
    status: 'success',
    details: "تسجيل دخول ناجح للنظام"
  },
  {
    id: "2",
    action: "إنشاء فاتورة",
    user: "فاطمة علي أحمد",
    entity: "فواتير المبيعات",
    entityId: "INV-2024-001",
    timestamp: "2024-01-15 14:25:10",
    ipAddress: "192.168.1.105",
    userAgent: "Firefox/121.0",
    status: 'success',
    details: "إنشاء فاتورة مبيعات جديدة بقيمة 1,250 ر.س"
  },
  {
    id: "3",
    action: "محاولة تسجيل دخول",
    user: "مجهول",
    entity: "المستخدمين",
    entityId: "UNKNOWN",
    timestamp: "2024-01-15 14:20:15",
    ipAddress: "203.0.113.1",
    userAgent: "Chrome/120.0",
    status: 'failed',
    details: "محاولة تسجيل دخول بكلمة مرور خاطئة"
  },
  {
    id: "4",
    action: "تعديل منتج",
    user: "أحمد محمد السالم",
    entity: "المنتجات",
    entityId: "PROD-001",
    timestamp: "2024-01-15 14:15:30",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome/120.0",
    status: 'success',
    details: "تحديث سعر المنتج iPhone 15 Pro"
  },
  {
    id: "5",
    action: "حذف مستخدم",
    user: "أحمد محمد السالم",
    entity: "المستخدمين",
    entityId: "USER-007",
    timestamp: "2024-01-15 14:10:45",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome/120.0",
    status: 'warning',
    details: "حذف حساب مستخدم محمد الأحمد"
  }
];

export function AuditPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { label: "نجح", variant: "default" as const },
      failed: { label: "فشل", variant: "destructive" as const },
      warning: { label: "تحذير", variant: "secondary" as const }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.success;
  };

  const getActionColor = (action: string) => {
    const actionColors: { [key: string]: string } = {
      "تسجيل دخول": "bg-blue-100 text-blue-800",
      "إنشاء فاتورة": "bg-green-100 text-green-800",
      "تعديل منتج": "bg-yellow-100 text-yellow-800",
      "حذف مستخدم": "bg-red-100 text-red-800",
      "محاولة تسجيل دخول": "bg-orange-100 text-orange-800"
    };
    return actionColors[action] || "bg-gray-100 text-gray-800";
  };

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    
    return matchesSearch && matchesStatus && matchesAction;
  });

  const uniqueActions = [...new Set(mockAuditLogs.map(log => log.action))];

  return (
    <div className="space-y-6 animate-fade-in rtl-layout" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center" dir="rtl">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 justify-end">
            <Shield className="h-8 w-8" />
            سجل التدقيق
          </h1>
          <p className="text-muted-foreground mt-2">
            متابعة جميع العمليات والأنشطة في النظام
          </p>
        </div>
        <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
          <Download className="h-4 w-4" />
          تصدير السجل
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" dir="rtl">
        <Card className="border-r-4 border-r-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              إجمالي العمليات
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockAuditLogs.length}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-r-4 border-r-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              العمليات الناجحة
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockAuditLogs.filter(log => log.status === 'success').length}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-red-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              العمليات الفاشلة
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockAuditLogs.filter(log => log.status === 'failed').length}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              التحذيرات
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockAuditLogs.filter(log => log.status === 'warning').length}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-right">البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" dir="rtl">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث في السجلات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right hover:border-primary focus:border-primary transition-colors"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-right">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="success">نجح</SelectItem>
                <SelectItem value="failed">فشل</SelectItem>
                <SelectItem value="warning">تحذير</SelectItem>
              </SelectContent>
            </Select>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="text-right">
                <SelectValue placeholder="نوع العملية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العمليات</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
              <Filter className="h-4 w-4" />
              فلترة متقدمة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-center" dir="rtl">
            <CardTitle className="text-right">سجل العمليات</CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="font-medium">
                {filteredLogs.length} من {mockAuditLogs.length} عملية
              </Badge>
              <Button variant="outline" size="icon" className="hover:bg-accent" title="تحديث">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table dir="rtl">
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="text-right font-semibold">التفاصيل</TableHead>
                <TableHead className="text-right font-semibold">الحالة</TableHead>
                <TableHead className="text-right font-semibold">عنوان IP</TableHead>
                <TableHead className="text-right font-semibold">الوقت والتاريخ</TableHead>
                <TableHead className="text-right font-semibold">الكيان المتأثر</TableHead>
                <TableHead className="text-right font-semibold">المستخدم</TableHead>
                <TableHead className="text-right font-semibold">العملية</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد سجلات مطابقة للبحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="max-w-xs text-right">
                      <div className="flex items-center gap-2 justify-end" dir="rtl">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" title="عرض التفاصيل">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <span className="truncate">{log.details}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusBadge(log.status).variant} className="font-medium">
                        {getStatusBadge(log.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {log.ipAddress}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div>{log.timestamp.split(' ')[0]}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.timestamp.split(' ')[1]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="font-medium text-blue-600">{log.entity}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.entityId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-blue-600">{log.user}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={`${getActionColor(log.action)} font-medium`}>
                        {log.action}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}