import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Receipt,
  Search,
  Download,
  Plus,
  DollarSign,
  FileText,
  Calendar,
  Eye,
  RotateCcw,
  Printer,
  X
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { API_CONFIG } from "@/config/api";
import { PosInterface } from "@/components/pos/PosInterface";
import { salesInvoiceService, SalesInvoice } from "@/services/salesInvoiceService";
import { toast } from "sonner";

export function SalesInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPosOpen, setIsPosOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [loadingInvoiceDetails, setLoadingInvoiceDetails] = useState(false);
  const queryClient = useQueryClient();

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

  // Handle preview invoice
  const handlePreviewInvoice = async (id: number) => {
    try {
      setLoadingInvoiceDetails(true);
      const response = await salesInvoiceService.getSalesInvoiceById(id);
      if (response.success && response.data) {
        // Ensure data is properly formatted
        const invoiceData = {
          ...response.data,
          details: response.data.details || []
        };
        setSelectedInvoice(invoiceData);
        setShowPreviewDialog(true);
      } else {
        toast.error("فشل في تحميل تفاصيل الفاتورة");
      }
    } catch (error) {
      console.error("Error loading invoice details:", error);
      toast.error("حدث خطأ في تحميل تفاصيل الفاتورة");
    } finally {
      setLoadingInvoiceDetails(false);
    }
  };

  // Handle return invoice - show dialog
  const handleReturnInvoice = async (id: number) => {
    toast.info("ميزة إرجاع الفواتير ستكون متاحة قريباً");
  };

  // Handle confirm return invoice
  const handleConfirmReturnInvoice = async () => {
    toast.info("ميزة إرجاع الفواتير ستكون متاحة قريباً");
  };

  // Handle print invoice
  const handlePrintInvoice = () => {
    if (selectedInvoice) {
      window.print();
    }
  };

  // Get payment method text
  const getPaymentMethodText = (paymentMethod: string | number) => {
    const method = typeof paymentMethod === 'number' ? paymentMethod.toString() : paymentMethod;
    switch (method) {
      case '0':
      case 'Cash': return 'نقدي';
      case '1':
      case 'Card': return 'بطاقة ائتمان';
      case '2':
      case 'Deferred': return 'آجل';
      default: return method;
    }
  };

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
                  <TableHead className="text-right">الإجراءات</TableHead>
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
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      لا توجد فواتير مطابقة لمعايير البحث
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end" dir="rtl">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600" 
                            title="معاينة الفاتورة"
                            onClick={() => handlePreviewInvoice(invoice.id)}
                            disabled={loadingInvoiceDetails}
                          >
                            {loadingInvoiceDetails ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-orange-100 hover:text-orange-600" 
                            title="إرجاع الفاتورة"
                            onClick={() => handleReturnInvoice(invoice.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
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
                          {getPaymentMethodText(invoice.paymentMethod.toString())}
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

      {/* Invoice Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-right">معاينة فاتورة المبيعات</DialogTitle>
                <DialogDescription className="text-right">
                  عرض تفاصيل الفاتورة مع إمكانية الطباعة
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrintInvoice}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  طباعة
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowPreviewDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6 print:space-y-4">
              {/* Invoice Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border print:bg-white print:border-gray-300">
                <div className="flex justify-between items-start">
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">فاتورة مبيعات</h2>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">رقم الفاتورة:</span> {selectedInvoice.invoiceNumber || 'غير محدد'}</p>
                      <p><span className="font-medium">تاريخ الفاتورة:</span> {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString('ar-SA') : 'غير محدد'}</p>
                      <p><span className="font-medium">تاريخ الإنشاء:</span> {selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="bg-white p-4 rounded-lg shadow-sm border print:shadow-none">
                      <h3 className="font-bold text-lg mb-2">متجر الإلكترونيات</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>الرياض، المملكة العربية السعودية</p>
                        <p>هاتف: +966 11 123 4567</p>
                        <p>البريد الإلكتروني: info@electronics-store.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer and Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground text-right">معلومات العميل</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-right">
                    <div><span className="font-medium">اسم العميل:</span> {selectedInvoice.customerName || 'عميل غير محدد'}</div>
                    <div><span className="font-medium">طريقة الدفع:</span> {getPaymentMethodText(selectedInvoice.paymentMethod.toString())}</div>
                    <div><span className="font-medium">الموظف المسؤول:</span> {selectedInvoice.username}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground text-right">ملخص الفاتورة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-right">
                    <div className="flex justify-between">
                      <span>عدد الأصناف:</span>
                      <span className="font-medium">{selectedInvoice.details?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>إجمالي الخصم:</span>
                      <span className="font-medium text-red-600">{typeof selectedInvoice.discountTotal === 'number' ? selectedInvoice.discountTotal.toLocaleString() : '0'} ر.س</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>المبلغ الإجمالي:</span>
                      <span className="text-green-600">{typeof selectedInvoice.totalAmount === 'number' ? selectedInvoice.totalAmount.toLocaleString() : '0'} ر.س</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Invoice Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-right">تفاصيل المنتجات</CardTitle>
                  <CardDescription className="text-right">
                    {selectedInvoice.details?.length || 0} منتج في هذه الفاتورة
                    {selectedInvoice.details && selectedInvoice.details.length === 0 && (
                      <span className="text-orange-600 block mt-1">
                        ⚠️ لا توجد تفاصيل منتجات في هذه الفاتورة
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedInvoice.details && selectedInvoice.details.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table dir="rtl">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">المجموع</TableHead>
                            <TableHead className="text-right">الخصم</TableHead>
                            <TableHead className="text-right">سعر الوحدة</TableHead>
                            <TableHead className="text-right">الكمية</TableHead>
                            <TableHead className="text-right">اسم المنتج</TableHead>
                            <TableHead className="text-right">رقم المنتج</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedInvoice.details.map((detail, index) => (
                            <TableRow key={detail.id || index}>
                              <TableCell className="text-right font-medium text-green-600">
                                {typeof detail.lineTotal === 'number' ? detail.lineTotal.toLocaleString() : '0'} ر.س
                              </TableCell>
                              <TableCell className="text-right text-red-600">
                                {typeof detail.discountAmount === 'number' ? detail.discountAmount.toLocaleString() : '0'} ر.س
                              </TableCell>
                              <TableCell className="text-right">
                                {typeof detail.unitPrice === 'number' ? detail.unitPrice.toLocaleString() : '0'} ر.س
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant="outline">{detail.quantity || 0}</Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">{detail.productName || 'غير محدد'}</TableCell>
                              <TableCell className="text-right text-muted-foreground">{detail.productId || 'غير محدد'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-4">
                        <FileText className="h-12 w-12 text-gray-300" />
                        <div>
                          <p className="text-lg font-medium">لا توجد منتجات في هذه الفاتورة</p>
                          <p className="text-sm">قد تكون الفاتورة فارغة أو لم يتم تحميل التفاصيل</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => selectedInvoice && handlePreviewInvoice(selectedInvoice.id)}
                          className="flex items-center gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          إعادة تحميل التفاصيل
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Footer */}
              <div className="text-center text-sm text-gray-500 border-t pt-4">
                <p>شكراً لاختياركم متجر الإلكترونيات</p>
                <p>هذه الفاتورة صالحة للطباعة والمراجعة</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Return Invoice Dialog - Temporarily disabled */}
      {/* Dialog will be re-enabled after database migration */}
    </div>
  );
}