import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Download,
  Upload,
  Barcode,
  Loader2,
  AlertCircle,
  DollarSign,
  Tag,
  Truck,
  Info,
  FileText,
  X,
  Save,
  RotateCcw
} from "lucide-react";
import { useProducts, useCreateProduct, useDeleteProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useAuth } from "@/contexts/AuthContext";
import { Product, CreateProductRequest } from "@/services/productService";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PDFExportDialog } from "@/components/PDFExportDialog";

export function ProductsPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // State for filters and UI
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<CreateProductRequest>>({
    defaultCostPrice: 0,
    defaultSellingPrice: 0,
    minSellingPrice: 0
  });
  const [editProduct, setEditProduct] = useState<Partial<CreateProductRequest>>({
    defaultCostPrice: 0,
    defaultSellingPrice: 0,
    minSellingPrice: 0
  });

  // API hooks
  const { 
    data: productsResponse, 
    isLoading: isLoadingProducts, 
    error: productsError,
    refetch: refetchProducts 
  } = useProducts({
    searchTerm: searchTerm || undefined,
    categoryId: categoryFilter !== 'all' ? parseInt(categoryFilter) : undefined,
    supplierId: supplierFilter !== 'all' ? parseInt(supplierFilter) : undefined,
    page: 1,
    pageSize: 100
  });

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Categories and Suppliers data
  const { data: categoriesResponse } = useCategories();
  const { data: suppliersResponse } = useSuppliers();
  const categories = categoriesResponse?.data || [];
  const suppliers = suppliersResponse?.data || [];

  // Extract products from response
  const products = productsResponse?.data || [];
  const isLoading = isLoadingProducts || createProductMutation.isPending || updateProductMutation.isPending || deleteProductMutation.isPending;

  // Filter products based on stock status
  const filteredProducts = products.filter(product => {
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = product.currentQuantity <= 5 && product.currentQuantity > 0;
    } else if (stockFilter === 'out') {
      matchesStock = product.currentQuantity === 0;
    } else if (stockFilter === 'normal') {
      matchesStock = product.currentQuantity > 5;
    }
    return matchesStock;
  });

  // Get stock status
  const getStockStatus = (product: Product) => {
    if (product.currentQuantity === 0) {
      return { variant: 'destructive' as const, text: 'نفد' };
    } else if (product.currentQuantity <= 5) {
      return { variant: 'secondary' as const, text: 'منخفض' };
    } else {
      return { variant: 'default' as const, text: 'متوفر' };
    }
  };

  // Add new product
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.defaultSellingPrice || !newProduct.categoryId) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة (الاسم، سعر البيع، الفئة)",
        variant: "destructive"
      });
      return;
    }

    try {
      await createProductMutation.mutateAsync(newProduct as CreateProductRequest);
      setNewProduct({
        defaultCostPrice: 0,
        defaultSellingPrice: 0,
        minSellingPrice: 0
      });
      setIsAddDialogOpen(false);
      
      toast({
        title: "تم إضافة المنتج",
        description: `تم إضافة "${newProduct.name}" بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ في إضافة المنتج",
        description: "حدث خطأ أثناء إضافة المنتج",
        variant: "destructive"
      });
    }
  };

  // Edit product
  const handleEditProduct = async () => {
    if (!editProduct.name || !editProduct.defaultSellingPrice || !editProduct.categoryId || !selectedProduct) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة (الاسم، سعر البيع، الفئة)",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateProductMutation.mutateAsync({
        id: selectedProduct.id,
        data: editProduct
      });
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      
      toast({
        title: "تم تحديث المنتج",
        description: `تم تحديث "${editProduct.name}" بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ في تحديث المنتج",
        description: "حدث خطأ أثناء تحديث المنتج",
        variant: "destructive"
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditProduct({
      name: product.name,
      barcode: product.barcode,
      description: product.description,
      defaultCostPrice: product.defaultCostPrice,
      defaultSellingPrice: product.defaultSellingPrice,
      minSellingPrice: product.minSellingPrice,
      categoryId: product.categoryId,
      supplierId: product.supplierId
    });
    setIsEditDialogOpen(true);
  };

  // Reset edit form to original values
  const resetEditForm = () => {
    if (selectedProduct) {
      setEditProduct({
        name: selectedProduct.name,
        barcode: selectedProduct.barcode,
        description: selectedProduct.description,
        defaultCostPrice: selectedProduct.defaultCostPrice,
        defaultSellingPrice: selectedProduct.defaultSellingPrice,
        minSellingPrice: selectedProduct.minSellingPrice,
        categoryId: selectedProduct.categoryId,
        supplierId: selectedProduct.supplierId
      });
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await deleteProductMutation.mutateAsync(productToDelete.id);
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      toast({
        title: "تم حذف المنتج",
        description: `تم حذف "${productToDelete.name}" بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ في حذف المنتج",
        description: "حدث خطأ أثناء حذف المنتج",
        variant: "destructive"
      });
    }
  };

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="جاري التحقق من الصلاحيات..." />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold gradient-text">
            إدارة المنتجات
          </h1>
          <p className="text-muted-foreground">
            إدارة كاملة لجميع منتجات المتجر مع تتبع المخزون
          </p>
        </motion.div>
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 ml-2" />
              استيراد
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" size="sm" onClick={() => setIsExportDialogOpen(true)}>
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  منتج جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إضافة منتج جديد</DialogTitle>
                  <DialogDescription>
                    أدخل بيانات المنتج الجديد
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">اسم المنتج *</Label>
                      <Input
                        id="name"
                        value={newProduct.name || ''}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="اسم المنتج"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="barcode">الباركود</Label>
                      <Input
                        id="barcode"
                        value={newProduct.barcode || ''}
                        onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                        placeholder="رقم الباركود"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description || ''}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      placeholder="وصف المنتج"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="defaultSellingPrice">سعر البيع الافتراضي *</Label>
                      <Input
                        id="defaultSellingPrice"
                        type="number"
                        step="0.01"
                        value={newProduct.defaultSellingPrice || ''}
                        onChange={(e) => setNewProduct({...newProduct, defaultSellingPrice: Number(e.target.value)})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="defaultCostPrice">سعر التكلفة</Label>
                      <Input
                        id="defaultCostPrice"
                        type="number"
                        step="0.01"
                        value={newProduct.defaultCostPrice || ''}
                        onChange={(e) => setNewProduct({...newProduct, defaultCostPrice: Number(e.target.value)})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="minSellingPrice">أقل سعر بيع</Label>
                      <Input
                        id="minSellingPrice"
                        type="number"
                        step="0.01"
                        value={newProduct.minSellingPrice || ''}
                        onChange={(e) => setNewProduct({...newProduct, minSellingPrice: Number(e.target.value)})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="categoryId">الفئة *</Label>
                      <Select
                        value={newProduct.categoryId?.toString() || ''}
                        onValueChange={(value) => setNewProduct({...newProduct, categoryId: Number(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="supplierId">المورد</Label>
                      <Select
                        value={newProduct.supplierId?.toString() || 'none'}
                        onValueChange={(value) => setNewProduct({...newProduct, supplierId: value === 'none' ? undefined : Number(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المورد (اختياري)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">بدون مورد</SelectItem>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleAddProduct}
                    disabled={createProductMutation.isPending}
                  >
                    {createProductMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري الإضافة...
                      </>
                    ) : (
                      'إضافة المنتج'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Error Alert */}
      {productsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            خطأ في تحميل المنتجات: {productsError.message}
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2"
              onClick={() => refetchProducts()}
            >
              إعادة المحاولة
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                منتجات مسجلة في النظام
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {products.filter(p => p.currentQuantity <= 5 && p.currentQuantity > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                يحتاج إعادة تموين
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نفد المخزون</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {products.filter(p => p.currentQuantity === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              غير متوفر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((sum, p) => sum + (p.currentQuantity * p.defaultCostPrice), 0).toLocaleString()} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي قيمة المخزون
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم، الباركود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="حالة المخزون" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="normal">متوفر</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
                <SelectItem value="out">نفد</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              قائمة المنتجات ({filteredProducts.length})
            </CardTitle>
            <CardDescription>
              جميع منتجات المتجر مع إمكانية البحث والتصفية
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="جاري تحميل المنتجات..." variant="gradient" />
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                {/* Fixed Header */}
                <div className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
                  <Table className="table-fixed w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[35%]">المنتج</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[15%]">الفئة</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[12%]">سعر البيع</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[10%]">المخزون</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[13%]">حالة المخزون</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-gray-100 py-4 w-[15%]">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>
                
                {/* Scrollable Body */}
                <div className="max-h-[500px] overflow-y-auto">
                  <Table className="table-fixed w-full">
                    <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                          >
                            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                            {products.length === 0 ? 'لا توجد منتجات' : 'لا توجد منتجات تطابق معايير البحث'}
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <AnimatePresence>
                        {filteredProducts.map((product, index) => {
                          const stockStatus = getStockStatus(product);
                          return (
                            <motion.tr
                              key={product.id}
                              className="border-b hover:bg-muted/50 transition-colors"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                                ease: "easeOut"
                              }}
                              whileHover={{
                                backgroundColor: "rgba(var(--muted), 0.1)",
                                transition: { duration: 0.2 }
                              }}
                            >
                              <TableCell className="w-[35%]">
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {product.barcode && `${product.barcode} • `}{product.categoryName}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="w-[15%]">{product.categoryName}</TableCell>
                              <TableCell className="font-medium w-[12%]">{product.defaultSellingPrice.toLocaleString()} ر.س</TableCell>
                              <TableCell className="w-[10%]">
                                <span className={product.currentQuantity <= 5 ? 'text-orange-600 font-medium' : ''}>
                                  {product.currentQuantity}
                                </span>
                              </TableCell>
                              <TableCell className="w-[13%]">
                                <Badge variant={stockStatus.variant}>
                                  {stockStatus.text}
                                </Badge>
                              </TableCell>
                              <TableCell className="w-[15%]">
                                <div className="flex items-center gap-1">
                                  <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedProduct(product)}
                                        title="عرض التفاصيل"
                                        className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rtl" dir="rtl">
                                      <DialogHeader className="text-right border-b pb-4">
                                        <div className="flex items-center gap-3 justify-center mb-2">
                                          <div className="p-2 bg-primary/10 rounded-full">
                                            <Package className="h-6 w-6 text-primary" />
                                          </div>
                                        </div>
                                        <DialogTitle className="text-2xl font-bold text-center">
                                          تفاصيل المنتج
                                        </DialogTitle>
                                        <DialogDescription className="text-center text-muted-foreground">
                                          عرض شامل لبيانات المنتج ومعلوماته
                                        </DialogDescription>
                                      </DialogHeader>
                                      {selectedProduct && (
                                        <div className="space-y-6 pt-4">
                                          {/* Product Header */}
                                          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-lg border">
                                            <div className="flex items-center gap-4">
                                              <div className="p-3 bg-primary/10 rounded-full">
                                                <Package className="h-8 w-8 text-primary" />
                                              </div>
                                              <div className="flex-1">
                                                <h3 className="text-xl font-bold text-foreground">
                                                  {selectedProduct.name}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                  {selectedProduct.barcode && (
                                                    <div className="flex items-center gap-1">
                                                      <Barcode className="h-4 w-4" />
                                                      <span>{selectedProduct.barcode}</span>
                                                    </div>
                                                  )}
                                                  <div className="flex items-center gap-1">
                                                    <Tag className="h-4 w-4" />
                                                    <span>{selectedProduct.categoryName}</span>
                                                  </div>
                                                  {selectedProduct.supplierName && (
                                                    <div className="flex items-center gap-1">
                                                      <Truck className="h-4 w-4" />
                                                      <span>{selectedProduct.supplierName}</span>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="text-left">
                                                <div className="text-2xl font-bold text-primary">
                                                  {selectedProduct.defaultSellingPrice.toLocaleString()} ر.س
                                                </div>
                                                <div className="text-sm text-muted-foreground">سعر البيع</div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Product Details Grid */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Pricing Information */}
                                            <div className="bg-card p-4 rounded-lg border shadow-sm">
                                              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                                معلومات التسعير
                                              </h4>
                                              <div className="space-y-2">
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-muted-foreground">سعر التكلفة:</span>
                                                  <span className="font-medium">{selectedProduct.defaultCostPrice.toLocaleString()} ر.س</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-muted-foreground">سعر البيع:</span>
                                                  <span className="font-bold text-primary">{selectedProduct.defaultSellingPrice.toLocaleString()} ر.س</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-muted-foreground">أقل سعر بيع:</span>
                                                  <span className="font-medium">{selectedProduct.minSellingPrice.toLocaleString()} ر.س</span>
                                                </div>
                                                <div className="flex justify-between pt-2 border-t">
                                                  <span className="text-sm text-muted-foreground">الربح المقدر:</span>
                                                  <span className="font-bold text-green-600">
                                                    {(selectedProduct.defaultSellingPrice - selectedProduct.defaultCostPrice).toLocaleString()} ر.س
                                                  </span>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Inventory Information */}
                                            <div className="bg-card p-4 rounded-lg border shadow-sm">
                                              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                <Package className="h-4 w-4 text-blue-600" />
                                                معلومات المخزون
                                              </h4>
                                              <div className="space-y-2">
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-muted-foreground">الكمية الحالية:</span>
                                                  <span className={`font-bold text-lg ${
                                                    selectedProduct.currentQuantity === 0 ? 'text-red-600' :
                                                    selectedProduct.currentQuantity <= 5 ? 'text-orange-600' :
                                                    'text-green-600'
                                                  }`}>
                                                    {selectedProduct.currentQuantity}
                                                  </span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-muted-foreground">حالة المخزون:</span>
                                                  <span className={`font-medium ${
                                                    selectedProduct.currentQuantity === 0 ? 'text-red-600' :
                                                    selectedProduct.currentQuantity <= 5 ? 'text-orange-600' :
                                                    'text-green-600'
                                                  }`}>
                                                    {selectedProduct.currentQuantity === 0 ? 'نفد المخزون' :
                                                     selectedProduct.currentQuantity <= 5 ? 'مخزون منخفض' :
                                                     'مخزون متوفر'}
                                                  </span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-muted-foreground">قيمة المخزون:</span>
                                                  <span className="font-medium">
                                                    {(selectedProduct.currentQuantity * selectedProduct.defaultCostPrice).toLocaleString()} ر.س
                                                  </span>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Product Information */}
                                            <div className="bg-card p-4 rounded-lg border shadow-sm">
                                              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                <Info className="h-4 w-4 text-purple-600" />
                                                معلومات المنتج
                                              </h4>
                                              <div className="space-y-2">
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-muted-foreground">الفئة:</span>
                                                  <span className="font-medium">{selectedProduct.categoryName}</span>
                                                </div>
                                                {selectedProduct.supplierName && (
                                                  <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">المورد:</span>
                                                    <span className="font-medium">{selectedProduct.supplierName}</span>
                                                  </div>
                                                )}
                                                {selectedProduct.barcode && (
                                                  <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">الباركود:</span>
                                                    <span className="font-medium font-mono text-sm">{selectedProduct.barcode}</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Description */}
                                          {selectedProduct.description && (
                                            <div className="bg-card p-4 rounded-lg border shadow-sm">
                                              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-indigo-600" />
                                                وصف المنتج
                                              </h4>
                                              <div className="bg-muted/50 p-3 rounded-md">
                                                <p className="text-sm leading-relaxed">{selectedProduct.description}</p>
                                              </div>
                                            </div>
                                          )}

                                          {/* Action Buttons */}
                                          <div className="flex justify-center gap-3 pt-4 border-t">
                                            <Button
                                              variant="outline"
                                              onClick={() => setIsViewDialogOpen(false)}
                                              className="flex items-center gap-2"
                                            >
                                              <X className="h-4 w-4" />
                                              إغلاق
                                            </Button>
                                            <Button
                                              onClick={() => {
                                                setIsViewDialogOpen(false);
                                                openEditDialog(selectedProduct);
                                              }}
                                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                            >
                                              <Edit className="h-4 w-4" />
                                              تعديل المنتج
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => openEditDialog(product)}
                                    title="تعديل المنتج"
                                    className="hover:bg-green-50 hover:text-green-600 transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDeleteDialog(product)}
                                    disabled={deleteProductMutation.isPending}
                                    title="حذف المنتج"
                                    className="hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المنتج</DialogTitle>
            <DialogDescription>
              تعديل بيانات المنتج المحدد
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">اسم المنتج *</Label>
                <Input
                  id="edit-name"
                  value={editProduct.name || ''}
                  onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                  placeholder="اسم المنتج"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-barcode">الباركود</Label>
                <Input
                  id="edit-barcode"
                  value={editProduct.barcode || ''}
                  onChange={(e) => setEditProduct({...editProduct, barcode: e.target.value})}
                  placeholder="رقم الباركود"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">الوصف</Label>
              <Textarea
                id="edit-description"
                value={editProduct.description || ''}
                onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                placeholder="وصف المنتج"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-defaultSellingPrice">سعر البيع الافتراضي *</Label>
                <Input
                  id="edit-defaultSellingPrice"
                  type="number"
                  step="0.01"
                  value={editProduct.defaultSellingPrice || ''}
                  onChange={(e) => setEditProduct({...editProduct, defaultSellingPrice: Number(e.target.value)})}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-defaultCostPrice">سعر التكلفة</Label>
                <Input
                  id="edit-defaultCostPrice"
                  type="number"
                  step="0.01"
                  value={editProduct.defaultCostPrice || ''}
                  onChange={(e) => setEditProduct({...editProduct, defaultCostPrice: Number(e.target.value)})}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-minSellingPrice">أقل سعر بيع</Label>
                <Input
                  id="edit-minSellingPrice"
                  type="number"
                  step="0.01"
                  value={editProduct.minSellingPrice || ''}
                  onChange={(e) => setEditProduct({...editProduct, minSellingPrice: Number(e.target.value)})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-categoryId">الفئة *</Label>
                <Select
                  value={editProduct.categoryId?.toString() || ''}
                  onValueChange={(value) => setEditProduct({...editProduct, categoryId: Number(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-supplierId">المورد</Label>
                <Select
                  value={editProduct.supplierId?.toString() || 'none'}
                  onValueChange={(value) => setEditProduct({...editProduct, supplierId: value === 'none' ? undefined : Number(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المورد (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون مورد</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={resetEditForm}
              className="flex items-center gap-2"
              title="إعادة تعيين النموذج"
            >
              <RotateCcw className="h-4 w-4" />
              إعادة تعيين
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                إلغاء
              </Button>
              <Button 
                onClick={handleEditProduct}
                disabled={updateProductMutation.isPending}
                className="flex items-center gap-2"
              >
                {updateProductMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    تحديث المنتج
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md rtl border-destructive/20 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300" dir="rtl">
          <AlertDialogHeader className="text-right pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full animate-pulse">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <AlertDialogTitle className="text-xl font-bold text-destructive text-center">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-3 mt-4">
              <div className="text-sm text-muted-foreground">
                هل أنت متأكد من أنك تريد حذف المنتج التالي؟
              </div>
              <div className="bg-muted/50 p-4 rounded-lg border-2 border-dashed border-muted-foreground/20">
                <p className="font-semibold text-foreground text-lg">
                  "{productToDelete?.name}"
                </p>
                {productToDelete?.barcode && (
                  <p className="text-sm text-muted-foreground mt-1">
                    باركود: {productToDelete.barcode}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  الفئة: {productToDelete?.categoryName}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-destructive font-medium bg-destructive/5 p-3 rounded-md border border-destructive/10">
                <AlertTriangle className="h-4 w-4" />
                <span>تحذير: هذا الإجراء لا يمكن التراجع عنه!</span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-3 pt-6 border-t bg-muted/20">
            <AlertDialogCancel
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1 bg-background hover:bg-muted/80 text-foreground border shadow-sm transition-all duration-200"
              disabled={deleteProductMutation.isPending}
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={deleteProductMutation.isPending}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {deleteProductMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحذف...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  حذف المنتج
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Export Dialog */}
      <PDFExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        products={filteredProducts}
      />
    </motion.div>
  );
}
