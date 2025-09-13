import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search, Plus, Eye, Edit, Trash2, FileText, Download, Loader2, X, Calendar, Building, DollarSign, TrendingUp, Users, Package } from "lucide-react";
import { purchaseInvoiceService, PurchaseInvoice, CreatePurchaseInvoiceRequest, PurchaseInvoiceDetail } from "@/services/purchaseInvoiceService";
import { supplierService } from "@/services/supplierService";
import { productService } from "@/services/productService";

export default function PurchaseInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [formData, setFormData] = useState<CreatePurchaseInvoiceRequest>({
    invoiceNumber: "",
    supplierId: 0,
    invoiceDate: new Date().toISOString().split('T')[0],
    details: []
  });

  const queryClient = useQueryClient();

  // Fetch purchase invoices
  const { data: invoices = [], isLoading, error, refetch } = useQuery({
    queryKey: ['purchaseInvoices'],
    queryFn: async () => {
      const response = await purchaseInvoiceService.getPurchaseInvoices();
      if (!response.success) {
        throw new Error(response.error || 'خطأ في تحميل فواتير الشراء');
      }
      return response.data;
    },
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['purchaseStatistics'],
    queryFn: async () => {
      const response = await purchaseInvoiceService.getPurchaseStatistics();
      if (!response.success) {
        throw new Error(response.error || 'خطأ في تحميل الإحصائيات');
      }
      return response.data;
    },
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await supplierService.getSuppliers();
      if (!response.success) {
        throw new Error(response.error || 'خطأ في تحميل الموردين');
      }
      return response.data;
    },
    retry: 3,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productService.getProducts();
      if (!response.success) {
        throw new Error(response.error || 'خطأ في تحميل المنتجات');
      }
      return response.data;
    },
    retry: 3,
    staleTime: 10 * 60 * 1000,
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: CreatePurchaseInvoiceRequest) => {
      const response = await purchaseInvoiceService.createPurchaseInvoice(invoiceData);
      if (!response.success) {
        throw new Error(response.error || 'خطأ في إنشاء فاتورة الشراء');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("تم إنشاء فاتورة الشراء بنجاح");
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseStatistics'] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "خطأ في إنشاء فاتورة الشراء");
    }
  });

  // Update invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreatePurchaseInvoiceRequest> }) => {
      const response = await purchaseInvoiceService.updatePurchaseInvoice(id, data);
      if (!response.success) {
        throw new Error(response.error || 'خطأ في تحديث فاتورة الشراء');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("تم تحديث فاتورة الشراء بنجاح");
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseStatistics'] });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "خطأ في تحديث فاتورة الشراء");
    }
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await purchaseInvoiceService.deletePurchaseInvoice(id);
      if (!response.success) {
        throw new Error(response.error || 'خطأ في حذف فاتورة الشراء');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("تم حذف فاتورة الشراء بنجاح");
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseStatistics'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "خطأ في حذف فاتورة الشراء");
    }
  });

  // Filter invoices based on search and filters
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSupplier = !supplierFilter || supplierFilter === 'all' || invoice.supplierId.toString() === supplierFilter;
    
    const matchesDate = !dateFilter || dateFilter === 'all' || {
      'today': new Date(invoice.invoiceDate).toDateString() === new Date().toDateString(),
      'week': (new Date().getTime() - new Date(invoice.invoiceDate).getTime()) <= 7 * 24 * 60 * 60 * 1000,
      'month': new Date(invoice.invoiceDate).getMonth() === new Date().getMonth() && 
               new Date(invoice.invoiceDate).getFullYear() === new Date().getFullYear()
    }[dateFilter] || false;

    return matchesSearch && matchesSupplier && matchesDate;
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      invoiceNumber: "",
      supplierId: 0,
      invoiceDate: new Date().toISOString().split('T')[0],
      details: []
    });
    setSelectedInvoice(null);
  };

  // Handle create invoice
  const handleCreateInvoice = () => {
    if (!formData.invoiceNumber.trim()) {
      toast.error("رقم الفاتورة مطلوب");
      return;
    }
    if (!formData.supplierId) {
      toast.error("اختيار المورد مطلوب");
      return;
    }
    if (formData.details.length === 0) {
      toast.error("يجب إضافة منتج واحد على الأقل");
      return;
    }

    createInvoiceMutation.mutate(formData);
  };

  // Handle edit invoice
  const handleEditInvoice = () => {
    if (!selectedInvoice || !formData.invoiceNumber.trim()) {
      toast.error("رقم الفاتورة مطلوب");
      return;
    }
    if (!formData.supplierId) {
      toast.error("اختيار المورد مطلوب");
      return;
    }
    if (formData.details.length === 0) {
      toast.error("يجب إضافة منتج واحد على الأقل");
      return;
    }

    updateInvoiceMutation.mutate({
      id: selectedInvoice.id,
      data: formData
    });
  };

  // Handle delete invoice
  const handleDeleteInvoice = (invoice: PurchaseInvoice) => {
    deleteInvoiceMutation.mutate(invoice.id);
  };

  // Handle view invoice
  const handleViewInvoice = (invoice: PurchaseInvoice) => {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  // Handle edit invoice click
  const handleEditInvoiceClick = (invoice: PurchaseInvoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      invoiceNumber: invoice.invoiceNumber,
      supplierId: invoice.supplierId,
      invoiceDate: invoice.invoiceDate.split('T')[0],
      details: invoice.details.map(detail => ({
        productId: detail.productId,
        quantity: detail.quantity,
        unitCost: detail.unitCost
      }))
    });
    setIsEditDialogOpen(true);
  };

  // Add product to invoice
  const addProductToInvoice = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { productId: 0, quantity: 1, unitCost: 0 }]
    });
  };

  // Remove product from invoice
  const removeProductFromInvoice = (index: number) => {
    setFormData({
      ...formData,
      details: formData.details.filter((_, i) => i !== index)
    });
  };

  // Update product in invoice
  const updateProductInInvoice = (index: number, field: string, value: any) => {
    const newDetails = [...formData.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setFormData({ ...formData, details: newDetails });
  };

  // Calculate total amount
  const calculateTotalAmount = () => {
    return formData.details.reduce((total, detail) => {
      return total + (detail.quantity * detail.unitCost);
    }, 0);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <FileText className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">خطأ في تحميل فواتير الشراء</h3>
              <p className="text-gray-600 mb-4">{(error as Error).message}</p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                إعادة المحاولة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة فواتير الشراء</h1>
          <p className="text-gray-600">إدارة فواتير الشراء والمشتريات</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          فاتورة شراء جديدة
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">فاتورة شراء</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الفواتير المكتملة</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.completedInvoices}</div>
              <p className="text-xs text-muted-foreground">فاتورة مكتملة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد المعالجة</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.pendingInvoices}</div>
              <p className="text-xs text-muted-foreground">فاتورة قيد المعالجة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(statistics.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">ريال سعودي</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في فواتير الشراء..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="فلتر المورد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الموردين</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="فلتر التاريخ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التواريخ</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>جاري تحميل فواتير الشراء...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>اسم المورد</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المبلغ الإجمالي</TableHead>
                  <TableHead>اسم المستخدم</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4" />
                        <p>لا توجد فواتير شراء</p>
                        {searchTerm && <p className="text-sm">لم يتم العثور على فواتير مطابقة للبحث</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>{invoice.invoiceNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span>{invoice.supplierName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(invoice.invoiceDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold">{formatCurrency(invoice.totalAmount)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{invoice.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditInvoiceClick(invoice)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="تحميل"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف فاتورة الشراء "{invoice.invoiceNumber}"؟ 
                                  <br />
                                  <span className="text-red-600 font-semibold">هذا الإجراء لا يمكن التراجع عنه.</span>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteInvoice(invoice)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleteInvoiceMutation.isPending}
                                >
                                  {deleteInvoiceMutation.isPending ? "جاري الحذف..." : "حذف"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إنشاء فاتورة شراء جديدة</DialogTitle>
            <DialogDescription>
              أدخل معلومات فاتورة الشراء الجديدة
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="invoiceNumber" className="text-right">
                  رقم الفاتورة *
                </Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="col-span-3"
                  placeholder="أدخل رقم الفاتورة"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplier" className="text-right">
                  المورد *
                </Label>
                <Select value={formData.supplierId > 0 ? formData.supplierId.toString() : ""} onValueChange={(value) => setFormData({ ...formData, supplierId: parseInt(value) })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoiceDate" className="text-right">
                تاريخ الفاتورة
              </Label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="col-span-3"
              />
            </div>

            {/* Products Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">تفاصيل المنتجات</Label>
                <Button type="button" onClick={addProductToInvoice} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة منتج
                </Button>
              </div>

              {formData.details.map((detail, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-4 border rounded-lg">
                  <div className="col-span-4">
                    <Select 
                      value={detail.productId > 0 ? detail.productId.toString() : ""} 
                      onValueChange={(value) => updateProductInInvoice(index, 'productId', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="الكمية"
                      value={detail.quantity}
                      onChange={(e) => updateProductInInvoice(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="سعر الوحدة"
                      value={detail.unitCost}
                      onChange={(e) => updateProductInInvoice(index, 'unitCost', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={formatCurrency(detail.quantity * detail.unitCost)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeProductFromInvoice(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {formData.details.length > 0 && (
                <div className="flex justify-end">
                  <div className="text-lg font-semibold">
                    المجموع الإجمالي: {formatCurrency(calculateTotalAmount())}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleCreateInvoice}
              disabled={createInvoiceMutation.isPending}
            >
              {createInvoiceMutation.isPending ? "جاري الإنشاء..." : "إنشاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل فاتورة الشراء</DialogTitle>
            <DialogDescription>
              تعديل معلومات فاتورة الشراء
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-invoiceNumber" className="text-right">
                  رقم الفاتورة *
                </Label>
                <Input
                  id="edit-invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="col-span-3"
                  placeholder="أدخل رقم الفاتورة"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-supplier" className="text-right">
                  المورد *
                </Label>
                <Select value={formData.supplierId > 0 ? formData.supplierId.toString() : ""} onValueChange={(value) => setFormData({ ...formData, supplierId: parseInt(value) })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-invoiceDate" className="text-right">
                تاريخ الفاتورة
              </Label>
              <Input
                id="edit-invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="col-span-3"
              />
            </div>

            {/* Products Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">تفاصيل المنتجات</Label>
                <Button type="button" onClick={addProductToInvoice} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة منتج
                </Button>
              </div>

              {formData.details.map((detail, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-4 border rounded-lg">
                  <div className="col-span-4">
                    <Select 
                      value={detail.productId > 0 ? detail.productId.toString() : ""} 
                      onValueChange={(value) => updateProductInInvoice(index, 'productId', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="الكمية"
                      value={detail.quantity}
                      onChange={(e) => updateProductInInvoice(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="سعر الوحدة"
                      value={detail.unitCost}
                      onChange={(e) => updateProductInInvoice(index, 'unitCost', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={formatCurrency(detail.quantity * detail.unitCost)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeProductFromInvoice(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {formData.details.length > 0 && (
                <div className="flex justify-end">
                  <div className="text-lg font-semibold">
                    المجموع الإجمالي: {formatCurrency(calculateTotalAmount())}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleEditInvoice}
              disabled={updateInvoiceMutation.isPending}
            >
              {updateInvoiceMutation.isPending ? "جاري التحديث..." : "تحديث"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>تفاصيل فاتورة الشراء</DialogTitle>
            <DialogDescription>
              عرض معلومات فاتورة الشراء
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">رقم الفاتورة</Label>
                  <p>{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <Label className="font-semibold">اسم المورد</Label>
                  <p>{selectedInvoice.supplierName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">تاريخ الفاتورة</Label>
                  <p>{formatDate(selectedInvoice.invoiceDate)}</p>
                </div>
                <div>
                  <Label className="font-semibold">المبلغ الإجمالي</Label>
                  <p className="font-semibold text-lg">{formatCurrency(selectedInvoice.totalAmount)}</p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">اسم المستخدم</Label>
                <p>{selectedInvoice.username}</p>
              </div>

              {/* Invoice Details */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">تفاصيل المنتجات</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم المنتج</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>سعر الوحدة</TableHead>
                      <TableHead>المجموع</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.details.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>{detail.productName}</TableCell>
                        <TableCell>{detail.quantity}</TableCell>
                        <TableCell>{formatCurrency(detail.unitCost)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(detail.lineTotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}