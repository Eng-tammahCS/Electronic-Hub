import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Search, Plus, Eye, Edit, Trash2, FileText, Download, Loader2, X, MoreVertical, ArrowLeft, Save, AlertCircle, Package, Calculator } from "lucide-react";
import { usePurchaseInvoices, usePurchaseStats, useDeletePurchaseInvoice, useCreatePurchaseInvoice, useUpdatePurchaseInvoice, PurchaseInvoiceFilters } from "@/hooks/usePurchaseInvoices";
import { useQueryClient } from "@tanstack/react-query";
import { useProducts } from "@/hooks/useProducts";
import { useSuppliers } from "@/hooks/useSuppliers";
import { PurchaseInvoice } from "@/services/purchaseInvoiceService";
import { CreatePurchaseInvoiceRequest } from "@/services/purchaseInvoiceService";
import { Product } from "@/services/productService";
import { Supplier } from "@/services/supplierService";
import { toast } from "sonner";
import { PurchaseInvoicePagination } from "@/components/PurchaseInvoicePagination";
import { useDebounce } from "@/hooks/useDebounce";

// Using the interface from the service

interface InvoiceDetail {
  productId: number;
  productName: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export function PurchaseInvoicesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<PurchaseInvoice | null>(null);

  // Create invoice form state
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplierId: 0,
    invoiceDate: new Date().toISOString().split('T')[0],
  });
  
  const [details, setDetails] = useState<InvoiceDetail[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Create filters object
  const filters: PurchaseInvoiceFilters = useMemo(() => ({
    page: currentPage,
    pageSize,
    searchTerm: debouncedSearchTerm || undefined,
  }), [currentPage, pageSize, debouncedSearchTerm]);

  // Fetch data using hooks
  const { data: invoicesData, isLoading, isError, refetch } = usePurchaseInvoices(filters);
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = usePurchaseStats();
  const queryClient = useQueryClient();
  const deleteInvoiceMutation = useDeletePurchaseInvoice();
  const createInvoiceMutation = useCreatePurchaseInvoice();
  const updateInvoiceMutation = useUpdatePurchaseInvoice();

  // Hooks for create invoice modal
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();

  const products = productsData?.data || [];
  const suppliers = suppliersData?.data || [];

  // Debug logging
  // console.log("PurchaseInvoicesPage - isLoading:", isLoading);
  // console.log("PurchaseInvoicesPage - isError:", isError);

  // Generate invoice number on modal open
  useEffect(() => {
    console.log('useEffect - isCreateModalOpen:', isCreateModalOpen);
    console.log('useEffect - formData.invoiceNumber:', formData.invoiceNumber);
    
    if (isCreateModalOpen && !formData.invoiceNumber) {
      const invoiceNumber = `PI-${Date.now()}`;
      console.log('useEffect - generating invoice number:', invoiceNumber);
      setFormData(prev => ({ ...prev, invoiceNumber }));
    }
  }, [isCreateModalOpen]);

  // Reset form when modal closes
  useEffect(() => {
    console.log('useEffect - modal close - isCreateModalOpen:', isCreateModalOpen);
    
    if (!isCreateModalOpen) {
      console.log('useEffect - resetting form');
      setFormData({
        invoiceNumber: '',
        supplierId: 0,
        invoiceDate: new Date().toISOString().split('T')[0],
      });
      setDetails([]);
      setSelectedProductId(0);
      setQuantity(1);
      setUnitCost(0);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isCreateModalOpen]);

  // Reset form when edit modal closes
  useEffect(() => {
    if (!isEditModalOpen) {
      setEditingInvoice(null);
      resetForm();
    }
  }, [isEditModalOpen]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleRefresh = async () => {
    try {
      await Promise.all([refetch(), refetchStats()]);
      toast.success("تم تحديث البيانات بنجاح");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("فشل في تحديث البيانات");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
      return;
    }

    try {
      await deleteInvoiceMutation.mutateAsync(id);
      toast.success("تم حذف الفاتورة بنجاح");
      // Refresh data after deletion
      await handleRefresh();
    } catch (error) {
      console.error("Error deleting purchase invoice:", error);
      toast.error("حدث خطأ في حذف الفاتورة");
    }
  };

  const handleViewDetails = (invoice: PurchaseInvoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsDialog(true);
  };

  const handleEdit = (id: number) => {
    const invoice = purchases.find(p => p.id === id);
    if (invoice) {
      setEditingInvoice(invoice);
      setIsEditModalOpen(true);
      
      // Load invoice data into form
      setFormData({
        invoiceNumber: invoice.invoiceNumber,
        supplierId: invoice.supplierId,
        invoiceDate: new Date(invoice.invoiceDate).toISOString().split('T')[0]
      });
      
      // Load invoice details
      if (invoice.details && invoice.details.length > 0) {
        setDetails(invoice.details.map(detail => ({
          productId: detail.productId,
          productName: detail.productName || '',
          quantity: detail.quantity,
          unitCost: detail.unitCost,
          lineTotal: detail.quantity * detail.unitCost
        })));
      }
    }
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Form handling functions for create invoice modal
  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    console.log('validateForm - formData:', formData);
    console.log('validateForm - details:', details);

    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'رقم الفاتورة مطلوب';
      console.log('Validation error: invoiceNumber is empty');
    }

    if (formData.supplierId === 0) {
      newErrors.supplierId = 'يرجى اختيار مورد';
      console.log('Validation error: supplierId is 0');
    }

    if (!formData.invoiceDate) {
      newErrors.invoiceDate = 'تاريخ الفاتورة مطلوب';
      console.log('Validation error: invoiceDate is empty');
    }

    if (details.length === 0) {
      newErrors.details = 'يجب إضافة منتج واحد على الأقل';
      console.log('Validation error: no details');
    }

    console.log('validateForm - newErrors:', newErrors);
    return newErrors;
  };

  const handleRemoveProduct = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
  };

  const handleAddProduct = () => {
    console.log('handleAddProduct - selectedProductId:', selectedProductId);
    console.log('handleAddProduct - quantity:', quantity);
    console.log('handleAddProduct - unitCost:', unitCost);
    console.log('handleAddProduct - products:', products);
    
    if (selectedProductId === 0) {
      console.log('Error: No product selected');
      toast.error('يرجى اختيار منتج');
      return;
    }

    if (quantity <= 0) {
      console.log('Error: Invalid quantity');
      toast.error('الكمية يجب أن تكون أكبر من صفر');
      return;
    }

    if (unitCost <= 0) {
      console.log('Error: Invalid unit cost');
      toast.error('سعر الوحدة يجب أن يكون أكبر من صفر');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    console.log('handleAddProduct - found product:', product);
    
    if (!product) {
      console.log('Error: Product not found');
      toast.error('المنتج غير موجود');
      return;
    }

    // Check if product already exists in details
    const existingDetailIndex = details.findIndex(d => d.productId === selectedProductId);
    console.log('handleAddProduct - existingDetailIndex:', existingDetailIndex);
    
    if (existingDetailIndex >= 0) {
      // Update existing detail
      const updatedDetails = [...details];
      updatedDetails[existingDetailIndex] = {
        ...updatedDetails[existingDetailIndex],
        quantity: updatedDetails[existingDetailIndex].quantity + quantity,
        lineTotal: (updatedDetails[existingDetailIndex].quantity + quantity) * unitCost
      };
      console.log('handleAddProduct - updating existing detail:', updatedDetails[existingDetailIndex]);
      setDetails(updatedDetails);
    } else {
      // Add new detail
      const newDetail: InvoiceDetail = {
        productId: selectedProductId,
        productName: product.name,
        quantity,
        unitCost,
        lineTotal: quantity * unitCost
      };
      console.log('handleAddProduct - adding new detail:', newDetail);
      setDetails([...details, newDetail]);
    }

    // Reset form
    setSelectedProductId(0);
    setQuantity(1);
    setUnitCost(0);
    console.log('handleAddProduct - form reset');
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
  };

  const handleUpdateDetail = (index: number, field: keyof InvoiceDetail, value: number) => {
    const updatedDetails = [...details];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value,
      lineTotal: updatedDetails[index].quantity * updatedDetails[index].unitCost
    };
    setDetails(updatedDetails);
  };

  const calculateTotal = () => {
    return details.reduce((sum, detail) => sum + detail.lineTotal, 0);
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      supplierId: 0,
      invoiceDate: new Date().toISOString().split('T')[0],
    });
    setDetails([]);
    setSelectedProductId(0);
    setQuantity(1);
    setUnitCost(0);
    setErrors({});
    setIsSubmitting(false);
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingInvoice) return;
    
    console.log("=== Update Invoice Debug ===");
    console.log("Form data:", formData);
    console.log("Details:", details);
    console.log("Errors:", errors);
    
    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      const updateData = {
        invoiceNumber: formData.invoiceNumber,
        supplierId: formData.supplierId,
        invoiceDate: new Date(formData.invoiceDate).toISOString(),
        details: details.map(detail => ({
          productId: detail.productId,
          quantity: detail.quantity,
          unitCost: detail.unitCost
        }))
      };
      
      console.log("Sending update data:", updateData);
      
      const result = await updateInvoiceMutation.mutateAsync({
        id: editingInvoice.id,
        data: updateData
      });
      
      if (result.success) {
        toast.success("تم تحديث فاتورة الشراء بنجاح");
        setIsEditModalOpen(false);
        setEditingInvoice(null);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
        queryClient.invalidateQueries({ queryKey: ['purchaseStats'] });
      } else {
        throw new Error(result.message || "فشل في تحديث فاتورة الشراء");
      }
    } catch (error: any) {
      console.error("Error updating purchase invoice:", error);
      toast.error(`خطأ في تحديث فاتورة الشراء: ${error.message}`);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== Create Invoice Debug ===');
    console.log('Form data:', formData);
    console.log('Details:', details);
    console.log('Errors:', errors);
    console.log('Auth token:', localStorage.getItem('token'));
    console.log('Current user:', localStorage.getItem('user'));
    
    if (!validateForm()) {
      console.log('Form validation failed');
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    console.log('Form validation passed');
    setIsSubmitting(true);

    try {
      // Get current user ID
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Current user for invoice:', currentUser);
      
      const invoiceData: CreatePurchaseInvoiceRequest = {
        invoiceNumber: formData.invoiceNumber,
        supplierId: formData.supplierId,
        invoiceDate: new Date(formData.invoiceDate).toISOString(),
        details: details.map(detail => ({
          productId: detail.productId,
          quantity: detail.quantity,
          unitCost: detail.unitCost
        }))
      };

      console.log('Sending invoice data:', invoiceData);
      console.log('Sending invoice data JSON:', JSON.stringify(invoiceData, null, 2));
      console.log('Mutation state:', createInvoiceMutation);
      
      const result = await createInvoiceMutation.mutateAsync(invoiceData);
      console.log('Create invoice result:', result);
      
      if (!result.success) {
        console.error('Create invoice failed:', result);
        throw new Error(result.message || 'فشل في إنشاء فاتورة الشراء');
      }
      
      toast.success('تم إنشاء فاتورة الشراء بنجاح');
      // Refresh data after creation
      await handleRefresh();
      // Close modal after refresh
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating purchase invoice:', error);
      console.error('Error details:', error);
      console.error('Error response:', error?.response);
      console.error('Error message:', error?.message);
      console.error('Error status:', error?.status);
      
      // Show more specific error message
      if (error?.message) {
        toast.error(`خطأ في إنشاء فاتورة الشراء: ${error.message}`);
      } else {
        toast.error('حدث خطأ في إنشاء فاتورة الشراء');
      }
    } finally {
      setIsSubmitting(false);
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
    } else if (daysDiff <= 30) {
      return { label: "مكتملة", variant: "default" as const };
    } else {
      return { label: "قديمة", variant: "outline" as const };
    }
  };

  // Extract data from API responses
  // Handle both success and error cases
  // invoicesData.data is a PaginatedResponse object with data, totalPages, totalCount properties
  const purchases = invoicesData?.success ? (invoicesData.data?.data || []) : [];
  const totalPages = invoicesData?.success ? (invoicesData.data?.totalPages || 0) : 0;
  const totalCount = invoicesData?.success ? (invoicesData.data?.totalCount || 0) : 0;
  const stats = statsData?.success ? statsData.data : null;

  // Debug logging for stats
  console.log("PurchaseInvoicesPage - statsData:", statsData);
  console.log("PurchaseInvoicesPage - stats:", stats);
  console.log("PurchaseInvoicesPage - products:", products);
  console.log("PurchaseInvoicesPage - suppliers:", suppliers);
  console.log("PurchaseInvoicesPage - productsLoading:", productsLoading);
  console.log("PurchaseInvoicesPage - suppliersLoading:", suppliersLoading);

  // Debug logging after data extraction
  // console.log("PurchaseInvoicesPage - purchases:", purchases);
  // console.log("PurchaseInvoicesPage - totalPages:", totalPages);
  // console.log("PurchaseInvoicesPage - totalCount:", totalCount);
  // console.log("PurchaseInvoicesPage - purchases.length:", purchases.length);

  // Handle loading and error states
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">حدث خطأ في تحميل البيانات</p>
          <Button onClick={handleRefresh}>إعادة المحاولة</Button>
        </div>
      </div>
    );
  }

  // Handle API error responses
  if (invoicesData && !invoicesData.success) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">خطأ في تحميل فواتير الشراء: {invoicesData.message}</p>
          <Button onClick={handleRefresh}>إعادة المحاولة</Button>
        </div>
      </div>
    );
  }

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
        <Button 
          className="flex items-center gap-2 hover:shadow-md transition-shadow" 
          dir="rtl"
          onClick={handleCreateNew}
        >
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
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.totalInvoices || 0)}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-r-4 border-r-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              الفواتير المكتملة
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.completedInvoices || 0)}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              قيد المعالجة
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.pendingInvoices || 0)}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-r-4 border-r-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-right">
              إجمالي المشتريات
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground text-right">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.totalAmount || 0).toLocaleString('ar-SA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} ر.س
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
                disabled={isLoading || statsLoading}
              >
                <RefreshCw className={`h-4 w-4 ${(isLoading || statsLoading) ? 'animate-spin' : ''}`} />
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">جاري التحميل...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "لا توجد فواتير مطابقة للبحث" : "لا توجد فواتير شراء"}
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase) => {
                  const statusInfo = getStatusBadge(purchase);
                  return (
                    <TableRow key={purchase.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <DropdownMenu dir="rtl">
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(purchase)}>
                              <Eye className="h-4 w-4 mr-2" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(purchase.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              تحميل
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(purchase.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                        {purchase.totalAmount.toLocaleString('ar-SA', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} ر.س
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(purchase.invoiceDate).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-right font-medium">{purchase.supplierName}</TableCell>
                      <TableCell className="text-right font-medium text-blue-600">{purchase.invoiceNumber}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                عرض {((currentPage - 1) * pageSize) + 1} إلى {Math.min(currentPage * pageSize, totalCount)} من {totalCount.toLocaleString('ar-SA')} فاتورة
              </div>
              <PurchaseInvoicePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Invoice Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <Package className="h-5 w-5" />
              فاتورة شراء جديدة
            </DialogTitle>
            <DialogDescription className="text-right">
              إضافة فاتورة شراء جديدة من الموردين
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateInvoice} className="space-y-6">
            {/* Invoice Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  معلومات الفاتورة
                </CardTitle>
                <CardDescription>
                  أدخل المعلومات الأساسية للفاتورة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">رقم الفاتورة *</Label>
                    <Input
                      id="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      placeholder="رقم الفاتورة"
                      className={errors.invoiceNumber ? 'border-red-500' : ''}
                    />
                    {errors.invoiceNumber && (
                      <p className="text-sm text-red-500">{errors.invoiceNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">المورد *</Label>
                    <Select
                      value={formData.supplierId.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: parseInt(value) }))}
                    >
                      <SelectTrigger className={errors.supplierId ? 'border-red-500' : ''}>
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
                    {errors.supplierId && (
                      <p className="text-sm text-red-500">{errors.supplierId}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">تاريخ الفاتورة *</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                      className={errors.invoiceDate ? 'border-red-500' : ''}
                    />
                    {errors.invoiceDate && (
                      <p className="text-sm text-red-500">{errors.invoiceDate}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Product */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  إضافة منتج
                </CardTitle>
                <CardDescription>
                  اختر المنتج والكمية والسعر
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">المنتج</Label>
                    <Select
                      value={selectedProductId.toString()}
                      onValueChange={(value) => {
                        const productId = parseInt(value);
                        setSelectedProductId(productId);
                        const product = products.find(p => p.id === productId);
                        if (product) {
                          setUnitCost(product.defaultCostPrice);
                        }
                      }}
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

                  <div className="space-y-2">
                    <Label htmlFor="quantity">الكمية</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unitCost">سعر الوحدة</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={unitCost}
                      onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddProduct}
                      className="w-full"
                      disabled={selectedProductId === 0 || quantity <= 0 || unitCost <= 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      إضافة
                    </Button>
                  </div>
                </div>

                {products.find(p => p.id === selectedProductId) && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>المنتج المحدد:</strong> {products.find(p => p.id === selectedProductId)?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>سعر التكلفة الافتراضي:</strong> {products.find(p => p.id === selectedProductId)?.defaultCostPrice} ريال
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Details */}
            {details.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    تفاصيل الفاتورة
                  </CardTitle>
                  <CardDescription>
                    المنتجات المضافة للفاتورة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>سعر الوحدة</TableHead>
                        <TableHead>المجموع</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell>{detail.productName}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={detail.quantity}
                              onChange={(e) => handleUpdateDetail(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={detail.unitCost}
                              onChange={(e) => handleUpdateDetail(index, 'unitCost', parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {detail.lineTotal.toFixed(2)} ريال
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveDetail(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {errors.details && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.details}</AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">المجموع الكلي:</span>
                      <Badge variant="default" className="text-lg px-4 py-2">
                        {calculateTotal().toFixed(2)} ريال
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || details.length === 0}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <Edit className="h-5 w-5" />
              تعديل فاتورة الشراء
            </DialogTitle>
            <DialogDescription className="text-right">
              تعديل فاتورة شراء موجودة
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateInvoice} className="space-y-6">
            {/* Invoice Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  معلومات الفاتورة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-invoiceNumber" className="text-right">رقم الفاتورة</Label>
                    <Input
                      id="edit-invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                      className="text-right"
                      placeholder="رقم الفاتورة"
                    />
                    {errors.invoiceNumber && (
                      <p className="text-sm text-destructive text-right">{errors.invoiceNumber}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-supplier" className="text-right">المورد</Label>
                    <Select 
                      value={formData.supplierId.toString()} 
                      onValueChange={(value) => setFormData({...formData, supplierId: parseInt(value)})}
                    >
                      <SelectTrigger className="text-right">
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
                    {errors.supplierId && (
                      <p className="text-sm text-destructive text-right">{errors.supplierId}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-invoiceDate" className="text-right">تاريخ الفاتورة</Label>
                    <Input
                      id="edit-invoiceDate"
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})}
                      className="text-right"
                    />
                    {errors.invoiceDate && (
                      <p className="text-sm text-destructive text-right">{errors.invoiceDate}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  أصناف الفاتورة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Product Form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="edit-product" className="text-right">المنتج</Label>
                    <Select 
                      value={selectedProductId.toString()} 
                      onValueChange={(value) => setSelectedProductId(parseInt(value))}
                    >
                      <SelectTrigger className="text-right">
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-quantity" className="text-right">الكمية</Label>
                    <Input
                      id="edit-quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                      className="text-right"
                      placeholder="الكمية"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-unitCost" className="text-right">سعر الوحدة</Label>
                    <Input
                      id="edit-unitCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={unitCost}
                      onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                      className="text-right"
                      placeholder="سعر الوحدة"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      onClick={handleAddProduct}
                      className="w-full"
                      disabled={!selectedProductId || quantity <= 0 || unitCost <= 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      إضافة
                    </Button>
                  </div>
                </div>

                {/* Products List */}
                {details.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-6 gap-4 p-2 bg-muted/30 rounded text-sm font-medium text-right">
                      <div>الإجراءات</div>
                      <div>المنتج</div>
                      <div>الكمية</div>
                      <div>سعر الوحدة</div>
                      <div>المجموع</div>
                      <div>#</div>
                    </div>
                    {details.map((detail, index) => (
                      <div key={index} className="grid grid-cols-6 gap-4 p-2 border rounded hover:bg-muted/20">
                        <div className="flex items-center justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProduct(index)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">{detail.productName}</div>
                        <div className="text-right">{detail.quantity}</div>
                        <div className="text-right">{detail.unitCost.toFixed(2)} ر.س</div>
                        <div className="text-right font-medium text-green-600">
                          {detail.lineTotal.toFixed(2)} ر.س
                        </div>
                        <div className="text-right text-muted-foreground">{index + 1}</div>
                      </div>
                    ))}
                    
                    {/* Total */}
                    <div className="flex justify-end pt-4 border-t">
                      <div className="text-lg font-bold text-green-600">
                        المجموع: {calculateTotal().toFixed(2)} ر.س
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد أصناف في الفاتورة</p>
                    <p className="text-sm">أضف أصنافاً لإنشاء الفاتورة</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingInvoice(null);
                  resetForm();
                }}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={updateInvoiceMutation.isPending || details.length === 0}
                className="flex items-center gap-2"
              >
                {updateInvoiceMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {updateInvoiceMutation.isPending ? 'جاري التحديث...' : 'تحديث الفاتورة'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
                    <div><span className="font-medium">تاريخ الفاتورة:</span> {new Date(selectedInvoice.invoiceDate).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}</div>
                    <div><span className="font-medium">المبلغ الإجمالي:</span> {selectedInvoice.totalAmount.toLocaleString('ar-SA', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} ر.س</div>
                    <div><span className="font-medium">تاريخ الإنشاء:</span> {new Date(selectedInvoice.createdAt).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}</div>
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
                            {detail.lineTotal.toLocaleString('ar-SA', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })} ر.س
                          </TableCell>
                          <TableCell className="text-right">
                            {detail.unitCost.toLocaleString('ar-SA', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })} ر.س
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