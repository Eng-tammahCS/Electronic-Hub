import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Receipt,
  Search,
  Download,
  Plus,
  DollarSign,
  FileText,
  Calendar
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { API_CONFIG } from "@/config/api";
import { PosInterface } from "@/components/pos/PosInterface";

// Simple interface for sales invoice
interface SalesInvoice {
  id: number;
  invoiceNumber: string;
  customerName?: string;
  invoiceDate: string;
  totalAmount: number;
  discountTotal: number;
  paymentMethod: string;
  username: string;
}

export function SalesInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPosOpen, setIsPosOpen] = useState(false);

  // Fetch sales invoices from API
  const { data: invoices, isLoading, error } = useQuery<SalesInvoice[]>({
    queryKey: ['salesInvoices'],
    queryFn: async () => {
      try {
        const response = await apiService.get<SalesInvoice[]>(API_CONFIG.ENDPOINTS.SALES_INVOICES);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to fetch sales invoices');
      } catch (error) {
        console.error('API Error:', error);
        // Return empty array as fallback
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter invoices based on search term
  const filteredInvoices = invoices?.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.customerName && invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Calculate statistics
  const totalInvoices = invoices?.length || 0;
  const totalAmount = invoices?.reduce((sum, invoice) => sum + invoice.totalAmount, 0) || 0;
  const totalDiscount = invoices?.reduce((sum, invoice) => sum + invoice.discountTotal, 0) || 0;

  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">فواتير المبيعات</h1>
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">فواتير المبيعات</h1>
            <p className="text-muted-foreground text-red-600">حدث خطأ في تحميل البيانات</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>لا يمكن تحميل فواتير المبيعات. يرجى المحاولة مرة أخرى.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">فواتير المبيعات</h1>
          <p className="text-muted-foreground">إدارة فواتير المبيعات والمبيعات</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
            تصدير إكسل
          </Button>
          <Dialog open={isPosOpen} onOpenChange={setIsPosOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                فاتورة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
              <PosInterface onClose={() => setIsPosOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              فاتورة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAmount.toLocaleString()} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي المبيعات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الخصومات</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDiscount.toLocaleString()} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              خصومات مطبقة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث برقم الفاتورة أو اسم العميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير ({filteredInvoices.length})</CardTitle>
          <CardDescription>
            جميع فواتير المبيعات مع إمكانية البحث والتصفية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الفاتورة</TableHead>
                  <TableHead className="text-right">اسم العميل</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">طريقة الدفع</TableHead>
                  <TableHead className="text-right">الموظف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      لا توجد فواتير مطابقة لمعايير البحث
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        {invoice.customerName || 'عميل غير محدد'}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.invoiceDate).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {invoice.totalAmount.toLocaleString()} ر.س
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {invoice.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.username}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}