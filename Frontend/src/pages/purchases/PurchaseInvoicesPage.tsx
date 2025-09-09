import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Search, Plus, Eye, Edit, Trash2, FileText, Download } from "lucide-react";

interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  purchaseDate: string;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  itemsCount: number;
}

const mockPurchases: PurchaseInvoice[] = [
  {
    id: "1",
    invoiceNumber: "PUR-2024-001",
    supplierName: "مورد الإلكترونيات الذهبية",
    purchaseDate: "2024-01-15",
    totalAmount: 15750.00,
    status: 'completed',
    itemsCount: 25
  },
  {
    id: "2",
    invoiceNumber: "PUR-2024-002", 
    supplierName: "شركة التقنية المتقدمة",
    purchaseDate: "2024-01-14",
    totalAmount: 8900.00,
    status: 'pending',
    itemsCount: 12
  },
  {
    id: "3",
    invoiceNumber: "PUR-2024-003",
    supplierName: "مؤسسة الأجهزة الحديثة",
    purchaseDate: "2024-01-13",
    totalAmount: 22300.00,
    status: 'completed',
    itemsCount: 35
  }
];

export function PurchaseInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "قيد المعالجة", variant: "secondary" as const },
      completed: { label: "مكتملة", variant: "default" as const },
      cancelled: { label: "ملغية", variant: "destructive" as const }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const filteredPurchases = mockPurchases.filter(purchase =>
    purchase.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in rtl-layout">
      {/* Header */}
      <div className="flex justify-between items-center" dir="rtl">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground">فواتير الشراء</h1>
          <p className="text-muted-foreground mt-2">
            إدارة ومتابعة فواتير الشراء من الموردين
          </p>
        </div>
        <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
          <Plus className="h-4 w-4" />
          فاتورة شراء جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" dir="rtl">
        <Card className="border-r-4 border-r-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              إجمالي الفواتير
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockPurchases.length}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-r-4 border-r-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              الفواتير المكتملة
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockPurchases.filter(p => p.status === 'completed').length}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              قيد المعالجة
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockPurchases.filter(p => p.status === 'pending').length}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              إجمالي المشتريات
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockPurchases.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()} ر.س
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Purchase Invoices Table */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-center" dir="rtl">
            <CardTitle className="text-right flex items-center gap-2 justify-end">
              <FileText className="h-5 w-5" />
              جميع فواتير الشراء
            </CardTitle>
            <div className="flex items-center gap-4" dir="rtl">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث في الفواتير..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-right hover:border-primary focus:border-primary transition-colors w-64"
                />
              </div>
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
                <TableHead className="text-right font-semibold">عدد الأصناف</TableHead>
                <TableHead className="text-right font-semibold">الحالة</TableHead>
                <TableHead className="text-right font-semibold">المبلغ الإجمالي</TableHead>
                <TableHead className="text-right font-semibold">تاريخ الشراء</TableHead>
                <TableHead className="text-right font-semibold">اسم المورد</TableHead>
                <TableHead className="text-right font-semibold">رقم الفاتورة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد فواتير مطابقة للبحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end" dir="rtl">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" title="عرض التفاصيل">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" title="تحميل">
                          <Download className="h-4 w-4" />
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
                      <Badge variant="outline" className="font-medium">
                        {purchase.itemsCount} صنف
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusBadge(purchase.status).variant} className="font-medium">
                        {getStatusBadge(purchase.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {purchase.totalAmount.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{purchase.purchaseDate}</TableCell>
                    <TableCell className="text-right font-medium">{purchase.supplierName}</TableCell>
                    <TableCell className="text-right font-medium text-blue-600">{purchase.invoiceNumber}</TableCell>
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