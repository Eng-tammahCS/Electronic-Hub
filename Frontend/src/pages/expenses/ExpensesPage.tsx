import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Search, Plus, Eye, Edit, Trash2, DollarSign, TrendingDown } from "lucide-react";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  receipt: string;
  approvedBy: string;
  status: 'pending' | 'approved' | 'rejected';
}

const mockExpenses: Expense[] = [
  {
    id: "1",
    description: "فاتورة كهرباء المتجر",
    amount: 850.00,
    category: "مصاريف تشغيلية",
    date: "2024-01-15",
    paymentMethod: "تحويل بنكي",
    receipt: "REC-001",
    approvedBy: "أحمد المدير",
    status: 'approved'
  },
  {
    id: "2",
    description: "رسوم صيانة أجهزة الكمبيوتر",
    amount: 1200.00,
    category: "صيانة",
    date: "2024-01-14",
    paymentMethod: "نقدي",
    receipt: "REC-002",
    approvedBy: "فاطمة المحاسبة",
    status: 'approved'
  },
  {
    id: "3",
    description: "شراء مواد تنظيف",
    amount: 180.00,
    category: "مصاريف عامة",
    date: "2024-01-13",
    paymentMethod: "بطاقة ائتمان",
    receipt: "REC-003",
    approvedBy: "",
    status: 'pending'
  }
];

export function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "قيد المراجعة", variant: "secondary" as const },
      approved: { label: "موافق عليه", variant: "default" as const },
      rejected: { label: "مرفوض", variant: "destructive" as const }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      "مصاريف تشغيلية": "bg-blue-100 text-blue-800",
      "صيانة": "bg-green-100 text-green-800",
      "مصاريف عامة": "bg-purple-100 text-purple-800"
    };
    return categoryColors[category] || "bg-gray-100 text-gray-800";
  };

  const filteredExpenses = mockExpenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in rtl-layout">
      {/* Header */}
      <div className="flex justify-between items-center" dir="rtl">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground">إدارة المصروفات</h1>
          <p className="text-muted-foreground mt-2">
            تتبع وإدارة جميع المصروفات التشغيلية للمتجر
          </p>
        </div>
        <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" dir="rtl">
          <Plus className="h-4 w-4" />
          إضافة مصروف جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" dir="rtl">
        <Card className="border-r-4 border-r-red-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              إجمالي المصروفات
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()} ر.س
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-r-4 border-r-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              المصروفات المعتمدة
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockExpenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()} ر.س
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              قيد المراجعة
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {mockExpenses.filter(exp => exp.status === 'pending').length}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              متوسط المصروف
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {Math.round(mockExpenses.reduce((sum, exp) => sum + exp.amount, 0) / mockExpenses.length).toLocaleString()} ر.س
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-center" dir="rtl">
            <CardTitle className="text-right flex items-center gap-2 justify-end">
              <TrendingDown className="h-5 w-5" />
              جميع المصروفات
            </CardTitle>
            <div className="flex items-center gap-4" dir="rtl">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث في المصروفات..."
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
                <TableHead className="text-right font-semibold">الحالة</TableHead>
                <TableHead className="text-right font-semibold">المعتمد من</TableHead>
                <TableHead className="text-right font-semibold">رقم الإيصال</TableHead>
                <TableHead className="text-right font-semibold">طريقة الدفع</TableHead>
                <TableHead className="text-right font-semibold">التاريخ</TableHead>
                <TableHead className="text-right font-semibold">الفئة</TableHead>
                <TableHead className="text-right font-semibold">المبلغ</TableHead>
                <TableHead className="text-right font-semibold">وصف المصروف</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    لا توجد مصروفات مطابقة للبحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-muted/50 transition-colors">
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
                      <Badge variant={getStatusBadge(expense.status).variant} className="font-medium">
                        {getStatusBadge(expense.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {expense.approvedBy || "غير محدد"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-medium">
                        {expense.receipt}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{expense.paymentMethod}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{expense.date}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={`${getCategoryBadge(expense.category)} font-medium`}>
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      -{expense.amount.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell className="text-right max-w-xs truncate font-medium">
                      {expense.description}
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