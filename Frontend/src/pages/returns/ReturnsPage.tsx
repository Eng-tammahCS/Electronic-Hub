import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Search, Plus, Eye, Edit, Trash2, Filter, Download } from "lucide-react";

interface ReturnRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  returnDate: string;
  totalAmount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

const mockReturns: ReturnRecord[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    customerName: "أحمد محمد",
    returnDate: "2024-01-15",
    totalAmount: 250.00,
    reason: "منتج معيب",
    status: 'approved'
  },
  {
    id: "2", 
    invoiceNumber: "INV-2024-002",
    customerName: "فاطمة علي",
    returnDate: "2024-01-14",
    totalAmount: 180.00,
    reason: "مقاس غير مناسب",
    status: 'pending'
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    customerName: "سارة أحمد",
    returnDate: "2024-01-13",
    totalAmount: 320.00,
    reason: "تغيير في الطلب",
    status: 'rejected'
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    customerName: "محمد عبدالله",
    returnDate: "2024-01-12",
    totalAmount: 150.00,
    reason: "منتج غير مطابق للمواصفات",
    status: 'approved'
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-005",
    customerName: "نورا سالم",
    returnDate: "2024-01-11",
    totalAmount: 275.00,
    reason: "تلف أثناء النقل",
    status: 'pending'
  }
];

export function ReturnsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "قيد المراجعة", variant: "secondary" as const },
      approved: { label: "موافق عليه", variant: "default" as const },
      rejected: { label: "مرفوض", variant: "destructive" as const }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const filteredReturns = mockReturns.filter(returnRecord =>
    returnRecord.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnRecord.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnRecord.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in rtl-layout">
      {/* Header */}
      <div className="flex justify-between items-center" dir="rtl">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground">إدارة المرتجعات</h1>
          <p className="text-muted-foreground mt-2">
            متابعة وإدارة مرتجعات المنتجات والفواتير
          </p>
        </div>
        <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
          <Plus className="h-4 w-4" />
          مرتجع جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" dir="rtl">
        <Card className="border-r-4 border-r-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              إجمالي المرتجعات
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              127
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-r-4 border-r-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              المرتجعات المعتمدة
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              89
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              قيد المراجعة
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              23
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-red-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              المبلغ الإجمالي
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              12,450 ر.س
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Returns Table */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-center" dir="rtl">
            <CardTitle className="text-right">جميع المرتجعات</CardTitle>
            <div className="flex items-center gap-4" dir="rtl">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث في المرتجعات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-right hover:border-primary focus:border-primary transition-colors w-64"
                />
              </div>
              <Button variant="outline" size="icon" title="تصفية" className="hover:bg-accent">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="تصدير" className="hover:bg-accent">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="تحديث" className="hover:bg-accent">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table dir="rtl" className="hover:bg-muted/50">
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="text-right font-semibold">الإجراءات</TableHead>
                <TableHead className="text-right font-semibold">الحالة</TableHead>
                <TableHead className="text-right font-semibold">السبب</TableHead>
                <TableHead className="text-right font-semibold">المبلغ</TableHead>
                <TableHead className="text-right font-semibold">تاريخ المرتجع</TableHead>
                <TableHead className="text-right font-semibold">اسم العميل</TableHead>
                <TableHead className="text-right font-semibold">رقم الفاتورة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReturns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد مرتجعات مطابقة للبحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredReturns.map((returnRecord) => (
                  <TableRow key={returnRecord.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end" dir="rtl">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" title="عرض التفاصيل">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" title="تعديل">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="حذف">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusBadge(returnRecord.status).variant} className="font-medium">
                        {getStatusBadge(returnRecord.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{returnRecord.reason}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {returnRecord.totalAmount.toFixed(2)} ر.س
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{returnRecord.returnDate}</TableCell>
                    <TableCell className="text-right font-medium">{returnRecord.customerName}</TableCell>
                    <TableCell className="text-right font-medium text-blue-600">{returnRecord.invoiceNumber}</TableCell>
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