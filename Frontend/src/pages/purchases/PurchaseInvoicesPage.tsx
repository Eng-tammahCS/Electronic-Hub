import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RefreshCw, Search, Plus, Eye, Edit, Trash2, FileText, Download, Loader2, X } from "lucide-react";
import { purchaseInvoiceService, PurchaseInvoice } from "@/services/purchaseInvoiceService";
import { toast } from "sonner";

// Using the interface from the service

export function PurchaseInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Load purchase invoices on component mount
  useEffect(() => {
    loadPurchaseInvoices();
  }, []);

  const loadPurchaseInvoices = async () => {
    try {
      setLoading(true);
      const response = await purchaseInvoiceService.getPurchaseInvoices();
      if (response.success && response.data) {
        setPurchases(response.data);
      } else {
        toast.error("فشل في تحميل فواتير الشراء");
      }
    } catch (error) {
      console.error("Error loading purchase invoices:", error);
      toast.error("حدث خطأ في تحميل فواتير الشراء");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadPurchaseInvoices();
      toast.success("تم تحديث البيانات بنجاح");
    } catch (error) {
      toast.error("فشل في تحديث البيانات");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
      return;
    }

    try {
      const response = await purchaseInvoiceService.deletePurchaseInvoice(id);
      if (response.success) {
        toast.success("تم حذف الفاتورة بنجاح");
        await loadPurchaseInvoices();
      } else {
        toast.error("فشل في حذف الفاتورة");
      }
    } catch (error) {
      console.error("Error deleting purchase invoice:", error);
      toast.error("حدث خطأ في حذف الفاتورة");
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const response = await purchaseInvoiceService.getPurchaseInvoiceById(id);
      if (response.success && response.data) {
        setSelectedInvoice(response.data);
        setShowDetailsDialog(true);
      } else {
        toast.error("فشل في تحميل تفاصيل الفاتورة");
      }
    } catch (error) {
      console.error("Error loading invoice details:", error);
      toast.error("حدث خطأ في تحميل تفاصيل الفاتورة");
    }
  };

  const getStatusBadge = (invoice: PurchaseInvoice) => {
    // Since the backend doesn't have status, we'll determine it based on date
    const invoiceDate = new Date(invoice.invoiceDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      return { label: "جديدة", variant: "secondary" as const };
    } else if (daysDiff <= 7) {
      return { label: "مكتملة", variant: "default" as const };
    } else {
      return { label: "قديمة", variant: "outline" as const };
    }
  };

  const filteredPurchases = purchases.filter(purchase =>
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
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : purchases.length}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-r-4 border-r-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              الفواتير المكتملة
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : purchases.filter(p => {
                const daysDiff = Math.floor((new Date().getTime() - new Date(p.invoiceDate).getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff > 1 && daysDiff <= 7;
              }).length}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              قيد المعالجة
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : purchases.filter(p => {
                const daysDiff = Math.floor((new Date().getTime() - new Date(p.invoiceDate).getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff <= 1;
              }).length}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              إجمالي المشتريات
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : purchases.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()} ر.س
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
              <Button 
                variant="outline" 
                size="icon" 
                title="تحديث" 
                className="hover:bg-accent"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">جاري التحميل...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد فواتير مطابقة للبحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => {
                  const statusInfo = getStatusBadge(purchase);
                  return (
                    <TableRow key={purchase.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end" dir="rtl">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-accent" 
                            title="عرض التفاصيل"
                            onClick={() => handleViewDetails(purchase.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" title="تحميل">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" title="تعديل">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                            title="حذف"
                            onClick={() => handleDelete(purchase.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="font-medium">
                          {purchase.details?.length || 0} صنف
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={statusInfo.variant} className="font-medium">
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {purchase.totalAmount.toLocaleString()} ر.س
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(purchase.invoiceDate).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell className="text-right font-medium">{purchase.supplierName}</TableCell>
                      <TableCell className="text-right font-medium text-blue-600">{purchase.invoiceNumber}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تفاصيل فاتورة الشراء</DialogTitle>
            <DialogDescription className="text-right">
              عرض تفاصيل فاتورة الشراء والمنتجات المشتراة
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground text-right">معلومات الفاتورة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-right">
                    <div><span className="font-medium">رقم الفاتورة:</span> {selectedInvoice.invoiceNumber}</div>
                    <div><span className="font-medium">تاريخ الفاتورة:</span> {new Date(selectedInvoice.invoiceDate).toLocaleDateString('ar-SA')}</div>
                    <div><span className="font-medium">المبلغ الإجمالي:</span> {selectedInvoice.totalAmount.toLocaleString()} ر.س</div>
                    <div><span className="font-medium">تاريخ الإنشاء:</span> {new Date(selectedInvoice.createdAt).toLocaleDateString('ar-SA')}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground text-right">معلومات المورد</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-right">
                    <div><span className="font-medium">اسم المورد:</span> {selectedInvoice.supplierName}</div>
                    <div><span className="font-medium">رقم المورد:</span> {selectedInvoice.supplierId}</div>
                    <div><span className="font-medium">الموظف المسؤول:</span> {selectedInvoice.username}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Invoice Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-right">تفاصيل المنتجات</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المجموع</TableHead>
                        <TableHead className="text-right">سعر الوحدة</TableHead>
                        <TableHead className="text-right">الكمية</TableHead>
                        <TableHead className="text-right">اسم المنتج</TableHead>
                        <TableHead className="text-right">رقم المنتج</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.details?.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-right font-medium text-green-600">
                            {detail.lineTotal.toLocaleString()} ر.س
                          </TableCell>
                          <TableCell className="text-right">
                            {detail.unitCost.toLocaleString()} ر.س
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{detail.quantity}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{detail.productName}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{detail.productId}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}